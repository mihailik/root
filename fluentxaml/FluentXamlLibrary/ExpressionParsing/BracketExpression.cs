using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Windows.Data;

namespace FluentXamlLibrary.ExpressionParsing
{
    internal sealed class BracketExpression : ExpressionNode
    {
        public readonly ExpressionNode InnerExpression;

        public BracketExpression(ExpressionNode innerExpression)
        {
            this.InnerExpression = innerExpression;
        }

        public override Type ExpressionType { get { return this.InnerExpression.ExpressionType; } }

        public override IEnumerable<Binding> Dependencies { get { return this.InnerExpression.Dependencies; } }
        public override object Convert(ArraySegment<object> dependencyValues, Type targetType) { return this.InnerExpression.Convert(dependencyValues, targetType); }
        public override object[] ConvertBack(object value, Type[] targetTypes) { return this.InnerExpression.ConvertBack(value, targetTypes); }

        public override string ToString() { return "("+this.InnerExpression+")"; }
    }
}
