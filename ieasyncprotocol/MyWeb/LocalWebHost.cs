using System;

using System.Collections;
using System.Reflection;
using System.IO;
using System.Runtime.InteropServices;
using System.Web;
using System.Web.Hosting;
using System.Text;

using Microsoft.Win32;

using Mihailik.InternetExplorer;
using System.Diagnostics;

namespace Mihailik.InternetExplorer.Protocols
{
    public class LocalWebHost : MarshalByRefObject
    {
        string virtualDir;
        string appDir;
        
        static readonly System.Net.CookieContainer cookies=new System.Net.CookieContainer();

        public LocalWebHost()
        {
        }

        public void Kick()
        {
        }

        public void Init(string virtualDir, string appDir)
        {
            this.virtualDir=virtualDir;
            this.appDir=appDir.Replace("/","\\");

            if( !this.appDir.EndsWith("\\") )
                this.appDir+="\\";
        }

        #region MyWorkerRequest
        class MyWorkerRequest : SimpleWorkerRequest
        {
            public MyWorkerRequest(
                LocalWebHost host,
                RequestInfo requestInfo,
                string path,
                string pathTranslated,
                string query,
                TextWriter writer,
                MemoryStream responseStream )
                :base(path,query, writer )
            {
                this.host=host;
                this.requestInfo=requestInfo;

                this.path=path;
                this.pathTranslated=pathTranslated;

                this.query=query;

                this.responseStream=responseStream;
                this.writer=writer;
            }

            readonly LocalWebHost host;
            readonly RequestInfo requestInfo;
            readonly string path;
            readonly string pathTranslated;
            readonly string query;
            readonly TextWriter writer;
            readonly MemoryStream responseStream;

            internal string ContentType="text/html";

            public byte[] GetResponseBytes()
            {
                return responseStream.ToArray();
            }

            public override string MapPath(string virtualPathArgument)
            {
                string virtualPath = virtualPathArgument;
                try
                {
                    string baseMapPath = base.MapPath(virtualPathArgument);
                    Debug.WriteLine("base.MapPath(" + (virtualPathArgument == null ? "null" : "\"" + virtualPathArgument + "\"") + ") = " + (baseMapPath == null ? "null" : "\"" + baseMapPath + "\""));
                }
                catch (Exception error)
                {
                    Debug.WriteLine("base.MapPath(" + (virtualPathArgument == null ? "null" : "\"" + virtualPathArgument + "\"") + ") " + error.Message);
                }

                try
                {
                    string argVirtualPath = virtualPath;

                    virtualPath = virtualPath + "";

                    virtualPath = virtualPath.Replace("/", "\\");

                    string result;

                    if (virtualPath.StartsWith("\\"))
                    {
                        result = Path.GetPathRoot(host.appDir);
                        virtualPath = virtualPath.Substring(1);
                    }
                    else
                    {
                        result = host.appDir;
                    }

                    if (result.EndsWith("\\"))
                        result += virtualPath;
                    else
                        result += "\\" + virtualPath;

                    Debug.WriteLine("this.MapPath(" + (virtualPathArgument == null ? "null" : "\"" + virtualPathArgument + "\"") + ") = " + (result == null ? "null" : "\"" + result + "\""));

                    return result;
                }
                catch (Exception error)
                {
                    Debug.WriteLine("this.MapPath(" + (virtualPathArgument == null ? "null" : "\"" + virtualPathArgument + "\"") + ") " + error.Message);
                    throw;
                }
            }

            public override string GetAppPath()
            {
                return base.GetAppPath();
                //return host.virtualDir;
            }

            public override string GetAppPathTranslated()
            {
                return base.GetAppPathTranslated();
                //return host.appDir;
            }


            public override string GetFilePath()
            {
                try
                {
                    string baseGetFilePath = base.GetFilePath();
                    Trace.WriteLine("base.GetFilePath() = " + (baseGetFilePath == null ? "null" : "\"" + baseGetFilePath + "\""));
                }
                catch( Exception error )
                {
                    Trace.WriteLine("base.GetFilePath() " + error.Message);
                }
                try
                {
                    string result = path;
                    if (result.StartsWith("/"))
                        result = result.Substring(1);

                    if (host.virtualDir.EndsWith("/"))
                        result = host.virtualDir + result;
                    else
                        result = host.virtualDir + "/" + result;

                    Trace.WriteLine("this.GetFilePath() = " + (result == null ? "null" : "\"" + result + "\""));

                    return result;
                }
                catch (Exception error)
                {
                    Trace.WriteLine("this.GetFilePath() " + error.Message);
                    throw;
                }
            }

            public override string GetFilePathTranslated()
            {
                return (pathTranslated+"").ToLower();
            }



            public override string GetHttpVerbName()
            {
                return requestInfo.Verb;
            }

            System.Uri CookieUri
            {
                get
                {
                    return new Uri(
                        new Uri(requestInfo.UrlString).Scheme+
                        "://"+host.appDir );
                }
            }

