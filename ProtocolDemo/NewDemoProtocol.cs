using System;
using System.Collections.Generic;
using System.Text;
using Mihailik.InternetExplorer;
using System.Drawing;

namespace ProtocolDemo
{
    public class NewDemoProtocol : PluggableProtocolHandler2
    {
        protected override void OnStarted(EventArgs e)
        {
            base.OnStarted(e);

            using (Bitmap bmp = new Bitmap(150, 30))
            {

            }

            //this.Response.OutputStream.Write(
        }
    }
}
