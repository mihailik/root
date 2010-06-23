using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace FluentXamlLibrary.ExpressionParsing
{
    internal static class BinaryOperations
    {
        public static object PerformOperation(
            object x, object y,
            Func<long, long, long> longOperation,
            Func<double, double, double> doubleOperation,
            Func<decimal, decimal, decimal> decimalOperation)
        {
            if (x == System.Windows.DependencyProperty.UnsetValue
                || y == System.Windows.DependencyProperty.UnsetValue)
                return System.Windows.DependencyProperty.UnsetValue;

            if (x == null)
                return y;
            if (y == null)
                return x;

            if (x is int && y is int)
            {
                long resultLong = longOperation((int)x, (int)y);
                if (resultLong >= int.MinValue && resultLong <= int.MaxValue)
                    return (int)resultLong;
                else
                    return resultLong;
            }
            else if ((x is int || x is float) && (y is int || y is float))
            {
                float xSingle = Convert.ToSingle(x);
                float ySingle = Convert.ToSingle(y);

                double doubleResult = doubleOperation(xSingle, ySingle);

                if (doubleResult >= float.MinValue && doubleResult <= float.MaxValue)
                    return (float)doubleResult;
                else
                    return doubleResult;
            }
            else if ((x is int || x is float || x is double) && (y is int || y is float || y is float))
            {
                double xDouble = Convert.ToDouble(x);
                double yDouble = Convert.ToDouble(y);

                double result = doubleOperation(xDouble, yDouble);

                return result;
            }
            else
            {
                decimal xDec = Convert.ToDecimal(x);
                decimal yDec = Convert.ToDecimal(y);

                decimal result = decimalOperation(xDec, yDec);

                return result;
            }
        }

        public static Type MaxType(Type t1, Type t2)
        {
            if ((t1.IsPrimitive || t1 == typeof(decimal))
                != (t2.IsPrimitive || t2 == typeof(decimal)))
                return typeof(object);
            else if (System.Runtime.InteropServices.Marshal.SizeOf(t1) > System.Runtime.InteropServices.Marshal.SizeOf(t2))
                return t1;
            else
                return t2;
        }

    }
}
