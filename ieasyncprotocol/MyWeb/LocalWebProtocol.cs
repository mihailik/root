using System;

using System.Collections;
using System.Reflection;
using System.IO;
using System.Runtime.InteropServices;
using System.Web;
using System.Web.Hosting;

using Microsoft.Win32;

using Mihailik.InternetExplorer;

namespace Mihailik.InternetExplorer.Protocols
{
    [Guid("33c4e6d5-739e-40d3-8073-85d00ea1c45d")]
	public class LocalWebProtocol : PluggableProtocolHandler
	{
        public static readonly string Schema="myweb";

		public LocalWebProtocol()
		{
		}

        


        protected override void OnProtocolStart(EventArgs e)
        {
            new System.Threading.ThreadStart( Process ).BeginInvoke(null,null);
        }

        void Process()
        {
            string appRootPath = Path.GetPathRoot(Request.Url.LocalPath).ToLower();

            LocalWebHost host = WebApplicationPool.GetHost(Request.Url);

            ResponseInfo response = host.ProcessRequest(
                new RequestInfo(Request.Url + "", Request.Verb, Request.VerbData));

            Response.ContentType = response.MimeType;
            if (response.ResponseBytes != null
                && response.ResponseBytes.Length > 0)
            {
                Response.OutputStream.Write(
                    response.ResponseBytes,
                    0,
                    response.ResponseBytes.Length);
            }

            Response.EndResponse();
        }
    }
}