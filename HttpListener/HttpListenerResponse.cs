using System;
using System.Collections.Generic;
using System.IO;
using System.Text;

using CookieCollection = System.Net.CookieCollection;
using Cookie = System.Net.Cookie;
using WebHeaderCollection = System.Net.WebHeaderCollection;

namespace Mihailik.Net
{
    public sealed class HttpListenerResponse
    {
        readonly HttpListenerConnection connection;
        readonly HttpListenerResponseStream m_OutputStream;

        internal HttpListenerResponse(HttpListenerConnection connection)
        {
            this.connection = connection;
            this.m_OutputStream = new HttpListenerResponseStream(connection);
            this.ContentEncoding = Encoding.UTF8;
        }

        public Stream OutputStream { get { return this.m_OutputStream; } }

        public Encoding ContentEncoding { get; set; }
        public long ContentLength64 { get { throw new NotImplementedException(); } set { throw new NotImplementedException(); } }
        public string ContentType { get { throw new NotImplementedException(); } set { throw new NotImplementedException(); } }
        public CookieCollection Cookies { get { throw new NotImplementedException(); } set { throw new NotImplementedException(); } }
        public WebHeaderCollection Headers { get { throw new NotImplementedException(); } set { throw new NotImplementedException(); } }
        public bool KeepAlive { get { throw new NotImplementedException(); } set { throw new NotImplementedException(); } }
        public Version ProtocolVersion { get { throw new NotImplementedException(); } set { throw new NotImplementedException(); } }
        public string RedirectLocation { get { throw new NotImplementedException(); } set { throw new NotImplementedException(); } }
        public bool SendChunked { get { throw new NotImplementedException(); } set { throw new NotImplementedException(); } }
        public int StatusCode { get { throw new NotImplementedException(); } set { throw new NotImplementedException(); } }
        public string StatusDescription { get { throw new NotImplementedException(); } set { throw new NotImplementedException(); } }

        public void Close()
        {
            this.connection.ResponseClose();
        }

        public void Abort()
        {
            this.connection.ResponseAbort();
        }

        public void AddHeader(string name, string value) { throw new NotImplementedException(); }
        public void AppendCookie(Cookie cookie) { throw new NotImplementedException(); }
        public void AppendHeader(string name, string value) { throw new NotImplementedException(); }
        public void Close(byte[] responseEntity, bool willBlock) { throw new NotImplementedException(); }
        public void CopyFrom(HttpListenerResponse templateResponse) { throw new NotImplementedException(); }
        public void Redirect(string url) { throw new NotImplementedException(); }
        public void SetCookie(Cookie cookie) { throw new NotImplementedException(); }
    }
}