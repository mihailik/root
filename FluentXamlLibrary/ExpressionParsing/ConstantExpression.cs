using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Windows.Data;

namespace FluentXamlLibrary.ExpressionParsing
{
    internal sealed class ConstantExpression : ExpressionNode
    {
        public readonly object Value;

        public ConstantExpression(object value) { this.Value = value; }

        public override Type ExpressionType { get { return this.Value==null ? typeof(object) : this.Value.GetType(); } }

        public override IEnumerable<Binding> Dependencies { get { return Enumerable.Empty<Binding>(); } }
        public override object Convert(ArraySegment<object> dependencyValues, Type targetType) { return this.Value; }

        public override string ToString() { return this.Value == null ? "null" : this.Value.ToString(); }
    }
}
