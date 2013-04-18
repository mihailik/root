using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Windows;

namespace FluentXamlLibrary
{
    internal static class InputElementCommon
    {
        public static bool OnInputElement(
            object sender,
            Action<FrameworkElement> onControl,
            Action<FrameworkContentElement> onContent)
        {
            var control = sender as FrameworkElement;
            var content = sender as FrameworkContentElement;

            if (control != null)
            {
                onControl(control);
                return true;
            }
            else if (content != null)
            {
                onContent(content);
                return true;
            }
            else
            {
                return false;
            }
        }
    }
}
