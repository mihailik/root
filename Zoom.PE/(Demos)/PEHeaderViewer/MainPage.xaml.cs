using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Animation;
using System.Windows.Shapes;
using System.Windows.Threading;
using Mi.PE;
using Mi.PE.Internal;
using PEHeaderViewer.ViewModel;

namespace PEHeaderViewer
{
    public partial class MainPage : UserControl
    {
        public MainPage()
        {
            InitializeComponent();

            var streamInfo = Application.GetResourceStream(new Uri("PEHeaderViewer.dll", UriKind.Relative));

            var reader = new BinaryStreamReader(streamInfo.Stream, new byte[32]);

            var pe = new PEFile();
            pe.ReadFrom(reader);

            {
                var tabControl = LayoutRoot.Children.OfType<TabControl>().FirstOrDefault();
                if (tabControl == null)
                {
                    tabControl = new TabControl();
                    LayoutRoot.Children.Add(tabControl);
                }

                var tabItem = new TabItem
                {
                    Header = "Self",
                    Content = new ScrollViewer
                    {
                        VerticalScrollBarVisibility = ScrollBarVisibility.Auto,
                        HorizontalScrollBarVisibility = ScrollBarVisibility.Auto,
                        //Background = Brushes.White,
                        Padding = new Thickness(5),
                        Content = new PEFileView { DataContext = new PEFileViewModel(pe) }
                    }
                };

                tabControl.Items.Add(tabItem);

                tabControl.SelectedIndex = tabControl.Items.Count - 1;
            }

            this.Drop += new DragEventHandler(MainPage_Drop);

            if (Application.Current.IsRunningOutOfBrowser)
            {
                var timer = new DispatcherTimer
                {
                    Interval = TimeSpan.FromSeconds(1)
                };
                timer.Tick += delegate
                {
                    timer.Stop();

                    Application.Current.CheckAndDownloadUpdateAsync();
                };
            }
        }

        void MainPage_Drop(object sender, DragEventArgs e)
        {
            if (e.Data != null)
            {
                var files = e.Data.GetData(DataFormats.FileDrop) as FileInfo[];

                if (files != null)
                {
                    foreach (var fi in files)
                    {
                        AddFile(fi);
                    }
                }
            }
        }

        private void AddFile(FileInfo fi)
        {
            var tabControl = LayoutRoot.Children.OfType<TabControl>().FirstOrDefault();
            if (tabControl == null)
            {
                tabControl = new TabControl();
                LayoutRoot.Children.Add(tabControl);
            }

            PEFile pe;
            using (var stream = fi.OpenRead())
            {
                var reader = new BinaryStreamReader(stream, new byte[32]);
                pe = new PEFile();
                pe.ReadFrom(reader);
            }

            var tabItem = new TabItem
            {
                Header = fi.Name,
                Content = new ScrollViewer
                {
                    VerticalScrollBarVisibility = ScrollBarVisibility.Auto,
                    HorizontalScrollBarVisibility = ScrollBarVisibility.Auto,
                    //Background = Brushes.White,
                    Padding = new Thickness(5),
                    Content = new PEFileView { DataContext = new PEFileViewModel(pe) }
                }
            };

            tabControl.Items.Add(tabItem);

            tabControl.SelectedIndex = tabControl.Items.Count - 1;
        }

        private void openFileButton_Click(object sender, RoutedEventArgs e)
        {
            var dialog = new OpenFileDialog
            {
                Filter = "DLL and EXE files|*.dll;*.exe|All files|*.*",
                Multiselect = true
            };

            if(dialog.ShowDialog()!=true)
                return;

            foreach (var fi in dialog.Files)
            {
                AddFile(fi);
            }
        }
    }
}
