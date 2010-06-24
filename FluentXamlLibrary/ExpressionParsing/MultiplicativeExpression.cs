using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Collections.ObjectModel;
using System.Windows.Data;

namespace FluentXamlLibrary.ExpressionParsing
{
    internal sealed class MultiplicativeExpression : ExpressionNode
    {
        static readonly ReadOnlyCollection<MultiplicativeExpressionOperand> EmptyOperands = new ReadOnlyCollection<MultiplicativeExpressionOperand>(new MultiplicativeExpressionOperand[] { });
        public readonly ReadOnlyCollection<MultiplicativeExpressionOperand> Operands;

        public MultiplicativeExpression(IEnumerable<MultiplicativeExpressionOperand> operands)
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
                    this.Operands = new ReadOnlyCollection<MultiplicativeExpressionOperand>(arr);
            }
        }

        public override Type ExpressionType
        {
            get
            {
                var types = from ope in this.Operands select ope.Operand.ExpressionType;

                return types.Skip(1).Aggregate(
                    types.First(),
                    Max);
            }
        }

        static Type Max(Type t1, Type t2)
        {
            if ((t1.IsPrimitive || t1 == typeof(decimal))
                != (t2.IsPrimitive || t2 == typeof(decimal)))
                return typeof(object);
            else if (System.Runtime.InteropServices.Marshal.SizeOf(t1) > System.Runtime.InteropServices.Marshal.SizeOf(t2))
                return t1;
            else
                return t2;
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
                    if (ope.IsDivide)
                        result = Divide(0, opeValue);
                    else
                        result = opeValue;
                }
                else
                {
                    if (ope.IsDivide)
                        result = Divide(result, opeValue);
                    else
                        result = Multiply(result, opeValue);
                }
            }

            return result;
        }

        public override object[] ConvertBack(object value, Type[] targetTypes)
        {
            throw new NotSupportedException();
        }

        static object Multiply(object x, object y)
        {
            return BinaryOperations.PerformOperation(
                x, y,
                (i, j) => i * j,
                (i, j) => i * j,
                (i, j) => i * j);
        }

        static object Divide(object x, object y)
        {
            return BinaryOperations.PerformOperation(
                x, y,
                (i, j) => i / j,
                (i, j) => i / j,
                (i, j) => i / j);
        }

        public override string ToString()
        {
            StringBuilder result = new StringBuilder();
            for (int i = 0; i < this.Operands.Count; i++)
            {
                if (i == 0)
                {
                    if (this.Operands[0].IsDivide)
                        result.Append("1/");
                }
                else
                {
                    result.Append(this.Operands[i].IsDivide ? '/' : '*');
                }

                result.Append(this.Operands[i].Operand);
            }
            return result.ToString();
        }
    }
}
