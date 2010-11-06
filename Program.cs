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
            //while (true)
            //{
            //    Console.Write("Enter URI Prefix, please: ");
            //    try
            //    {
            //        UriPrefix prefix = UriPrefix.Parse(Console.ReadLine());
            //        Console.WriteLine(prefix);
            //    }
            //    catch (Exception error)
            //    {
            //        Console.WriteLine("\t " + error.GetType().Name + ": " + error.Message);
            //    }
            //}

			var listener = new HttpListener();
			listener.Prefixes.Add("http://*:99/");
            listener.Start();

            while (Console.KeyAvailable)
            {
                Console.ReadKey(false);
            }

            Console.WriteLine("Press a key to exit...");

            while (!Console.KeyAvailable)
            {
                Console.Write("GetContext...");
                var nextContext = listener.GetContext();

                Console.WriteLine(" " + nextContext.Request.Url);

                var output = new StreamWriter(nextContext.Response.OutputStream, nextContext.Response.ContentEncoding);
                output.WriteLine("<html><head><title>OK</title></head><body>OK</body></html>");
                nextContext.Response.Close();

                Console.WriteLine("Completed.");
            }
		}

		////static void TestMultiple(byte[] request, TestRequestValid tester)
		////{
		////    int[] seq = new int[request.Length+5];
		////    for( int i = 0; i < seq.Length; i++ )
		////    {
		////        seq[i] = i + 1;
		////    }
		////    IEnumerable<int> randomSeq = Random(seq);
		////    for( int i = 0; i < 100000; i++ )
		////    {
		////        TestChunked2(request, randomSeq, randomSeq, tester);
		////    }
		////}

		//static IEnumerable<T> Repeat<T>(T item)
		//{
		//    while( true )
		//    {
		//        yield return item;
		//    }
		//}

		//static IEnumerable<T> Repeat<T>(params T[] items)
		//{
		//    return Repeat((IEnumerable<T>)items);
		//}

		//static IEnumerable<T> Repeat<T>(IEnumerable<T> items)
		//{
		//    while( true )
		//    {
		//        foreach( T item in items )
		//        {
		//            yield return item;
		//        }
		//    }
		//}

		//static IEnumerable<T> Random<T>(params T[] items)
		//{
		//    return Random((IEnumerable<T>)items);
		//}

		//static Random rnd = new Random();

		//static IEnumerable<T> Random<T>(IEnumerable<T> items)
		//{
		//    while( true )
		//    {
		//        List<T> buf = new List<T>(items);
		//        yield return buf[rnd.Next(buf.Count)];
		//    }
		//}

		////delegate void TestRequestValid(HttpRequestReader reader, byte[] content);

		////static void TestChunked2(
		////    byte[] request,
		////    IEnumerable<int> headerParts,
		////    IEnumerable<int> contentParts,
		////    TestRequestValid tester)
		////{
		////    List<int> historyParts = new List<int>();

		////    bool useHistory = false;
		////    if( request.GetHashCode() == 12345 )
		////        useHistory = true;

		////    HttpRequestReader reader = new HttpRequestReader();
		////    int parsedCount = 0;

		////    int headerHistoryIndex = 0;

		////    List<byte> contentBytes = new List<byte>();
		////    foreach( int part in headerParts )
		////    {
		////        int usePart = part;
		////        if( useHistory )
		////        {
		////            usePart = historyParts[headerHistoryIndex];
		////            headerHistoryIndex++;
		////        }
		////        else
		////        {
		////            historyParts.Add(part);
		////        }

		////        int partCapped = Math.Min(usePart, request.Length - parsedCount);

		////        IEnumerable<ArraySegment<byte>> dataEnum = reader.Read(request, parsedCount, partCapped);
		////        parsedCount = reader.ReadByteCount;

		////        if( dataEnum != null )
		////        {
		////            foreach( ArraySegment<byte> chunk in dataEnum )
		////            {
		////                for( int iByte = 0; iByte < chunk.Count; iByte++ )
		////                {
		////                    contentBytes.Add(chunk.Array[iByte + chunk.Offset]);
		////                }
		////            }
		////        }

		////        if( !reader.IsMoreExpected )
		////            break;
		////    }

		////    tester(reader, contentBytes.ToArray());
		////}

		////static void TestChunked(byte[] request, IEnumerable<int> headerParts, IEnumerable<int> contentParts)
		////{
		////    List<int> headerPartsHistory = new List<int>();
		////    List<int> contentPartsHistory = new List<int>();

		////    bool useHistory = false;
		////    if( request.GetHashCode()==12345 )
		////        useHistory = true;

		////    HttpRequestHeaderReader headerReader = new HttpRequestHeaderReader();
		////    HttpRequestHeader header = null;
		////    int parsedCount = 0;

		////    int headerHistoryIndex = 0;

		////    foreach (int part in headerParts)
		////    {
		////        int usePart = part;
		////        if( useHistory )
		////        {
		////            usePart = headerPartsHistory[headerHistoryIndex];
		////            headerHistoryIndex++;
		////        }
		////        else
		////        {
		////            headerPartsHistory.Add(part);
		////        }

		////        int partCapped = Math.Min(usePart, request.Length - parsedCount);

		////        header = headerReader.Read(request, parsedCount, partCapped);
		////        if( header == null )
		////        {
		////            parsedCount += partCapped;
		////        }
		////        else
		////        {
		////            parsedCount = header.HeaderLength;
		////            break;
		////        }
		////    }


		////    int contentHistoryIndex = 0;

		////    StringBuilder content = new StringBuilder();
		////    HttpRequestContentReader contentReader;
		////    if( header.Headers.ContainsKey("Transfer-Encoding") && header.Headers["Transfer-Encoding"]== "chunked" )
		////        contentReader = HttpRequestContentReader.CreateChunked();
		////    else if( header.Headers.ContainsKey("Content-Length") )
		////        contentReader = HttpRequestContentReader.CreateContentLength(int.Parse(header.Headers["Content-Length"]));
		////    else
		////        contentReader = HttpRequestContentReader.CreateConnectionClose();

		////    foreach( int part in contentParts )
		////    {
		////        int usePart = part;
		////        if( useHistory )
		////        {
		////            usePart = contentPartsHistory[contentHistoryIndex];
		////            contentHistoryIndex++;
		////        }
		////        else
		////        {
		////            contentPartsHistory.Add(part);
		////        }

		////        int partCapped = Math.Min(usePart, request.Length - parsedCount);

		////        if( parsedCount > request.Length - 4 )
		////            parsedCount.GetHashCode();

		////        HttpRequestContentChunk chunk = contentReader.Read(request, parsedCount, partCapped);
		////        parsedCount += chunk.RawChunkLength;
		////        if( chunk.DataLength > 0 )
		////        {
		////            content.Append(Encoding.ASCII.GetString(request, chunk.DataOffset, chunk.DataLength));
		////        }
		////        if( !chunk.MoreExpected )
		////            break;
		////    }

		////    if( content.ToString() != "onetwothree" )
		////        throw new InvalidOperationException();
		////}

		//static void SrvTest3()
		//{
		//    WeakReference wref = Test3_InternalWrapped();

		//    GC.Collect();
		//    GC.WaitForPendingFinalizers();
		//    GC.Collect();
		//    GC.WaitForPendingFinalizers();
		//    GC.Collect();
		//    GC.WaitForPendingFinalizers();
		//    GC.Collect();
		//    GC.WaitForPendingFinalizers();
		//    GC.Collect();
		//    GC.WaitForPendingFinalizers();

		//    object ls = wref.Target;
		//    Console.WriteLine(ls == null ? "released" : ls.ToString());
		//    ls = null;

		//    GC.Collect();
		//    GC.WaitForPendingFinalizers();
		//    GC.Collect();
		//    GC.WaitForPendingFinalizers();
		//    GC.Collect();
		//    GC.WaitForPendingFinalizers();
		//    GC.Collect();
		//    GC.WaitForPendingFinalizers();
		//    GC.Collect();
		//    GC.WaitForPendingFinalizers();

		//    ls = wref.Target;
		//    Console.WriteLine(ls == null ? "released" : ls.ToString());
		//    ls = null;

		//    GC.Collect();
		//    GC.WaitForPendingFinalizers();
		//    GC.Collect();
		//    GC.WaitForPendingFinalizers();
		//    GC.Collect();
		//    GC.WaitForPendingFinalizers();
		//    GC.Collect();
		//    GC.WaitForPendingFinalizers();
		//    GC.Collect();
		//    GC.WaitForPendingFinalizers();

		//    ls = wref.Target;
		//    Console.WriteLine(ls == null ? "released" : ls.ToString());

		//    GC.Collect();
		//    GC.WaitForPendingFinalizers();
		//    GC.Collect();
		//    GC.WaitForPendingFinalizers();
		//    GC.Collect();
		//    GC.WaitForPendingFinalizers();
		//    GC.Collect();
		//    GC.WaitForPendingFinalizers();
		//    GC.Collect();
		//    GC.WaitForPendingFinalizers();

		//    ls = wref.Target;
		//    Console.WriteLine(ls == null ? "released" : ls.ToString());
		//    ls = null;

		//    Console.Write("Press a key...");
		//    Console.ReadKey();
		//}

		//static WeakReference Test3_InternalWrapped()
		//{
		//    return new WeakReference(Test3_Internal());
		//}

		//static TcpListener Test3_Internal()
		//{
		//    const int bufferSize = 1024 * 16;
		//    LinkedList<byte[]> buffers = new LinkedList<byte[]>();
		//    for( int i = 0; i < Environment.ProcessorCount * 4; i++ )
		//    {
		//        buffers.AddFirst(new byte[bufferSize]);
		//    }

		//    TcpListener listener = new TcpListener(888);
		//    listener.Start();
		//    try
		//    {
		//        AsyncCallback clientAccepted = null;
		//        clientAccepted = delegate(IAsyncResult ar)
		//            {
		//                listener.BeginAcceptTcpClient(clientAccepted, null);

		//                try
		//                {
		//                    TcpClient client = listener.EndAcceptTcpClient(ar);
		//                    try
		//                    {
		//                        Stream connectionStream = client.GetStream();
		//                        try
		//                        {
		//                            byte[] buf;
		//                            lock( buffers )
		//                            {
		//                                if( buffers.Count == 0 )
		//                                {
		//                                    buf = new byte[bufferSize];
		//                                }
		//                                else
		//                                {
		//                                    buf = buffers.First.Value;
		//                                    buffers.RemoveFirst();
		//                                }
		//                            }

		//                            HttpRequestReader reader = null;
		//                            AsyncCallback readMore = null;
		//                            readMore = delegate(IAsyncResult ar1)
		//                            {
		//                                try
		//                                {
		//                                    try
		//                                    {
		//                                        int readCount = connectionStream.EndRead(ar1);
		//                                        if( reader == null )
		//                                        {
		//                                            reader = new HttpRequestReader();
		//                                        }

		//                                        reader.Read(buf, 0, readCount);
		//                                        if( reader.IsMoreExpected )
		//                                        {
		//                                            connectionStream.BeginRead(
		//                                                buf, 0, buf.Length,
		//                                                readMore, null);
		//                                            return;
		//                                        }
		//                                        else if( reader.IsFailed )
		//                                        {
		//                                            connectionStream.Close();
		//                                            client.Close();
		//                                            return;
		//                                        }
		//                                        else
		//                                        {
		//                                            ProcessRequest2(connectionStream, client, reader);
		//                                            connectionStream.Close();
		//                                            client.Close();
		//                                            lock( buffers )
		//                                            {
		//                                                buffers.AddLast(buf);
		//                                            }
		//                                            return;
		//                                        }
		//                                    }
		//                                    catch
		//                                    {
		//                                        connectionStream.Close();
		//                                        throw;
		//                                    }
		//                                }
		//                                catch
		//                                {
		//                                    client.Close();
		//                                    lock( buffers )
		//                                    {
		//                                        buffers.AddLast(buf);
		//                                    }
		//                                    throw;
		//                                }
		//                            };

		//                            connectionStream.BeginRead(
		//                                buf, 0, buf.Length,
		//                                readMore, null);
		//                        }
		//                        catch
		//                        {
		//                            connectionStream.Close();
		//                            throw;
		//                        }
		//                    }
		//                    catch
		//                    {
		//                        client.Close();
		//                        throw;
		//                    }
		//                }
		//                catch( Exception error )
		//                {
		//                    Console.WriteLine(error);
		//                }
		//            };

		//        listener.BeginAcceptTcpClient(clientAccepted, null);
		//    }
		//    finally
		//    {
		//        //listener.Stop();
		//    }

		//    return listener;
		//}

		//static void SrvTest2()
		//{
		//    const int bufferSize = 1024 * 16;
		//    LinkedList<byte[]> buffers = new LinkedList<byte[]>();
		//    for( int i = 0; i < Environment.ProcessorCount * 4; i++ )
		//    {
		//        buffers.AddFirst(new byte[bufferSize]);
		//    }

		//    TcpListener listener = new TcpListener(888);
		//    listener.Start();
		//    try
		//    {
		//        AsyncCallback clientAccepted = null;
		//        clientAccepted = delegate(IAsyncResult ar)
		//            {
		//                listener.BeginAcceptTcpClient(clientAccepted, null);

		//                try
		//                {
		//                    TcpClient client = listener.EndAcceptTcpClient(ar);
		//                    try
		//                    {
		//                        Stream connectionStream = client.GetStream();
		//                        try
		//                        {
		//                            byte[] buf;
		//                            lock( buffers )
		//                            {
		//                                if( buffers.Count == 0 )
		//                                {
		//                                    buf = new byte[bufferSize];
		//                                }
		//                                else
		//                                {
		//                                    buf = buffers.First.Value;
		//                                    buffers.RemoveFirst();
		//                                }
		//                            }

		//                            HttpRequestReader reader = null;
		//                            AsyncCallback readMore = null;
		//                            readMore = delegate(IAsyncResult ar1)
		//                            {
		//                                try
		//                                {
		//                                    try
		//                                    {
		//                                        int readCount = connectionStream.EndRead(ar1);
		//                                        if( reader == null )
		//                                        {
		//                                            reader = new HttpRequestReader();
		//                                        }

		//                                        reader.Read(buf, 0, readCount);
		//                                        if( reader.IsMoreExpected )
		//                                        {
		//                                            connectionStream.BeginRead(
		//                                                buf, 0, buf.Length,
		//                                                readMore, null);
		//                                            return;
		//                                        }
		//                                        else if( reader.IsFailed )
		//                                        {
		//                                            connectionStream.Close();
		//                                            client.Close();
		//                                            return;
		//                                        }
		//                                        else
		//                                        {
		//                                            ProcessRequest2(connectionStream, client, reader);
		//                                            connectionStream.Close();
		//                                            client.Close();
		//                                            lock( buffers )
		//                                            {
		//                                                buffers.AddLast(buf);
		//                                            }
		//                                            return;
		//                                        }
		//                                    }
		//                                    catch
		//                                    {
		//                                        connectionStream.Close();
		//                                        throw;
		//                                    }
		//                                }
		//                                catch
		//                                {
		//                                    client.Close();
		//                                    lock( buffers )
		//                                    {
		//                                        buffers.AddLast(buf);
		//                                    }
		//                                    throw;
		//                                }
		//                            };

		//                            connectionStream.BeginRead(
		//                                buf, 0, buf.Length,
		//                                readMore, null);
		//                        }
		//                        catch
		//                        {
		//                            connectionStream.Close();
		//                            throw;
		//                        }
		//                    }
		//                    catch
		//                    {
		//                        client.Close();
		//                        throw;
		//                    }
		//                }
		//                catch( Exception error )
		//                {
		//                    Console.WriteLine(error);
		//                }
		//            };

		//        listener.BeginAcceptTcpClient(clientAccepted, null);

		//        Console.ReadKey();
		//    }
		//    finally
		//    {
		//        listener.Stop();
		//    }
		//}

		////private static void ProcessRequest2(Stream connectionStream, TcpClient client, HttpRequestReader reader)
		////{
		////    string path = "c:" + reader.RawUrl;

		////    if( !Directory.Exists(path) && Directory.Exists(path.Replace("%20", " ")) )
		////        path = path.Replace("%20", " ");
		////    if( !File.Exists(path) && File.Exists(path.Replace("%20", " ")) )
		////        path = path.Replace("%20", " ");

		////    if( Directory.Exists(path) )
		////    {
		////        if( !path.EndsWith("/") && !path.EndsWith("\\") )
		////        {
		////            HttpResponseWriter.WriteStatusLine(HttpVersion.Version11, 302, connectionStream);
		////            HttpResponseWriter.WriteHeaderLine("Location", path.Substring(2) + "/", connectionStream);
		////            HttpResponseWriter.WriteEndHeaders(connectionStream);
		////            return;
		////        }

		////        ProcessRequestDirectory2(path, connectionStream);
		////    }
		////    else if( File.Exists(path) )
		////    {
		////        ProcessRequestFile2(path, connectionStream);
		////    }
		////}

		//private static void ProcessRequestFile2(string path, Stream connectionStream)
		//{
		//    byte[] resultBytes = File.ReadAllBytes(path);

		//    HttpResponseWriter.WriteStatusLine(HttpVersion.Version11, 200, connectionStream);
		//    HttpResponseWriter.WriteHeaderLine("Content-Length", resultBytes.Length.ToString(), connectionStream);
		//    HttpResponseWriter.WriteEndHeaders(connectionStream);

		//    connectionStream.Write(resultBytes, 0, resultBytes.Length);
		//}


		//private static void ProcessRequestDirectory2(string path, Stream connectionStream)
		//{
		//    HttpResponseWriter.WriteStatusLine(HttpVersion.Version11, 200, connectionStream);
		//    HttpResponseWriter.WriteHeaderLine("Content-Type", "text/html", connectionStream);
		//    HttpResponseWriter.WriteEndHeaders(connectionStream);
		//    StringBuilder result = new StringBuilder();
		//    result.Append(
		//        "<html><head><title>" + path + "</title></header>\r\n" +
		//        "<body>\r\n");

		//    if( Path.GetFullPath(Path.GetPathRoot(path)) != Path.GetFullPath(path) )
		//    {
		//        result.Append(" <b>[<a href='..'>..</a>]</b>");
		//    }

		//    foreach( string dir in Directory.GetDirectories(path) )
		//    {
		//        result.Append(" <b>[<a href='" + Path.GetFileName(dir) + "'>" + Path.GetFileName(dir) + "</a>]</b>");
		//    }
		//    foreach( string file in Directory.GetFiles(path) )
		//    {
		//        result.Append(" [<a href='" + Path.GetFileName(file) + "'>" + Path.GetFileName(file) + "</a>]");
		//    }
		//    result.Append("</body></html>\r\n\r\n");

		//    byte[] resultBytes = Encoding.ASCII.GetBytes(result.ToString());

		//    connectionStream.Write(resultBytes, 0, resultBytes.Length);
		//}


		//static void SrvTest()
		//{
		//    const int bufferSize = 1024*16;
		//    LinkedList<byte[]> buffers = new LinkedList<byte[]>();
		//    for (int i = 0; i < Environment.ProcessorCount*4; i++)
		//    {
		//        buffers.AddFirst(new byte[bufferSize]);
		//    }

		//    TcpListener listener = new TcpListener(888);
		//    listener.Start();
		//    try
		//    {
		//        AsyncCallback clientAccepted = null;
		//        clientAccepted = delegate(IAsyncResult ar)
		//            {
		//                listener.BeginAcceptTcpClient(clientAccepted, null);

		//                try
		//                {
		//                    TcpClient client = listener.EndAcceptTcpClient(ar);
		//                    try
		//                    {
		//                        Stream connectionStream = client.GetStream();
		//                        try
		//                        {
		//                            byte[] buf;
		//                            lock( buffers )
		//                            {
		//                                if( buffers.Count==0 )
		//                                {
		//                                    buf = new byte[bufferSize];
		//                                }
		//                                else
		//                                {
		//                                    buf = buffers.First.Value;
		//                                    buffers.RemoveFirst();
		//                                }
		//                            }

		//                            HttpRequestHeaderReader reader = null;
		//                            AsyncCallback readMore = null;
		//                            readMore = delegate(IAsyncResult ar1)
		//                            {
		//                                try
		//                                {
		//                                    try
		//                                    {
		//                                        int readCount = connectionStream.EndRead(ar1);
		//                                        if( reader == null )
		//                                        {
		//                                            reader = new HttpRequestHeaderReader();
		//                                        }

		//                                        HttpRequestHeader header = reader.Read(buf, 0, readCount);
		//                                        if( header == null )
		//                                        {
		//                                            connectionStream.BeginRead(
		//                                                buf, 0, buf.Length,
		//                                                readMore, null);
		//                                            return;
		//                                        }
		//                                        else if( header.IsValid == false )
		//                                        {
		//                                            connectionStream.Close();
		//                                            client.Close();
		//                                            return;
		//                                        }
		//                                        else
		//                                        {
		//                                            ProcessRequest(connectionStream, client, header);
		//                                            connectionStream.Close();
		//                                            client.Close();
		//                                            lock( buffers )
		//                                            {
		//                                                buffers.AddLast(buf);
		//                                            }
		//                                            return;
		//                                        }
		//                                    }
		//                                    catch
		//                                    {
		//                                        connectionStream.Close();
		//                                        throw;
		//                                    }
		//                                }
		//                                catch
		//                                {
		//                                    client.Close();
		//                                    lock( buffers )
		//                                    {
		//                                        buffers.AddLast(buf);
		//                                    }
		//                                    throw;
		//                                }
		//                            };

		//                            connectionStream.BeginRead(
		//                                buf, 0, buf.Length,
		//                                readMore, null);
		//                        }
		//                        catch
		//                        {
		//                            connectionStream.Close();
		//                            throw;
		//                        }
		//                    }
		//                    catch
		//                    {
		//                        client.Close();
		//                        throw;
		//                    }
		//                }
		//                catch( Exception error )
		//                {
		//                    Console.WriteLine(error);
		//                }
		//            };

		//        listener.BeginAcceptTcpClient(clientAccepted, null);

		//        Console.ReadKey();
		//    }
		//    finally
		//    {
		//        listener.Stop();
		//    }
		//}

		//private static void ProcessRequest(Stream connectionStream, TcpClient client, HttpRequestHeader header)
		//{
		//    string path = "c:"+header.Path;

		//    if( !Directory.Exists(path) && Directory.Exists(path.Replace("%20", " ")) )
		//        path = path.Replace("%20", " ");
		//    if( !File.Exists(path) && File.Exists(path.Replace("%20", " ")) )
		//        path = path.Replace("%20", " ");

		//    if( Directory.Exists(path) )
		//    {
		//        if( !path.EndsWith("/") && !path.EndsWith("\\") )
		//        {
		//            string response =
		//                "HTTP/1.1 302 Moved\r\n" +
		//                "Location: " + path.Substring(2) + "/\r\n" +
		//                "\r\n";

		//            byte[] responseBytes = Encoding.ASCII.GetBytes(response);
		//            connectionStream.Write(responseBytes, 0, responseBytes.Length);
		//            return;
		//        }

		//        ProcessRequestDirectory(path, connectionStream);
		//    }
		//    else if( File.Exists(path) )
		//    {
		//        ProcessRequestFile(path, connectionStream);
		//    }
		//}

		//private static void ProcessRequestDirectory(string path, Stream connectionStream)
		//{
		//    StringBuilder result = new StringBuilder();
		//    result.Append(
		//        "HTTP/1.1 200 OK\r\n" +
		//        //"Connection: Close\r\n"+
		//        "Content-Type: text/html\r\n" +
		//        "\r\n" +
		//        "<html><head><title>" + path + "</title></header>\r\n" +
		//        "<body>\r\n");

		//    if( Path.GetFullPath(Path.GetPathRoot(path)) != Path.GetFullPath(path) )
		//    {
		//        result.Append(" <b>[<a href='..'>..</a>]</b>");
		//    }

		//    foreach( string dir in Directory.GetDirectories(path) )
		//    {
		//        result.Append(" <b>[<a href='" + Path.GetFileName(dir) +"'>" + Path.GetFileName(dir) + "</a>]</b>");
		//    }
		//    foreach( string file in Directory.GetFiles(path) )
		//    {
		//        result.Append(" [<a href='" + Path.GetFileName(file) + "'>" + Path.GetFileName(file) + "</a>]");
		//    }
		//    result.Append("</body></html>\r\n\r\n");

		//    byte[] resultBytes = Encoding.ASCII.GetBytes(result.ToString());

		//    connectionStream.Write(resultBytes, 0, resultBytes.Length);
		//}

		//private static void ProcessRequestFile(string path, Stream connectionStream)
		//{
		//    byte[] resultBytes = File.ReadAllBytes(path);

		//    string prefix =
		//        "HTTP/1.1 200 OK\r\n" +
		//        "\r\n";

		//    byte[] prefixBytes = Encoding.ASCII.GetBytes(prefix);

		//    connectionStream.Write(prefixBytes, 0, prefixBytes.Length);
		//    connectionStream.Write(resultBytes, 0, resultBytes.Length);
		//}

		//static void Other()
		//{
		//    byte[] buf = new byte[1024 * 1024];

		//    using( TcpClient cli = new TcpClient("compass", 80) )
		//    {
		//        string req =
		//            "GET /news HTTP/1.1\r\n" +
		//            "Host: compass\r\n" +
		//            "\r\n";

		//        byte[] reqBytes = Encoding.ASCII.GetBytes(req);
		//        using( Stream s = cli.GetStream() )
		//        {
		//            s.Write(reqBytes, 0, reqBytes.Length);

		//            Thread.Sleep(TimeSpan.FromSeconds(1));

		//            int readCount = s.Read(buf, 0, buf.Length);

		//            string responseText = Encoding.ASCII.GetString(buf, 0, readCount);
		//            if( responseText.Length > 900 )
		//                responseText = responseText.Substring(0, 900);

		//            responseText = responseText
		//                .Replace("\r", "[CR]\r")
		//                .Replace("\n", "[LF]\n")
		//                .Replace("[CR]\r[LF]\n", "[CR][LF]\r\n");

		//            Console.WriteLine(responseText);
		//            Console.WriteLine();
		//            Console.WriteLine();

		//        }
		//    }

		//    TcpListener srv = new TcpListener(888);
		//    srv.Start();
		//    try
		//    {
		//        while (true)
		//        {
		//            using (TcpClient connection = srv.AcceptTcpClient())
		//            {
		//                using (Stream connectionStream = connection.GetStream())
		//                {
		//                    Thread.Sleep(TimeSpan.FromSeconds(1));
		//                    int readCount = connectionStream.Read(buf, 0, buf.Length);

		//                    string readText = Encoding.ASCII.GetString(buf, 0, readCount);
		//                    string txtDisplay = readText;
		//                    if (txtDisplay.Length > 900)
		//                        txtDisplay = txtDisplay.Substring(0, 900);
		//                    Console.WriteLine();
		//                    Console.WriteLine();

		//                    txtDisplay =
		//                        txtDisplay
		//                            .Replace("\r", "[CR]\r")
		//                            .Replace("\n", "[LF]\n")
		//                            .Replace("[CR]\r[LF]\n", "[CR][LF]\r\n");

		//                    Console.WriteLine(txtDisplay);
		//                    Console.WriteLine();

		//                    HttpRequestHeaderReader reader = new HttpRequestHeaderReader();
		//                    HttpRequestHeader header = reader.Read(buf, 0, readCount);
		//                    Console.WriteLine(header.FailureDescription);

		//                    string result =
		//                        "HTTP/1.1 200 OK\r\n"+
		//                        //"Connection: Close\r\n"+
		//                        "Content-Type: text/html\r\n"+
		//                        "\r\n"+
		//                        "<html><head><title>"+header.IsValid+"</title></header>\r\n"+
		//                        "<body>\r\n"+
		//                        txtDisplay.Replace("<","&lt;")
		//                            .Replace("\r","<br>\r")
		//                            .Replace("\n","<br>\n")
		//                            .Replace("<br>\r<br>\n","<br>\r\n")+
		//                        "</body></html>\r\n\r\n";

		//                    byte[] resultBytes = Encoding.ASCII.GetBytes(result);


		//                    connectionStream.Write(resultBytes, 0, resultBytes.Length);
		//                }
		//            }
		//        }
		//    }
		//    finally
		//    {
		//        srv.Stop();
		//    }
		//}
	}
}
