using System;
using System.Collections.Generic;
using System.Globalization;
using System.Net;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Ink;
using System.Windows.Input;
using System.Windows.Markup;
using System.Windows.Media;
using System.Windows.Media.Animation;
using System.Windows.Shapes;

namespace Zoom.PE
{
    [ContentProperty("Matches")]
    public sealed class ByType : Binding
    {
        private sealed class DelegateConverter : IValueConverter
        {
            readonly Func<object, object> convert;

            public DelegateConverter(Func<object,object> convert)
            {
                this.convert = convert;
            }

            object IValueConverter.Convert(object value, Type targetType, object parameter, CultureInfo culture)
            {
                return convert(value);
            }

            object IValueConverter.ConvertBack(object value, Type targetType, object parameter, CultureInfo culture) { throw new NotSupportedException(); }
        }

        readonly List<MatchType> m_Matches = new List<MatchType>();

        public ByType()
        {
            base.Converter = new DelegateConverter(Convert);
        }

        public ByType(string path)
            : base(path)
        {
            base.Converter = new DelegateConverter(Convert);
        }

        public List<MatchType> Matches { get { return m_Matches; } }

        new public object Converter { get { return null; } }

        object Convert(object value)
        {
            Type type = value == null ? null : value.GetType();
            while (true)
            {
                foreach (var m in Matches)
                {
                    if ((string.IsNullOrEmpty(m.Type) && type == null)
                        || (type != null && m.Type == type.FullName))
                        return m.Value;
                }

                type = type.BaseType;
                if (type == null)
                    break;
            }

            foreach (var m in Matches)
            {
                if (string.IsNullOrEmpty(m.Type))
                    return m.Value;
            }

            return null;
        }
    }
}
