using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Windows.UI.Xaml.Data;

namespace MetroFileDetails
{
    public sealed class HexConverter : IValueConverter
    {
        public object Convert(object value, string typeName, object parameter, string language)
        {
            var culture = new CultureInfo(language);

            if (value == null || Equals(value, string.Empty))
                return string.Empty;

            ulong num = System.Convert.ToUInt64(value, culture);

            string format = parameter as string;
            if (string.IsNullOrEmpty(format))
                format = "X";

            return num.ToString(format, culture) + "h";
        }

        public object ConvertBack(object value, string typeName, object parameter, string language)
        {
            var culture = new CultureInfo(language);

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

            var targetType = Type.GetType(typeName);

            return System.Convert.ChangeType(num, targetType, culture);
        }
    }
}