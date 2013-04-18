using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Threading;

using Socket = System.Net.Sockets.Socket;
using AuthenticationSchemes = System.Net.AuthenticationSchemes;
using SocketAsyncEventArgs = System.Net.Sockets.SocketAsyncEventArgs;
using SocketError = System.Net.Sockets.SocketError;
using SocketFlags = System.Net.Sockets.SocketFlags;
using HttpVersion = System.Net.HttpVersion;

namespace Mihailik.Net
{
    using Internal.StateMachine;

    internal sealed class HttpListenerConnection
    {
        enum ConnectionState
        {
            ReadingHeader,
            Rejecting,
            ProcessingCallback,
            Sending100Continue,
            ReadyToSendResponse,
            SendingResponse,
            SkippingExcessiveContent,
            Closed
        }

        static byte[] BadHeaderResponse;

        readonly Socket m_Socket;
        ArraySegment<byte> buffer;
        ConnectionState currentState;
        HttpRequestHeaderReader headerReader;

        HttpListener dispatchedHttpListener;
        HttpListenerContext context;
        HttpRequestContentReader requestContentReader;
        byte[] overspillBuffer;

        bool keepAlive;

        public HttpListenerConnection(Socket socket)
        {
            this.m_Socket = socket;
            buffer = new ArraySegment<byte>(new byte[1024 * 4], 0, 0);
            headerReader = new HttpRequestHeaderReader();
            BeginReceiveToBuffer();
        }

        private Socket Socket { get { return m_Socket; } }

        void BeginReceiveToBuffer()
        {
            this.Socket.BeginReceive(
                buffer.Array, buffer.Offset + buffer.Count, buffer.Array.Length - buffer.Offset - buffer.Count,
                SocketFlags.None,
                ReceiveToBufferComplete,
                null);
        }

        void ReceiveToBufferComplete(IAsyncResult ar)
        {
            int receiveCount;
            try
            {
                receiveCount = Socket.EndReceive(ar);
            }
            catch (System.Net.Sockets.SocketException error)
            {
                ReceiveToBufferFailed(error);
                return;
            }
            catch (ObjectDisposedException error)
            {
                ReceiveToBufferFailed(error);
                return;
            }

            if (receiveCount == 0)
            {
                ReceiveToBufferFailed(null);
                return;
            }

            buffer = new ArraySegment<byte>(
                buffer.Array,
                buffer.Offset,
                buffer.Count + receiveCount);

            ProcessBufferData();
        }

        void ReceiveToBufferFailed(Exception error)
        {
            Shutdown();
        }

        void RejectBadHeader()
        {
            if (currentState == ConnectionState.Closed)
                return;

            if (BadHeaderResponse == null)
            {
                BadHeaderResponse = Encoding.ASCII.GetBytes(
                    "HTTP/1.1 400 Bad header\r\n" +
                    "Connection: Close\r\n\r\n");
            }

            this.Socket.Send(BadHeaderResponse);

            Shutdown();
        }

        void Shutdown()
        {
            this.currentState = ConnectionState.Closed;
            try
            {
                ((IDisposable)this.Socket).Dispose();
            }
            catch (ObjectDisposedException) { }
            catch (System.Net.Sockets.SocketException) { }
        }

        void ProcessBufferData()
        {
            if (currentState == ConnectionState.ReadingHeader)
            {
                int processedCount = headerReader.Read(buffer.Array, buffer.Offset, buffer.Count);
                buffer = new ArraySegment<byte>(buffer.Array, buffer.Offset + processedCount, buffer.Count - processedCount);
                if (headerReader.IsFailed)
                {
                    RejectBadHeader();
                    return;
                }
                else if (headerReader.IsSucceed)
                {
                    ProcessHeaderReceived();
                }
                else
                {
                    BeginReceiveToBuffer();
                }
            }
        }

        void ProcessHeaderReceived()
        {
            var request = new HttpListenerRequest(
                headerReader,
                headerReader.HasEntityBody ?
                   new HttpListenerRequestStream(this) :
                    Stream.Null,
                this.Socket.LocalEndPoint,
                this.Socket.RemoteEndPoint);

            this.requestContentReader = headerReader.HasEntityBody ?
                headerReader.IsContentLength64Present ?
                HttpRequestContentReader.CreateContentLength((int)headerReader.ContentLength64) :
                HttpRequestContentReader.CreateChunked() :
                null;

            dispatchedHttpListener = HttpListener.Dispatch(request);

            if (dispatchedHttpListener == null)
            {
                Shutdown();
                return;
            }

            currentState = ConnectionState.ProcessingCallback;
            AuthenticationSchemes scheme = dispatchedHttpListener.AuthenticationSchemes;
            var getAuthenticationSchemes = dispatchedHttpListener.AuthenticationSchemeSelectorDelegate;
            if (getAuthenticationSchemes != null)
                scheme = getAuthenticationSchemes(request);



            currentState = ConnectionState.ReadyToSendResponse;

            var responseStream = new HttpListenerResponseStream(this);

            var response = new HttpListenerResponse(this, responseStream)
            {
                ProtocolVersion = request.ProtocolVersion,
                KeepAlive = request.KeepAlive,
                SendChunked = request.KeepAlive && request.ProtocolVersion==HttpVersion.Version11,
                StatusCode = 200,
                StatusDescription = "OK"
            };

            this.context = new HttpListenerContext(
                request,
                response,
                null);

            dispatchedHttpListener.PublishContext(context);
        }

