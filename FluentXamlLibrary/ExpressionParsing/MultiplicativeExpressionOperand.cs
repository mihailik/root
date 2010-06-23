using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace FluentXamlLibrary.ExpressionParsing
{
    internal sealed class MultiplicativeExpressionOperand
    {
        public readonly bool IsDivide;
        public readonly ExpressionNode Operand;

        public MultiplicativeExpressionOperand(ExpressionNode operand, bool isDivide)
        {
            this.IsDivide = isDivide;
            this.Operand = operand;
        }

        public override string ToString() { return (this.IsDivide ? "/" : "") + this.Operand; }
    }
}
