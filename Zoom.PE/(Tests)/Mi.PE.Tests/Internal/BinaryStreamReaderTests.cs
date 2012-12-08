using System;
using System.Text;
using System.Collections.Generic;
using System.Linq;
using System.IO;

using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace Mi.PE.Internal
{
    [TestClass]
    public class BinaryStreamReaderTests
    {
        private sealed class GradualReadMemoryStream : MemoryStream
        {
            readonly Queue<int> portions;

            public GradualReadMemoryStream(byte[] bytes, params int[] portions)
                : base(bytes, false)
            {
                this.portions = new Queue<int>(portions);
            }

            public override int Read(byte[] buffer, int offset, int count)
            {
                return base.Read(buffer, offset, portions.Count == 0 ? count : portions.Dequeue());
            }
        }

        [TestMethod]
        public void CallConstructor()
        {
            var reader = new BinaryStreamReader(new MemoryStream(), new byte[128]);
        }

        [ExpectedException(typeof(ArgumentNullException))]
        [TestMethod]
        public void ConstructorThrowsForNullStream()
        {
            var reader = new BinaryStreamReader(null, new byte[128]);
        }

        [ExpectedException(typeof(ArgumentNullException))]
        [TestMethod]
        public void ConstructorThrowsForNullBuffer()
        {
            var reader = new BinaryStreamReader(new MemoryStream(), null);
        }

        [ExpectedException(typeof(ArgumentException))]
        [TestMethod]
        public void ConstructorThrowsForBufferSize7()
        {
            var reader = new BinaryStreamReader(new MemoryStream(), new byte[7]);
        }

        [TestMethod]
        public void ConstructorSucceedsForBufferSize8()
        {
            var reader = new BinaryStreamReader(new MemoryStream(), new byte[8]);
        }

        [TestMethod]
        public void EmptyBuffer20_Seek0()
        {
            var reader = new BinaryStreamReader(new MemoryStream(), new byte[20]);
            Assert.AreEqual(0, reader.Position);
        }

        [TestMethod]
        public void Stream34Buffer20_PositionIs0()
        {
            var reader = new BinaryStreamReader(new MemoryStream(new byte[34]), new byte[20]);
            Assert.AreEqual(0, reader.Position);
        }

        [TestMethod]
        public void Stream34Buffer20_Seek0()
        {
            var reader = new BinaryStreamReader(new MemoryStream(new byte[34]), new byte[20]);
            reader.Position = 0;
            Assert.AreEqual(0, reader.Position);
        }

        [TestMethod]
        public void Stream34Buffer20_Seek1To34()
        {
            var reader = new BinaryStreamReader(new MemoryStream(new byte[34]), new byte[20]);
            for (int i = 1; i <= 34; i++)
            {
                reader.Position++;
                Assert.AreEqual(i, reader.Position);
            }
        }

        [TestMethod]
        public void Stream34Buffer20_ReadByte_Seek1To34()
        {
            var reader = new BinaryStreamReader(new MemoryStream(new byte[34]), new byte[20]);
            reader.ReadByte();
            for (int i = 1; i <= 34; i++)
            {
                reader.Position++;
                Assert.AreEqual(i + 1, reader.Position);
            }
        }

        [TestMethod]
        public void ShortStream_ReadByte_ExtendStream_Seek1To34()
        {
            var stream = new MemoryStream();
            stream.SetLength(7);
            var reader = new BinaryStreamReader(stream, new byte[20]);
            reader.ReadByte();
            stream.SetLength(34);
            for (int i = 1; i <= 34; i++)
            {
                reader.Position = i;
                Assert.AreEqual(i, reader.Position);
            }
        }

        [TestMethod]
        public void ShortStream_ReadByte_ExtendStream_Seek34To1()
        {
            var stream = new MemoryStream();
            stream.SetLength(7);
            var reader = new BinaryStreamReader(stream, new byte[20]);
            reader.ReadByte();
            stream.SetLength(34);
            for (int i = 34; i >= 1; i--)
            {
                reader.Position = i;
                Assert.AreEqual(i, reader.Position);
            }
        }

        [TestMethod]
        public void ShortStream_ReadByte_ExtendStream_SeekReadInt64()
        {
            var stream = new MemoryStream();
            stream.SetLength(7);
            stream.Position = 6;
            stream.WriteByte(108);
            stream.Position = 0;

            var reader = new BinaryStreamReader(stream, new byte[8]);
            reader.ReadByte();
            stream.SetLength(34);
            reader.Position = 6;

            long value = reader.ReadInt64();
            Assert.AreEqual(108, value);
        }

        [TestMethod]
        public void ReadByte_213()
        {
            var reader = new BinaryStreamReader(new MemoryStream(new byte[] { 213 }), new byte[20]);
            byte value = reader.ReadByte();
            Assert.AreEqual(213, value);
        }

        [TestMethod]
        public void ReadByteReadByte_213()
        {
            var reader = new BinaryStreamReader(new MemoryStream(new byte[] { 0, 213 }), new byte[20]);
            reader.ReadByte();
            byte value = reader.ReadByte();
            Assert.AreEqual(213, value);
        }

        [TestMethod]
        public void ReadInt32_131232223()
        {
            var reader = new BinaryStreamReader(new MemoryStream(BitConverter.GetBytes(131232223)), new byte[20]);
            int value = reader.ReadInt32();
            Assert.AreEqual(131232223, value);
        }

        [TestMethod]
        public void ReadUInt32_131232223()
        {
            var reader = new BinaryStreamReader(new MemoryStream(BitConverter.GetBytes((uint)131232223)), new byte[20]);
            uint value = reader.ReadUInt32();
            Assert.AreEqual((uint)131232223, value);
        }

        [TestMethod]
        public void ReadInt16_M32223()
        {
            var reader = new BinaryStreamReader(new MemoryStream(BitConverter.GetBytes((short)-32223)), new byte[20]);
            short value = reader.ReadInt16();
            Assert.AreEqual((short)-32223, value);
        }

        [TestMethod]
        public void ReadUInt16_32223()
        {
            var reader = new BinaryStreamReader(new MemoryStream(BitConverter.GetBytes((ushort)32223)), new byte[20]);
            ushort value = reader.ReadUInt16();
            Assert.AreEqual((ushort)32223, value);
        }

        [TestMethod]
        public void ReadInt64_M322234534333()
        {
            var reader = new BinaryStreamReader(new MemoryStream(BitConverter.GetBytes(-322234534333L)), new byte[20]);
            long value = reader.ReadInt64();
            Assert.AreEqual(-322234534333L, value);
        }

        [TestMethod]
        public void ReadUInt64_322234534333()
        {
            var reader = new BinaryStreamReader(new MemoryStream(BitConverter.GetBytes((ulong)322234534333L)), new byte[20]);
            ulong value = reader.ReadUInt64();
            Assert.AreEqual((ulong)322234534333L, value);
        }

        [ExpectedException(typeof(EndOfStreamException))]
        [TestMethod]
        public void Empty_ReadByte()
        {
            var reader = new BinaryStreamReader(new MemoryStream(), new byte[20]);
            reader.ReadByte();
        }

        [TestMethod]
        public void ReadFixedZeroFilledString_0IsEmpty()
        {
            var reader = new BinaryStreamReader(new MemoryStream(), new byte[20]);
            string str = reader.ReadFixedZeroFilledAsciiString(0);
            Assert.AreEqual("", str);
        }

        [ExpectedException(typeof(ArgumentOutOfRangeException))]
        [TestMethod]
        public void ReadFixedZeroFilledString_Negative()
        {
            var reader = new BinaryStreamReader(new MemoryStream(), new byte[20]);
            string str = reader.ReadFixedZeroFilledAsciiString(-1);
        }

        [TestMethod]
        public void ReadFixedZeroFilledString_FilledWithZero()
        {
            var reader = new BinaryStreamReader(new MemoryStream(new byte[1]), new byte[20]);
            string str = reader.ReadFixedZeroFilledAsciiString(1);
            Assert.AreEqual("", str);
        }

        [TestMethod]
        public void ReadFixedZeroFilledString_A()
        {
            var reader = new BinaryStreamReader(new MemoryStream(new byte[] { 65 }), new byte[20]);
            string str = reader.ReadFixedZeroFilledAsciiString(1);
            Assert.AreEqual("A", str);
        }

        [TestMethod]
        public void ShortThenExtend_ReadFixedZeroFilledString_Alphabet()
        {
            var stream = new GradualReadMemoryStream(Encoding.ASCII.GetBytes("*ABCDEFGHIJKLMNOPQRSTUVWXYZ"), 1);
            var reader = new BinaryStreamReader(stream, new byte[20]);
            reader.ReadByte();
            string str = reader.ReadFixedZeroFilledAsciiString(26);
            Assert.AreEqual("ABCDEFGHIJKLMNOPQRSTUVWXYZ", str);
        }

        [ExpectedException(typeof(EndOfStreamException))]
        [TestMethod]
        public void ReadFixedZeroFilledString_StreamTooShort()
        {
            var stream = new MemoryStream();
            var reader = new BinaryStreamReader(stream, new byte[20]);
            reader.ReadFixedZeroFilledAsciiString(8);
        }

        [ExpectedException(typeof(EndOfStreamException))]
        [TestMethod]
        public void ShortThenExtend_ReadFixedZeroFilledString_StreamTooShort()
        {
            var stream = new GradualReadMemoryStream(Encoding.ASCII.GetBytes("*ABCD"), 1);
            var reader = new BinaryStreamReader(stream, new byte[20]);
            reader.ReadByte();
            reader.ReadFixedZeroFilledAsciiString(20);
        }

        [TestMethod]
        public void ReadBytes_123()
        {
            var reader = new BinaryStreamReader(new MemoryStream(new byte[] { 1, 2, 3, }), new byte[20]);
            byte[] result = new byte[3];
            reader.ReadBytes(result, 0, 3);
            Assert.AreEqual(1, result[0]);
            Assert.AreEqual(2, result[1]);
            Assert.AreEqual(3, result[2]);
        }

        [ExpectedException(typeof(ArgumentNullException))]
        [TestMethod]
        public void ReadBytes_NullBuffer()
        {
            var reader = new BinaryStreamReader(new MemoryStream(), new byte[20]);
            reader.ReadBytes(null, 0, 1);
        }

        [ExpectedException(typeof(ArgumentOutOfRangeException))]
        [TestMethod]
        public void ReadBytes_NegativeOffset()
        {
            var reader = new BinaryStreamReader(new MemoryStream(), new byte[20]);
            reader.ReadBytes(new byte[3], -1, 1);
        }

        [ExpectedException(typeof(ArgumentOutOfRangeException))]
        [TestMethod]
        public void ReadBytes_TooLargeOffset()
        {
            var reader = new BinaryStreamReader(new MemoryStream(), new byte[20]);
            reader.ReadBytes(new byte[3], 10, 1);
        }

        [ExpectedException(typeof(ArgumentOutOfRangeException))]
        [TestMethod]
        public void ReadBytes_NegativeLength()
        {
            var reader = new BinaryStreamReader(new MemoryStream(), new byte[20]);
            reader.ReadBytes(new byte[3], 0, -1);
        }

        [ExpectedException(typeof(ArgumentOutOfRangeException))]
        [TestMethod]
        public void ReadBytes_TooLargeLength()
        {
            var reader = new BinaryStreamReader(new MemoryStream(), new byte[20]);
            reader.ReadBytes(new byte[3], 0, 10);
        }

        [TestMethod]
        public void ReadBytes_Gradual()
        {
            byte[] input =new byte[10];
            for (int i = 0; i < input.Length; i++)
			{
                input[i] = (byte)i;
			}
            var stream = new GradualReadMemoryStream(input, 3, 7);
            var reader = new BinaryStreamReader(stream, new byte[8]);
            byte[] output = new byte[input.Length];
            reader.ReadBytes(output, 0, output.Length);

            Assert.AreEqual(input.Length, output.Length);
            for (int i = 0; i < output.Length; i++)
            {
                Assert.AreEqual(input[i], output[i], "output[" + i + "]");
            }
        }

        [ExpectedException(typeof(EndOfStreamException))]
        [TestMethod]
        public void ReadBytes_Gradual_EOF()
        {
            byte[] input = new byte[10];
            var stream = new GradualReadMemoryStream(input, 3, 7);
            var reader = new BinaryStreamReader(stream, new byte[8]);
            byte[] output = new byte[input.Length + 5];
            reader.ReadBytes(output, 0, output.Length);
        }
    }
}