            public override void SendKnownResponseHeader(int index, string value)
            {
                //string wrott=HttpWorkerRequest.GetKnownRequestHeaderName(index);

                if( index==HttpWorkerRequest.HeaderContentType )
                    ContentType=value;
                else if( index==HttpWorkerRequest.HeaderFrom )
                {
                    string[] parts=value.Split(';');
                    value=parts[0];

                    cookies.SetCookies(
                        CookieUri,
                        value );
                }
                base.SendKnownResponseHeader(index,value);

                // ! ! !  !  !  !   !   !   !
                // HeaderFrom — is it HeaderCookier?
                // Cannot understand it
            }

            public override void SendUnknownResponseHeader(string name, string value)
            {
                base.SendUnknownResponseHeader(name,value);
            }

            public override string GetQueryString()
            {
                return this.query;
            }

            public override byte[] GetQueryStringRawBytes()
            {
                return Encoding.UTF8.GetBytes(query);
            }

            public override string GetRawUrl()
            {
                return requestInfo.UrlString;
            }

            public override string GetHttpVersion()
            {
                return "HTTP/1.1";
            }

            public override string GetRemoteAddress()
            {
                return System.Net.IPAddress.Loopback.ToString();
            }

            public override int GetRemotePort()
            {
                return 0;
            }

            public override string GetLocalAddress()
            {
                return System.Net.IPAddress.Loopback.ToString();
            }

            public override int GetLocalPort()
            {
                return 80;
            }

            public override string GetPathInfo()
            {
                return base.GetPathInfo();
                //string fullUrl=unescape(new Uri(requestInfo.UrlString).LocalPath+"").ToLower();
                //fullUrl=fullUrl.Replace("\\","/");

                //string appUrl=host.appDir.ToLower().Replace("\\","/");

                //string result;
                //if( fullUrl.StartsWith(appUrl) )
                //    result=fullUrl.Substring(appUrl.Length);
                //else
                //    result=fullUrl;

                //if( !result.StartsWith("/") )
                //    result="/"+result;

                //return result;
            }

            









            public override byte[] GetPreloadedEntityBody()
            {
                return requestInfo.VerbData;
            }

            public override bool IsEntireEntityBodyIsPreloaded()
            {
                return true;
            }

            public override string GetKnownRequestHeader(int index)
            {
                if( index==HttpWorkerRequest.HeaderContentLength
                    && requestInfo.VerbData!=null )
                    return requestInfo.VerbData.Length+"";
                else if( index==HttpWorkerRequest.HeaderContentType
                    && requestInfo.VerbData!=null )
                    return "application/x-www-form-urlencoded";
                else if( index==HttpWorkerRequest.HeaderCookie )
                {
                    string result=cookies.GetCookieHeader(CookieUri);
                    return result;//cookies.GetCookieHeader(new Uri(requestInfo.UrlString));
                }
                else
                    return base.GetKnownRequestHeader (index);
            }

            string InternalGKRH(int index)
            {
                return base.GetKnownRequestHeader(index);
            }


            public override int ReadEntityBody(byte[] buffer, int size)
            {
                if( requestInfo.VerbData==null )
                    return 0;

                int len=Math.Min(buffer.Length,requestInfo.VerbData.Length);

                System.Array.Copy(
                    requestInfo.VerbData,
                    buffer,
                    len );

                return len;
            }

            public override void SendResponseFromFile(string filename, long offset, long length)
            {
                using( FileStream fs=new FileStream(
                           filename,
                           FileMode.Open,
                           FileAccess.Read,
                           FileShare.Read ) )
                {
                    byte[] responseBytes=new byte[
                        Math.Min(length,(int)fs.Length) ];

                    fs.Read(
                        responseBytes,
                        0,
                        responseBytes.Length );

                    responseStream.Write(
                        responseBytes,
                        0,
                        responseBytes.Length );
                }
            }

            public override void SendResponseFromFile(System.IntPtr handle, long offset, long length)
            {
                using( FileStream fs=new FileStream(
                           handle,
                           FileAccess.Read,
                           false ) )
                {
                    byte[] responseBytes=new byte[
                        Math.Min(length,(int)fs.Length) ];

                    fs.Read(
                        responseBytes,
                        0,
                        responseBytes.Length );

                    responseStream.Write(
                        responseBytes,
                        0,
                        responseBytes.Length );
                }
            }

            public override void SendResponseFromMemory(byte[] data, int length)
            {
                responseStream.Write(
                    data,
                    0,
                    length );
            }

            public override void SendResponseFromMemory(System.IntPtr data, int length)
            {
                byte[] responseBytes=new byte[length];
                Marshal.Copy(
                    data,
                    responseBytes,
                    0,
                    length );

                responseStream.Write(
                    responseBytes,
                    0,
                    responseBytes.Length );
            }





        }
        #endregion

