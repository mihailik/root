using System;
using System.Collections.Generic;
using System.Text;

using EndPoint = System.Net.EndPoint;
using AuthenticationSchemes = System.Net.AuthenticationSchemes;

namespace Mihailik.Net
{
    using Collections;

    public sealed class HttpListener : IDisposable
    {
        static class GlobalListenerState
        {
            public static readonly object SyncStartStop = new object();
            public static readonly Dictionary<HttpListener, UriPrefix[]> ActivePrefixesByHttpListener = new Dictionary<HttpListener, UriPrefix[]>();
            public static readonly List<EndPointListener> ActiveEndPointListeners = new List<EndPointListener>();
        }

        readonly HttpListenerPrefixCollection m_Prefixes = new HttpListenerPrefixCollection();

        readonly AsyncQueue<HttpListenerContext> receivedContextQueue = new AsyncQueue<HttpListenerContext>();

        public HttpListener()
        {
        }

        public bool IsListening { get; private set; }

        public HttpListenerPrefixCollection Prefixes { get { return m_Prefixes; } }

        public AuthenticationSchemes AuthenticationSchemes { get; set; }
        public Converter<HttpListenerRequest, AuthenticationSchemes> AuthenticationSchemeSelectorDelegate { get; set; }

        public string Realm { get { throw new NotImplementedException(); } set { throw new NotImplementedException(); } }
        public bool UnsafeConnectionNtlmAuthentication { get { throw new NotImplementedException(); } set { throw new NotImplementedException(); } }

        public bool IgnoreWriteExceptions { get; set; }

        public static bool IsSupported { get { return true; } }

        public void Start()
        {
            lock (GlobalListenerState.SyncStartStop)
            {
                if (this.IsListening)
                    throw new InvalidOperationException("HttpListener is already started.");

                UriPrefix[] prefixes = new UriPrefix[this.Prefixes.Count];
                for (int i = 0; i < this.Prefixes.Count; i++)
                {
                    prefixes[i] = UriPrefix.Parse(this.Prefixes[i]);
                }
                GlobalListenerState.ActivePrefixesByHttpListener.Add(this, prefixes);

                UpdateEndPointListeners();

                this.IsListening = true;
            }
        }

        public void Stop()
        {
            lock (GlobalListenerState.SyncStartStop)
            {
                if (!this.IsListening)
                    throw new InvalidOperationException("HttpListener is already started.");

                GlobalListenerState.ActivePrefixesByHttpListener.Remove(this);

                UpdateEndPointListeners();

                this.IsListening = true;
            }
        }

        public void Abort()
        {
            Stop();
        }

        public void Close()
        {
            Stop();
        }

        void IDisposable.Dispose()
        {
            Close();
        }

        public HttpListenerContext GetContext()
        {
            return receivedContextQueue.Dequeue();
        }

        public IAsyncResult BeginGetContext(AsyncCallback callback, object state)
        {
            return receivedContextQueue.BeginDequeue(callback, state);
        }

        public HttpListenerContext EndGetContext(IAsyncResult result)
        {
            return receivedContextQueue.EndDequeue(result);
        }

        private static void UpdateEndPointListeners()
        {
            var activeEndPointListenerByEndPoint = new Dictionary<EndPoint, EndPointListener>(GlobalListenerState.ActiveEndPointListeners.Count);
            foreach (var epListener in GlobalListenerState.ActiveEndPointListeners)
            {
                activeEndPointListenerByEndPoint.Add(epListener.EndPoint, epListener);
            }

            var neededEndPointActive = new Dictionary<EndPoint, bool>();
            foreach (var ep in GetNeededEndPoints())
            {
                if (!neededEndPointActive.ContainsKey(ep))
                    neededEndPointActive.Add(ep, activeEndPointListenerByEndPoint.ContainsKey(ep));
            }

            var notNeededEndPointListeners = new List<EndPointListener>();
            foreach (KeyValuePair<EndPoint, EndPointListener> kv in activeEndPointListenerByEndPoint)
            {
                if (!neededEndPointActive.ContainsKey(kv.Key))
                    notNeededEndPointListeners.Add(kv.Value);
            }

            List<EndPoint> endPointsToListen = new List<EndPoint>();
            foreach (KeyValuePair<EndPoint, bool> kv in neededEndPointActive)
            {
                if (!kv.Value)
                    endPointsToListen.Add(kv.Key);
            }

            // Shutdown not needed EP listeners
            foreach (EndPointListener endPointListener in notNeededEndPointListeners)
            {
                endPointListener.Shutdown();
            }

            // Create and start new EP listeners
            List<EndPointListener> newStartedEndPointListeners = new List<EndPointListener>();
            bool allEndPointsCreated = false;
            try
            {
                foreach (EndPoint ep in endPointsToListen)
                {
                    EndPointListener newEndPointListener = new EndPointListener(ep);
                    newStartedEndPointListeners.Add(newEndPointListener);
                }
                allEndPointsCreated = true;
            }
            finally
            {
                if (!allEndPointsCreated)
                {
                    foreach (EndPointListener endPointListener in newStartedEndPointListeners)
                    {
                        endPointListener.Shutdown();
                    }
                }
            }

            // Add already running new EP listeners to static collection
            GlobalListenerState.ActiveEndPointListeners.AddRange(newStartedEndPointListeners);
        }

