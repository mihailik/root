using System;

using System.Collections;
using System.Reflection;
using System.IO;
using System.Runtime.InteropServices;

using Microsoft.Win32;

using Mihailik.InternetExplorer;

namespace Mihailik.InternetExplorer.Protocols
{
    [Guid("59354fd1-1467-45e8-a5d1-1d997754b04e")]
	public class ResourceProtocol : PluggableProtocolHandler
	{
        public static readonly string Schema="netres";

		public ResourceProtocol()
		{
		}

        protected override void OnProtocolStart(EventArgs e)
        {
            string file=Request.Url.LocalPath;
            string resourceName=null;

            if( file.EndsWith("/")
                || file.EndsWith("\\") )
                file=file.Substring(0,file.Length-1);

            while( !File.Exists(file) )
            {
                string newPath=Path.GetDirectoryName(file);
                if( newPath==null )
                    throw new Exception("File "+Request.Url.LocalPath+" or "+Path.GetDirectoryName(Request.Url.LocalPath)+" not found.");

                string newPart=file.Substring(newPath.Length);
                if( newPart.StartsWith("/")
                    || newPart.StartsWith("\\") )
                    newPart=newPart.Substring(1);

                if( resourceName!=null )
                    resourceName="."+resourceName;

                resourceName=newPart+resourceName;

                file=newPath;
            }

            Assembly asm;
            try
            {
                asm=Assembly.LoadFrom(file);
            }
            catch( Exception loadError )
            {
                throw new Exception("Cannot load Assembly from existing file "+file+".", loadError );
            }

            if( resourceName+""=="" )
                DumpAssemblyResources(asm);
            else
                PushAssemblyResource(asm,resourceName);
            
            Response.EndResponse();
        }

        void PushAssemblyResource(Assembly asm, string resourceName)
        {
            Stream resStream=asm.GetManifestResourceStream(resourceName);
            if( resStream==null )
            {
                foreach( string resName in asm.GetManifestResourceNames() )
                {
                    if( string.Compare(resourceName,resName,true)==0 )
                        resStream=asm.GetManifestResourceStream(resName);
                }
                if( resStream==null )
                {
                    ErrorNoResource(asm,resourceName);
                    return;
                }
            }

            using( resStream )
            {
                byte[] buf=new byte[(int)resStream.Length];
                resStream.Read(buf,0,buf.Length);
                Response.OutputStream.Write(
                    buf, 0, buf.Length );
            }

            // Try to detect ContentType
            try
            {
                string ext=Path.GetExtension(resourceName);
                if( ext+""!="" )
                {
                    RegistryKey extKey=Registry.ClassesRoot.OpenSubKey( ext );
                    if( extKey!=null )
                    {
                        string contentType=extKey.GetValue("Content Type")+"";
                        if( contentType=="" )
                            contentType=extKey.GetValue("PerceivedType")+"";

                        if( contentType!=null )
                            Response.ContentType=contentType;
                    }
                }
            }
            catch {}
        }

        void ErrorNoResource(Assembly asm,string resourceName)
        {
            throw new Exception("Cannot find '"+resourceName+"' resource in "+asm.Location+".");
        }

        void DumpAssemblyResources(Assembly asm)
        {
            Response.ContentType="text/html";

            Response.WriteLine("<html>");
            Response.WriteLine("<head><title>"+asm.GetName().Name+" resources</title></head>");
            Response.WriteLine("<body>");
            Response.WriteLine("<h2>"+asm.Location+" resources</h2>");
            Response.WriteLine("<ul>");

            string[] resNames=asm.GetManifestResourceNames();
            foreach( string resName in resNames )
            {

                Response.WriteLine(
                    "<li>"+
                    "<a href=\""+
                    
                    Schema+"://"+
                    
                    asm.Location.Replace("\\","/")+"/"+
                    
                    Path.GetFileNameWithoutExtension(resName).Replace(".","/")+
                    Path.GetExtension(resName)+

                    "\">"+resName+"</a>" );
            }

            Response.WriteLine("</ul>");
            Response.WriteLine("<font size=-1>Total count: "+resNames.Length+"</font>");

            Response.WriteLine("<hr>");
            Response.Write("<font size=-2>Verb: "+Request.Verb);
            if( Request.VerbData!=null && Request.VerbData.Length>0 )
                Response.Write(" ("+Request.VerbData.Length+" bytes)");
            
            Response.Write("<font color=white><br>"+Request.Url);
            Response.WriteLine("</font>");

            Response.WriteLine("</body>");
            Response.WriteLine("</html>");

        }
    }
}
