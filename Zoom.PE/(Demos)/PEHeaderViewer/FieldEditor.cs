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
    public class FieldEditor : ContentControl
    {
        public FieldEditor()
        {
            this.DefaultStyleKey = typeof(FieldEditor);
        }

        public object Header { get { return (object)GetValue(HeaderProperty); } set { SetValue(HeaderProperty, value); } }
        #region HeaderProperty = DependencyProperty.Register(...)
        public static readonly DependencyProperty HeaderProperty = DependencyProperty.Register(
            "Header",
            typeof(object),
            typeof(FieldEditor),
            new PropertyMetadata((sender, e) => { }));
        #endregion

        public DataTemplate HeaderTemplate { get { return (DataTemplate)GetValue(HeaderTemplateProperty); } set { SetValue(HeaderTemplateProperty, value); } }
        #region HeaderTemplateProperty = DependencyProperty.Register(...)
        public static readonly DependencyProperty HeaderTemplateProperty = DependencyProperty.Register(
            "HeaderTemplate",
            typeof(DataTemplate),
            typeof(FieldEditor),
            new PropertyMetadata((sender, e) => { }));
        #endregion

    }
}