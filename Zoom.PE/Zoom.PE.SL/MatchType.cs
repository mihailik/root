using System;
using System.Net;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Documents;
using System.Windows.Ink;
using System.Windows.Input;
using System.Windows.Markup;
using System.Windows.Media;
using System.Windows.Media.Animation;
using System.Windows.Shapes;

namespace Zoom.PE
{
    [ContentProperty("Value")]
    public sealed class MatchType
    {
        public string Type { get; set; }
        public object Value { get; set; }
    }
}
