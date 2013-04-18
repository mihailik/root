using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;
using FluentXamlLibrary;
using System.Windows.Threading;
using System.Threading;
using System.Diagnostics;

namespace FluentXamlDemo
{
    public partial class MainWindow : Window
    {
        readonly ProcessViewList processList = new ProcessViewList();
        readonly DispatcherTimer updateProcessListTimer = new DispatcherTimer(DispatcherPriority.ApplicationIdle)
        {
            IsEnabled = true,
            Interval = TimeSpan.FromSeconds(0.6)
        };

        public MainWindow()
        {
            InitializeComponent();

            bool isClosed = false;

            this.Closed+=delegate
            {
                isClosed = true;
            };

            updateProcessListTimer.Tick += delegate
            {
                updateProcessListTimer.IsEnabled = false;

                ThreadPool.QueueUserWorkItem(delegate
                {
                    var processes = Process.GetProcesses();
                    Action update = processList.PrepareApply(processes);

                    this.Dispatcher.BeginInvoke(new Action(delegate
                    {
                        if (isClosed)
                            return;

                        update();
                        updateProcessListTimer.IsEnabled = true;
                    }));
                });
            };

            this.DataContext = processList;
        }
    }
}
