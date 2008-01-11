using System;
using System.Collections.Generic;
using System.IO;
using System.Text;

using CookieCollection = System.Net.CookieCollection;
using NameValueCollection = System.Collections.Specialized.NameValueCollection;
using IPEndPoint = System.Net.IPEndPoint;
using WebHeaderCollection = System.Net.WebHeaderCollection;
using X509Certificate2 = System.Security.Cryptography.X509Certificates.X509Certificate2;
using Mihailik.Net.Internal.StateMachine;

namespace Mihailik.Net
{
    public sealed class HttpListenerRequest
    {
        public string[] AcceptTypes { get { throw new NotImplementedException(); } }
        public int ClientCertificateError { get { throw new NotImplementedException(); } }
        public Encoding ContentEncoding { get { throw new NotImplementedException(); } }
        public long ContentLength64 { get { throw new NotImplementedException(); } }
        public string ContentType { get { throw new NotImplementedException(); } }
        public CookieCollection Cookies { get { throw new NotImplementedException(); } }
        public bool HasEntityBody { get { throw new NotImplementedException(); } }
        public NameValueCollection Headers { get { throw new NotImplementedException(); } }
        public string HttpMethod { get { throw new NotImplementedException(); } }
        public Stream InputStream { get { throw new NotImplementedException(); } }
        public bool IsAuthenticated { get { throw new NotImplementedException(); } }
        public bool IsLocal { get { throw new NotImplementedException(); } }
        public bool IsSecureConnection { get { throw new NotImplementedException(); } }
        public bool KeepAlive { get { throw new NotImplementedException(); } }
        public IPEndPoint LocalEndPoint { get { throw new NotImplementedException(); } }
        public Version ProtocolVersion { get { throw new NotImplementedException(); } }
        public NameValueCollection QueryString { get { throw new NotImplementedException(); } }
        public string RawUrl { get { throw new NotImplementedException(); } }
        public IPEndPoint RemoteEndPoint { get { throw new NotImplementedException(); } }
        public Guid RequestTraceIdentifier { get { throw new NotImplementedException(); } }
        public Uri Url { get { throw new NotImplementedException(); } }
        public Uri UrlReferrer { get { throw new NotImplementedException(); } }
        public string UserAgent { get { throw new NotImplementedException(); } }
        public string UserHostAddress { get { throw new NotImplementedException(); } }
        public string UserHostName { get { throw new NotImplementedException(); } }
        public string[] UserLanguages { get { throw new NotImplementedException(); } }

        public IAsyncResult BeginGetClientCertificate(AsyncCallback requestCallback, object state) { throw new NotImplementedException(); }
        public X509Certificate2 EndGetClientCertificate(IAsyncResult asyncResult) { throw new NotImplementedException(); }
        public X509Certificate2 GetClientCertificate() { throw new NotImplementedException(); }
        
        internal HttpListenerRequest(HttpRequestHeaderReader headerReader)
        {
            throw new NotImplementedException();
        }
    }
}