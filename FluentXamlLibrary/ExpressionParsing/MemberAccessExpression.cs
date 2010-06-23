using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Windows.Data;
using System.Windows;

namespace FluentXamlLibrary.ExpressionParsing
{
    internal sealed class MemberAccessExpression : ExpressionNode
    {
        public readonly ExpressionNode ThisExpression;
        public readonly string MemberName;

        public MemberAccessExpression(ExpressionNode thisExpression, string memberName)
        {
            this.ThisExpression = thisExpression;
            this.MemberName = memberName;
        }

        public override string ToString() { return this.ThisExpression+"."+this.MemberName; }

        public override IEnumerable<Binding> Dependencies
        {
            get
            {
                if (this.ThisExpression is MemberAccessExpression
                    || this.ThisExpression is NameExpression
                    || this.ThisExpression is IdExpression
                    || this.ThisExpression is KeywordExpression)
                {
                    return this.ThisExpression.Dependencies.Select(
                        bin =>
                        {
                            var newBin = new Binding(
                                bin.Path != null && !string.IsNullOrEmpty(bin.Path.Path) ?
                                    bin.Path.Path + "." + this.MemberName :
                                    this.MemberName);

                            if (!string.IsNullOrEmpty(bin.ElementName))
                                newBin.ElementName = bin.ElementName;

                            if (bin.RelativeSource != null)
                                newBin.RelativeSource = bin.RelativeSource;

                            return newBin;
                        });
                }
                else
                {
                    return this.ThisExpression.Dependencies;
                }
            }
        }

        public override object Convert(ArraySegment<object> dependencyValues, Type targetType)
        {
            if (this.ThisExpression is MemberAccessExpression
                || this.ThisExpression is NameExpression
                || this.ThisExpression is IdExpression
                || this.ThisExpression is KeywordExpression)
            {
                return dependencyValues.Array[dependencyValues.Offset];
            }
            else
            {
                throw new NotImplementedException("Member access over an arbitrary expression is not yet implemented.");
            }
        }
    }
}
