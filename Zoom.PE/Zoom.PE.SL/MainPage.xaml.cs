using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Reflection;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Animation;
using System.Windows.Shapes;
using Mi.PE;
using Mi.PE.Internal;

namespace Zoom.PE
{
    public partial class MainPage : UserControl
    {
        public MainPage()
        {
            InitializeComponent();

            Application.Current.Host.Settings.EnableAutoZoom = false;

            string fileName = new AssemblyName(this.GetType().Assembly.FullName).Name+".dll";
            var streamInfo = Application.GetResourceStream(new Uri(fileName, UriKind.Relative));

            var reader = new BinaryStreamReader(streamInfo.Stream, new byte[32]);

            var pe = new PEFile();
            pe.ReadFrom(reader);

            myContentControl.Content = new Model.PEFileModel(fileName, pe);
            myContentControl.Visibility = System.Windows.Visibility.Visible;

            this.MouseWheel += new MouseWheelEventHandler(MainPage_MouseWheel);

            this.AllowDrop = true;

            this.Drop += new DragEventHandler(MainPage_Drop);
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
                        PEFile pe = new PEFile();
                        using(var stream = fi.OpenRead())
                        {
                            var reader = new BinaryStreamReader(stream, new byte[1024]);
                            pe.ReadFrom(reader);
                        }

                        myContentControl.Content = new Model.PEFileModel(fi.Name, pe);
                    }
                }
            }
        }

        void MainPage_MouseWheel(object sender, MouseWheelEventArgs e)
        {
            e.Handled = true;
        }
    }
}