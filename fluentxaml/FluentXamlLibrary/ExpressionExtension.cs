using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Globalization;
using System.Text;
using System.Windows;
using System.Windows.Data;
using System.Windows.Markup;

namespace FluentXamlLibrary
{
    using ExpressionParsing;

    public sealed class ExpressionExtension : MultiBinding
    {
        readonly string m_Expression;

        public ExpressionExtension(string source)
        {
            this.m_Expression = source.Replace('`', '"');

            var expr = ExpressionParsing.ExpressionParser.ParseExpression(this.Expression /*, targetType*/);

            foreach (var d in expr.Dependencies)
            {
                this.Bindings.Add(d);
            }

            this.Converter = new MultiBindingConverter(
                (values, targetType1) => expr.Convert(new ArraySegment<object>(values), targetType1),
                (value, targetTypes1) => expr.ConvertBack(value, targetTypes1));
        }

        public ExpressionExtension(string part1, string part2) : this(part1 + "," + part2) { }
        public ExpressionExtension(string part1, string part2, string part3) : this(part1 + "," + part2 + "," + part3) { }
        public ExpressionExtension(string part1, string part2, string part3, string part4) : this(part1 + "," + part2 + "," + part3 + "," + part4) { }
        public ExpressionExtension(string part1, string part2, string part3, string part4, string part5) : this(part1 + "," + part2 + "," + part3 + "," + part4 + "," + part5) { }
        public ExpressionExtension(string part1, string part2, string part3, string part4, string part5, string part6) : this(part1 + "," + part2 + "," + part3 + "," + part4 + "," + part5 + "," + part6) { }
        public ExpressionExtension(string part1, string part2, string part3, string part4, string part5, string part6, string part7) : this(part1 + "," + part2 + "," + part3 + "," + part4 + "," + part5 + "," + part6 + "," + part7) { }
        public ExpressionExtension(string part1, string part2, string part3, string part4, string part5, string part6, string part7, string part8) : this(part1 + "," + part2 + "," + part3 + "," + part4 + "," + part5 + "," + part6 + "," + part7 + "," + part8) { }
        public ExpressionExtension(string part1, string part2, string part3, string part4, string part5, string part6, string part7, string part8, string part9) : this(part1 + "," + part2 + "," + part3 + "," + part4 + "," + part5 + "," + part6 + "," + part7 + "," + part8 + "," + part9) { }
        public ExpressionExtension(string part1, string part2, string part3, string part4, string part5, string part6, string part7, string part8, string part9, string part10) : this(part1 + "," + part2 + "," + part3 + "," + part4 + "," + part5 + "," + part6 + "," + part7 + "," + part8 + "," + part9 + "," + part10) { }
        public ExpressionExtension(string part1, string part2, string part3, string part4, string part5, string part6, string part7, string part8, string part9, string part10, string part11) : this(part1 + "," + part2 + "," + part3 + "," + part4 + "," + part5 + "," + part6 + "," + part7 + "," + part8 + "," + part9 + "," + part10 + "," + part11) { }

        public string Expression { get { return this.m_Expression; } }

        new Collection<BindingBase> Bindings { get { return base.Bindings; } }
        new IMultiValueConverter Converter { get { return base.Converter; } set { base.Converter = value; } }
        new CultureInfo ConverterCulture { get { return base.ConverterCulture; } set { base.ConverterCulture = value; } }
        new object ConverterParameter { get { return base.ConverterParameter; } set { base.ConverterParameter = value; } }
        new BindingMode Mode { get { return base.Mode; } set { base.Mode = value; } }
    }
}