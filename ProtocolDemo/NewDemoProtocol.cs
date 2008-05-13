using System;
using System.Collections.Generic;
using System.Text;
using Mihailik.InternetExplorer;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;

namespace ProtocolDemo
{
    public class NewDemoProtocol : PluggableProtocolHandler2
    {
        protected override void OnStarted(EventArgs e)
        {
            base.OnStarted(e);

            using (Bitmap bmp = new Bitmap(150, 30))
            {
                using( Graphics draw = Graphics.FromImage(bmp) )
                {
                    draw.DrawString(
                        DateTime.Now.ToLongTimeString(),
                        SystemFonts.MessageBoxFont,
                        Brushes.Black,
                        new Rectangle(Point.Empty, bmp.Size));
                }

                MemoryStream buf = new MemoryStream();

                bmp.Save(buf, ImageFormat.Png);

                byte[] bufBytes = buf.ToArray();
                this.Response.OutputStream.Write(bufBytes, 0, bufBytes.Length);
            }

            this.Response.Close();
        }
    }
}
