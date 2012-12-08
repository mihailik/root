using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Mi.PE.Cli
{
    using Mi.PE.Cli.CodedIndices;
    using Mi.PE.Cli.Signatures;
    using Mi.PE.Cli.Tables;
    using Mi.PE.Internal;
    using Mi.PE.PEFormat;

    public sealed class ClrModuleReader
    {
        public const uint ClrHeaderSize = 72;

        static readonly FieldDefinition[] EmptyFields = new FieldDefinition[] {};
        static readonly MethodDefinition[] EmptyMethods = new MethodDefinition[] { };
        static readonly ParameterDefinition[] EmptyParameters = new ParameterDefinition[] { };
        static readonly PropertyDefinition[] EmptyProperties = new PropertyDefinition[] { };

        readonly BinaryStreamReader m_Binary;
        readonly ModuleDefinition module;
        TableStream tableStream;
        
        Guid[] guids;
        byte[] blobHeap;
        byte[] stringHeap;
        readonly Dictionary<uint, string> stringHeapCache = new Dictionary<uint, string>();

        private ClrModuleReader(BinaryStreamReader binaryReader, ModuleDefinition module)
        {
            this.m_Binary = binaryReader;
            this.module = module;
        }

        public static void Read(BinaryStreamReader reader, ModuleDefinition module)
        {
            var modReader = new ClrModuleReader(reader, module);
            modReader.Read();
        }

        void Read()
        {
            // CLR header
            uint cb = this.Binary.ReadUInt32();

            if (cb < ClrHeaderSize)
                throw new BadImageFormatException(
                    "Unexpectedly short CLR header structure " + cb + " reported by Cb field " +
                    "(expected at least " + ClrHeaderSize + ").");

            this.module.RuntimeVersion = new Version(this.Binary.ReadUInt16(), this.Binary.ReadUInt16());

            var metadataDir = new DataDirectory();
            metadataDir.Read(this.Binary);

            this.module.ImageFlags = (ClrImageFlags)this.Binary.ReadInt32();

            uint entryPointToken = this.Binary.ReadUInt32();

            var resourcesDir = new DataDirectory();
            resourcesDir.Read(this.Binary);

            var strongNameSignatureDir = new DataDirectory();
            strongNameSignatureDir.Read(this.Binary);

            var codeManagerTableDir = new DataDirectory();
            codeManagerTableDir.Read(this.Binary);

            var vtableFixupsDir = new DataDirectory();
            vtableFixupsDir.Read(this.Binary);

            var exportAddressTableJumpsDir = new DataDirectory();
            exportAddressTableJumpsDir.Read(this.Binary);

            var managedNativeHeaderDir = new DataDirectory();
            managedNativeHeaderDir.Read(this.Binary);



            // CLR metadata
            this.Binary.Position = metadataDir.VirtualAddress;

            var mdSignature = (ClrMetadataSignature)this.Binary.ReadUInt32();
            if (mdSignature != ClrMetadataSignature.Signature)
                throw new InvalidOperationException("Invalid CLR metadata signature field " + ((uint)mdSignature).ToString("X") + "h.");

            this.module.MetadataVersion = new Version(
                this.Binary.ReadUInt16(),
                this.Binary.ReadUInt16());

            uint mdReserved = this.Binary.ReadUInt32();

            int versionLength = this.Binary.ReadInt32();
            string versionString = this.Binary.ReadFixedZeroFilledAsciiString(versionLength);

            this.module.MetadataVersionString = versionString;

            short mdFlags = this.Binary.ReadInt16();

            ushort streamCount = this.Binary.ReadUInt16();
            var streamHeaders = new StreamHeader[streamCount];

            for (int i = 0; i < streamHeaders.Length; i++)
            {
                streamHeaders[i] = new StreamHeader();
                streamHeaders[i].Read(this.Binary);
            }

            this.guids = null;
            this.blobHeap = null;
            this.stringHeap = null;

            StreamHeader tableStreamHeader = null;
            foreach (var sh in streamHeaders)
            {
                this.Binary.Position = metadataDir.VirtualAddress + sh.Offset;

                switch (sh.Name)
                {
                    case "#GUID":
                        this.guids = new Guid[sh.Size / 16];
                        ReadGuids(this.Binary, this.guids);
                        break;

                    case "#Strings":
                        this.stringHeap = ReadBinaryHeap(this.Binary, sh.Size);
                        break;

                    case "#US": // user strings
                        break;

                    case "#Blob":
                        this.blobHeap = ReadBinaryHeap(this.Binary, sh.Size);
                        break;

                    case "#~":
                    case "#-":
                        tableStreamHeader = sh;
                        break;

                    default:
                        break;
                }
            }

            this.Binary.Position = metadataDir.VirtualAddress + tableStreamHeader.Offset;
            this.ReadTableStream();

            this.LoadModule();
            this.LoadTypes();
        }

        public BinaryStreamReader Binary { get { return m_Binary; } }

        public string ReadString()
        {
            uint pos;
            if(this.stringHeap.Length<ushort.MaxValue)
                pos = this.Binary.ReadUInt16();
            else
                pos = this.Binary.ReadUInt32();

            string result;
            if(pos == 0 )
            {
                result = null;
            }
            else if(!stringHeapCache.TryGetValue(pos, out result))
            {
                if (pos > stringHeap.Length)
                    throw new InvalidOperationException("String heap position overflow.");

                int length = 0;
                while(pos + length < stringHeap.Length)
                {
                    if(stringHeap[pos + length]==0)
                        break;
                    else
                        length ++;
                }

                result = Encoding.UTF8.GetString(stringHeap, (int)pos, length);

                stringHeapCache[pos] = result;
            }

            return result;
        }

        public Guid? ReadGuid()
        {
            uint index;

            if (this.guids.Length <= ushort.MaxValue)
                index = this.Binary.ReadUInt16();
            else
                index = this.Binary.ReadUInt32();

            if (index == 0)
                return null;

            return guids[(index-1)/16];
        }

        public byte[] ReadBlob()
        {
            uint index = ReadBlobIndex();

            if (index == 0)
                return null;

            byte[] result = GetBlobFromIndex(index);

            return result;
        }

        private uint ReadBlobIndex()
        {
            uint index;

            if (this.blobHeap.Length <= ushort.MaxValue)
                index = this.Binary.ReadUInt16();
            else
                index = this.Binary.ReadUInt32();
            return index;
        }

        byte[] GetBlobFromIndex(uint index)
        {
            uint length = ReadBlobLengthForIndex(ref index);

            byte[] result = new byte[length];
            Array.Copy(
                this.blobHeap, (int)index,
                result, 0,
                (int)length);

            return result;
        }

        uint ReadBlobLengthForIndex(ref uint index)
        {
            uint length;

            byte b0 = this.blobHeap[index];
            if (b0 <= sbyte.MaxValue)
            {
                length = b0;
                index++;
            }
            else if ((b0 & 0xC0) == sbyte.MaxValue + 1)
            {
                byte b2 = this.blobHeap[index + 1];
                length = unchecked((uint)(((b0 & 0x3F) << 8) | b2));
                index += 2;
            }
            else
            {
                byte b2 = this.blobHeap[index + 1];
                byte b3 = this.blobHeap[index + 2];
                byte b4 = this.blobHeap[index + 3];
                length = unchecked((uint)(((b0 & 0x3F) << 24) + (b2 << 16) + (b3 << 8) + b4));
                index += 4;
            }
            return length;
        }

        public MethodSig ReadMethodSignature()
        {
            uint blobIindex = ReadBlobIndex();
            if (blobIindex == 0)
                return null;
            
            var sigReader = GetSignatureBlobReader(blobIindex);

            var sig = MethodSig.Read(sigReader);

            return sig;
        }

        public MethodSpec ReadMethodSpec()
        {
            uint blobIindex = ReadBlobIndex();
            if (blobIindex == 0)
                return null;

            var sigReader = GetSignatureBlobReader(blobIindex);

            var sig = new MethodSpec();
            sig.Read(sigReader);

            return sig;
        }

        public FieldSig ReadFieldSignature()
        {
            uint blobIindex = ReadBlobIndex();
            if (blobIindex == 0)
                return null;

            var sigReader = GetSignatureBlobReader(blobIindex);

            var sig = new FieldSig();
            sig.Read(sigReader);

            return sig;
        }

        public PropertySig ReadPropertySignature()
        {
            uint blobIindex = ReadBlobIndex();
            if (blobIindex == 0)
                return null;

            var sigReader = GetSignatureBlobReader(blobIindex);

            var sig = new PropertySig();
            sig.Read(sigReader);

            return sig;
        }

        public TypeReference ReadTypeSpec()
        {
            uint blobIindex = ReadBlobIndex();
            if (blobIindex == 0)
                return null;

            uint blobLength = ReadBlobLengthForIndex(ref blobIindex);

            var sigReader = new BinaryStreamReader(this.blobHeap, checked((int)blobIindex), checked((int)blobLength));
            // TODO: read type spec signature
            return null;
        }

        BinaryStreamReader GetSignatureBlobReader(uint blobIindex)
        {
            uint blobLength = ReadBlobLengthForIndex(ref blobIindex);
            var sigReader = new BinaryStreamReader(this.blobHeap, checked((int)blobIindex), checked((int)blobLength));
            return sigReader;
        }

        public Version ReadVersion()
        {
            ushort major = this.Binary.ReadUInt16();
            ushort minor = this.Binary.ReadUInt16();
            ushort buildNumber = this.Binary.ReadUInt16();
            ushort revisionNumber = this.Binary.ReadUInt16();
            return new Version(major, minor, buildNumber, revisionNumber);
        }

        public uint ReadTableIndex(TableKind table)
        {
            ushort mask = ushort.MaxValue;

            int length = this.tableStream.Tables[(int)table].Length;

            uint index;
            if ((length & ~mask) == 0)
                index = this.Binary.ReadUInt16();
            else
                index = this.Binary.ReadUInt32();

            if (index > length + 1)
                throw new FormatException("Index " + index + " is out of range [0.." + length + "] for " + table + " table.");

            return index;
        }

        public CodedIndex<TCodedIndexDefinition> ReadCodedIndex<TCodedIndexDefinition>()
            where TCodedIndexDefinition : struct, ICodedIndexDefinition
        {
            var def = default(TCodedIndexDefinition);

            ushort mask = (ushort)(ushort.MaxValue >> CodedIndex<TCodedIndexDefinition>.TableKindBitCount);

            int length = 0;
            foreach (var tab in def.Tables)
            {
                if ((int)tab == ushort.MaxValue)
                    continue;

                var table = this.tableStream.Tables[(int)tab];
                
                length = Math.Max(length, table==null ? 0 : table.Length);
            }

            uint result;

            if ((length & ~mask) == 0)
                result = this.Binary.ReadUInt16();
            else
                result = this.Binary.ReadUInt32();

            var typedResult = (CodedIndex<TCodedIndexDefinition>)result;

            if (typedResult.Index > this.tableStream.Tables[(int)typedResult.TableKind].Length)
            {
                throw new FormatException(
                    "Coded index " + typedResult + " is out of bound " +
                    "(0.." + this.tableStream.Tables[(int)typedResult.TableKind].Length + ") " +
                    "for " + typeof(TCodedIndexDefinition).Name + " " +
                    "(" + string.Join(",", def.Tables.Select(t => t.ToString()).ToArray()) + ").");
            }

            return typedResult;
        }

        static void ReadGuids(BinaryStreamReader reader, Guid[] guids)
        {
            byte[] buf = new byte[16];
            for (int i = 0; i < guids.Length; i++)
            {
                reader.ReadBytes(buf, 0, buf.Length);
                guids[i] = new Guid(buf);
            }
        }

        static byte[] ReadBinaryHeap(BinaryStreamReader reader, uint size)
        {
            byte[] heapBytes = new byte[size];
            reader.ReadBytes(heapBytes, 0, (int)size);
            return heapBytes;
        }

        void ReadTableStream()
        {
            tableStream = new TableStream();
            tableStream.Read(this);
            this.module.TableStreamVersion = this.tableStream.Version;
        }

        void LoadModule()
        {
            ModuleEntry moduleEntry;
            {
                var moduleEntries = (ModuleEntry[])tableStream.Tables[(int)TableKind.Module];
                if (moduleEntries == null || moduleEntries.Length == 0)
                {
                    this.module.Name = null;
                    this.module.Mvid = null;
                    this.module.Generation = 0;
                    this.module.EncId = null;
                    this.module.EncBaseId = null;
                    return;
                }

                moduleEntry = moduleEntries[0];
            }

            this.module.Name = moduleEntry.Name;
            this.module.Mvid = moduleEntry.Mvid;
            this.module.Generation = moduleEntry.Generation;
            this.module.EncId = moduleEntry.EncId;
            this.module.EncBaseId = moduleEntry.EncBaseId;
        }

        void LoadTypes()
        {
            var typeDefEntries = (TypeDefEntry[])tableStream.Tables[(int)TableKind.TypeDef];
            if (typeDefEntries == null || typeDefEntries.Length == 0)
            {
                this.module.Types = null;
                return;
            }

            bool isFirstTypeModuleStub;

            if (typeDefEntries[0].Extends.Index == 0
                && (typeDefEntries[0].TypeDefinition.Attributes & TypeAttributes.Interface) == 0)
                isFirstTypeModuleStub = true;
            else
                isFirstTypeModuleStub = false;

            {
                int typeCount = isFirstTypeModuleStub ? typeDefEntries.Length - 1 : typeDefEntries.Length;
                if (this.module.Types == null
                    || this.module.Types.Length != typeCount)
                    this.module.Types = new TypeDefinition[typeCount];
            }

            var fieldEntries = (FieldEntry[])this.tableStream.Tables[(int)TableKind.Field];
            var methodDefEntries = (MethodDefEntry[])this.tableStream.Tables[(int)TableKind.MethodDef];
            var paramDefEntries = (ParamEntry[])this.tableStream.Tables[(int)TableKind.Param];

            for (int iType = isFirstTypeModuleStub ? 1 : 0; iType < typeDefEntries.Length; iType++)
            {
                TypeDefEntry typeDef = typeDefEntries[iType];
                int typeIndex = isFirstTypeModuleStub ? iType-1 : iType;

                TypeDefinition type = typeDef.TypeDefinition;
                type.BaseType = GetTypeReference(typeDef.Extends);

                uint fieldIndex = typeDef.FieldList - 1;
                uint methodIndex = typeDef.MethodList - 1;
                uint nextFieldIndex;
                uint nextMethodIndex;

                if (iType < typeDefEntries.Length - 1)
                {
                    var nextTypeDef = typeDefEntries[iType + 1];
                    nextFieldIndex = nextTypeDef.FieldList - 1;
                    nextMethodIndex = nextTypeDef.MethodList - 1;
                }
                else
                {
                    nextFieldIndex = (uint)fieldEntries.Length;
                    nextMethodIndex = (uint)methodDefEntries.Length;
                }

                type.Fields = nextFieldIndex - fieldIndex == 0 ? EmptyFields : new FieldDefinition[nextFieldIndex - fieldIndex];
                for (int iField = 0; iField < type.Fields.Length; iField++)
                {
                    type.Fields[iField] = fieldEntries[fieldIndex + iField].FieldDefinition;
                }

                type.Methods = nextMethodIndex - methodIndex == 0 ? EmptyMethods : new MethodDefinition[nextMethodIndex - methodIndex];
                for (int iMethod = 0; iMethod < type.Methods.Length; iMethod++)
                {
                    var methodDef = methodDefEntries[methodIndex + iMethod];
                    var method = methodDef.MethodDefinition;

                    uint paramIndex = methodDef.ParamList - 1;
                    uint nextParamIndex;

                    if (methodIndex + iMethod < methodDefEntries.Length - 1)
                    {
                        var nextMethodDef = methodDefEntries[methodIndex + iMethod + 1];
                        nextParamIndex = nextMethodDef.ParamList - 1;
                    }
                    else
                    {
                        nextParamIndex = (uint)paramDefEntries.Length;
                    }

                    method.Parameters = nextParamIndex - paramIndex == 0 ? EmptyParameters : new ParameterDefinition[nextParamIndex - paramIndex];
                    for (int iParam = 0; iParam < method.Parameters.Length; iParam++)
                    {
                        method.Parameters[iParam] = paramDefEntries[paramIndex + iParam].ParameterDefinition;
                    }

                    type.Methods[iMethod] = method;
                }

                this.module.Types[typeIndex] = type;
            }

            var propertyEntries = (PropertyEntry[])tableStream.Tables[(int)TableKind.Property];
            var propertyMapEntries = (PropertyMapEntry[])tableStream.Tables[(int)TableKind.PropertyMap];

            if (propertyMapEntries != null)
            {
                for (int propertyMapIndex = 0; propertyMapIndex < propertyMapEntries.Length; propertyMapIndex++)
                {
                    uint propertyEntryIndex = propertyMapEntries[propertyMapIndex].PropertyList - 1;
                    uint nextPropertyEntryIndex = propertyMapIndex < propertyMapEntries.Length - 1 ?
                        propertyMapEntries[propertyMapIndex + 1].PropertyList - 1 :
                        (uint)propertyEntries.Length;

                    PropertyDefinition[] properties = nextPropertyEntryIndex == propertyEntryIndex + 1 ?
                        EmptyProperties :
                        new PropertyDefinition[nextPropertyEntryIndex - propertyEntryIndex - 1];

                    for (int iProperty = 0; iProperty < properties.Length; iProperty++)
                    {
                        properties[iProperty] = propertyEntries[propertyEntryIndex + iProperty].PropertyDefinition;
                    }

                    uint typeDefIndex = propertyMapEntries[propertyMapIndex].Parent - 1;
                    typeDefEntries[typeDefIndex].TypeDefinition.Properties = properties;
                }
            }
        }

        TypeReference GetTypeReference(CodedIndex<TypeDefOrRef> typeDefOrRef)
        {
            if (typeDefOrRef.Index == 0)
                return null;

            uint adjustedIndex = typeDefOrRef.Index - 1;

            if (typeDefOrRef.TableKind == TableKind.TypeRef)
            {
                return ((TypeRefEntry[])this.tableStream.Tables[(int)TableKind.TypeRef])[adjustedIndex].TypeReference;
            }
            else if (typeDefOrRef.TableKind == TableKind.TypeDef)
            {
                return ((TypeDefEntry[])this.tableStream.Tables[(int)TableKind.TypeDef])[adjustedIndex].TypeDefinition;
            }
            else // TableKind.TypeSpec
            {
                return ((TypeSpecEntry[])this.tableStream.Tables[(int)TableKind.TypeSpec])[adjustedIndex].Signature;
            }
        }
    }
}