        static string Unescape(string s)
        {
            if( s==null )
                return null;

            StringBuilder result=new StringBuilder();
            int pos=0;
            while( pos<s.Length )
            {
                int percPo=s.IndexOf("%",pos);
                if( percPo<0                // not found
                    || percPo>=s.Length-2 ) // or too far
                {
                    result.Append( s.Substring(pos) );
                    pos=s.Length;
                    continue;
                }

                result.Append( s.Substring(pos,percPo-pos) );
                s=s.Substring(percPo);

                char next1=s[1];
                char next2=s[2];
                if( Uri.IsHexDigit(next1) && Uri.IsHexDigit(next2) )
                {
                    result.Append( (char)( (int)next1*16+(int)next2 ) );
                    s=s.Substring(3);
                }
                else
                {
                    result.Append(s.Substring(0,3));
                    s=s.Substring(3);
                }
            }

            return result.ToString();
        }

        static string unescape(string escaped)
        {
            if( escaped==null )
                return escaped;

            StringBuilder result=new StringBuilder();
            int i=0;
            byte[] tmpBytes=new byte[1];
            while( i<escaped.Length )
            {
                if( escaped[i]=='%'
                    && i+2<escaped.Length
                    && Uri.IsHexDigit(escaped[i+1])
                    && Uri.IsHexDigit(escaped[i+2]) )
                {
                    tmpBytes[0]=byte.Parse(
                        ""+escaped[i+1]+escaped[i+2],
                        System.Globalization.NumberStyles.HexNumber );

                    char unescapedChar=Encoding.Default.GetChars(tmpBytes)[0];
                    result.Append(unescapedChar);
                    i+=3;
                }
                else
                {
                    result.Append(escaped[i]);
                    i++;
                }
            }

            return result.ToString();
        }

        public ResponseInfo ProcessRequest( RequestInfo requestInfo )
        {
            try
            {
                string contentType="text/html";

                string appDir=this.appDir;
                if( !appDir.EndsWith("\\")
                    && !appDir.EndsWith("/") )
                    appDir+="\\";
                appDir=appDir.Replace("\\","/");

                Uri requestUrl=new Uri(requestInfo.UrlString);
                string query=requestUrl.Query;

                requestUrl=new Uri(
                    requestUrl.Scheme+"://"+
                    requestUrl.LocalPath.Replace("\\","/") );

                Uri appDirUrl=new Uri("myweb://"+appDir);

                string page=
                    requestUrl.ToString().Substring( appDirUrl.ToString().Length );

                if( page.EndsWith("/")
                    || page.EndsWith("\\") )
                    page=page.Substring(0,page.Length-1);

                page="/"+page;

                

                if( query==null )
                    query="";
                else if( query.StartsWith("?") )
                    query=query.Substring(1);
                //query=Unescape(query);

                string physicalPath=this.appDir;
                if( physicalPath.EndsWith("\\")
                    || physicalPath.EndsWith("/") )
                    physicalPath=physicalPath.Substring(0,physicalPath.Length-1);

                physicalPath+=page;

                physicalPath=physicalPath.Replace("/","\\");
                physicalPath=unescape(physicalPath);

                string pathTranslated=physicalPath;

                if( !File.Exists(pathTranslated) )
                {
                    pathTranslated=Path.Combine(pathTranslated,"default.aspx");
                    if( !File.Exists(pathTranslated) )
                        pathTranslated=null;
                }

                using( MemoryStream responseStream=new MemoryStream() )
                {
                    using( StreamWriter writer=new StreamWriter(responseStream) )
                    {

                        if( pathTranslated!=null
                            || !Directory.Exists(physicalPath) )
                        {
                            MyWorkerRequest request=new MyWorkerRequest(
                                this,
                                requestInfo,
                                page,
                                pathTranslated,
                                query,
                                writer,
                                responseStream );

                            HttpRuntime.ProcessRequest(request);

                            contentType=request.ContentType;
                        }
                        else // directory content
                        {
                            DumpDir(physicalPath,writer);
                        
                            contentType="text/html";
                        }

                        if( contentType==null
                            || contentType=="" )
                            contentType="application/octet-stream";

                    }

                    return new ResponseInfo(
                        contentType,
                        responseStream.ToArray() );
                }
            }
            catch( Exception error )
            {
                if( error.GetType().IsSerializable )
                    throw new Exception("Request processing error.",error);
                else
                    throw new Exception("Request processing error.\r\n"+error);
            }
        }

        void DumpDir(string path, TextWriter writer)
        {
            writer.WriteLine("<html><head><title>"+path+"</title></head>");
            writer.WriteLine("<body><h2>"+path+"</h2>");
        
            if( (Path.GetPathRoot(path)+"").ToLower()!=path.ToLower() )
                writer.WriteLine(
                    "<a href=\"myweb://"+Path.GetDirectoryName(path).Replace("\\","/")+"\">[ .. ]</a><br>");

            writer.WriteLine("<br><br>");

            foreach( string dir in Directory.GetDirectories(path) )
                writer.WriteLine("<a href=\"myweb://"+dir.Replace("\\","/")+"\">[ "+Path.GetFileName(dir)+" ]</a><br>");

            writer.WriteLine("<br><br>");
            
            foreach( string file in Directory.GetFiles(path) )
                writer.WriteLine("<a href=\"myweb://"+file.Replace("\\","/")+"\">"+Path.GetFileName(file)+"</a><br>");
            
            writer.WriteLine("</html>");
        }
	}
}
