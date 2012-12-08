using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Mi.PE.Cli.Signatures
{
    using Mi.PE.Cli.CodedIndices;
    using Mi.PE.Internal;

    public static class IntegerCompression
    {
        public static uint? ReadCompressedUInt32(this BinaryStreamReader reader)
        {
            byte b0 = reader.ReadByte();
            switch (b0 & 0xC0)
            {
                case 0x00:
                case 0x40:
                    return b0;

                case 0x80:
                    {
                        byte b1 = reader.ReadByte();
                        return (uint)(
                            ((b0 & 0x3F) << 8)
                            | b1);
                    }

                case 0xFF:
                    return null;

                default:
                    {
                        byte b1 = reader.ReadByte();
                        byte b2 = reader.ReadByte();
                        byte b3 = reader.ReadByte();
                        return (uint)(
                            ((b0 & 0x3F) << 24)
                            | (b1 << 16)
                            | (b2 << 8)
                            | b3);
                    }
            }
        }

        public static CodedIndex<TypeDefOrRef> ReadTypeDefOrRefOrSpecEncoded(this BinaryStreamReader reader)
        {
            // TypeDefOrRefOrSpecEncoded (ECMA-335 §23.2.8)
            uint? encodedOrNull = reader.ReadCompressedUInt32();

            switch (encodedOrNull & 3) // 2 least significant bits
            {
                case 0: // TypeDef
                case 1: // TypeRef
                case 2: // TypeSpec
                    var r = (CodedIndices.CodedIndex<CodedIndices.TypeDefOrRef>)encodedOrNull.Value;
                    r.TableKind.GetHashCode();
                    r.Index.GetHashCode();
                    return r;

                default:
                    throw new BadImageFormatException("Invalid TypeDefOrRefOrSpecEncoded value: " + (encodedOrNull == null ? "null" : encodedOrNull.ToString()) + ".");
            }
        }

        public static void WriteCompressedInteger(this BinaryStreamWriter writer, uint? value)
        {
            if (value == null)
            {
                writer.WriteByte(0xFF);
                return;
            }

            if (value <= 0x7F)
            {
                writer.WriteByte((byte)value);
            }
            else if (value <= 0x3FFF)
            {
                writer.WriteByte((byte)(0x80 | (value >> 8)));
                writer.WriteByte((byte)value);
            }
            else
            {
                writer.WriteByte((byte)(0xC0 | (value >> 24)));
                writer.WriteByte((byte)(value >> 16));
                writer.WriteByte((byte)(value >> 8));
                writer.WriteByte((byte)value);
            }
        }
    }
}