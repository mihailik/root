using System;
using System.Collections.Generic;
using System.Linq;
using System.Globalization;
using System.Windows.Data;
using System.Windows.Markup;

namespace Zoom.PE
{
    public sealed class HexConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            if (value == null || Equals(value, string.Empty))
                return string.Empty;

            ulong num = System.Convert.ToUInt64(value, culture);

            string format = parameter as string;
            if (string.IsNullOrEmpty(format))
                format = "X";

            return num.ToString(format, culture) + "h";
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            string str = value as string;
            if (string.IsNullOrEmpty(str))
                return null;

            str = str.Trim();
            if (str.Length == 0)
                return null;

            ulong num;

            if (str.EndsWith("h", StringComparison.OrdinalIgnoreCase))
            {
                num = ulong.Parse(str.Substring(0, str.Length - 1), NumberStyles.HexNumber, culture);
            }
            else
            {
                try
                {
                    num = ulong.Parse(str, NumberStyles.HexNumber, culture);
                }
                catch
                {
                    if (!ulong.TryParse(str, NumberStyles.None, culture, out num))
                        throw;
                }
            }

            return System.Convert.ChangeType(num, targetType, culture);
        }
    }
}