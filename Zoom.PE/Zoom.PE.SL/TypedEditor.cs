using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Windows;
using System.Windows.Controls;

namespace Zoom.PE
{
    public class TypedEditor : Control
    {
        bool skipCoercion;

        public TypedEditor()
        {
            this.DefaultStyleKey = typeof(TypedEditor);
        }

        public object Value { get { return (object)GetValue(ValueProperty); } set { SetValue(ValueProperty, value); } }
        #region ValueProperty = DependencyProperty.Register(...)
        public static readonly DependencyProperty ValueProperty = DependencyProperty.Register(
            "Value",
            typeof(object),
            typeof(TypedEditor),
            new PropertyMetadata((sender, e) => ((TypedEditor)sender).OnValueChanged((object)e.OldValue)));
        #endregion

        public string Text { get { return (string)GetValue(TextProperty); } set { SetValue(TextProperty, value); } }
        #region TextProperty = DependencyProperty.Register(...)
        public static readonly DependencyProperty TextProperty = DependencyProperty.Register(
            "Text",
            typeof(string),
            typeof(TypedEditor),
            new PropertyMetadata((sender, e) => ((TypedEditor)sender).OnTextChanged((string)e.OldValue)));
        #endregion

        public TextAlignment TextAlignment { get { return (TextAlignment)GetValue(TextAlignmentProperty); } set { SetValue(TextAlignmentProperty, value); } }
        #region TextAlignmentProperty = DependencyProperty.Register(...)
        public static readonly DependencyProperty TextAlignmentProperty = DependencyProperty.Register(
            "TextAlignment",
            typeof(TextAlignment),
            typeof(TypedEditor),
            new PropertyMetadata((sender, e) => { }));
        #endregion

        private void OnValueChanged(object oldNumber)
        {
            if (skipCoercion)
                return;

            skipCoercion = true;
            try
            {
                UpdateTextFromValue();
            }
            finally
            {
                skipCoercion = false;
            }
        }

        private void OnTextChanged(string oldText)
        {
            if (skipCoercion)
                return;

            skipCoercion = true;
            try
            {
                UpdateValueFromText();

                this.Dispatcher.BeginInvoke(delegate
                {
                    skipCoercion = true;
                    try
                    {
                        UpdateTextFromValue();
                    }
                    finally
                    {
                        skipCoercion = false;
                    }
                });
            }
            catch
            {
                string newText = this.Text;
                this.Dispatcher.BeginInvoke(delegate
                {
                    if (this.Text != newText)
                        return;

                    skipCoercion = true;
                    try
                    {
                        this.Text = oldText;
                    }
                    finally
                    {
                        skipCoercion = false;
                    }
                });
            }
            finally
            {
                skipCoercion = false;
            }
        }

        protected virtual void UpdateTextFromValue()
        {
            string newText = this.Value == null ? null : this.Value.ToString();

            newText = newText == null ? null :
                newText.Replace(" ", Environment.NewLine);

            this.Text = newText;
        }

        protected virtual void UpdateValueFromText()
        {
            try
            {
                this.Value = Convert.ChangeType(this.Text, this.Value.GetType(), CultureInfo.CurrentCulture);
            }
            catch
            {
                if (this.Value is Enum)
                    this.Value = Enum.Parse(this.Value.GetType(), this.Text, true);
            }
        }
    }
}