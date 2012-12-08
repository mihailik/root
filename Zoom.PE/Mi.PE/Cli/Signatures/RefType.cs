using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Mi.PE.Cli.Signatures
{
    using Mi.PE.Internal;

    /// <summary>
    /// [ECMA-335 §23.2.11]
    /// </summary>
    public abstract class RefType
    {
        public sealed class ByRef : RefType
        {
            public Type Type;

            public override string ToString()
            {
                return "ref "+this.Type;
            }
        }

        public sealed class DirectType : RefType
        {
            public Type Type;

            public override string ToString()
            {
                return this.Type+"";
            }
        }

        public sealed class TypedByRef : RefType
        {
            public static readonly TypedByRef Instance = new TypedByRef();

            private TypedByRef() { }

            public override string ToString()
            {
                return "TypedByRef";
            }
        }

        public sealed class Void : RefType
        {
            public static readonly Void Instance = new Void();

            private Void() { }

            public override string ToString()
            {
                return "Void";
            }
        }

        private RefType()
        {
        }

        public static RefType Read(BinaryStreamReader signatureBlobReader)
        {
            var leadByte = (ElementType)signatureBlobReader.ReadByte();
            if (leadByte == ElementType.ByRef)
            {
                Type t = Type.Read(leadByte, signatureBlobReader);
                return new ByRef
                {
                    Type = t
                };
            }
            else if (leadByte == ElementType.TypedByRef)
            {
                return TypedByRef.Instance;
            }
            else if (leadByte == ElementType.Void)
            {
                return Void.Instance;
            }
            else
            {
                Type t = Type.Read(leadByte, signatureBlobReader);
                return new DirectType
                {
                    Type = t
                };
            }
        }
    }
}