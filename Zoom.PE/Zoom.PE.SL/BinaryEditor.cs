using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;

namespace Zoom.PE
{
    [TemplatePart(Name = BinaryEditor.TextBoxName, Type = typeof(TextBox))]
    public class BinaryEditor : Control
    {
        const string TextBoxName = "PART_TextBox";
        TextBox PART_TextBox;
        bool isMouseDown;

        bool selectionNormalizationQueued;

        public BinaryEditor()
        {
            this.DefaultStyleKey = typeof(BinaryEditor);
        }

        public byte[] Data { get { return (byte[])GetValue(DataProperty); } set { SetValue(DataProperty, value); } }
        #region DataProperty = DependencyProperty.Register(...)
        public static readonly DependencyProperty DataProperty = DependencyProperty.Register(
            "Data",
            typeof(byte[]),
            typeof(BinaryEditor),
            new PropertyMetadata((sender, e) => ((BinaryEditor)sender).OnDataChanged((byte[])e.OldValue)));
        #endregion

        private void OnDataChanged(byte[] oldData)
        {
            if (this.PART_TextBox == null)
                return;

            if (this.Data == null)
            {
                this.PART_TextBox.Text = "";
            }
            else
            {
                byte[] data = this.Data;

                var sb = new StringBuilder();
                for (int i = 0; i < data.Length; i++)
                {
                    int num = i % 16;

                    if (num == 0 && i > 0)
                    {
                        sb.Append('\n');
                    }

                    if (num > 0)
                    {
                        sb.Append(' ');

                        if (num == 8)
                            sb.Append(' ');
                    }

                    sb.Append(data[i].ToString("X2"));
                }

                this.PART_TextBox.Text = sb.ToString();
            }
        }

        public override void OnApplyTemplate()
        {
            if (PART_TextBox != null)
            {
                PART_TextBox.KeyDown -= PART_TextBox_KeyDown;
                PART_TextBox.SelectionChanged -= PART_TextBox_SelectionChanged;
                PART_TextBox.MouseLeftButtonDown -= PART_TextBox_MouseLeftButtonDown;
                PART_TextBox.MouseLeftButtonUp -= PART_TextBox_MouseLeftButtonUp;
            }

            base.OnApplyTemplate();

            PART_TextBox = GetTemplateChild(TextBoxName) as TextBox;

            if (PART_TextBox != null)
            {
                PART_TextBox.IsReadOnly = true;
                PART_TextBox.Background = null;
                PART_TextBox.KeyDown += PART_TextBox_KeyDown;
                PART_TextBox.SelectionChanged += PART_TextBox_SelectionChanged;
                PART_TextBox.MouseLeftButtonDown += PART_TextBox_MouseLeftButtonDown;
                PART_TextBox.MouseLeftButtonUp += PART_TextBox_MouseLeftButtonUp;
            }

            OnDataChanged(null);
        }

        void PART_TextBox_MouseLeftButtonUp(object sender, MouseButtonEventArgs e)
        {
            isMouseDown = false;

            if (selectionNormalizationQueued)
            {
                QueueSelectionNormalization();
            }
        }

        void PART_TextBox_MouseLeftButtonDown(object sender, MouseButtonEventArgs e)
        {
            isMouseDown = true;
        }

        void PART_TextBox_SelectionChanged(object sender, RoutedEventArgs e)
        {
            if (PART_TextBox==null
                || PART_TextBox.SelectionLength>0)
                return;

            QueueSelectionNormalization();
        }

        private void QueueSelectionNormalization()
        {
            if (selectionNormalizationQueued)
                return;

            selectionNormalizationQueued = true;

            if (isMouseDown)
                return; // on up we'll queue again

            selectionNormalizationQueued = true;
            this.Dispatcher.BeginInvoke(delegate
            {
                if (!selectionNormalizationQueued)
                    return;

                if (isMouseDown)
                    return; // on up we'll queue again

                selectionNormalizationQueued = false;

                if (PART_TextBox == null
                    || PART_TextBox.SelectionLength > 0)
                    return;

                NormalizeSelection();
            });
        }

        private void NormalizeSelection()
        {
            const int lineLength =
                16 * (2 + 1) // 2 for byte hex value, 1 for space
                + 1; // 1 for extra space at 8-byte boundary

            int selectionStart = PART_TextBox.SelectionStart;

            int lineNum = selectionStart / lineLength;
            int charNum = selectionStart % lineLength;

            int hexStart;

            if (charNum < 8 * (2 + 1))
                hexStart = lineNum * lineLength + (charNum / 3) * 3;
            else
                hexStart = lineNum * lineLength + ((charNum - 1) / 3) * 3 + 1;

            System.Diagnostics.Debug.WriteLine("Select(" + selectionStart + ", 2)");
            PART_TextBox.Select(hexStart, 2);
        }

        void PART_TextBox_KeyDown(object sender, KeyEventArgs e)
        {
            if (PART_TextBox==null)
                return;
        }
    }
}