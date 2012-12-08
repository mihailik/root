using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Windows;
using Mi.PE;
using Zoom.PE.Model;

namespace Zoom.PE.DesignTime
{
    public sealed class ModelSource
    {
        readonly PEFileModel m_PEFileModel = CreatePEFileModel();

        static PEFileModel CreatePEFileModel()
        {
            var asm = typeof(ModelSource).Assembly;
            string asmPath = asm.Location;
            byte[] asmBytes = File.ReadAllBytes(asmPath);
            var pe = new PEFile();
            pe.ReadFrom(new Mi.PE.Internal.BinaryStreamReader(new MemoryStream(asmBytes), new byte[32]));

            return new PEFileModel(Path.GetFileName(asmPath), pe);
        }

        public PEFileModel PEFileModel { get { return m_PEFileModel; } }
    }
}