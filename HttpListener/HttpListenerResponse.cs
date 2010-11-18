using System;
using System.Collections.Generic;
using System.IO;
using System.Text;

using CookieCollection = System.Net.CookieCollection;
using Cookie = System.Net.Cookie;
using WebHeaderCollection = System.Net.WebHeaderCollection;
using HttpResponseHeader = System.Net.HttpResponseHeader;

namespace Mihailik.Net
{
    public sealed class HttpListenerResponse
    {
        private sealed class HeaderCollection : WebHeaderCollection
        {
            readonly HttpListenerResponse response;

            public HeaderCollection(HttpListenerResponse response)
            {
                this.response = response;
            }
        }

        readonly HttpListenerConnection connection;
        readonly Stream m_OutputStream;

        internal HttpListenerResponse(HttpListenerConnection connection, Stream outputStream)
        {
            this.connection = connection;
            this.m_OutputStream = outputStream;

            this.ContentEncoding = Encoding.UTF8;
            this.Headers = new HeaderCollection(this);

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
            get { return this.Headers[HttpResponseHeader.ContentType]; }
            set { this.Headers[HttpResponseHeader.ContentType] = value; }
        }

        public CookieCollection Cookies { get; private set; }
        public WebHeaderCollection Headers { get; private set; }

        public bool KeepAlive
        {
            get
            {
                return string.Equals(
                    this.Headers[HttpResponseHeader.Connection],
                    "Keep-Alive",
                    StringComparison.OrdinalIgnoreCase);
            }
            set
            {
                this.Headers[HttpResponseHeader.Connection] = value ? "Keep-Alive" : "Close";
            }
        }

        public string RedirectLocation { get; set; }
        
        public bool SendChunked
        {
            get
            {
                return string.Equals(
                    this.Headers[HttpResponseHeader.TransferEncoding],
                    "Chunked",
                    StringComparison.OrdinalIgnoreCase);
            }
            set
            {
                if(value)
                    this.Headers[HttpResponseHeader.TransferEncoding] = "Chunked";
                else
                    this.Headers.Remove(HttpResponseHeader.TransferEncoding);
            }
        }

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
            if (willBlock)
            {
                this.OutputStream.Write(responseEntity, 0, responseEntity.Length);
            }
            else
            {
                this.OutputStream.BeginWrite(
                    responseEntity, 0, responseEntity.Length,
                    ar =>
                    {
                        try
                        {
                            this.OutputStream.EndWrite(ar);
                        }
                        catch { }

                        this.Close();
                    },
                    null);
            }
        }

        public void CopyFrom(HttpListenerResponse templateResponse) { throw new NotImplementedException(); }
        
        public void Redirect(string url)
        {
            this.RedirectLocation = url;
            this.Close();
        }
    }
}