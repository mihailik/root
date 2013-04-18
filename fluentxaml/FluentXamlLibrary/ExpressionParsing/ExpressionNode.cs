using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Windows.Data;

namespace FluentXamlLibrary.ExpressionParsing
{
    internal abstract class ExpressionNode
    {
        public abstract override string ToString();
        public virtual Type ExpressionType { get { return typeof(object); } }

        public abstract IEnumerable<Binding> Dependencies { get; }
        public abstract object Convert(ArraySegment<object> dependencyValues, Type targetType);
        public abstract object[] ConvertBack(object value, Type[] targetTypes);
    }
}