        ArraySegment<byte> GenerateResponseHeader()
        {
            var memBuf = new MemoryStream();
            var writer = new StreamWriter(memBuf, Encoding.ASCII);

            writer.Write(
                this.context.Response.ProtocolVersion == System.Net.HttpVersion.Version10 ?
                "HTTP/1.0 " : "HTTP/1.1 ");

            writer.Write(this.context.Response.StatusCode);
            writer.Write(' ');

            writer.WriteLine(((System.Net.HttpStatusCode)this.context.Response.StatusCode).ToString());

            foreach (string headerName in this.context.Response.Headers.Keys)
            {
                string headerValue = this.context.Response.Headers[headerName];

                writer.Write(headerName);
                writer.Write(": ");
                writer.WriteLine(headerValue);
            }

            writer.WriteLine();
            writer.Flush();

            var headerBuf = memBuf.GetBuffer();
            int headerLength = (int)memBuf.Length;

            writer.Close();

            this.context.SendChunked = this.context.Response.SendChunked;
            this.context.ResponseContentLength64 = this.context.Response.ContentLength64;

            return new ArraySegment<byte>(
                headerBuf,
                0,
                headerLength);
        }

        internal void ResponseAbort()
        {
            try { this.Socket.Shutdown(System.Net.Sockets.SocketShutdown.Both); }
            catch { }
            try { this.Socket.Close(); }
            catch { }

            this.currentState = ConnectionState.Closed;
        }

        internal void ResponseClose()
        {
            if (currentState == ConnectionState.ReadyToSendResponse)
            {
                var buf = GenerateResponseHeader();
                this.Socket.SendAll(buf.Array, buf.Offset, buf.Count);
            }

            if (this.context != null)
                this.context.Response.OutputStream.Close();

            if (this.keepAlive)
            {
                this.currentState = ConnectionState.ReadingHeader;
                BeginReceiveToBuffer();
            }
            else
            {
                try { this.Socket.Shutdown(System.Net.Sockets.SocketShutdown.Both); }
                catch { }
                try { this.Socket.Close(); }
                catch { }

                this.currentState = ConnectionState.Closed;
            }
        }

        internal int RequestRead(byte[] buffer, int offset, int count)
        {
            int receiveCount = 0;
            
            while( true )
            {
                int chunkSize = this.Socket.Receive(buffer, offset+receiveCount, count-receiveCount, SocketFlags.None);
                receiveCount += chunkSize;

                var chunk = this.requestContentReader.Read(buffer, offset, receiveCount);
                
                if (chunk.IsFailed)
                    throw new IOException();

                if (!chunk.MoreExpected)
                {
                    Array.Copy(
                        buffer, chunk.DataOffset,
                        buffer, offset,
                        chunk.DataLength);

                    int chunkEnd = chunk.DataOffset + chunk.DataLength - offset;
                    int overspillSize = offset + receiveCount - chunkEnd;

                    throw new NotImplementedException();
                    //if()
                }
                    
            }

        }

        internal IAsyncResult RequestBeginRead(byte[] buffer, int offset, int count, AsyncCallback callback, object state)
        {
            throw new NotImplementedException();
        }

        internal int RequestEndRead(IAsyncResult asyncResult)
        {
            throw new NotImplementedException();
        }

        internal void RequestStreamClose(ArraySegment<byte> excessBytes)
        {
            throw new NotImplementedException();
        }

        internal void ResponseStreamWrite(byte[] buffer, int offset, int count)
        {
            if (this.currentState != ConnectionState.SendingResponse)
            {
                var headerBytes = GenerateResponseHeader();
                this.Socket.SendAll(headerBytes.Array, headerBytes.Offset, headerBytes.Count);
                this.currentState = ConnectionState.SendingResponse;
            }

            if (this.context.SendChunked)
                ResponseStreamWriteChunked(buffer, offset, count);
            else
                ResponseStreamWriteDirect(buffer, offset, count);
        }

