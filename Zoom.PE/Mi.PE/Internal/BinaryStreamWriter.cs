using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;

namespace Mi.PE.Internal
{
    public sealed class BinaryStreamWriter
    {
        readonly byte[] buffer = new byte[8];
        readonly Stream stream;

        public BinaryStreamWriter(Stream stream)
        {
            this.stream = stream;
        }

        public void WriteByte(byte b)
        {
            stream.WriteByte(b);
        }

        public void WriteUInt16(ushort x)
        {
            this.buffer[0] = (byte)x;
            this.buffer[1] = (byte)(x >> 8);
            this.stream.Write(this.buffer, 0, 2);
        }

        public void WriteUInt32(uint x)
        {
            this.buffer[0] = (byte)x;
            this.buffer[1] = (byte)(x >> 8);
            this.buffer[2] = (byte)(x >> 16);
            this.buffer[3] = (byte)(x >> 24);
            this.stream.Write(this.buffer, 0, 4);
        }

        public void WriteUInt64(ulong x)
        {
            this.buffer[0] = (byte)x;
            this.buffer[1] = (byte)(x >> 8);
            this.buffer[2] = (byte)(x >> 16);
            this.buffer[3] = (byte)(x >> 24);
            this.buffer[4] = (byte)(x >> 32);
            this.buffer[5] = (byte)(x >> 40);
            this.buffer[6] = (byte)(x >> 48);
            this.buffer[7] = (byte)(x >> 56);
            this.stream.Write(this.buffer, 0, 8);
        }

        public void WriteBytes(byte[] bytes, int offset, int length)
        {
            this.stream.Write(bytes, offset, length);
        }

        public long Position
        {
            get { return stream.Position; }
            set
            {
                if (value == this.Position)
                    return;

                stream.Position = value;
            }
        }

        public void WriteFixedZeroFilledAsciiString(string str, int length)
        {
            if(str==null)
                throw new ArgumentNullException("str");
            if (length < 0)
                throw new ArgumentOutOfRangeException("Length cannot be negative.", "length");

            if (str.Length > length)
                throw new ArgumentException("String is too long (" + str.Length + " chars) to fit in expected length (" + length + " bytes).", "str");

            byte[] buf;
            if (length < this.buffer.Length)
                buf = this.buffer;
            else
                buf = new byte[length];

            for (int i = 0; i < str.Length; i++)
            {
                buf[i] = (byte)str[i];
            }

            if (buf == this.buffer)
            {
                // zero out the remaining of the buffer
                // except for when the buffer was just created anyway
                Array.Clear(buf, str.Length, length - str.Length);
            }

            this.stream.Write(buf, 0, length);
        }
    }
}