using System;
using System.Collections.Generic;
using System.Text;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Threading;
using System.Windows.Forms;
using System.Diagnostics;

namespace Mihailik.Net
{
	public static class DumpHttp
	{
		public static byte[] ResponseGet(string url)
		{
			Uri uri = new Uri(url);
			using( TcpClient cli = new TcpClient() )
			{
				cli.Connect(new IPEndPoint(ResolveHostName(uri.Host), uri.Port));

				using( Stream connStream = cli.GetStream() )
				{
					byte[] buf = Encoding.ASCII.GetBytes(
						"GET " + uri.PathAndQuery + " HTTP/1.1\r\n" +
						"Host: " + uri.Host + "\r\n" +
						"More: " + uri.Host + "\r\n" +
						"More:    1 2 3    \r\n" +
						"\r\n");

					connStream.Write(buf, 0, buf.Length);

					while( cli.Available < 20 )
					{
						Thread.Sleep(200);
					}

					Thread.Sleep(200);

					buf = new byte[cli.Available];
					connStream.Read(buf, 0, buf.Length);

					return buf;
				}
			}
		}

		public static void SetHelloWorldListener(string uriPrefix)
		{
			System.Net.HttpListener ls = new System.Net.HttpListener();
			ls.Prefixes.Add(uriPrefix);
			ls.Start();
			ls.BeginGetContext(
				delegate(IAsyncResult ar)
				{
					try
					{
						DoSomething();
						Console.WriteLine("Response");
						System.Net.HttpListenerContext ctx = ls.EndGetContext(ar);
						DoSomething(ctx);
						ctx.Response.ContentType = "text/html";
						ctx.Response.StatusCode = 200;
						ctx.Response.StatusDescription = "OK";
						ctx.Response.SendChunked = false;
						ctx.Response.Headers["EncodingValue"] = "катастрофа";
						//ctx.Response.Headers["EncodingName-аббревиатура"] = "ABCD";
						//ctx.Response.Headers["EncodingNameValue-поломка"] = "починка";
						byte[] responseBytes = Encoding.ASCII.GetBytes(
							"<html><head><title>Hello, World</title></head>\r\n" +
							"<body><h2>Hello, World</h2></body></html>");
						ctx.Response.ContentLength64 = responseBytes.Length;
						ctx.Response.OutputStream.Write(responseBytes, 0, responseBytes.Length);
						ctx.Response.Close();
						Thread.Sleep(1000);
						ls.Stop();
					}
					catch( Exception error )
					{
						Console.WriteLine(error);
					}
				}, null);
		}

		static void DoSomething()
		{
			"123".GetHashCode();
		}

		static void DoSomething(HttpListenerContext ctx)
		{
			ctx.Request.Headers.GetHashCode();
			ctx.GetHashCode();
		}

		public static byte[] RequestBclGetWeirdHeaders(string path)
		{
			byte[] buf1 = null;

			SetHelloWorldListener("http://localhost:777/");

			//SetTemporaryServer(delegate(byte[] buf)
			//{
			//    buf1 = (byte[])buf.Clone();
			//});

			HttpWebRequest req = (HttpWebRequest)WebRequest.Create(
				"http://localhost:777/" +
				(path.StartsWith("/") ? path.Substring(1) : path));
			req.ProtocolVersion = HttpVersion.Version10;
			req.Headers["EncodingValue"] = "раз два три четыре";
			//req.Headers["EncodingName-два"] = "value1";
			//req.Headers["EncodingNameValue-три"] = "четыре";

			try
			{
				req.GetResponse().Close();
			}
			catch { }

			return buf1;
		}

		public static byte[] RequestBclGet(string path)
		{
			byte[] buf1 = null;

			SetTemporaryServer(delegate(byte[] buf)
			{
				buf1 = (byte[])buf.Clone();
			});

			HttpWebRequest req = (HttpWebRequest)WebRequest.Create(
				"http://localhost:777/" +
				(path.StartsWith("/") ? path.Substring(1) : path));

			try
			{
				req.GetResponse().Close();
			}
			catch { }

			return buf1;
		}

		public static byte[] RequestBclGetChunked(string path)
		{
			byte[] buf1 = null;

			SetTemporaryServer(delegate(byte[] buf)
			{
				buf1 = (byte[])buf.Clone();
			});

			HttpWebRequest req = (HttpWebRequest)WebRequest.Create(
				"http://localhost:777/" +
				(path.StartsWith("/") ? path.Substring(1) : path));

			req.Method = "POST";
			req.SendChunked = true;

			using( Stream reqStream = req.GetRequestStream() )
			{
				byte[] buf2 = Encoding.ASCII.GetBytes("one");
				reqStream.Write(buf2,0,buf2.Length);
				buf2 = Encoding.ASCII.GetBytes("two");
				reqStream.Write(buf2,0,buf2.Length);
				buf2 = Encoding.ASCII.GetBytes("three");
				reqStream.Write(buf2,0,buf2.Length);
			}

			try
			{
				req.GetResponse().Close();
			}
			catch { }

			return buf1;
		}

		private static void SetTemporaryServer(Action<byte[]> requestReceived)
		{
			TcpListener ls = new TcpListener(777);
			ls.Start();
			ls.BeginAcceptTcpClient(
				delegate(IAsyncResult ar)
				{
					using( TcpClient cli = ls.EndAcceptTcpClient(ar) )
					{
						using( Stream connStream = cli.GetStream() )
						{
							while( cli.Available<20 )
							{
								Thread.Sleep(200);
							}
							Thread.Sleep(1000);

							byte[] buf = new byte[cli.Available];
							connStream.Read(buf, 0, buf.Length);

							requestReceived(buf);
						}
					}
					ls.Stop();
				}, null);
		}

		public static byte[] RequestIEGet(string path)
		{
			byte[] buf1 = null;

			SetTemporaryServer(delegate(byte[] buf)
			{
				buf1 = (byte[])buf.Clone();
			});

			Form frm = new Form();
			WebBrowser br = new WebBrowser();
			br.Url = new Uri("http://localhost:777/"+(path.StartsWith("/") ? path.Substring(1) : path));
			frm.Controls.Add(br);
			frm.Show();

			while (br.ReadyState!=WebBrowserReadyState.Complete)
			{
				Application.DoEvents();
				Application.DoEvents();
				Application.DoEvents();
			}

			frm.Close();

			return buf1;
		}

		static readonly Random rnd = new Random();

		static IPAddress ResolveHostName(string host)
		{
			IPAddress[] list = Dns.GetHostEntry(host).AddressList;
			lock( rnd )
			{
				return list[rnd.Next(list.Length)];
			}
		}
	}
}
