using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Net;
using System.Net.Sockets;

namespace Mihailik.Net
{
    internal static class SocketExtensions
    {
        public static void SendAll(this Socket socket, byte[] buffer, int offset, int count)
        {
            int writtenCount = 0;
            while(true)
            {
                writtenCount += socket.Send(buffer, offset + writtenCount, count - writtenCount, SocketFlags.None);

                if (writtenCount == count)
                    break;
            }            
        }

        public static AsyncResult BeginSendAll(
            this Socket socket,
            AsyncCallback callback, object state,
            params ArraySegment<byte>[] chunks)
        {
            int totalCount = 0;
            foreach (var ch in chunks)
	        {
                totalCount += ch.Count;
	        }

            int sentBufferCount = 0;
            int currentBufferWrittenCount = 0;

            var args = new SocketAsyncEventArgs();
            var asyncResult = new AsyncResult(args, callback, state);

            Action handleSend = null;
            handleSend = () =>
            {
                if (args.SocketError != System.Net.Sockets.SocketError.Success)
                {
                    asyncResult.CompleteWithError(new System.Net.Sockets.SocketException((int)args.SocketError));
                    return;
                }

                int sentCount = args.BytesTransferred;
                while(true)
                {
                    if(currentBufferWrittenCount+sentCount > chunks[sentBufferCount].Count)
                    {
                        sentCount-=chunks[sentBufferCount].Count-currentBufferWrittenCount;

                        if(sentBufferCount==chunks.Length)
                        {
                            asyncResult.CompleteSuccessfully();
                            return;
                        }

                        sentBufferCount++;
                    }
                    else
                    {
                        break;
                    }
                }

                
                var ch = chunks[sentBufferCount];
                args.BufferList = null;
                args.SetBuffer(ch.Array, ch.Offset + currentBufferWrittenCount, ch.Count - currentBufferWrittenCount);

                if (!socket.SendAsync(args))
                {
                    handleSend();
                }
            };

            args.Completed += delegate
            {
                handleSend();
            };

            args.BufferList = chunks;

            if(!socket.SendAsync(args))
            {
                asyncResult.CompletedSynchronously = true;
                
                handleSend();
            }

            return asyncResult;
        }
    }
}
