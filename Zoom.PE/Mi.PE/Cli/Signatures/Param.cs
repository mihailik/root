using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Mi.PE.Cli.Signatures
{
    using Mi.PE.Internal;

    /// <summary>
    /// [ECMA-335 §23.2.10]
    /// </summary>
    public abstract class Param
    {
        public sealed class ByRef : Param
        {
            public Type Type;

            public override string ToString()
            {
                return
                    (this.CustomMods == null ? "" :
                    "[" + string.Join(", ", this.CustomMods.Select(cm => cm.ToString()).ToArray()) + "]") + 
                    "ByRef:" + this.Type;
            }
        }

        public sealed class DirectType : Param
        {
            public Type Type;

            public override string ToString()
            {
                return
                    (this.CustomMods == null ? "" :
                    "[" + string.Join(", ", this.CustomMods.Select(cm => cm.ToString()).ToArray()) + "]") + 
                    this.Type + "";
            }
        }

        public sealed class TypedByRef : Param
        {
            public TypedByRef()
            {
            }

            public override string ToString()
            {
                return
                    (this.CustomMods == null ? "" :
                    "[" + string.Join(", ", this.CustomMods.Select(cm => cm.ToString()).ToArray()) + "]") + 
                    this.GetType().Name;
            }
        }

        public CustomMod[] CustomMods;

        private Param()
        {
        }

        public static Param Read(BinaryStreamReader signatureBlobReader)
        {
            ElementType leadByte;

            var customMods = CustomMod.ReadCustomModArray(out leadByte, signatureBlobReader);

            switch (leadByte)
	        {
                case ElementType.ByRef:
                    leadByte = (ElementType)signatureBlobReader.ReadByte();
                    return new ByRef
                    {
                        Type = Type.Read(leadByte, signatureBlobReader)
                    };

                case ElementType.TypedByRef:
                    return new TypedByRef();

		        default:
                    return new DirectType
                    {
                        Type = Type.Read(leadByte, signatureBlobReader)
                    };
            }
        }
    }
}