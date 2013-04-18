using System;
using System.Collections.Generic;
using System.Text;
using System.Net.Sockets;
using System.IO;
using System.Threading;
using System.Diagnostics;
using System.Reflection;
using System.Globalization;

using Mihailik.Net.Internal.StateMachine;

namespace Mihailik.Net
{
	public class Program
	{
		[STAThread]
		public static void Main(string[] args)
		{
            RunMihailikHttpListener("http://localhost:56789/");
            RunSystemHttpListener("http://localhost:56798/");

            string response = new System.Net.WebClient().DownloadString("http://localhost:56789/Internal.Data/HTMLPage1.htm");


            //byte[] mihailikResponse = 

            Console.WriteLine("Started, press any key to exit.");

            while (Console.KeyAvailable)
            {
                Console.ReadKey(false);
            }

            Console.ReadKey();
        }

        static void RunMihailikHttpListener(string url)
        {
            Console.Write("New HttpListener(" + url + ")");
            var listener = new HttpListener();
            listener.Prefixes.Add(url);
            Console.WriteLine(" OK. " + listener);


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
        }
        
        static void RunSystemHttpListener(string url)
        {
            Console.Write("New HttpListener(" + url + ")");
            var listener = new System.Net.HttpListener();
            listener.Prefixes.Add(url);
            Console.WriteLine(" OK. " + listener);


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
                        Console.ForegroundColor = ConsoleColor.Cyan;
                        Console.Write(rawUrl);
                        Console.ForegroundColor = ConsoleColor.DarkCyan;
                        Console.Write(": streaming ");
                        Console.ForegroundColor = ConsoleColor.Cyan;
                        Console.Write(new FileInfo(rawUrl).Length);
                        Console.ForegroundColor = ConsoleColor.DarkCyan;
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
                        Console.ForegroundColor = ConsoleColor.Magenta;
                        Console.Write(rawUrl);
                        Console.ForegroundColor = ConsoleColor.DarkMagenta;
                        Console.Write(": absent, streaming ");
                        Console.ForegroundColor = ConsoleColor.Magenta;
                        Console.Write("404");
                        Console.ForegroundColor = ConsoleColor.DarkMagenta;
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
        }
    }
}
