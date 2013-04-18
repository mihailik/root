using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace FluentXamlLibrary.ExpressionParsing
{
    internal sealed class AdditiveExpressionOperand
    {
        public readonly bool IsSubtract;
        public readonly ExpressionNode Operand;

        public AdditiveExpressionOperand(ExpressionNode operand, bool isSubtract)
        {
            this.IsSubtract = isSubtract;
            this.Operand = operand;
        }

         public override string ToString() { return (this.IsSubtract ? "-" : "" ) + this.Operand; }
    }
}
