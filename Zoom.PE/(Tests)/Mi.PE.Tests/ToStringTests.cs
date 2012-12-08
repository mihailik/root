using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.VisualStudio.TestTools.UnitTesting;

using Mi.PE.PEFormat;

namespace Mi.PE
{
    [TestClass]
    public class ToStringTests
    {
        [TestMethod]
        public void DataDirectory()
        {
            var dd = new DataDirectory
            {
                VirtualAddress = 0x10,
                Size = 0x11
            };

            Assert.AreEqual("10:11h", dd.ToString());
        }

        [TestMethod]
        public void DosHeader()
        {
            var dh = new DosHeader();
            dh.lfanew = 0x102;

            Assert.AreEqual("[MZ].lfanew=102h", dh.ToString());
        }

        [TestMethod]
        public void OptionalHeader()
        {
            var oh = new OptionalHeader();
            oh.PEMagic = PEMagic.NT32;
            oh.Subsystem = Subsystem.WindowsCUI;
            oh.DllCharacteristics = DllCharacteristics.TerminalServerAware;

            Assert.AreEqual("NT32 WindowsCUI TerminalServerAware", oh.ToString());
        }

        [TestMethod]
        public void OptionalHeader_EmptyDataDirectories()
        {
            var oh = new OptionalHeader();
            oh.PEMagic = PEMagic.NT32;
            oh.Subsystem = Subsystem.WindowsCUI;
            oh.DllCharacteristics = DllCharacteristics.TerminalServerAware;
            oh.NumberOfRvaAndSizes = 4;

            Assert.AreEqual("NT32 WindowsCUI TerminalServerAware", oh.ToString());
        }

        [TestMethod]
        public void OptionalHeader_NonEmptyDataDirectories()
        {
            var oh = new OptionalHeader();
            oh.PEMagic = PEMagic.NT32;
            oh.Subsystem = Subsystem.WindowsCUI;
            oh.DllCharacteristics = DllCharacteristics.TerminalServerAware;
            oh.NumberOfRvaAndSizes = 4;

            oh.DataDirectories = new DataDirectory[4];

            oh.DataDirectories[0] = new DataDirectory { Size = 5 };
            oh.DataDirectories[1] = new DataDirectory { Size = 6 };
            oh.DataDirectories[2] = new DataDirectory { Size = 100 };
            oh.DataDirectories[3] = new DataDirectory { VirtualAddress = 10, Size = 20 };

            Assert.AreEqual("NT32 WindowsCUI TerminalServerAware DataDirectories[ExportSymbols,ImportSymbols,Resources,Exception]", oh.ToString());
        }

        [TestMethod]
        public void PEHeader()
        {
            var peh = new PEHeader();
            peh.Machine = Machine.I386;
            peh.Characteristics = ImageCharacteristics.Bit32Machine;

            Assert.AreEqual("I386 Bit32Machine Sections[0]", peh.ToString());
        }

        [TestMethod]
        public void Section()
        {
            var sh = new SectionHeader();

            sh.Name = "Dummy";
            sh.PointerToRawData = 0x14e;
            sh.SizeOfRawData = 0x1aff0;
            sh.VirtualAddress = 0x1234c0;
            sh.VirtualSize = 0x320ff;

            Assert.AreEqual("Dummy [14E:1AFF0h]=>Virtual[1234C0:320FFh]", sh.ToString());
        }
    }
}