using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Windows.Input;

namespace FluentXamlLibrary
{
    internal sealed class DelegateCommand : ICommand
    {
        readonly Action<object> execute;

        public DelegateCommand(Action<object> execute)
        {
            this.execute = execute;
        }

        public void Execute(object parameter)
        {
            this.execute(parameter);
        }

        public bool CanExecute(object parameter)
        {
            return true;
        }

        public string Text { get; set; }

        public event EventHandler CanExecuteChanged;
    }
}
