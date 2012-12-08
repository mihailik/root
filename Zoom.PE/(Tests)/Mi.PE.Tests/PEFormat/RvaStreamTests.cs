using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace Mi.PE.PEFormat
{
    [TestClass]
    public class RvaStreamTests
    {
        [TestMethod]
        public void Constructor()
        {
            var stream = new RvaStream(new MemoryStream(new byte[5]), new RvaStream.Range { PhysicalAddress = 0, VirtualAddress = 0, Size = 5 });
        }

        [ExpectedException(typeof(ArgumentNullException))]
        [TestMethod]
        public void Constructor_NullStream()
        {
            var stream = new RvaStream(null);
        }

        [ExpectedException(typeof(ArgumentNullException))]
        [TestMethod]
        public void Constructor_NullRangeArray()
        {
            RvaStream.Range[] array = null;
            var stream = new RvaStream(new MemoryStream(), array);
        }

        [ExpectedException(typeof(ArgumentException))]
        [TestMethod]
        public void Constructor_EmptyRangeArray()
        {
            var stream = new RvaStream(new MemoryStream());
        }

        private sealed class NoReadStream : MemoryStream
        {
            public override bool CanRead { get { return false; } }
        }

        [ExpectedException(typeof(ArgumentException))]
        [TestMethod]
        public void Constructor_NoReadStream()
        {
            var stream = new RvaStream(new NoReadStream());
        }

        private sealed class NoSeekStream : MemoryStream
        {
            public override bool CanSeek { get { return false; } }
        }

        [ExpectedException(typeof(ArgumentException))]
        [TestMethod]
        public void Constructor_NoSeekStream()
        {
            var stream = new RvaStream(new NoSeekStream());
        }

        [TestMethod]
        public void CanRead()
        {
            var stream = new RvaStream(new MemoryStream(new byte[5]), new RvaStream.Range { PhysicalAddress = 0, VirtualAddress = 0, Size = 5 });
            Assert.IsTrue(stream.CanRead);
        }

        [TestMethod]
        public void CanSeek()
        {
            var stream = new RvaStream(new MemoryStream(new byte[5]), new RvaStream.Range { PhysicalAddress = 0, VirtualAddress = 0, Size = 5 });
            Assert.IsTrue(stream.CanSeek);
        }

        [TestMethod]
        public void CanWrite()
        {
            var stream = new RvaStream(new MemoryStream(new byte[5]), new RvaStream.Range { PhysicalAddress = 0, VirtualAddress = 0, Size = 5 });
            Assert.IsFalse(stream.CanWrite);
        }

        [ExpectedException(typeof(NotSupportedException))]
        [TestMethod]
        public void Flush()
        {
            var stream = new RvaStream(new MemoryStream(new byte[5]), new RvaStream.Range { PhysicalAddress = 0, VirtualAddress = 0, Size = 5 });
            stream.Flush();
        }

        [ExpectedException(typeof(NotSupportedException))]
        [TestMethod]
        public void Write()
        {
            var stream = new RvaStream(new MemoryStream(new byte[5]), new RvaStream.Range { PhysicalAddress = 0, VirtualAddress = 0, Size = 5 });
            stream.Write(new byte[2], 0, 2);
        }

        [ExpectedException(typeof(NotSupportedException))]
        [TestMethod]
        public void WriteByte()
        {
            var stream = new RvaStream(new MemoryStream(new byte[5]), new RvaStream.Range { PhysicalAddress = 0, VirtualAddress = 0, Size = 5 });
            stream.WriteByte(2);
        }

        [ExpectedException(typeof(NotSupportedException))]
        [TestMethod]
        public void BeginWrite()
        {
            var stream = new RvaStream(new MemoryStream(new byte[5]), new RvaStream.Range { PhysicalAddress = 0, VirtualAddress = 0, Size = 5 });
            stream.BeginWrite(
                new byte[2], 0, 2,
                ir => { },
                null);
        }

        [ExpectedException(typeof(NotSupportedException))]
        [TestMethod]
        public void EndWrite()
        {
            var stream = new RvaStream(new MemoryStream(new byte[5]), new RvaStream.Range { PhysicalAddress = 0, VirtualAddress = 0, Size = 5 });
            stream.EndWrite(null);
        }

        [ExpectedException(typeof(NotSupportedException))]
        [TestMethod]
        public void SetLength()
        {
            var stream = new RvaStream(new MemoryStream(new byte[5]), new RvaStream.Range { PhysicalAddress = 0, VirtualAddress = 0, Size = 5 });
            stream.SetLength(10);
        }

        [TestMethod]
        public void Read_CorrectResult()
        {
            byte[] bytes = new byte[] { 1, 200, 3, 4, 5 };
            var stream = new RvaStream(new MemoryStream(bytes), new RvaStream.Range { PhysicalAddress = 0, VirtualAddress = 34, Size = 5 });
            stream.Position = 34;
            byte[] result = new byte[5];
            stream.Read(result, 0, 5);

            Assert.AreEqual(bytes.Length, result.Length, "result.Length");
            for (int i = 0; i < result.Length; i++)
            {
                Assert.AreEqual(bytes[i], result[i], "result[" + i + "]");
            }
        }

        [TestMethod]
        public void Read_CorrectPosition()
        {
            byte[] bytes = new byte[] { 1, 200, 3, 4, 5 };
            var stream = new RvaStream(new MemoryStream(bytes), new RvaStream.Range { PhysicalAddress = 0, VirtualAddress = 34, Size = 5 });
            stream.Position = 34;
            byte[] result = new byte[4];
            stream.Read(result, 0, 4);

            Assert.AreEqual(34 + 4, (int)stream.Position);
        }

        [ExpectedException(typeof(IOException))]
        [TestMethod]
        public void Read_AtWrongOffset()
        {
            var rawStream = new MemoryStream(new byte[5]);
            var stream = new RvaStream(rawStream, new RvaStream.Range { PhysicalAddress = 2, VirtualAddress = 34, Size = 3 });
            rawStream.Position = 34;
            byte[] result = new byte[4];
            stream.Read(result, 0, 4);
        }

        [TestMethod]
        public void BeginEndRead_CorrectResult()
        {
            byte[] bytes = new byte[] { 1, 200, 3, 4, 5 };
            var stream = new RvaStream(new MemoryStream(bytes), new RvaStream.Range { PhysicalAddress = 0, VirtualAddress = 34, Size = 5 });
            stream.Position = 34;
            byte[] result = new byte[5];
            var ar = stream.BeginRead(
                result, 0, 5,
                ar_ => { }, null);

            stream.EndRead(ar);

            Assert.AreEqual(bytes.Length, result.Length, "result.Length");
            for (int i = 0; i < result.Length; i++)
            {
                Assert.AreEqual(bytes[i], result[i], "result[" + i + "]");
            }
        }

        [TestMethod]
        public void BeginEndRead_CorrectPosition()
        {
            byte[] bytes = new byte[] { 1, 200, 3, 4, 5 };
            var stream = new RvaStream(new MemoryStream(bytes), new RvaStream.Range { PhysicalAddress = 0, VirtualAddress = 34, Size = 5 });
            stream.Position = 34;
            byte[] result = new byte[4];
            var ar = stream.BeginRead(
                result, 0, 4,
                ar_ => { }, null);

            stream.EndRead(ar);

            Assert.AreEqual(34 + 4, (int)stream.Position);
        }

        private sealed class CanTimeoutStream : MemoryStream
        {
            readonly bool m_CanTimeout;

            public CanTimeoutStream(bool canTimeout)
            {
                this.m_CanTimeout = canTimeout;
            }

            public override bool CanTimeout { get { return m_CanTimeout; } }
        }

        [TestMethod]
        public void CanTimeout_True()
        {
            var stream = new RvaStream(new CanTimeoutStream(true), new RvaStream.Range { PhysicalAddress = 0, VirtualAddress = 0, Size = 5 });

            Assert.IsTrue(stream.CanTimeout);
        }

        [TestMethod]
        public void CanTimeout_False()
        {
            var stream = new RvaStream(new CanTimeoutStream(false), new RvaStream.Range { PhysicalAddress = 0, VirtualAddress = 0, Size = 5 });

            Assert.IsFalse(stream.CanTimeout);
        }

        private sealed class ReadTimeoutStream : MemoryStream
        {
            public override int ReadTimeout { get; set; }
        }

        [TestMethod]
        public void GetReadTimeout()
        {
            var stream = new RvaStream(
                new ReadTimeoutStream { ReadTimeout = 314 },
                new RvaStream.Range { PhysicalAddress = 0, VirtualAddress = 0, Size = 5 });

            Assert.AreEqual(314, stream.ReadTimeout);
        }

        [TestMethod]
        public void SetReadTimeout()
        {
            var rawStream = new ReadTimeoutStream();
            var stream = new RvaStream(
                rawStream,
                new RvaStream.Range { PhysicalAddress = 0, VirtualAddress = 0, Size = 5 });

            stream.ReadTimeout = 214;

            Assert.AreEqual(214, rawStream.ReadTimeout);
        }

        [ExpectedException(typeof(ArgumentOutOfRangeException))]
        [TestMethod]
        public void SetPosition_OutsideOfRange()
        {
            byte[] bytes = new byte[] { 1, 200, 3, 4, 5 };
            var stream = new RvaStream(new MemoryStream(bytes), new RvaStream.Range { PhysicalAddress = 2, VirtualAddress = 34, Size = 4 });
            stream.Position = 1;
        }

        [TestMethod]
        public void SetPosition()
        {
            byte[] bytes = new byte[] { 1, 200, 3, 4, 5 };
            var rawStream = new MemoryStream(bytes);
            var stream = new RvaStream(
                rawStream,
                new RvaStream.Range { PhysicalAddress = 0, VirtualAddress = 34, Size = 3 },
                new RvaStream.Range { PhysicalAddress = 3, VirtualAddress = 40, Size = 2 });

            stream.Position = 41;
            Assert.AreEqual(4, (int)rawStream.Position);
        }

        [TestMethod]
        public void Seek_Begin()
        {
            byte[] bytes = new byte[] { 1, 200, 3, 4, 5 };
            var rawStream = new MemoryStream(bytes);
            var stream = new RvaStream(
                rawStream,
                new RvaStream.Range { PhysicalAddress = 0, VirtualAddress = 34, Size = 3 },
                new RvaStream.Range { PhysicalAddress = 3, VirtualAddress = 40, Size = 2 });

            stream.Seek(41, SeekOrigin.Begin);
            Assert.AreEqual(4, (int)rawStream.Position);
        }

        [TestMethod]
        public void Seek_Current()
        {
            byte[] bytes = new byte[] { 1, 200, 3, 4, 5 };
            var rawStream = new MemoryStream(bytes);
            var stream = new RvaStream(
                rawStream,
                new RvaStream.Range { PhysicalAddress = 0, VirtualAddress = 34, Size = 3 },
                new RvaStream.Range { PhysicalAddress = 3, VirtualAddress = 40, Size = 2 });

            stream.Position = 40;
            stream.Seek(1, SeekOrigin.Current);
            Assert.AreEqual(4, (int)rawStream.Position);
        }

        [TestMethod]
        public void Seek_End()
        {
            byte[] bytes = new byte[] { 1, 200, 3, 4, 5 };
            var rawStream = new MemoryStream(bytes);
            var stream = new RvaStream(
                rawStream,
                new RvaStream.Range { PhysicalAddress = 0, VirtualAddress = 34, Size = 3 },
                new RvaStream.Range { PhysicalAddress = 3, VirtualAddress = 40, Size = 2 });

            stream.Seek(-1, SeekOrigin.End);
            Assert.AreEqual(4, (int)rawStream.Position);
        }

        [ExpectedException(typeof(ArgumentException))]
        [TestMethod]
        public void Seek_Invalid()
        {
            var stream = new RvaStream(new MemoryStream(new byte[5]), new RvaStream.Range { PhysicalAddress = 0, VirtualAddress = 0, Size = 5 });
            stream.Seek(10, (SeekOrigin)21633);
        }

        [ExpectedException(typeof(IOException))]
        [TestMethod]
        public void GetPosition_OutsideOfRange()
        {
            byte[] bytes = new byte[] { 1, 200, 3, 4, 5 };
            var stream = new RvaStream(new MemoryStream(bytes), new RvaStream.Range { PhysicalAddress = 2, VirtualAddress = 34, Size = 4 });
            long position = stream.Position;
        }

        [TestMethod]
        public void GetPosition()
        {
            byte[] bytes = new byte[] { 1, 200, 3, 4, 5 };
            var rawStream = new MemoryStream(bytes);
            var stream = new RvaStream(
                rawStream,
                new RvaStream.Range { PhysicalAddress = 0, VirtualAddress = 34, Size = 3 },
                new RvaStream.Range { PhysicalAddress = 3, VirtualAddress = 40, Size = 2 });

            rawStream.Position = 4;
            Assert.AreEqual(41, (int)stream.Position);
        }

        [TestMethod]
        public void Length()
        {
            var rawStream = new MemoryStream(new byte[200]);
            var stream = new RvaStream(
                rawStream,
                new RvaStream.Range { PhysicalAddress = 0, VirtualAddress = 34, Size = 3 },
                new RvaStream.Range { PhysicalAddress = 3, VirtualAddress = 40, Size = 2 });

            Assert.AreEqual(42, (int)stream.Length);
        }
    }
}