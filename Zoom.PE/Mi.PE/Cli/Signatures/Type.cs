using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Mi.PE.Cli.Signatures
{
    using Mi.PE.Cli.CodedIndices;
    using Mi.PE.Internal;

    /// <summary>
    /// [ECMA-335 §23.2.12]
    /// </summary>
    public abstract class Type
    {
        public sealed class Boolean : Type
        {
            public static readonly Boolean Instance = new Boolean();
            private Boolean() { }
        }

        public sealed class Char : Type
        {
            public static readonly Char Instance = new Char();
            private Char() { }
        }

        public sealed class I1 : Type
        {
            public static readonly I1 Instance = new I1();
            private I1() { }
        }

        public sealed class U1 : Type
        {
            public static readonly U1 Instance = new U1();
            private U1() { }
        }

        public sealed class I2 : Type
        {
            public static readonly I2 Instance = new I2();
            private I2() { }
        }

        public sealed class U2 : Type
        {
            public static readonly U2 Instance = new U2();
            private U2() { }
        }

        public sealed class I4 : Type
        {
            public static readonly I4 Instance = new I4();
            private I4() { }
        }

        public sealed class U4 : Type
        {
            public static readonly U4 Instance = new U4();
            private U4() { }
        }

        public sealed class I8 : Type
        {
            public static readonly I8 Instance = new I8();
            private I8() { }
        }

        public sealed class U8 : Type
        {
            public static readonly U8 Instance = new U8();
            private U8() { }
        }

        public sealed class R4 : Type
        {
            public static readonly R4 Instance = new R4();
            private R4() { }
        }

        public sealed class R8 : Type
        {
            public static readonly R8 Instance = new R8();
            private R8() { }
        }

        public sealed class I : Type
        {
            public static readonly I Instance = new I();
            private I() { }
        }

        public sealed class U : Type
        {
            public static readonly U Instance = new U();
            private U() { }
        }

        public sealed class Class : Type
        {
            public CodedIndex<TypeDefOrRef> TypeDefOrRefEncoded;

            public override string ToString()
            {
                return "Class:" + this.TypeDefOrRefEncoded;
            }
        }

        public sealed class FnPtr : Type
        {
            public MethodSig MethodDefSig;

            public override string ToString()
            {
                return "FnPtr:" + this.MethodDefSig;
            }
        }

        public abstract class GenericInst : Type
        {
            new public sealed class Class : GenericInst
            {
            }

            new public sealed class ValueType : GenericInst
            {
            }

            public CodedIndex<TypeDefOrRef> TypeDefOrRefOrSpecEncoded;
            public Type[] Types;

            private GenericInst()
            {
            }

            public override string ToString()
            {
                return
                    this.GetType().Name + ":" + this.TypeDefOrRefOrSpecEncoded +
                    "<" +
                    (this.Types == null ? null :
                    string.Join(", ", this.Types.Select(t => t.ToString()).ToArray())) +
                    ">";
            }
        }

        public sealed class MVar : Type
        {
            public uint? Number;

            public override string ToString()
            {
                return "MVar:" + this.Number;
            }
        }

        public sealed class Object : Type
        {
            public static readonly Object Instance = new Object();
            private Object() { }
        }

        public abstract class Ptr : Type
        {
            private Ptr()
            {
            }

            public sealed class Void : Ptr
            {
                public static readonly Void Instance = new Void();

                private Void() { }

                public override string ToString()
                {
                    return
                        (this.CustomMods == null ? "" :
                        "[" + string.Join(", ", this.CustomMods.Select(cm => cm.ToString()).ToArray()) + "]") +
                        "Ptr:Void";
                }
            }

            public sealed class Type : Ptr
            {
                public Signatures.Type PtrType;

                public override string ToString()
                {
                    return
                        (this.CustomMods == null ? "" :
                        "[" + string.Join(", ", this.CustomMods.Select(cm => cm.ToString()).ToArray()) + "]") +
                        "Ptr:" + PtrType;
                }
            }

            public CustomMod[] CustomMods;
        }

        public sealed class String : Type
        {
            public static readonly String Instance = new String();
            private String() { }
        }

        public sealed class SZArray : Type
        {
            public CustomMod[] CustomMods;
            public Type Type;

            public override string ToString()
            {
                return
                    (this.CustomMods == null ? "" :
                    "[" + string.Join(", ", this.CustomMods.Select(cm => cm.ToString()).ToArray()) + "]") +
                    Type + "[]";
            }
        }

        public sealed class ValueType : Type
        {
            public CodedIndex<TypeDefOrRef> TypeDefOrRefEncoded;

            public override string ToString()
            {
                return "ValueType:" + TypeDefOrRefEncoded;
            }
        }

        public sealed class Var : Type
        {
            public uint? Number;

            public override string ToString()
            {
                return "Var:" + this.Number;
            }
        }

        private Type()
        {
        }

        public static Type Read(ElementType leadByte, BinaryStreamReader signatureBlobReader)
        {
            switch (leadByte)
            {
                case ElementType.End:
                    break;
                case ElementType.Void:
                    break;
                
                case ElementType.Boolean: return Boolean.Instance;
                case ElementType.Char: return Char.Instance;
                case ElementType.I1: return I1.Instance;
                case ElementType.U1: return U1.Instance;
                case ElementType.I2: return I2.Instance;
                case ElementType.U2: return U2.Instance;
                case ElementType.I4: return I4.Instance;
                case ElementType.U4: return U4.Instance;
                case ElementType.I8: return I8.Instance;
                case ElementType.U8: return U8.Instance;
                case ElementType.R4: return R4.Instance;
                case ElementType.R8: return R8.Instance;

                case ElementType.String: return String.Instance;

                case ElementType.Ptr:
                    ElementType ptrLeadByte;
                    var ptrCustomMod = CustomMod.ReadCustomModArray(out ptrLeadByte, signatureBlobReader);
                    Ptr resultPtr;
                    if (ptrLeadByte == ElementType.Void)
                    {
                        resultPtr = Ptr.Void.Instance;
                    }
                    else
                    {
                        Type ptrType = Type.Read(ptrLeadByte, signatureBlobReader);
                        resultPtr = new Ptr.Type
                        {
                            PtrType = ptrType
                        };
                    }
                    resultPtr.CustomMods = ptrCustomMod;
                    return resultPtr;

                case ElementType.ByRef:
                    break;
                
                case ElementType.ValueType:
                    var valueTypeTypeDefOrRefOrSpecEncoded = signatureBlobReader.ReadTypeDefOrRefOrSpecEncoded();
                    return new ValueType { TypeDefOrRefEncoded = valueTypeTypeDefOrRefOrSpecEncoded };

                case ElementType.Class:
                    var classTypeDefOrRefOrSpecEncoded = signatureBlobReader.ReadTypeDefOrRefOrSpecEncoded();
                    return new Class { TypeDefOrRefEncoded = classTypeDefOrRefOrSpecEncoded };

                case ElementType.Var:
                    uint? varNumber = signatureBlobReader.ReadCompressedUInt32();
                    return new Var
                    {
                        Number = varNumber
                    };
                
                case ElementType.Array:
                    // TODO: implement ArrayShape (ECMA-335 §23.2.13)
                    throw new NotImplementedException("TODO: implement ArrayShape (ECMA-335 §23.2.13).");

                case ElementType.GenericInst:
                    var genericLeadByte = (ElementType)signatureBlobReader.ReadByte();
                    GenericInst genericInst;
                    switch (genericLeadByte)
	                {
                        case ElementType.Class:
                            genericInst = new GenericInst.Class();
                            break;

                        case ElementType.ValueType:
                            genericInst = new GenericInst.ValueType();
                            break;

		                default:
                            throw new BadImageFormatException("Invalid lead byte for "+ElementType.GenericInst+" class/valuetype value.");
	                }

                    var typeDefOrRefOrSpecEncoded = signatureBlobReader.ReadTypeDefOrRefOrSpecEncoded();
                    genericInst.TypeDefOrRefOrSpecEncoded = typeDefOrRefOrSpecEncoded;

                    uint? genArgCount = signatureBlobReader.ReadCompressedUInt32();
                    if (genArgCount == null)
                        throw new BadImageFormatException("Invalid null value for GenArgCount value in " + ElementType.GenericInst+".");
                    
                    var genericInstTypes = new Type[genArgCount.Value];
                    for(int i = 0; i<genericInstTypes.Length; i++)
                    {
                        var genericInstTypeLeadByte = (ElementType)signatureBlobReader.ReadByte();
                        genericInstTypes[i] = Type.Read(genericInstTypeLeadByte, signatureBlobReader);
                    }

                    genericInst.Types = genericInstTypes;
                    return genericInst;

                case ElementType.TypedByRef:
                    break;

                case ElementType.I: return I.Instance;
                case ElementType.U: return U.Instance;
                
                case ElementType.FnPtr:
                    var methodDefSig = MethodSig.Read(signatureBlobReader);
                    return new FnPtr
                    {
                        MethodDefSig = methodDefSig
                    };

                case ElementType.Object: return Object.Instance;

                case ElementType.SZArray:
                    ElementType szArrayLeadByte;
                    var szArrayCustomMod = CustomMod.ReadCustomModArray(out szArrayLeadByte, signatureBlobReader);
                    var szArrayType = Type.Read(szArrayLeadByte, signatureBlobReader);
                    return new SZArray
                    {
                        CustomMods = szArrayCustomMod,
                        Type = szArrayType
                    };
                
                case ElementType.MVar:
                    uint? mvarNumber = signatureBlobReader.ReadCompressedUInt32();
                    return new MVar
                    {
                        Number = mvarNumber
                    };

                case ElementType.CMod_ReqD:
                    break;

                case ElementType.CMod_Opt:
                    break;
                case ElementType.Internal:
                    break;
                case ElementType.Modifier:
                    break;
                case ElementType.Sentinel:
                    break;
                case ElementType.Pinned:
                    break;
                case ElementType.R4_Hfa:
                    break;
                case ElementType.R8_Hfa:
                    break;
                case ElementType.ArgumentType_:
                    break;
                case ElementType.CustomAttribute_BoxedObject_:
                    break;
                case ElementType.CustomAttribute_Field_:
                    break;
                case ElementType.CustomAttribute_Property_:
                    break;
                case ElementType.CustomAttribute_Enum_:
                    break;
                default:
                    break;
            }

            throw new BadImageFormatException("Invalid lead byte "+leadByte+".");
        }

        public override string ToString() { return this.GetType().Name; }
    }
}