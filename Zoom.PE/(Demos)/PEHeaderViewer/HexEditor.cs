using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Globalization;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Markup;

namespace PEHeaderViewer
{
    public class HexEditor : TypedEditor
    {
        protected override void UpdateTextFromValue()
        {
            if (this.Value == null)
            {
                this.Text = null;
                return;
            }

            ulong extendedNumber = (ulong)Convert.ChangeType(this.Value, typeof(ulong), CultureInfo.CurrentCulture);

            string newText = extendedNumber.ToString("X") + "h";

            this.Text = newText;
        }

        protected override void UpdateValueFromText()
        {
            string text = this.Text;
            if (text == null)
            {
                this.Value = null;
                return;
            }

            text = text.Trim();

            if (text.EndsWith("H", StringComparison.OrdinalIgnoreCase))
                text = text.Substring(0, text.Length-1);

            ulong extendedNumber = ulong.Parse(text, NumberStyles.HexNumber);

            this.Value = Convert.ChangeType(extendedNumber, this.Value.GetType(), CultureInfo.CurrentCulture);
        }
    }
}