using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Mi.PE.Cli
{
    using Mi.PE.Cli.Tables;
    using Mi.PE.Internal;
    using Mi.PE.PEFormat;

    public sealed class ModuleDefinition
    {
        public Version RuntimeVersion;
        public ClrImageFlags ImageFlags;
        public Version MetadataVersion;
        public string MetadataVersionString;
        public Version TableStreamVersion;

        public TypeDefinition[] Types;
        
        public string Name;
        public ushort Generation;
        public Guid? Mvid;
        public Guid? EncId;
        public Guid? EncBaseId;
    }
}