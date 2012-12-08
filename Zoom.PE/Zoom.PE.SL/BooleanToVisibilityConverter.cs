using System;
using System.Collections.Generic;
using System.Linq;
using System.Globalization;
using System.Windows;
using System.Windows.Data;

namespace Zoom.PE
{
    public sealed class BooleanToVisibilityConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            if (value == null)
                return null;

            bool typedValue = System.Convert.ToBoolean(value);
            if (typedValue)
                return Visibility.Visible;
            else
                return Visibility.Collapsed;
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            if (value == null)
                return null;

            var typedValue = (Visibility)System.Convert.ChangeType(value, typeof(Visibility), culture);
            if (typedValue == Visibility.Visible)
                return true;
            else
                return false;
        }
    }
}
