using System;
using System.Collections.Generic;
using System.Text;
using System.Net.Sockets;

using System.Threading;

using AuthenticationSchemes = System.Net.AuthenticationSchemes;

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

        static readonly byte[] BadHeaderResponse;

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
            catch (SocketException error)
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
            catch (SocketException) { }
        }

        void ProcessBufferData()
        {
            if (currentState != ConnectionState.ReadingHeader)
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
            request = new HttpListenerRequest(headerReader);
            dispatchedHttpListener = HttpListener.Dispatch(request.Url);

            currentState = ConnectionState.ProcessingCallback;
            AuthenticationSchemes scheme = dispatchedHttpListener.AuthenticationSchemes;
            Converter<HttpListenerRequest, AuthenticationSchemes> getAuthenticationSchemes = dispatchedHttpListener.AuthenticationSchemeSelectorDelegate;
            if (getAuthenticationSchemes != null)
                scheme = getAuthenticationSchemes(request);



            currentState = ConnectionState.Processing;
            ;

            throw new NotImplementedException();
        }
    }
}