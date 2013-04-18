using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Windows.Data;

namespace FluentXamlLibrary.ExpressionParsing
{
    internal sealed class StaticExpression : ExpressionNode
    {
        public readonly Type Type;
        public readonly string MemberPath;

        public StaticExpression(Type type, string memberPath)
        {
            this.Type = type;
            this.MemberPath = memberPath;
        }

        public override IEnumerable<Binding> Dependencies { get { return new Binding[] {}; } }

        public override object Convert(ArraySegment<object> dependencyValues, Type targetType)
        {
            throw new NotImplementedException();
        }

        public override object[] ConvertBack(object value, Type[] targetTypes)
        {
            throw new NotImplementedException();
        }
    
        public override string ToString() { return this.Type.Name + ":" + this.MemberPath; }
    }
}