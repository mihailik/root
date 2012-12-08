using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Mi.PE.Cli.Signatures
{
    using Mi.PE.Internal;

    /// <summary>
    /// A <see cref="MethodSig"/> is indexed by the Method.Signature column.
    /// It captures the signature of a method or global function.
    /// [ECMA-335 §23.2.1, §23.2.2, §23.2.3]
    /// </summary>
    public abstract class MethodSig
    {
        public sealed class Default : MethodSig
        {
        }

        public sealed class C : MethodSig
        {
        }

        public sealed class StdCall : MethodSig
        {
        }

        public sealed class ThisCall : MethodSig
        {
        }

        public sealed class FastCall : MethodSig
        {
        }

        public sealed class Generic : MethodSig
        {
            public uint GenParamCount;

            internal void ReadDetails(BinaryStreamReader reader)
            {
                this.GenParamCount = reader.ReadCompressedUInt32() ?? 0;
            }
        }

        public sealed class VarArg : MethodSig
        {
            public LocalVarSig[] VarArgs;
        }

        [Flags]
        private enum CallingConventions : byte
        {
            /// <summary>
            /// Used to encode the keyword default in the calling convention, see ECMA §15.3.
            /// </summary>
            Default = 0x0,

            C = 0x1,

            StdCall = 0x2,

            FastCall = 0x4,

            /// <summary>
            /// Used to encode the keyword vararg in the calling convention, see ECMA §15.3.
            /// </summary>
            VarArg = 0x5,

            /// <summary>
            /// Used to indicate that the method has one or more generic parameters.
            /// </summary>
            Generic = 0x10,

            /// <summary>
            /// Used to encode the keyword instance in the calling convention, see ECMA §15.3.
            /// </summary>
            HasThis = 0x20,

            /// <summary>
            /// Used to encode the keyword explicit in the calling convention, see ECMA §15.3.
            /// </summary>
            ExplicitThis = 0x40,

            /// <summary>
            /// (ECMA §23.1.16), used to encode '...' in the parameter list, see ECMA §15.3.
            /// </summary>
            Sentinel = 0x41,
        }

        public bool Instance;
        public bool Explicit;

        public RefType RefType;
        public Param[] ParamList;

        public static MethodSig Read(BinaryStreamReader signatureBlobReader)
        {
            var callingConvention = (CallingConventions)signatureBlobReader.ReadByte();

            MethodSig result;
            switch (callingConvention & ~CallingConventions.HasThis & ~CallingConventions.ExplicitThis)
            {
                case CallingConventions.Default:
                    result = new Default();
                    break;

                case CallingConventions.C:
                    result = new C();
                    break;

                case CallingConventions.StdCall:
                    result = new StdCall();
                    break;

                case CallingConventions.FastCall:
                    result = new FastCall();
                    break;

                case CallingConventions.VarArg:
                    result = new VarArg();
                    break;

                case CallingConventions.Generic:
                    {
                        var typed = new Generic();
                        typed.ReadDetails(signatureBlobReader);
                        result = typed;
                    }
                    break;

                default:
                    throw new BadImageFormatException("Invalid calling convention byte "+callingConvention+".");
            }

            result.ReadParameters(signatureBlobReader);

            return result;
        }

        void ReadParameters(BinaryStreamReader signatureBlobReader)
        {
            uint parameterCount = signatureBlobReader.ReadCompressedUInt32() ?? 0;

            this.RefType = RefType.Read(signatureBlobReader);

            var paramList = new Param[parameterCount];
            for (int i = 0; i < paramList.Length; i++)
            {
                var p = Param.Read(signatureBlobReader);
                paramList[i] = p;
            }

            this.ParamList = paramList;
        }

        void PopulateInstanceAndExplicit(CallingConventions callingConvention)
        {
            this.Instance = (callingConvention & CallingConventions.HasThis) != 0;
            this.Explicit = (callingConvention & CallingConventions.ExplicitThis) != 0;
        }

        void PopulateSimpleSig(BinaryStreamReader signatureBlobReader, CallingConventions callingConvention)
        {
            PopulateInstanceAndExplicit(callingConvention);
            throw new NotImplementedException();
        }
    }
}