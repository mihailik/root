using System;
using System.Collections.Generic;
using System.Text;
using System.IO;
using System.Threading;

using Socket = System.Net.Sockets.Socket;
using SocketAsyncEventArgs = System.Net.Sockets.SocketAsyncEventArgs;

namespace Mihailik.Net
{
    internal sealed class HttpListenerResponseStream : Stream
    {
        
        readonly HttpListenerConnection connection;

        public HttpListenerResponseStream(
            HttpListenerConnection connection)
        {
            this.connection = connection;
        }

        public override void Flush() { }

        public override bool CanRead { get { return false; } }
        public override bool CanSeek { get { return false; } }
        public override bool CanWrite { get { return true; } }

        public override long Length { get { throw new NotSupportedException(); } }
        public override long Position { get { throw new NotSupportedException(); } set { throw new NotSupportedException(); } }

        public override long Seek(long offset, SeekOrigin origin) { throw new NotSupportedException(); }
        public override void SetLength(long value) { throw new NotSupportedException(); }
        public override int Read(byte[] buffer, int offset, int count) { throw new NotSupportedException(); }

        public override void Write(byte[] buffer, int offset, int count)
        {
            this.connection.ResponseStreamWrite(buffer, offset, count);
        }

        public override IAsyncResult BeginWrite(byte[] buffer, int offset, int count, AsyncCallback callback, object state)
        {
            return this.connection.ResponseStreamBeginWrite(buffer, offset, count, callback, state);
        }

        public override void EndWrite(IAsyncResult asyncResult)
        {
            this.connection.ResponseStreamEndWrite(asyncResult);
        }

        public override void Close()
        {
            this.connection.ResponseStreamClose();
        }
    }
}
