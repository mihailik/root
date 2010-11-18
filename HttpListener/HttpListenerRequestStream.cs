using System;
using System.Collections.Generic;
using System.Text;
using System.IO;
using System.Threading;

namespace Mihailik.Net
{
    internal sealed class HttpListenerRequestStream : Stream
    {
        readonly HttpListenerConnection connection;

        public HttpListenerRequestStream(HttpListenerConnection connection)
        {
            this.connection = connection;
        }

        public override bool CanRead { get { return true; } }
        public override bool CanSeek { get { return false; } }
        public override bool CanWrite { get { return false; } }

        public override long Length { get { throw new NotSupportedException(); } }
        public override long Position { get { throw new NotSupportedException(); } set { throw new NotSupportedException(); } }

        public override long Seek(long offset, SeekOrigin origin) { throw new NotSupportedException(); }
        public override void SetLength(long value) { throw new NotSupportedException(); }
        public override void Write(byte[] buffer, int offset, int count) { throw new NotSupportedException(); }
        public override void Flush() { throw new NotSupportedException(); }

        public override int Read(byte[] buffer, int offset, int count)
        {
            return this.connection.RequestRead(buffer, offset, count);
        }

        public override IAsyncResult BeginRead(byte[] buffer, int offset, int count, AsyncCallback callback, object state)
        {
            return this.connection.RequestBeginRead(buffer, offset, count, callback, state);
        }

        public override int EndRead(IAsyncResult asyncResult)
        {
            return this.connection.RequestEndRead(asyncResult);
        }

        public override void Close()
        {
            this.connection.RequestStreamClose(default(ArraySegment<byte>));
        }
    }
}
