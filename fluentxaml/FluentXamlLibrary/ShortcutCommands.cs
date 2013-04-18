using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Windows;
using System.Windows.Input;

namespace FluentXamlLibrary
{
    public static class ShortcutCommands
    {
        public static ICommand GetCtrlA(DependencyObject obj) { return (ICommand)obj.GetValue(CtrlAProperty); }
        public static void SetCtrlA(DependencyObject obj, ICommand value) { obj.SetValue(CtrlAProperty, value); }

        public static readonly DependencyProperty CtrlAProperty = DependencyProperty.RegisterAttached(
            "CtrlA",
            typeof(ICommand),
            typeof(ShortcutCommands),
            new FrameworkPropertyMetadata(null, OnCtrlAChanged));

        static void OnCtrlAChanged(DependencyObject sender, DependencyPropertyChangedEventArgs e)
        {
            Keyboard.AddKeyDownHandler(
                sender,
                KeyDownHandler);
        }

        static void KeyDownHandler(object sender, KeyEventArgs e)
        {
            var senderElement = sender as DependencyObject;
            if( senderElement==null )
                return;

            if (e.Key == Key.A && ((KeyboardDevice)e.Device).Modifiers == ModifierKeys.Control)
            {
                var command = GetCtrlA(senderElement);

                if (command == null)
                    return;

                if (command.CanExecute(sender))
                {
                    command.Execute(sender);
                    e.Handled = true;
                }
            }
        }
    }
}
