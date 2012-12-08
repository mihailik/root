using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Mi.PE.Cli
{
    public abstract class TypeReference
    {
        internal TypeReference()
        {
        }

        public sealed class External : TypeReference
        {
            public string Name;
            public string Namespace;

            public override string ToString()
            {
                return string.IsNullOrEmpty(Namespace) ? Name : Namespace + "." + Name;
            }
        }
    }
}