        void ResponseStreamWriteDirect(byte[] buffer, int offset, int count)
        {
            this.context.WrittenContentLength += count;

            this.Socket.SendAll(buffer, offset, count);
        }

        void ResponseStreamWriteChunked(byte[] buffer, int offset, int count)
        {
            ResponseStreamGenerateChunkHeader(count);

            byte[] chunkHeaderBuffer = this.context.ChunkHeaderBufStream.GetBuffer();

            this.Socket.SendAll(chunkHeaderBuffer, 0, (int)this.context.ChunkHeaderBufStream.Length);

            this.Socket.SendAll(buffer, offset, count);

            this.Socket.SendAll(chunkHeaderBuffer, (int)this.context.ChunkHeaderBufStream.Length - 2, 2);
        }

        void ResponseStreamGenerateChunkHeader(int count)
        {
            if (this.context.ChunkHeaderBufStream == null)
                this.context.ChunkHeaderBufStream = new MemoryStream();
            if (this.context.ChunkHeaderBufWriter == null)
                this.context.ChunkHeaderBufWriter = new StreamWriter(
                    this.context.ChunkHeaderBufStream,
                    this.context.Response.ContentEncoding ?? Encoding.UTF8);

            this.context.ChunkHeaderBufWriter.Flush();
            this.context.ChunkHeaderBufStream.Position = 0;
            this.context.ChunkHeaderBufWriter.WriteLine(count.ToString("x"));
            this.context.ChunkHeaderBufWriter.Flush();
        }

        internal IAsyncResult ResponseStreamBeginWrite(byte[] buffer, int offset, int count, AsyncCallback callback, object state)
        {
            ArraySegment<byte> headerBytes;

            if (this.currentState != ConnectionState.SendingResponse)
            {
                headerBytes = GenerateResponseHeader();
                this.Socket.SendAll(headerBytes.Array, headerBytes.Offset, headerBytes.Count);
                this.currentState = ConnectionState.SendingResponse;
            }
            else
            {
                headerBytes = default(ArraySegment<byte>);
            }

            if (this.context.SendChunked)
                return this.ResponseStreamBeginWriteChunked(headerBytes, new ArraySegment<byte>(buffer, offset,count), callback, state);
            else
                return this.ResponseStreamBeginWriteDirect(headerBytes, new ArraySegment<byte>(buffer, offset, count), callback, state);
        }

        private IAsyncResult ResponseStreamBeginWriteDirect(
            ArraySegment<byte> headerBytes,
            ArraySegment<byte> payload,
            AsyncCallback callback, object state)
        {
            if (headerBytes.Array != null)
                return this.Socket.BeginSendAll(
                    callback, state,
                    headerBytes, payload);
            else
                return this.Socket.BeginSendAll(
                    callback, state,
                    payload);
        }

        private IAsyncResult ResponseStreamBeginWriteChunked(
            ArraySegment<byte> headerBytes,
            ArraySegment<byte> payload,
            AsyncCallback callback, object state)
        {
            ResponseStreamGenerateChunkHeader(payload.Count);
            var chunkHeader = new ArraySegment<byte>(this.context.ChunkHeaderBufStream.GetBuffer(), 0, (int)this.context.ChunkHeaderBufStream.Length);
            var chunkFooter = new ArraySegment<byte>(chunkHeader.Array, chunkHeader.Count - 2, 2);

            if (headerBytes.Array != null)
                return this.Socket.BeginSendAll(
                    callback, state,
                    headerBytes, chunkHeader, payload, chunkFooter);
            else
                return this.Socket.BeginSendAll(
                    callback, state,
                    chunkHeader, payload, chunkFooter);
        }

        internal void ResponseStreamEndWrite(IAsyncResult asyncResult)
        {
            ((AsyncResult)asyncResult).EndAction();
        }

        internal void ResponseStreamClose()
        {
            if (this.context.SendChunked)
            {
                ResponseStreamGenerateChunkHeader(0);
                var chunkHeader = new ArraySegment<byte>(this.context.ChunkHeaderBufStream.GetBuffer(), 0, (int)this.context.ChunkHeaderBufStream.Length);
                var chunkFooter = new ArraySegment<byte>(chunkHeader.Array, chunkHeader.Count - 2, 2);

                this.Socket.SendAll(chunkHeader.Array, chunkHeader.Offset, chunkHeader.Count);
                this.Socket.SendAll(chunkFooter.Array, chunkFooter.Offset, chunkFooter.Count);
                this.Socket.SendAll(chunkFooter.Array, chunkFooter.Offset, chunkFooter.Count);
            }
        }
    }
}