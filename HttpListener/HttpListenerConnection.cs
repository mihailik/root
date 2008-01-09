using System;
using System.Collections.Generic;
using System.Text;
using System.Net.Sockets;

using Mihailik.Net.Internal.StateMachine;
using System.Threading;

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
            SkippingExcessiveContent
        }

        readonly Socket m_Socket;
        ArraySegment<byte> buffer;
        ConnectionState currentState;
        HttpRequestHeaderReader headerReader;

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

            throw new NotImplementedException();
        }

        void RejectBadHeader()
        {
            throw new NotImplementedException();
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
            throw new NotImplementedException();
        }
    }
}