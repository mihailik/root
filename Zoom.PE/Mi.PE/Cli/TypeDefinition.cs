using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Mi.PE.Cli
{
    public sealed class TypeDefinition : TypeReference
    {
        public string Name;
        public string Namespace;
        public Mi.PE.Cli.Tables.TypeAttributes Attributes;
        public TypeReference BaseType;
        public FieldDefinition[] Fields;
        public MethodDefinition[] Methods;
        public PropertyDefinition[] Properties;

        public override string ToString()
        {
            return
                string.IsNullOrEmpty(this.Namespace) ? this.Name :
                this.Namespace + "." + this.Name +
                (this.Fields == null ? null : " : Fields["+this.Fields.Length+"]") +
                (this.Methods == null ? null : " : Methods[" + this.Methods.Length + "]") +
                (this.Properties == null ? null : " : Properties[" + this.Properties.Length + "]");
        }
    }
}