using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Mi.PE;
using Mi.PE.Internal;
using Windows.Foundation;
using Windows.Storage.Pickers;
using Windows.System.Threading;
using Windows.UI.Xaml;
using Windows.UI.Xaml.Controls;
using Windows.UI.Xaml.Data;

namespace MetroFileDetails
{
    partial class MainPage
    {
        public MainPage()
        {
            InitializeComponent();
        }

        private async void parseButton_Click(object sender, RoutedEventArgs e)
        {
            var pe = new PEFile();

            var metroExe =
                (from f in await Windows.ApplicationModel.Package.Current.InstalledLocation.GetFilesAsync()
                 where string.Equals(f.FileName, this.GetType().Namespace + ".exe", StringComparison.OrdinalIgnoreCase)
                 select f).First();

            var fiStream = await metroExe.OpenForReadAsync();
            using (var inputStream = fiStream.AsStream())
            {
                var buf = await ReadAll(inputStream);

                var bufStream = new MemoryStream(buf);

                pe.ReadFrom(new BinaryStreamReader(bufStream, new byte[32]));
            }
            LayoutRoot.Children.Add(new PEFileView { DataContext = pe });
        }

        private async void openFileButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                var pi = new FileOpenPicker();
                pi.SuggestedStartLocation = PickerLocationId.Downloads;
                pi.FileTypeFilter.Add(".dll");
                //{
                //    //SettingsIdentifier = "PE Viewer",
                //    SuggestedStartLocation = PickerLocationId.Downloads,
                //    ViewMode = PickerViewMode.List
                //};
                ////pi.FileTypeFilter.Add("DLL and EXE files|*.dll;*.exe");
                ////pi.FileTypeFilter.Add("All files|*.*");

                var fi = await pi.PickSingleFileAsync();

                var fiStream = await fi.OpenAsync(Windows.Storage.FileAccessMode.Read);
                var stream = fiStream.OpenRead();

                var buf = await ReadAll(stream);

                var bufStream = new MemoryStream(buf);

                var pe = new PEFile();
                pe.ReadFrom(new BinaryStreamReader(bufStream, new byte[32]));

                LayoutRoot.Children.Add(new PEFileView { DataContext = pe });
            }
            catch (Exception error)
            {
                openFileButton.Content = error;
            }
        }

        private async Task<byte[]> ReadAll(Stream stream)
        {
            var buf = new byte[1024];
            var result = new MemoryStream();
            while (true)
            {
                int readCount = await stream.ReadAsync(buf, 0, buf.Length);

                if (readCount <= 0)
                    break;

                result.Write(buf, 0, readCount);
            }

            return result.ToArray();
        }
    }
}
