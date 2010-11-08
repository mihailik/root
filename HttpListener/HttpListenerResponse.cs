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
            this.Headers = new WebHeaderCollection();

            this.StatusCode = 200;
            this.StatusDescription = "OK";

            this.Cookies = new CookieCollection();
        }

        public Stream OutputStream { get { return this.m_OutputStream; } }

        public Version ProtocolVersion { get; set; }
        public Encoding ContentEncoding { get; set; }
        public int StatusCode { get; set; }
        public string StatusDescription { get; set; }
        public long ContentLength64 { get; set; }

        public string ContentType
        {
            get { return this.Headers["Content-Type"]; }
            set { this.Headers["Content-Type"] = value; }
        }

        public CookieCollection Cookies { get; set; }
        public WebHeaderCollection Headers { get; set; }
        public bool KeepAlive { get; set; }
        public string RedirectLocation { get; set; }
        public bool SendChunked { get; set; }

        public void Close()
        {
            this.connection.ResponseClose();
        }

        public void Abort()
        {
            this.connection.ResponseAbort();
        }

        public void AddHeader(string name, string value) { this.Headers.Add(name, value); }
        public void AppendHeader(string name, string value) { this.Headers.Add(name,value); }

        public void SetCookie(Cookie cookie) { this.Cookies.Add(cookie); }
        public void AppendCookie(Cookie cookie) { this.Cookies.Add(cookie); }

        public void Close(byte[] responseEntity, bool willBlock)
        {
            throw new NotImplementedException();
        }

        public void CopyFrom(HttpListenerResponse templateResponse) { throw new NotImplementedException(); }
        
        public void Redirect(string url)
        {
            throw new NotImplementedException();
        }
    }
}