using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace Mi.PE.Internal
{
    [TestClass]
    public class BinaryStreamWriterTests
    {
        [TestMethod]
        public void Constructor()
        {
            var writer = new BinaryStreamWriter(new MemoryStream());
        }

        [TestMethod]
        public void WriteByte()
        {
            const byte value = 121;
            TestWrite(
                writer => writer.WriteByte(value),
                new [] { value });
        }

        [TestMethod]
        public void WriteUInt16()
        {
            const ushort value = 45321;
            TestWrite(
                writer => writer.WriteUInt16(value),
                BitConverter.GetBytes(value));
        }

        [TestMethod]
        public void WriteUInt32()
        {
            const uint value = 11245321;
            TestWrite(
                writer => writer.WriteUInt32(value),
                BitConverter.GetBytes(value));
        }

        [TestMethod]
        public void WriteUInt64()
        {
            const ulong value = 112453210002;
            TestWrite(
                writer => writer.WriteUInt64(value),
                BitConverter.GetBytes(value));
        }

        [TestMethod]
        public void WriteBytes_Empty()
        {
            byte[] value = new byte[] { };
            TestWrite(
                writer => writer.WriteBytes(value, 0, value.Length),
                value);
        }

        [TestMethod]
        public void WriteBytes_5bytes()
        {
            byte[] value = new byte[] { 45, 123, 78, 122, 66 };
            TestWrite(
                writer => writer.WriteBytes(value, 0, value.Length),
                value);
        }

        [TestMethod]
        public void WriteBytes_4bytesOfLargerArray()
        {
            TestWrite(
                writer => writer.WriteBytes(new byte[] { 0, 16, 45, 123, 78, 122, 66 }, 2, 4),
                new byte[] { 45, 123, 78, 122 });
        }

        [ExpectedException(typeof(ArgumentNullException))]
        [TestMethod]
        public void WriteBytes_Null()
        {
            var outputBuf = new MemoryStream();
            var writer = new BinaryStreamWriter(outputBuf);
            writer.WriteBytes(null, 0, 0);
        }

        [TestMethod]
        public void WriteFixedZeroFilledAsciiString()
        {
            const string value = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            TestWrite(
                writer => writer.WriteFixedZeroFilledAsciiString(value, value.Length),
                Encoding.ASCII.GetBytes(value));
        }

        [TestMethod]
        public void WriteFixedZeroFilledAsciiString_TrailingZeros()
        {
            const string value = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            TestWrite(
                writer => writer.WriteFixedZeroFilledAsciiString(value, value.Length+10),
                Encoding.ASCII.GetBytes(value).Concat(Enumerable.Repeat((byte)0, 10)).ToArray());
        }

        [ExpectedException(typeof(ArgumentException))]
        [TestMethod]
        public void WriteFixedZeroFilledAsciiString_StringTooLarge()
        {
            var outputBuf = new MemoryStream();
            var writer = new BinaryStreamWriter(outputBuf);
            writer.WriteFixedZeroFilledAsciiString("ABCDEFGHIJKLMNOPQRSTUVWXYZ", 4);
        }

        [ExpectedException(typeof(ArgumentOutOfRangeException))]
        [TestMethod]
        public void WriteFixedZeroFilledAsciiString_NegativeLength()
        {
            var outputBuf = new MemoryStream();
            var writer = new BinaryStreamWriter(outputBuf);
            writer.WriteFixedZeroFilledAsciiString("ABCDEFGHIJKLMNOPQRSTUVWXYZ", -5);
        }

        [TestMethod]
        public void WriteFixedZeroFilledAsciiString_EmptyStringZeroLength()
        {
            var outputBuf = new MemoryStream();
            var writer = new BinaryStreamWriter(outputBuf);
            writer.WriteFixedZeroFilledAsciiString("", 0);
            Assert.AreEqual(0L, outputBuf.Length);
        }

        [ExpectedException(typeof(ArgumentNullException))]
        [TestMethod]
        public void WriteFixedZeroFilledAsciiString_NullString()
        {
            var outputBuf = new MemoryStream();
            var writer = new BinaryStreamWriter(outputBuf);
            writer.WriteFixedZeroFilledAsciiString(null, 1);
        }

        [TestMethod]
        public void GetPosition()
        {
            var outputBuf = new MemoryStream();
            var writer = new BinaryStreamWriter(outputBuf);
            writer.WriteByte(12);
            Assert.AreEqual(1L, writer.Position);
        }

        [TestMethod]
        public void SetPosition()
        {
            var outputBuf = new MemoryStream();
            var writer = new BinaryStreamWriter(outputBuf);
            writer.WriteByte(12);
            writer.Position = 0;
            Assert.AreEqual(0L, outputBuf.Position);
        }

        [TestMethod]
        public void SetPosition_SameValue()
        {
            var outputBuf = new MemoryStream();
            var writer = new BinaryStreamWriter(outputBuf);
            writer.WriteByte(12);
            writer.Position = 1;
            Assert.AreEqual(1L, outputBuf.Position);
        }

        static void TestWrite(Action<BinaryStreamWriter> write, byte[] expectedBytes)
        {
            var outputBuf = new MemoryStream();
            var writer = new BinaryStreamWriter(outputBuf);
            write(writer);
            byte[] outputBytes = outputBuf.ToArray();
            Assert.AreEqual(expectedBytes.Length, outputBytes.Length, "outputBytes.Length");
            for (int i = 0; i < expectedBytes.Length; i++)
            {
                Assert.AreEqual(expectedBytes[i], outputBytes[i], "outputBytes[" + i + "]");
            }
        }
    }
}