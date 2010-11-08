using System;
using System.Collections.Generic;
using System.Text;
using System.Net.Sockets;
using System.IO;
using System.Threading;
using System.Diagnostics;
using System.Reflection;
using System.Globalization;
using Mihailik.Net;
using System.Net;

using Mihailik.Net.Internal.StateMachine;

namespace Mihailik.Net
{
	public class Program
	{
		[STAThread]
		public static void Main(string[] args)
		{
            string[] urls = args;
            if(urls.Length==0)
                urls = new [] { "http://*:99/" };

            Console.Write("New HttpListener()");
			var listener = new HttpListener();
            Console.WriteLine(" OK. " + listener);

            foreach (var url in urls)
            {
                Console.Write("   ");
                listener.Prefixes.Add(url);
                Console.WriteLine(url);
            }
			
            listener.Start();

            AsyncCallback onGotContext = null;
            onGotContext = ar =>
             {
                 var context = listener.EndGetContext(ar);

                 string rawUrl = context.Request.RawUrl;
                 if (rawUrl.StartsWith("/"))
                     rawUrl = rawUrl.Substring(1);

                 if (File.Exists(rawUrl))
                 {
                     lock (onGotContext)
                     {
                         var saveColor = Console.ForegroundColor;
                         Console.ForegroundColor = ConsoleColor.DarkYellow;
                         Console.Write(rawUrl);
                         Console.ForegroundColor = ConsoleColor.DarkGray;
                         Console.Write(": streaming ");
                         Console.ForegroundColor = ConsoleColor.DarkYellow;
                         Console.Write(new FileInfo(rawUrl).Length);
                         Console.ForegroundColor = ConsoleColor.DarkGray;
                         Console.WriteLine(" bytes.");
                         Console.ForegroundColor = saveColor;
                     }
                     
                     byte[] fileBytes = File.ReadAllBytes(rawUrl);
                     context.Response.OutputStream.Write(fileBytes, 0, fileBytes.Length);
                 }
                 else
                 {
                     lock (onGotContext)
                     {
                         var saveColor = Console.ForegroundColor;
                         Console.ForegroundColor = ConsoleColor.Red;
                         Console.Write(rawUrl);
                         Console.ForegroundColor = ConsoleColor.DarkRed;
                         Console.Write(": absent, streaming ");
                         Console.ForegroundColor = ConsoleColor.Red;
                         Console.Write("404");
                         Console.ForegroundColor = ConsoleColor.DarkRed;
                         Console.WriteLine(" Not Found.");
                         Console.ForegroundColor = saveColor;
                     }

                     context.Response.StatusCode = 404;
                     context.Response.StatusDescription = "Not Found.";
                 }

                 context.Response.Close();

                 listener.BeginGetContext(onGotContext, null);
            };


            listener.BeginGetContext(onGotContext, null);
            Console.WriteLine("Started, press any key to exit.");
            
            while (Console.KeyAvailable)
            {
                Console.ReadKey(false);
            }

            Console.ReadKey();
		}
	}
}
