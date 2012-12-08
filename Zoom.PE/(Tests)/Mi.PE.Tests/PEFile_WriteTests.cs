using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using Microsoft.VisualStudio.TestTools.UnitTesting;

using Mi.PE.Internal;

namespace Mi.PE
{
    [TestClass]
    public class PEFile_WriteTests
    {
        [TestMethod] public void PreReadAnyCPU() { AssertReadWriteRoundtrip(Properties.Resources.console_anycpu); }
        [TestMethod] public void PreReadX86() { AssertReadWriteRoundtrip(Properties.Resources.console_x86); }
        
        [TestMethod] public void PreReadX64() { AssertReadWriteRoundtrip(ClearFillerBytes(Properties.Resources.console_x64)); }
        [TestMethod] public void PreReadItanium() { AssertReadWriteRoundtrip(ClearFillerBytes(Properties.Resources.console_itanium)); }

        [TestMethod] public void EmitAnyCPU() { AssertReadWriteRoundtrip(EmitSamplePEs.Library.Bytes.AnyCPU); }
        [TestMethod] public void EmitX86() { AssertReadWriteRoundtrip(EmitSamplePEs.Library.Bytes.X86); }
        [TestMethod] public void EmitX64() { AssertReadWriteRoundtrip(EmitSamplePEs.Library.Bytes.X64); }
        [TestMethod] public void EmitItanium() { AssertReadWriteRoundtrip(EmitSamplePEs.Library.Bytes.Itanium); }

        [TestMethod]
        public void Timestamp_RoundDown()
        {
            AssertReadWriteRoundtrip(
                EmitSamplePEs.Library.Bytes.Itanium,
                pe => pe.PEHeader.Timestamp += TimeSpan.FromSeconds(0.45));
        }

        [TestMethod]
        public void Timestamp_RoundUp()
        {
            AssertReadWriteRoundtrip(
                EmitSamplePEs.Library.Bytes.Itanium,
                pe => pe.PEHeader.Timestamp -= TimeSpan.FromSeconds(0.45));
        }

        private static void AssertReadWriteRoundtrip(byte[] originalBytes)
        {
            AssertReadWriteRoundtrip(originalBytes, null);
        }

        private static void AssertReadWriteRoundtrip(byte[] originalBytes, Action<PEFile> modifyPEFile)
        {
            var pe = new PEFile();
            var stream = new MemoryStream(originalBytes);
            var reader = new BinaryStreamReader(stream, new byte[32]);
            pe.ReadFrom(reader);
            int pos = (int)reader.Position;

            if (modifyPEFile != null)
                modifyPEFile(pe);

            var buf = new MemoryStream();
            var writer = new BinaryStreamWriter(buf);
            pe.WriteTo(writer);
            buf.Write(originalBytes, pos, originalBytes.Length - pos);

            byte[] outputBytes = buf.ToArray();
            Assert.AreEqual(originalBytes.Length, outputBytes.Length, "outputBytes.Length");

            for (int i = 0; i < outputBytes.Length; i++)
            {
                Assert.AreEqual(originalBytes[i], outputBytes[i], "outputBytes[" + i + "]");
            }
        }

        private byte[] ClearFillerBytes(byte[] bytes)
        {
            byte[] result = (byte[])bytes.Clone();

            // Apparently, C# compiler generates garbage bytes in 64-bit mode
            // between the last SectionHeader and the data of the first section.
            Array.Clear(
                result,
                472,
                512 - 472);
            return result;
        }
    }
}