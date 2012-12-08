using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Reflection;
using System.IO;
using System.Reflection.Emit;
using Mi.PE.Internal;

namespace Mi.PE
{
    internal static class EmitSamplePEs
    {
        public static class Library
        {
            public static class Bytes
            {
                public static readonly byte[] AnyCPU = EmitLibraryAssembly(PortableExecutableKinds.ILOnly, ImageFileMachine.I386);
                public static readonly byte[] X86 = EmitLibraryAssembly(PortableExecutableKinds.Required32Bit, ImageFileMachine.I386);
                public static readonly byte[] X64 = EmitLibraryAssembly(PortableExecutableKinds.PE32Plus, ImageFileMachine.AMD64);
                public static readonly byte[] Itanium = EmitLibraryAssembly(PortableExecutableKinds.PE32Plus, ImageFileMachine.IA64);
            }

            public static readonly PEFile AnyCPU = Read(Bytes.AnyCPU);
            public static readonly PEFile X86 = Read(Bytes.X86);
            public static readonly PEFile X64 = Read(Bytes.X64);
            public static readonly PEFile Itanium = Read(Bytes.Itanium);
        }

        public static class Console
        {
            public static class Bytes
            {
                public static readonly byte[] AnyCPU = EmitHelloWorldConsoleExeAssembly(PortableExecutableKinds.ILOnly, ImageFileMachine.I386);
                public static readonly byte[] X86 = EmitHelloWorldConsoleExeAssembly(PortableExecutableKinds.Required32Bit, ImageFileMachine.I386);
                public static readonly byte[] X64 = EmitHelloWorldConsoleExeAssembly(PortableExecutableKinds.PE32Plus, ImageFileMachine.AMD64);
                public static readonly byte[] Itanium = EmitHelloWorldConsoleExeAssembly(PortableExecutableKinds.PE32Plus, ImageFileMachine.IA64);
            }

            public static readonly PEFile AnyCPU = Read(Bytes.AnyCPU);
            public static readonly PEFile X86 = Read(Bytes.X86);
            public static readonly PEFile X64 = Read(Bytes.X64);
            public static readonly PEFile Itanium = Read(Bytes.Itanium);
        }

        static PEFile Read(byte[] bytes)
        {
            var stream = new MemoryStream(bytes);
            var reader = new BinaryStreamReader(stream, new byte[32]);
            var pe = new PEFile();
            pe.ReadFrom(reader);
            return pe;
        }

        private static byte[] EmitLibraryAssembly(PortableExecutableKinds peKind, ImageFileMachine machine)
        {
            byte[] bytes;
            var asmName = new AssemblyName { Name = "Dummy" + Guid.NewGuid() };
            var asmBuilder = AppDomain.CurrentDomain.DefineDynamicAssembly(
                asmName,
                System.Reflection.Emit.AssemblyBuilderAccess.Save);
            asmBuilder.Save(asmName.Name, peKind, machine);
            try
            {
                bytes = File.ReadAllBytes(asmName.Name);
            }
            finally
            {
                File.Delete(asmName.Name);
            }
            return bytes;
        }

        private static byte[] EmitHelloWorldConsoleExeAssembly(PortableExecutableKinds peKind, ImageFileMachine machine)
        {
            byte[] bytes;
            var asmName = new AssemblyName { Name = "Dummy" + Guid.NewGuid() };
            var asmBuilder = AppDomain.CurrentDomain.DefineDynamicAssembly(
                asmName,
                System.Reflection.Emit.AssemblyBuilderAccess.Save);
            var modBuilder = asmBuilder.DefineDynamicModule(asmName.Name, asmName.Name + ".exe");
            var programTypeBuilder = modBuilder.DefineType("Program");
            var mainMethodBuilder = programTypeBuilder.DefineMethod("Main", MethodAttributes.Static, typeof(void), Type.EmptyTypes);
            var il = mainMethodBuilder.GetILGenerator();
            il.EmitWriteLine("Hello, World!");
            il.Emit(OpCodes.Ret);
            asmBuilder.SetEntryPoint(mainMethodBuilder);
            programTypeBuilder.CreateType();
            asmBuilder.Save(asmName.Name + ".exe", peKind, machine);
            try
            {
                bytes = File.ReadAllBytes(asmName.Name + ".exe");
            }
            finally
            {
                File.Delete(asmName.Name);
            }
            return bytes;
        }
    }
}