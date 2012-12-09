using Roslyn.Compilers.CSharp;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RoslynOverZoomPE
{
    class Program
    {
        static void Main(string[] args)
        {
            string pathToEntries = @"..\..\..\Zoom.PE\Mi.PE\Cli\Tables";

            var entries = Directory.GetFiles(pathToEntries, "*Entry.cs");
            foreach (var entryFile in entries)
            {
                var syntax = SyntaxTree.ParseFile(entryFile);
                var root = syntax.GetRoot();

                var ns = (NamespaceDeclarationSyntax)root.Members.Single();
                var declaration = (TypeDeclarationSyntax)ns.Members.Single();

                string name = declaration.Identifier.ToString();
                string[] docComments = GetDocs(declaration);

                var fields =
                    (from f in declaration.Members.OfType<FieldDeclarationSyntax>()
                    let fDocs = GetDocs(f)
                    let fNameOriginal = f.Declaration.Variables.Single().Identifier.ToString()
                    let fName = string.Concat(fNameOriginal.TakeWhile(c => char.IsUpper(c)).Select(c => char.ToLowerInvariant(c)))+string.Concat(fNameOriginal.SkipWhile(c => char.IsUpper(c)))
                    let fType = f.Declaration.Type.ToString()
                    let coercedFType = fType == "Version" ? "string" : fType
                    select new { name = fName, type = coercedFType, docs = fDocs }).ToArray();

                var readMethod = declaration.Members.OfType<MethodDeclarationSyntax>().Single(m => m.Identifier.ToString() == "Read");

                string[] readMethodBody = GetReadMethodBody(readMethod.Body);

                string jsText =
                    "module pe.managed.metadata {\n" +
                    string.Concat(docComments.Select(c => "\t//" + c + "\n")) +
                    "\texport class " + name+" {\n" +
                    string.Concat(
                        from f in fields
                        select
                            string.Concat(f.docs.Select(d => "\t\t//"+d+"\n")) +
                            "\t\t"+f.name+": " + f.type +";\n\n") +
                    "\t\tread(reader: io.BinaryReader): void {\n"+
                    string.Concat(readMethodBody.Select(l => "\t\t"+l+"\n"))+
                    "\t}\n"+
                    "}";

                jsText.GetHashCode();
            }

            //SyntaxTree.ParseFile()
        }

        private static string[] GetReadMethodBody(BlockSyntax body)
        {
            string allBodyText = body.Statements.ToString();
            string jsBodyText = allBodyText
                .Replace(".Binary", "")
                .Replace(".Read", ".read")
                .Replace("Int32", "Int")
                .Replace("Int16", "Short");

            string[] jsBodyLines = jsBodyText.Replace("\r\n", "\n").Replace("\r", "\n").Split('\n');

            return jsBodyLines.Select(l => l.Trim()).ToArray();
        }

        private static string[] GetDocs(SyntaxNode declaration)
        {
            var triv = declaration.GetLeadingTrivia();
            var docComments =
                (from t in triv
                 where t.Kind == SyntaxKind.DocumentationCommentTrivia
                 let s = t.GetStructure()
                 from childT in s.ChildNodes().OfType<XmlElementSyntax>()
                 from co in childT.Content
                 let coElement = co as XmlEmptyElementSyntax
                 let coElementText = coElement==null ? null : coElement.Attributes.Select(a => a.TextTokens.ToString()).Aggregate((v1, v2) => v1 + " " + v2)
                 let coTxt = coElementText ?? co.ToString()
                 select coTxt).Aggregate(string.Concat);

            return
                (from line in docComments.Replace("\r\n", "\n").Replace('\r', '\n').Split('\n')
                 let trimLine = line.Trim()
                 let skipCommentSigns = trimLine.Replace("///", "").Trim()
                 where skipCommentSigns.Length > 0
                 select skipCommentSigns).ToArray();
        }
    }
}
