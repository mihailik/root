using System;
using System.Collections.Generic;
using System.IO;
using System.Text;

using CookieCollection = System.Net.CookieCollection;
using NameValueCollection = System.Collections.Specialized.NameValueCollection;
using EndPoint = System.Net.EndPoint;
using WebHeaderCollection = System.Net.WebHeaderCollection;
using X509Certificate2 = System.Security.Cryptography.X509Certificates.X509Certificate2;

namespace Mihailik.Net
{
    using Internal.StateMachine;

    public sealed class HttpListenerRequest
    {
        static class KnownHeaderNames
        {
            public const string ContentType = "content-type";
            
        }

        readonly HttpRequestHeaderReader headerReader;

        readonly Encoding m_ContentEncoding;
        readonly Uri m_Url;
        readonly EndPoint m_RemoteEndPoint;
        readonly EndPoint m_LocalEndPoint;
        readonly Stream m_InputStream;
        
        string[] m_AcceptTypes;
        CookieCollection m_Cookies;
        NameValueCollection m_QueryString;
        Uri m_UrlReferer;

        internal HttpListenerRequest(
            HttpRequestHeaderReader headerReader,
            Stream inputStream,
            EndPoint localEndPoint,
            EndPoint remoteEndPoint)
        {
            this.headerReader = headerReader;
            this.m_InputStream = inputStream;

            this.m_LocalEndPoint = localEndPoint;
            this.m_RemoteEndPoint = remoteEndPoint;

            this.m_Url = new Uri("http://" + headerReader.Host + headerReader.QueryLineReader.RawUrl);

            if (headerReader.HasEntityBody)
            {
                string contentType = headerReader.Headers["Content-Type"];
                if (contentType != null)
                {
                    // TODO: extract content encoding form charset
                }
            }

            if (this.m_ContentEncoding == null)
            {
                this.m_ContentEncoding = Encoding.UTF8;
            }
        }

        public Stream InputStream { get { return this.m_InputStream; } }

        public NameValueCollection Headers { get { return this.headerReader.Headers; } }

        public string ContentType { get { return this.headerReader.Headers[KnownHeaderNames.ContentType]; } }
        public bool KeepAlive { get { return this.headerReader.KeepAlive; } }
        public long ContentLength64 { get { return this.headerReader.ContentLength64; } }
        public bool HasEntityBody { get { return this.headerReader.HasEntityBody; } }

        public string HttpMethod { get { return this.headerReader.QueryLineReader.HttpMethod; } }
        public Version ProtocolVersion { get { return this.headerReader.QueryLineReader.ProtocolVersion; } }
        public string RawUrl { get { return this.headerReader.QueryLineReader.RawUrl; } }


        public EndPoint LocalEndPoint { get { return this.m_LocalEndPoint; } }
        public EndPoint RemoteEndPoint { get { return this.m_RemoteEndPoint; } }
        public Encoding ContentEncoding { get { return this.m_ContentEncoding; } }
        public Uri Url { get { return this.m_Url; } }
        public bool IsSecureConnection { get { return this.headerReader.QueryLineReader.IsHttpSecureProtocol; } }
        public string UserAgent { get { return this.Headers["User-Agent"]; } }

        public Uri UrlReferrer
        {
            get
            {
                if (this.m_UrlReferer == null)
                {
                    string refererString = this.Headers["Referer"];
                    Uri.TryCreate(refererString, UriKind.Absolute, out this.m_UrlReferer);
                }

                return this.m_UrlReferer;
            }
        }

        public string[] AcceptTypes
        {
            get
            {
                if (this.m_AcceptTypes == null)
                {
                    string accept = this.Headers["Accept"];
                    if (accept == null)
                    {
                        this.m_AcceptTypes = new string[] { };
                    }
                    else
                    {
                        this.m_AcceptTypes = accept.Split(',');
                    }
                }

                if (this.m_AcceptTypes.Length == 0)
                    return this.m_AcceptTypes;
                else
                    return (string[])this.m_AcceptTypes.Clone();
            }
        }

        public CookieCollection Cookies
        {
            get
            {
                if (this.m_Cookies == null)
                {
                    var cookies = new CookieCollection();
                    // TODO: interrogate and populate cookie collection
                    this.m_Cookies = cookies;
                }
                return this.m_Cookies;
            }
        }

        public NameValueCollection QueryString
        {
            get
            {
                if (this.m_QueryString == null)
                {
                    var queryString = new NameValueCollection();
                    // TODO: populate query string
                    this.m_QueryString = queryString;
                }
                return this.m_QueryString;
            }
        }

        public bool IsLocal { get { throw new NotImplementedException(); } }

        public int ClientCertificateError { get { throw new NotImplementedException(); } }
        public bool IsAuthenticated { get { throw new NotImplementedException(); } }

        

        public Guid RequestTraceIdentifier { get { throw new NotImplementedException(); } }

        public string UserHostAddress { get { throw new NotImplementedException(); } }
        public string UserHostName { get { throw new NotImplementedException(); } }
        public string[] UserLanguages { get { throw new NotImplementedException(); } }

        public IAsyncResult BeginGetClientCertificate(AsyncCallback requestCallback, object state) { throw new NotImplementedException(); }
        public X509Certificate2 EndGetClientCertificate(IAsyncResult asyncResult) { throw new NotImplementedException(); }
        public X509Certificate2 GetClientCertificate() { throw new NotImplementedException(); }
    }
}