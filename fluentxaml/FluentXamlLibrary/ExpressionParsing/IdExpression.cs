using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Windows.Data;

namespace FluentXamlLibrary.ExpressionParsing
{
    internal sealed class IdExpression : ExpressionNode
    {
        public readonly string Id;

        public IdExpression(string id) { this.Id = id; }

        public override string ToString() { return "#"+this.Id; }

        public override IEnumerable<Binding> Dependencies { get { yield return new Binding { ElementName = this.Id }; } }

        public override object Convert(ArraySegment<object> dependencyValues, Type targetType) { return dependencyValues.Array[dependencyValues.Offset]; }
        public override object[] ConvertBack(object value, Type[] targetTypes) { return new [] { value }; }
    }
}
