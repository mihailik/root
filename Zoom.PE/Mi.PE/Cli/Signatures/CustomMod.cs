using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Mi.PE.Cli.Signatures
{
    using Mi.PE.Cli.CodedIndices;
    using Mi.PE.Internal;

    /// <summary>
    /// [ECMA-335 §23.2.7, 23.2.8]
    /// </summary>
    public sealed class CustomMod
    {
        public bool Required;
        public CodedIndex<TypeDefOrRef> Type;

        public static CustomMod Read(BinaryStreamReader signatureBlobReader, ElementType leadByte)
        {
            CustomMod result;
            if (leadByte == ElementType.CMod_Opt)
            {
                result = new CustomMod();
                result.Required = true;
            }
            else if (leadByte == ElementType.CMod_ReqD)
            {
                result = new CustomMod();
                result.Required = false;
            }
            else
            {
                return null;
            }

            result.Type = signatureBlobReader.ReadTypeDefOrRefOrSpecEncoded();

            return result;
        }

        public static CustomMod[] ReadCustomModArray(out ElementType leadByte, BinaryStreamReader signatureBlobReader)
        {
            List<CustomMod> customMods = null;

            leadByte = (ElementType)signatureBlobReader.ReadByte();
            while (true)
            {
                var cmod = CustomMod.Read(signatureBlobReader, leadByte);
                if (cmod == null)
                    break;

                if (customMods == null)
                    customMods = new List<CustomMod>();

                customMods.Add(cmod);
            }

            if (customMods == null)
                return null;
            else
                return customMods.ToArray();
        }
    }
}