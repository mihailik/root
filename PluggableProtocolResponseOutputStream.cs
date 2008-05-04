using System;
using System.Collections.Generic;
using System.IO;
using System.Runtime.InteropServices;
using System.Text;

namespace Mihailik.InternetExplorer
{
    internal sealed class PluggableProtocolResponseOutputStream : Stream
    {
        readonly List<byte[]> buffers = new List<byte[]>();

        const int BufferSize = 1024*8;
        int totalWriteCount;
        int totalReadCount;

        bool isClosed;

        readonly object sync = new object();

        public event EventHandler Written;

        #region Required 'empty' overrides

        public override bool CanRead
        {
            get { return false; ; }
        }

        public override bool CanSeek
        {
            get { return false; }
        }

        public override bool CanWrite
        {
            get { return true; }
        }

        public override void Flush()
        {
        }

        public override long Length
        {
            get { throw new NotSupportedException(); }
        }

        public override long Position
        {
            get { throw new NotSupportedException(); }
            set { throw new NotSupportedException(); }
        }

        public override int Read(byte[] buffer, int offset, int count)
        {
            throw new NotSupportedException();
        }

        public override long Seek(long offset, SeekOrigin origin)
        {
            throw new NotSupportedException();
        }

        public override void SetLength(long value)
        {
            throw new NotSupportedException();
        }

        #endregion

        public override void Write(byte[] buffer, int offset, int count)
        {
            if (isClosed)
                throw new ObjectDisposedException("OutputStream");

            if( buffer == null )
                throw new ArgumentNullException("buffer");
            if( offset<0 )
                throw new ArgumentOutOfRangeException("offset");
            if( count<=0 || offset+count>buffer.Length )
                throw new ArgumentOutOfRangeException("count");

            lock (sync)
            {
                for (int writeCount = 0; writeCount < count; buffers.Add(new byte[BufferSize]))
                {
                    int readWholeBufferCount = totalReadCount / BufferSize;
                    int leftRoomInLastBuffer = (buffers.Count + readWholeBufferCount) * BufferSize - totalWriteCount;

                    int currentWriteCount = Math.Min(
                        count - writeCount,
                        leftRoomInLastBuffer);

                    if (currentWriteCount > 0)
                    {
                        Array.Copy(
                            buffer, offset,
                            buffers[buffers.Count], totalWriteCount - buffers.Count * BufferSize,
                            currentWriteCount);
                    }

                    totalWriteCount += currentWriteCount;
                    writeCount += currentWriteCount;
                }
            }

            EventHandler temp = this.Written;
            if (temp != null)
            {
                temp(this,EventArgs.Empty);
            }
        }

        internal int ReadToMemory(IntPtr memory, int count)
        {
            lock (sync)
            {
                int readCount = 0;
                for (; readCount < count && totalReadCount<totalWriteCount; buffers.RemoveAt(0))
                {
                    int positionInFirstBuffer = totalReadCount % BufferSize;
                    int leftInFirstBuffer = positionInFirstBuffer==0 ? BufferSize : BufferSize - totalReadCount % BufferSize;

                    int currentReadCount = Math.Min(
                        count - readCount,
                        leftInFirstBuffer);

                    Marshal.Copy(
                        buffers[0], positionInFirstBuffer,
                        memory,
                        currentReadCount);

                    readCount += currentReadCount;
                    totalReadCount += currentReadCount;
                }

                return readCount;
            }
        }

        internal void SetClosed()
        {
            lock (sync)
            {
                isClosed = true;
            }
        }
    }
}