        static IEnumerable<EndPoint> GetNeededEndPoints()
        {
            var portPrefixes = new Dictionary<int, List<UriPrefix>>();

            foreach (var prefixList in GlobalListenerState.ActivePrefixesByHttpListener.Values)
            {
                foreach (var fullPrefix in prefixList)
                {
                    UriPrefix p = fullPrefix.StripPath();

                    List<UriPrefix> prefixesForPort;
                    if (!portPrefixes.TryGetValue(p.Port, out prefixesForPort))
                    {
                        prefixesForPort = new List<UriPrefix>();
                        prefixesForPort.Add(p);
                        portPrefixes.Add(p.Port, prefixesForPort);
                    }
                    else
                    {
                        if (!prefixesForPort.Contains(p))
                        {
                            prefixesForPort.Add(p);
                        }
                    }
                }
            }

            foreach (int port in portPrefixes.Keys)
            {
                var hosts = new Dictionary<string, string>();

                foreach (UriPrefix p in portPrefixes[port])
                {
                    if (p.Kind == UriPrefixKind.AllHosts || p.Kind == UriPrefixKind.OtherHosts)
                    {
                        hosts.Clear();
                        hosts.Add("*", null);
                        break;
                    }
                    else
                    {
                        hosts[p.Host] = null;
                    }
                }

                foreach (string hostName in hosts.Keys)
                {
                    if (hostName == "*")
                    {
                        yield return CreateAllHostsEndPoint(port);
                    }
                    else
                    {
                        foreach (EndPoint ep in CreateExplicitHostEndPoints(hostName, port))
                        {
                            yield return ep;
                        }
                    }
                }
            }
        }

        static EndPoint[] CreateExplicitHostEndPoints(string host, int port)
        {
            var result = Array.ConvertAll(
                System.Net.Dns.GetHostEntry(host).AddressList,
                address => new System.Net.IPEndPoint(address, port));
            return result;
        }

        static EndPoint CreateAllHostsEndPoint(int port)
        {
            return new System.Net.IPEndPoint(System.Net.IPAddress.Any, port);
        }

        internal static HttpListener Dispatch(HttpListenerRequest request)
        {
            lock (GlobalListenerState.SyncStartStop)
            {
                foreach (var kv in GlobalListenerState.ActivePrefixesByHttpListener)
                {
                    foreach (var prefix in kv.Value)
                    {
                        if (prefix.Kind == UriPrefixKind.AllHosts
                            || (prefix.Kind == UriPrefixKind.ExactHost && request.Url.Host == prefix.Host))
                        {
                            if(request.Url.Port==prefix.Port)
                            {
                                if(request.RawUrl.StartsWith(prefix.Path, StringComparison.OrdinalIgnoreCase))
                                {
                                    return kv.Key;
                                }
                            }
                        }
                    }
                }

                foreach (var kv in GlobalListenerState.ActivePrefixesByHttpListener)
                {
                    foreach (var prefix in kv.Value)
                    {
                        if (prefix.Kind == UriPrefixKind.OtherHosts)
                        {
                            if (request.Url.Port == prefix.Port)
                            {
                                if (request.RawUrl.StartsWith(prefix.Path, StringComparison.OrdinalIgnoreCase))
                                {
                                    return kv.Key;
                                }
                            }
                        }
                    }
                }

                return null;
            }
        }

        internal void Process(HttpListenerContext context)
        {
            lock (GlobalListenerState.SyncStartStop)
            {
                this.receivedContextQueue.Enqueue(context);
            }
        }
    }
}
