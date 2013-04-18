using System;
using System.Collections.Generic;
using System.Text;

using EndPoint = System.Net.EndPoint;
using Socket = System.Net.Sockets.Socket;
using SocketException = System.Net.Sockets.SocketException;

namespace Mihailik.Net
{
    internal sealed class EndPointListener
    {
        readonly EndPoint m_EndPoint;
        readonly Socket listeningSocket;

        bool isClosed = false;

        public EndPointListener(EndPoint endPoint)
        {
            this.m_EndPoint = endPoint;
            this.listeningSocket = new Socket(
                endPoint.AddressFamily,
                System.Net.Sockets.SocketType.Stream,
                System.Net.Sockets.ProtocolType.Tcp);

            bool socketStartSucceeded = false;
            try
            {
                listeningSocket.Bind(endPoint);
                listeningSocket.Listen((int)System.Net.Sockets.SocketOptionName.MaxConnections);
                listeningSocket.BeginAccept(Accept_Complete, null);
                socketStartSucceeded = true;
            }
            finally
            {
                if (!socketStartSucceeded)
                {
                    try
                    {
                        ((IDisposable)listeningSocket).Dispose();
                    }
                    catch (ObjectDisposedException) { }
                    catch (SocketException) { }
                }
            }
        }

        public EndPoint EndPoint { get { return m_EndPoint; } }

        public void Shutdown()
        {
            if (isClosed)
                return;

            isClosed = true;
            try
            {
                ((IDisposable)listeningSocket).Dispose();
            }
            catch (ObjectDisposedException) { }
            catch (SocketException) { }
        }

        void Accept_Complete(IAsyncResult ar)
        {
            if( isClosed )
                return;

            Socket connectionSocket;

            try
            {
                connectionSocket = listeningSocket.EndAccept(ar);
            }
            catch( ObjectDisposedException error )
            {
                OnAcceptFailed(error);
                return;
            }
            catch(SocketException error)
            {
                OnAcceptFailed(error);
                return;
            }

            listeningSocket.BeginAccept(Accept_Complete, null);

            HttpListenerConnection connection = new HttpListenerConnection(connectionSocket);
        }

        void OnAcceptFailed(Exception error)
        {
            isClosed = true;
        }
    }
}