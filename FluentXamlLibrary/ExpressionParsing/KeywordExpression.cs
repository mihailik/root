using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Windows.Data;

namespace FluentXamlLibrary.ExpressionParsing
{
    internal sealed class KeywordExpression : ExpressionNode
    {
        readonly string keyword;
        readonly IEnumerable<Binding> m_Dependencies;

        public KeywordExpression(string keyword)
        {
            this.keyword = keyword;

            switch (keyword)
            {
                case "self":
                    m_Dependencies =
                        from _ in Enumerable.Range(0,1)
                        select new Binding { RelativeSource = RelativeSource.Self };
                    break;

                case "parent":
                    m_Dependencies =
                        from _ in Enumerable.Range(0, 1)
                        select new Binding { RelativeSource = new RelativeSource(RelativeSourceMode.FindAncestor, typeof(object), 0) };
                    break;

                default:
                    throw new FormatException("Unknown keyword '@"+keyword+"' in expression.");
            }
        }

        public override IEnumerable<Binding> Dependencies { get { return this.m_Dependencies; } }

        public override object Convert(ArraySegment<object> dependencyValues, Type targetType)
        {
            return dependencyValues.Array[dependencyValues.Offset];
        }

        public override string ToString() { return keyword; }
    }
}
