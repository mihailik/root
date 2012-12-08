using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using Mi.PE.Cli.Tables;

namespace Mi.PE.Internal
{
    public sealed class BinaryStreamReader
    {
        readonly Stream stream;
        readonly byte[] buffer;
        int bufferDataPosition;
        int bufferDataSize;

        public BinaryStreamReader(Stream stream, byte[] buffer)
        {
            if (stream == null)
                throw new ArgumentNullException("stream");
            if (buffer == null)
                throw new ArgumentNullException("buffer");
            if (buffer.Length < 8)
                throw new ArgumentException("Too short buffer, needs to fit at least sizeof(long).", "buffer");

            this.stream = stream;
            this.buffer = buffer;
        }

        public BinaryStreamReader(byte[] source, int offset, int length)
        {
            if (source == null)
                throw new ArgumentNullException("source");

            this.buffer = source;
            this.bufferDataPosition = checked((int)offset);
            this.bufferDataSize = checked((int)length);
        }

        public long Position
        { 
            get 
            {
                return
                    this.stream == null ?
                    -1 :
                    this.stream.Position - this.bufferDataSize; 
            } 
            set
            {
                if (this.stream == null)
                    throw new NotSupportedException("Buffer-based reader cannot be repositioned safely.");

                long offset = value - this.Position;
                if (offset == 0)
                {
                    return;
                }
                else if (offset > 0 && offset <this.bufferDataSize )
                {
                    this.bufferDataPosition += unchecked((int)offset);
                    this.bufferDataSize -= unchecked((int)offset);
                }
                else
                {
                    this.stream.Position = value;
                    this.bufferDataPosition = 0;
                    this.bufferDataSize = 0;
                }
            }
        }

        public byte ReadByte()
        {
            EnsurePopulatedData(1);
            byte result = buffer[bufferDataPosition];
            SkipUnchecked(1);
            return result;
        }

        public int ReadInt32()
        {
            EnsurePopulatedData(4);
            int result = BitConverter.ToInt32(buffer, bufferDataPosition);
            SkipUnchecked(4);
            return result;
        }

        public uint ReadUInt32()
        {
            return unchecked((uint)this.ReadInt32());
        }

        public short ReadInt16()
        {
            EnsurePopulatedData(2);
            short result = BitConverter.ToInt16(buffer, bufferDataPosition);
            SkipUnchecked(2);
            return result;
        }

        public ushort ReadUInt16()
        {
            return unchecked((ushort)this.ReadInt16());
        }

        public long ReadInt64()
        {
            EnsurePopulatedData(8);
            long result = BitConverter.ToInt64(buffer, bufferDataPosition);
            SkipUnchecked(8);
            return result;
        }

        public ulong ReadUInt64()
        {
            return unchecked((ulong)this.ReadInt64());
        }

        public string ReadFixedZeroFilledAsciiString(int size)
        {
            if (size < 0)
                throw new ArgumentOutOfRangeException("size", "Negative size is not allowed for string length.");

            if (size <= 8 || size <= this.bufferDataSize)
            {
                EnsurePopulatedData(size);
                int actualSize = 0;
                for (int i = 0; i < size; i++)
                {
                    if (this.buffer[this.bufferDataPosition + i] != 0)
                        actualSize = i + 1;
                }

                char[] strChars = new char[actualSize];
                for (int i = 0; i < strChars.Length; i++)
                {
                    strChars[i] = (char)this.buffer[this.bufferDataPosition + i];
                }

                string result = new string(strChars);

                SkipUnchecked(size);

                return result;
            }
            else
            {
                if (stream == null)
                    throw new EndOfStreamException();

                byte[] byteBuffer = new byte[size];
                Array.Copy(
                    this.buffer, this.bufferDataPosition,
                    byteBuffer, 0,
                    this.bufferDataSize);
                int byteBufferLegth = this.bufferDataSize;

                this.bufferDataPosition = 0;
                this.bufferDataSize = 0;

                while (true)
                {
                    int readCount = this.stream.Read(byteBuffer, 0, byteBuffer.Length - byteBufferLegth);

                    if (readCount <= 0)
                        throw new EndOfStreamException();

                    byteBufferLegth += readCount;

                    if (byteBufferLegth == size)
                        break;
                }

                int actualSize = 0;
                for (int i = 0; i < size; i++)
                {
                    if (byteBuffer[i] != 0)
                        actualSize = i + 1;
                }

                string result = Encoding.UTF8.GetString(byteBuffer, 0, actualSize);

                return result;
            }
        }

        public void ReadBytes(byte[] buffer, int offset, int length)
        {
            if (buffer == null)
                throw new ArgumentNullException("buffer");
            if (offset < 0 || offset > buffer.Length)
                throw new ArgumentOutOfRangeException("offset", "Offset should point within the buffer.");
            if (length < 0 || offset + length > buffer.Length)
                throw new ArgumentOutOfRangeException("length", "Length should be positive and point within the buffer.");

            if (length < 8 || length < this.bufferDataSize)
            {
                EnsurePopulatedData(length);

                Array.Copy(
                    this.buffer, this.bufferDataPosition,
                    buffer, offset,
                    length);

                SkipUnchecked(length);
            }
            else
            {
                if (stream == null)
                    throw new EndOfStreamException();

                Array.Copy(
                    this.buffer, this.bufferDataPosition,
                    buffer, offset,
                    this.bufferDataSize);

                int readCount = this.bufferDataSize;

                this.bufferDataPosition = 0;
                this.bufferDataSize = 0;

                while (readCount < length)
                {
                    int chunkSize = stream.Read(buffer, offset + readCount, length - readCount);

                    if (chunkSize <= 0)
                        throw new EndOfStreamException();

                    readCount += chunkSize;
                }
            }
        }

        private void SkipUnchecked(int size)
        {
            this.bufferDataSize-=size;
            if (this.bufferDataSize == 0)
                this.bufferDataPosition = 0;
            else
                this.bufferDataPosition += size;
        }

        private void EnsurePopulatedData(int size)
        {
            if (this.bufferDataSize < size)
            {
                if (this.stream == null)
                    throw new EndOfStreamException();

                if (this.buffer.Length - this.bufferDataPosition < size)
                {
                    Array.Copy(
                        this.buffer, this.bufferDataPosition,
                        this.buffer, 0,
                        this.bufferDataSize);

                    this.bufferDataPosition = 0;
                }

                while (this.bufferDataSize < size)
                {
                    int bufferDataEnd = this.bufferDataPosition + this.bufferDataSize;
                    int readCount = this.stream.Read(this.buffer, bufferDataEnd, this.buffer.Length - bufferDataEnd);

                    if (readCount <= 0)
                        throw new EndOfStreamException();

                    this.bufferDataSize += readCount;
                }
            }
        }
    }
}