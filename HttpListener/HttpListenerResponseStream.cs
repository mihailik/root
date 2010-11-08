using System;
using System.Collections.Generic;
using System.Text;
using System.IO;
using System.Threading;

namespace Mihailik.Net
{
    internal sealed class HttpListenerResponseStream : Stream
    {
        readonly HttpListenerConnection connection;

        public HttpListenerResponseStream(HttpListenerConnection connection)
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
            this.connection.ResponseWrite(buffer, offset, count);
        }

        public override IAsyncResult BeginWrite(byte[] buffer, int offset, int count, AsyncCallback callback, object state)
        {
            return this.connection.ResponseBeginWrite(buffer, offset, count, callback, state);
        }

        public override void EndWrite(IAsyncResult asyncResult)
        {
            this.connection.EndWrite(asyncResult);
        }
    }
}
