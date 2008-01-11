using System;
using System.Collections.Generic;
using System.Text;

using EndPoint = System.Net.EndPoint;
using AuthenticationSchemes = System.Net.AuthenticationSchemes;

namespace Mihailik.Net
{
    public sealed class HttpListener : IDisposable
    {
        static void NotCalled()
        {
            System.Net.HttpListener li;
        }

        static readonly object syncStartStop = new object();
        static readonly Dictionary<HttpListener, UriPrefix[]> activePrefixesByHttpListener = new Dictionary<HttpListener, UriPrefix[]>();
        static readonly List<EndPointListener> activeEndPointListeners = new List<EndPointListener>();

        readonly HttpListenerPrefixCollection m_Prefixes = new HttpListenerPrefixCollection();
        AuthenticationSchemes m_AuthenticationSchemes;
        Converter<HttpListenerRequest, AuthenticationSchemes> m_AuthenticationSchemeSelectorDelegate;
        bool m_IsListening;
        bool m_IgnoreWriteExceptions;

        public HttpListenerPrefixCollection Prefixes { get { return m_Prefixes; } }

        public AuthenticationSchemes AuthenticationSchemes { get { return m_AuthenticationSchemes; } set { m_AuthenticationSchemes = value; } }
        public Converter<HttpListenerRequest, AuthenticationSchemes> AuthenticationSchemeSelectorDelegate { get { return m_AuthenticationSchemeSelectorDelegate; } set { m_AuthenticationSchemeSelectorDelegate = value; } }
        public string Realm { get { throw new NotImplementedException(); } set { throw new NotImplementedException(); } }
        public bool UnsafeConnectionNtlmAuthentication { get { throw new NotImplementedException(); } set { throw new NotImplementedException(); } }

        public bool IgnoreWriteExceptions { get { return m_IgnoreWriteExceptions; } set { m_IgnoreWriteExceptions = value; } }

        public static bool IsSupported { get { return true; } }

        public HttpListener()
        {
        }

        public bool IsListening { get { return m_IsListening; } }

        public void Start()
        {
            lock (syncStartStop)
            {
                if (m_IsListening)
                    throw new InvalidOperationException("HttpListener is already started.");

                UriPrefix[] prefixes = new UriPrefix[this.Prefixes.Count];
                for (int i = 0; i < this.Prefixes.Count; i++)
                {
                    prefixes[i] = UriPrefix.Parse(this.Prefixes[i]);
                }
                activePrefixesByHttpListener.Add(this, prefixes);

                UpdateEndPointListeners();

                m_IsListening = true;
            }
        }

        public void Stop()
        {
            lock (syncStartStop)
            {
                if (!m_IsListening)
                    throw new InvalidOperationException("HttpListener is already started.");

                activePrefixesByHttpListener.Remove(this);

                UpdateEndPointListeners();

                m_IsListening = true;
            }
        }

        public void Abort()
        {
            throw new NotImplementedException();
        }

        public void Close()
        {
            throw new NotImplementedException();
        }

        void IDisposable.Dispose()
        {
            throw new NotImplementedException();
        }

        public HttpListenerContext GetContext()
        {
            throw new NotImplementedException();
        }

        public IAsyncResult BeginGetContext(AsyncCallback callback, object state)
        {
            throw new NotImplementedException();
        }

        public HttpListenerContext EndGetContext(IAsyncResult result)
        {
            throw new NotImplementedException();
        }

        private static void UpdateEndPointListeners()
        {
            Dictionary<EndPoint, EndPointListener> activeEndPointListenerByEndPoint = new Dictionary<EndPoint, EndPointListener>(activeEndPointListeners.Count);
            foreach (EndPointListener epListener in activeEndPointListeners)
            {
                activeEndPointListenerByEndPoint.Add(epListener.EndPoint, epListener);
            }

            Dictionary<EndPoint, bool> neededEndPointActive = new Dictionary<EndPoint, bool>();
            foreach (EndPoint ep in GetNeededEndPoints())
            {
                if (!neededEndPointActive.ContainsKey(ep))
                    neededEndPointActive.Add(ep, activeEndPointListenerByEndPoint.ContainsKey(ep));
            }

            List<EndPointListener> notNeededEndPointListeners = new List<EndPointListener>();
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
            try
            {
                foreach (EndPoint ep in endPointsToListen)
                {
                    EndPointListener newEndPointListener = new EndPointListener(ep);
                    newStartedEndPointListeners.Add(newEndPointListener);
                }
            }
            catch
            {
                foreach (EndPointListener endPointListener in newStartedEndPointListeners)
                {
                    endPointListener.Shutdown();
                }
                throw;
            }

            // Add already running new EP listeners to static collection
            activeEndPointListeners.AddRange(newStartedEndPointListeners);
        }

        static IEnumerable<EndPoint> GetNeededEndPoints()
        {
            Dictionary<int, List<UriPrefix>> portPrefixes = new Dictionary<int, List<UriPrefix>>();

            foreach (UriPrefix[] prefixList in activePrefixesByHttpListener.Values)
            {
                foreach (UriPrefix fullPrefix in prefixList)
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
                Dictionary<string, string> hosts = new Dictionary<string, string>();

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
            return Array.ConvertAll(
                System.Net.Dns.GetHostEntry(host).AddressList,
                delegate(System.Net.IPAddress address)
                {
                    return new System.Net.IPEndPoint(address, port);
                });
        }

        static EndPoint CreateAllHostsEndPoint(int port)
        {
            return new System.Net.IPEndPoint(System.Net.IPAddress.Any, port);
        }

        internal static HttpListener Dispatch(Uri uri)
        {
            throw new NotImplementedException();
        }
    }
}
