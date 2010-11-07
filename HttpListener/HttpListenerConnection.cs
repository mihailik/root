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
            SendingResponseHeader,
            SendingResponseContent,
            SkippingExcessiveContent,
            Closed
        }

        public sealed class EndWriteAsyncResult : IAsyncResult
        {
            readonly object syncRoot;
            readonly object m_AsyncState;
            readonly AsyncCallback callback;
            WaitHandle m_AsyncWaitHandle;

            Exception error;

            public EndWriteAsyncResult(object syncRoot, AsyncCallback callback, object state)
            {
                this.syncRoot = syncRoot;
                this.callback = callback;
                this.m_AsyncState = state;
            }

            public object AsyncState { get { return this.m_AsyncState; } }
            public bool CompletedSynchronously { get { return false; } }
            public bool IsCompleted { get; private set; }

            public WaitHandle AsyncWaitHandle
            {
                get
                {
                    if (m_AsyncWaitHandle == null)
                    {
                        lock (syncRoot)
                        {
                            if (this.IsCompleted)
                                m_AsyncWaitHandle = Mihailik.Collections.NoWaitHandle.Instance;
                            else
                                m_AsyncWaitHandle = new ManualResetEvent(false);
                        }
                    }
                    return m_AsyncWaitHandle;
                }
            }

            public void CompleteSuccessfully()
            {
                lock(syncRoot)
                {
                    this.IsCompleted = true;
                    Monitor.PulseAll(syncRoot);
                }
            }

            public void CompleteWithError(Exception error)
            {
                lock (syncRoot)
                {
                    this.IsCompleted = true;
                    this.error = error;
                    Monitor.PulseAll(syncRoot);
                }
            }

            public void EndWrite()
            {
                while(!this.IsCompleted)
                {
                    Monitor.Wait(syncRoot);
                }

                if (this.error != null)
                    throw error;
            }
        }

        static byte[] BadHeaderResponse;
        static byte[] Http11200OKConnectionClose;

        readonly Socket m_Socket;
        ArraySegment<byte> buffer;
        ConnectionState currentState;
        HttpRequestHeaderReader headerReader;

        HttpListener dispatchedHttpListener;
        HttpListenerContext context;
        bool connectionClose;

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
            var request = new HttpListenerRequest(headerReader, this.Socket.LocalEndPoint, this.Socket.RemoteEndPoint);
            dispatchedHttpListener = HttpListener.Dispatch(request);

            currentState = ConnectionState.ProcessingCallback;
            AuthenticationSchemes scheme = dispatchedHttpListener.AuthenticationSchemes;
            var getAuthenticationSchemes = dispatchedHttpListener.AuthenticationSchemeSelectorDelegate;
            if (getAuthenticationSchemes != null)
                scheme = getAuthenticationSchemes(request);



            currentState = ConnectionState.ReadyToSendResponse;

            var response = new HttpListenerResponse(this)
            {
                ProtocolVersion = request.ProtocolVersion
            };

            this.context = new HttpListenerContext(
                request,
                response);

            dispatchedHttpListener.PublishContext(context);
        }

        internal void ResponseWrite(byte[] buffer, int offset, int count)
        {
            if (currentState == ConnectionState.ReadyToSendResponse)
            {
                SendResponseHeaderBlocking();
            }

            int sentCount = 0;
            while (sentCount < count)
            {
                int nextChunkSize = Socket.Send(buffer, offset+sentCount, count-sentCount, SocketFlags.None);
                sentCount += nextChunkSize;
            }
        }

        internal IAsyncResult ResponseBeginWrite(byte[] buffer, int offset, int count, AsyncCallback callback, object state)
        {
            Action processReceiveCompleted = null;

            var args = new SocketAsyncEventArgs();
            args.Completed+=delegate { processReceiveCompleted(); };

            var asyncResult = new EndWriteAsyncResult(args, callback, state);


            Action continueSend = null;
            int sentCount = 0;

            continueSend = () =>
            {
                args.SetBuffer(buffer, offset+offset, count-offset);
                if( !this.Socket.SendAsync(args))
                {
                    processReceiveCompleted();
                }
            };

            processReceiveCompleted = () =>
            {
                if (args.SocketError != SocketError.Success)
                {
                    asyncResult.CompleteWithError(new System.Net.Sockets.SocketException((int)args.SocketError));
                    return;
                }

                sentCount += args.BytesTransferred;

                if (sentCount < count)
                {
                    continueSend();
                    return;
                }

                asyncResult.CompleteSuccessfully();
            };


            if (currentState == ConnectionState.ReadyToSendResponse)
            {
                SendResponseHeaderAsync(asyncResult, continueSend);
            }
            else
            {
                continueSend();
            }

            return asyncResult;
        }

        ArraySegment<byte> GenerateResponseHeader()
        {
            if (this.context.Response.StatusCode == 200
                && this.context.Response.ContentLength64 == 0)
            {
                if (Http11200OKConnectionClose==null)
                {
                    Http11200OKConnectionClose = Encoding.ASCII.GetBytes(
                        "HTTP/1.1 200 OK\r\n" +
                        "Connection: Close\r\n" +
                        "\r\n");
                }

                return new ArraySegment<byte>(Http11200OKConnectionClose);
            }

            var memBuf = new MemoryStream();
            var writer = new StreamWriter(memBuf, Encoding.ASCII);

            writer.Write(
                this.context.Response.ProtocolVersion == System.Net.HttpVersion.Version10 ?
                "HTTP/1.0 " : "HTTP/1.1 ");

            writer.Write(this.context.Response.StatusCode);

            writer.WriteLine(((System.Net.HttpStatusCode)this.context.Response.StatusCode).ToString());
            bool overrideConnectionSetToClose = this.context.Response.ContentLength64 == 0;
            bool connectionHeaderEncountered = false;
            foreach (string headerName in this.context.Response.Headers.Keys)
            {
                string headerValue = this.context.Response.Headers[headerName];

                if (headerName == "Connection")
                {
                    connectionHeaderEncountered = true;
                    if (overrideConnectionSetToClose)
                    {
                        headerValue = "Close";
                        this.connectionClose = true;
                    }
                    else
                    {
                        this.connectionClose = String.Equals(headerValue, "Close");
                    }
                }

                writer.Write(headerName);
                writer.Write(": ");
                writer.WriteLine(headerValue);
            }

            if (!connectionHeaderEncountered)
            {
                writer.WriteLine("Connection: Close");
                this.connectionClose = true;
            }

            writer.WriteLine();


            var headerBuf = memBuf.GetBuffer();
            int headerLength = (int)memBuf.Length;

            writer.Close();

            return new ArraySegment<byte>(
                headerBuf,
                0,
                headerLength);
        }

        void SendResponseHeaderBlocking()
        {
            var header = GenerateResponseHeader();
            int headerSentByteCount = 0;
            this.currentState = ConnectionState.SendingResponseHeader;

            while (headerSentByteCount < header.Count)
            {
                int sentChunkSize = this.Socket.Send(
                    header.Array,
                    header.Offset + headerSentByteCount,
                    header.Count - headerSentByteCount,
                    SocketFlags.None);

                headerSentByteCount += sentChunkSize;
            }
        }

        void SendResponseHeaderAsync(EndWriteAsyncResult asyncResult, Action continueWithContent)
        {
            var header = GenerateResponseHeader();
            int headerSentByteCount = 0;
            this.currentState = ConnectionState.SendingResponseHeader;

            Action handleSendResult = null;
            var args = new SocketAsyncEventArgs();
            args.Completed += delegate { handleSendResult(); };
            
            Action sendMoreHeader = null;
            handleSendResult = () =>
            {
                if (args.SocketError != SocketError.Success)
                {
                    asyncResult.CompleteWithError(new System.Net.Sockets.SocketException((int)args.SocketError));
                    return;
                }

                int chunkSize = args.BytesTransferred;
                headerSentByteCount += chunkSize;

                if (headerSentByteCount == header.Count)
                {
                    continueWithContent();
                    return;
                }

                sendMoreHeader();
            };


            sendMoreHeader = () =>
            {
                 args.SetBuffer(header.Array, header.Offset + headerSentByteCount, header.Count - headerSentByteCount);
                 if (!this.Socket.SendAsync(args))
                 {
                     handleSendResult();
                 }
            };

            sendMoreHeader();
        }

        internal void EndWrite(IAsyncResult asyncResult)
        {
            var endWriteAsyncResult = (EndWriteAsyncResult)asyncResult;
            endWriteAsyncResult.EndWrite();
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
                SendResponseHeaderBlocking();
            }
            
            if (this.connectionClose)
            {
                try { this.Socket.Shutdown(System.Net.Sockets.SocketShutdown.Both); }
                catch { }
                try { this.Socket.Close(); }
                catch { }

                this.currentState = ConnectionState.Closed;
            }
            else
            {
                this.currentState = ConnectionState.ReadingHeader;
                BeginReceiveToBuffer();
            }
        }
    }
}