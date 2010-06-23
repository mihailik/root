using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Windows.Input;
using System.Windows;
using System.Windows.Controls;

namespace FluentXamlLibrary
{
    public sealed class MouseCommandsExtension
    {
        public static ICommand GetDoubleClick(DependencyObject obj) { return (ICommand)obj.GetValue(DoubleClickProperty); }
        public static void SetDoubleClick(DependencyObject obj, ICommand value) { obj.SetValue(DoubleClickProperty, value); }

        public static readonly DependencyProperty DoubleClickProperty = DependencyProperty.RegisterAttached(
            "DoubleClick",
            typeof(ICommand),
            typeof(MouseCommandsExtension),
            new UIPropertyMetadata(null, DoubleClickChanged));

        static void DoubleClickChanged(DependencyObject sender, DependencyPropertyChangedEventArgs e)
        {
            var oldCommand = (ICommand)e.OldValue;
            var newCommand = (ICommand)e.NewValue;

            if (oldCommand != null && newCommand==null)
            {
                Mouse.RemoveMouseDownHandler(sender, senderDoubleClick_MouseLeftButtonDown);
            }
            
            if(oldCommand == null && newCommand!=null)
            {
                Mouse.AddMouseDownHandler(sender, senderDoubleClick_MouseLeftButtonDown);
            }
        }

        static void senderDoubleClick_MouseLeftButtonDown(object sender, MouseButtonEventArgs e)
        {
            if (e.ClickCount != 2)
                return;

            var senderElement = sender as DependencyObject;
            if (senderElement == null)
                return;

            var senderInputElement = sender as IInputElement;
            if (senderInputElement == null)
                return;

            var doubleClickCommand = GetDoubleClick(senderElement);
            if (doubleClickCommand == null)
                return;

            if (doubleClickCommand.CanExecute(sender))
            {
                doubleClickCommand.Execute(sender);
                e.Handled = true;
            }
        }

        public static ICommand GetLeftClick(DependencyObject obj) { return (ICommand)obj.GetValue(LeftClickProperty); }
        public static void SetLeftClick(DependencyObject obj, ICommand value) { obj.SetValue(LeftClickProperty, value); }

        public static readonly DependencyProperty LeftClickProperty = DependencyProperty.RegisterAttached(
            "LeftClick",
            typeof(ICommand),
            typeof(MouseCommandsExtension),
            new FrameworkPropertyMetadata(null, LeftClickChanged));

        static void LeftClickChanged(DependencyObject sender, DependencyPropertyChangedEventArgs e)
        {
            var oldCommand = (ICommand)e.OldValue;
            var newCommand = (ICommand)e.NewValue;

            if (oldCommand != null && newCommand==null)
            {
                Mouse.RemoveMouseDownHandler(sender, senderLeftClick_MouseLeftButtonDown);
                Mouse.RemoveMouseUpHandler(sender, senderLeftClick_MouseLeftButtonUp);
            }
            
            if(oldCommand == null && newCommand!=null)
            {
                Mouse.AddMouseDownHandler(sender, senderLeftClick_MouseLeftButtonDown);
                Mouse.AddMouseUpHandler(sender, senderLeftClick_MouseLeftButtonUp);
            }
        }

        static void senderLeftClick_MouseLeftButtonDown(object sender, MouseButtonEventArgs e)
        {
            var senderElement = sender as DependencyObject;
            if (senderElement == null)
                return;

            var senderInputElement = sender as IInputElement;
            if (senderInputElement == null)
                return;

            var position = e.GetPosition(senderInputElement);

            senderInputElement.CaptureMouse();
        }

        static void senderLeftClick_MouseLeftButtonUp(object sender, MouseButtonEventArgs e)
        {
            var senderElement = sender as DependencyObject;
            if (senderElement == null)
                return;

            var senderInputElement = sender as IInputElement;
            if (senderInputElement == null)
                return;

            var clickCommand = GetLeftClick(senderElement);
            if (clickCommand == null)
                return;

            senderInputElement.ReleaseMouseCapture();

            if (!senderInputElement.IsMouseOver)
                return;

            if (clickCommand.CanExecute(senderElement))
            {
                clickCommand.Execute(senderElement);
                e.Handled = true;
            }
      }
    }
}