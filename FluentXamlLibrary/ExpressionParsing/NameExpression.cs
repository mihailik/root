using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Windows.Data;

namespace FluentXamlLibrary.ExpressionParsing
{
    internal sealed class NameExpression : ExpressionNode
    {
        public readonly string Name;

        public NameExpression(string name) { this.Name = name; }

        public override string ToString() { return this.Name; }

        public override IEnumerable<Binding> Dependencies
        {
            get { yield return new Binding(this.Name); }
        }

        public override object Convert(ArraySegment<object> dependencyValues, Type targetType)
        {
            return dependencyValues.Array[dependencyValues.Offset];
        }
    }
}
