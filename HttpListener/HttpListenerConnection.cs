using System;
using System.Collections.Generic;
using System.Text;

using System.Threading;

using Socket = System.Net.Sockets.Socket;
using AuthenticationSchemes = System.Net.AuthenticationSchemes;
using SocketAsyncEventArgs = System.Net.Sockets.SocketAsyncEventArgs;
using SocketError = System.Net.Sockets.SocketError;
using SocketFlags = System.Net.Sockets.SocketFlags;

using Mihailik.Net.Internal.StateMachine;

namespace Mihailik.Net
{
    internal sealed class HttpListenerConnection
    {
        enum ConnectionState
        {
            ReadingHeader,
            Rejecting,
            ProcessingCallback,
            Sending100Continue,
            Processing,
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

        readonly Socket m_Socket;
        ArraySegment<byte> buffer;
        ConnectionState currentState;
        HttpRequestHeaderReader headerReader;

        HttpListener dispatchedHttpListener;
        HttpListenerRequest request;

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
            request = new HttpListenerRequest(headerReader, this.Socket.LocalEndPoint, this.Socket.RemoteEndPoint);
            dispatchedHttpListener = HttpListener.Dispatch(request);

            currentState = ConnectionState.ProcessingCallback;
            AuthenticationSchemes scheme = dispatchedHttpListener.AuthenticationSchemes;
            var getAuthenticationSchemes = dispatchedHttpListener.AuthenticationSchemeSelectorDelegate;
            if (getAuthenticationSchemes != null)
                scheme = getAuthenticationSchemes(request);



            currentState = ConnectionState.Processing;

            var response = new HttpListenerResponse(this);

            var context = new HttpListenerContext(
                request,
                response);

            dispatchedHttpListener.Process(context);
        }

        internal void ResponseWrite(byte[] buffer, int offset, int count)
        {
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

            continueSend();

            return asyncResult;
        }

        internal void EndWrite(IAsyncResult asyncResult)
        {
            var endWriteAsyncResult = (EndWriteAsyncResult)asyncResult;
            endWriteAsyncResult.EndWrite();
        }

        internal void ResponseAbort()
        {
            this.currentState = ConnectionState.Closed;
        }

        internal void ResponseClose()
        {
            this.currentState = ConnectionState.ReadingHeader;
            BeginReceiveToBuffer();            
        }
    }
}