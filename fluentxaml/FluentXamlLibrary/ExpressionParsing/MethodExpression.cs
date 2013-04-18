using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Text;
using System.Windows.Input;
using System.Windows.Data;

namespace FluentXamlLibrary.ExpressionParsing
{
    internal sealed class MethodExpression : ExpressionNode
    {
        static readonly ReadOnlyCollection<ExpressionNode> EmptyParameters = new ReadOnlyCollection<ExpressionNode>(new ExpressionNode[] {});

        public readonly ExpressionNode ThisExpression;
        public readonly string MethodName;
        public readonly ReadOnlyCollection<ExpressionNode> Parameters;

        public MethodExpression(
            ExpressionNode thisExpression,
            string methodName,
            IEnumerable<ExpressionNode> parameters)
        {
            this.ThisExpression = thisExpression;
            this.MethodName = methodName;

            if (parameters == null)
            {
                this.Parameters = EmptyParameters;
            }
            else
            {
                var arr = parameters.ToArray();
                if (arr.Length == 0)
                    this.Parameters = EmptyParameters;
                else
                    this.Parameters = new ReadOnlyCollection<ExpressionNode>(arr);
            }
        }

        public override IEnumerable<Binding> Dependencies
        {
            get
            {
                return
                    this.ThisExpression.Dependencies.Concat(
                    from ope in this.Parameters
                    from d in ope.Dependencies
                    select d);
            }
        }

        public override object Convert(ArraySegment<object> dependencyValues, Type targetType)
        {
            int methodDependencyCount = this.ThisExpression.Dependencies.Count();

            var thisValue = this.ThisExpression.Convert(
                new ArraySegment<object>(
                    dependencyValues.Array,
                    dependencyValues.Offset,
                    methodDependencyCount),
                typeof(object));

            object[] parameterValues = new object[this.Parameters.Count];
            int valueIndex = methodDependencyCount;

            for (int i = 0; i < this.Parameters.Count; i++)
            {
                var ope = this.Parameters[i];

                int opeDependencyCount = ope.Dependencies.Count();

                var args = new ArraySegment<object>(
                    dependencyValues.Array,
                    dependencyValues.Offset + valueIndex,
                    opeDependencyCount);

                valueIndex += opeDependencyCount;

                object opeValue = ope.Convert(args, typeof(object));

                parameterValues[i] = opeValue;
            }

            if (targetType != typeof(object)
                && targetType.IsAssignableFrom(typeof(DelegateCommand))
                && typeof(ICommand).IsAssignableFrom(targetType))
            {
                var result = new DelegateCommand(
                    _ =>
                    {
                        var invokeResult = this.Invoke(thisValue, this.MethodName, parameterValues);
                        // TODO: push result somewhere
                    })
                    {
                        Text = this.MethodName
                    };
                return result;
            }
            else
            {
                var result = Invoke(thisValue, this.MethodName, parameterValues);
                return result;
            }
        }

        public override object[] ConvertBack(object value, Type[] targetTypes)
        {
            throw new NotSupportedException();
        }

        object Invoke(object thisValue, string methodName, object[] parameterValues)
        {
            return thisValue.GetType().InvokeMember(
                methodName,
                System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Instance | System.Reflection.BindingFlags.InvokeMethod,
                null,
                thisValue,
                parameterValues);
        }

        public override string ToString()
        {
            return
                this.ThisExpression + "(" +
                string.Join(",", (from p in this.Parameters select p.ToString()).ToArray()) +
                ")";
        }
    }
}
