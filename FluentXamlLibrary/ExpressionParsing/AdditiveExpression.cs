using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Windows.Data;

namespace FluentXamlLibrary.ExpressionParsing
{
    internal sealed class AdditiveExpression : ExpressionNode
    {
        static readonly ReadOnlyCollection<AdditiveExpressionOperand> EmptyOperands = new ReadOnlyCollection<AdditiveExpressionOperand>(new AdditiveExpressionOperand[] { });
        public readonly ReadOnlyCollection<AdditiveExpressionOperand> Operands;

        public AdditiveExpression(IEnumerable<AdditiveExpressionOperand> operands)
        {
            if (operands == null)
            {
                this.Operands = EmptyOperands;
            }
            else
            {
                var arr = operands.ToArray();
                if (arr.Length == 0)
                    this.Operands = EmptyOperands;
                else
                    this.Operands = new ReadOnlyCollection<AdditiveExpressionOperand>(arr);
            }
        }

        public override Type ExpressionType
        {
            get
            {
                var types = from ope in this.Operands select ope.Operand.ExpressionType;

                return types.Skip(1).Aggregate(
                    types.First(),
                    BinaryOperations.MaxType);
            }
        }

        public override IEnumerable<Binding> Dependencies
        {
            get
            {
                return
                    from ope in this.Operands 
                    from d in ope.Operand.Dependencies
                    select d;
            }
        }

        public override object Convert(ArraySegment<object> dependencyValues, Type targetType)
        {
            object result = null;
            int valueIndex = 0;
            for (int i = 0; i < this.Operands.Count; i++)
            {
                var ope = this.Operands[i];

                int opeDependencyCount = ope.Operand.Dependencies.Count();

                var args = new ArraySegment<object>(
                    dependencyValues.Array,
                    dependencyValues.Offset + valueIndex,
                    opeDependencyCount);

                valueIndex += opeDependencyCount;

                object opeValue = ope.Operand.Convert(args, targetType);

                if (i == 0)
                {
                    if (ope.IsSubtract)
                        result = Subtract(0, opeValue);
                    else
                        result = opeValue;
                }
                else
                {
                    if (ope.IsSubtract)
                        result = Subtract(result, opeValue);
                    else
                        result = Add(result, opeValue);
                }
            }

            return result;
        }

        public override object[] ConvertBack(object value, Type[] targetTypes)
        {
            if (value == System.Windows.DependencyProperty.UnsetValue)
            {
                var result = new object[this.Dependencies.Count()];
                for (int i = 0; i < result.Length; i++)
                {
                    result[i] = System.Windows.DependencyProperty.UnsetValue;
                }
                return result;
            }

            throw new NotSupportedException();
        }

        private object Add(object x, object y)
        {
            if( x==System.Windows.DependencyProperty.UnsetValue
                || y==System.Windows.DependencyProperty.UnsetValue)
                return System.Windows.DependencyProperty.UnsetValue;
            else if (x is string)
                return ((string)x) + y;
            else if (y is string)
                return x + (string)y;
            else
                return BinaryOperations.PerformOperation(
                    x, y,
                    (i, j) => i + j,
                    (i, j) => i + j,
                    (i, j) => i + j);
        }

        private object Subtract(object x, object y)
        {
            return BinaryOperations.PerformOperation(
                x, y,
                (i, j) => i - j,
                (i, j) => i - j,
                (i, j) => i - j);
        }


        public override string ToString()
        {
            StringBuilder result = new StringBuilder();
            for (int i = 0; i < this.Operands.Count; i++)
            {
                if (i == 0)
                {
                    if (this.Operands[i].IsSubtract)
                        result.Append('-');
                }
                else
                {
                    result.Append(this.Operands[i].IsSubtract ? '-' : '+');
                }

                result.Append(this.Operands[i].Operand);
            }
            return result.ToString();
        }
    }
}
