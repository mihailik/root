#define wrotto

using System;

// test

/*test line */

/*test
 * 
 * 




 * multiline */

using System.Collections;
using System.Reflection;
using System.IO;
using System.Runtime.InteropServices;

using Microsoft.Win32;

using Mihailik.InternetExplorer;

namespace Mihailik.InternetExplorer.Protocols
{
    [Guid("5eb36782-53fb-44f8-a28b-2c5c9e559a38")]
    public class HtmlColorProtocol : PluggableProtocolHandler
    {
        public static readonly string Schema="color";

        public HtmlColorProtocol()
        {
            keywords = GetKeywords();
        }

        ArrayList keywords;

        


        protected override void OnProtocolStart(EventArgs e)
        {
            string path=Request.Url.LocalPath;

            if( !File.Exists(path) )
            {
                Response.ContentType="text/html";
                Response.WriteLine("<html>");
                Response.WriteLine("<head><title>File not found</title></head>");
                Response.WriteLine("<body>");
                Response.WriteLine("<h2>File not found<h2>");
                Response.WriteLine( path );
                Response.WriteLine("<br>");
                Response.WriteLine("HTML source colorer cannot find C# file.");
                Response.WriteLine("</body>");
                Response.WriteLine("</html>");
                Response.EndResponse();
                return;
            }

            if( path.EndsWith("\\") || path.EndsWith("/") )
                path=path.Substring(0,path.Length-1);

            ArrayList strings=new ArrayList();
            

            using( FileStream stream=new FileStream(path,FileMode.Open,FileAccess.Read,FileShare.Read) )
            {
                using( StreamReader reader=new StreamReader(stream) )
                {
                    while( true )
                    {
                        string line=reader.ReadLine();
                        if( line==null )
                            break;

                        strings.Add(line);
                    }
                }
            }

            Response.ContentType="text/html";
            Response.WriteLine("<html>");
            Response.WriteLine("<head><title>"+Path.GetFileName(path)+"</title></head>");
            
            EmitCss();

            Response.WriteLine("<body>");
            Response.WriteLine("<h2>"+Path.GetFileName(path)+"</h2>");
            Response.WriteLine( "<font size=-2>"+strings.Count+" lines</font>" );

            Response.WriteLine( "<hr>" );

            if( File.Exists("c:\\script.js") )
            {
                using( StreamReader scriptReader=new StreamReader("c:\\script.js") )
                {
                    Response.WriteLine("<script>");
                    Response.WriteLine( scriptReader.ReadToEnd() );
                    Response.WriteLine("</script>");
                }
            }

            Response.WriteLine( "<div id=code>" );

            bool runningComment=false;
            bool escapedString=false;
            
            foreach( string lineDDD in strings )
            {
                string line=lineDDD;
                bool lineStart=true;
                bool nobr=false;

                while( lineStart || (line!="" && line!=null) )
                {
                    if( runningComment )
                    {
                        int commentEnd=line.IndexOf("*/");
                        if( commentEnd<0 )
                        {
                            if( lineStart )
                            {
                                Response.Write("<div class=comment>");
                                if( (line+"").Trim()=="" )
                                    Response.Write("<br>");
                                else
                                    Emit( line );
                                line="";                            
                                Response.Write("</div>");
                                //Response.Write("<span class=comment>");
                                nobr=true;
                            }
                            else
                            {
                                Emit( line );
                                line="";
                            }
                            lineStart=false;
                            continue;
                        }
                        else
                        {
                            string commentStr=line.Substring(0,commentEnd+"*/".Length);
                            Emit(commentStr);
                            Response.Write("</span>");
                            line=line.Substring(commentEnd+"*/".Length);
                            runningComment=false;
                            lineStart=false;
                            continue;
                        }
                    }

                    if( escapedString )
                    {
                        int stringEnd=line.IndexOf("\"");
                        if( stringEnd<0 )
                        {
                            if( lineStart )
                            {
                                Response.Write("<div class=string>");
                                if( (line+"").Trim()=="" )
                                    Response.Write("<br>");
                                else
                                    Emit( line );
                                line="";
                                Response.Write("</div>");
                                //Response.Write("<span class=comment>");
                                nobr=true;
                            }
                            else
                            {
                                Emit( line );
                                line="";
                                lineStart=false;
                                continue;
                            }
                        }
                        else
                        {
                            string stringStr=line.Substring(0,stringEnd+"\"".Length);
                            Emit(stringStr);
                            Response.Write("</span>");
                            line=line.Substring(stringEnd+"\"".Length);
                            escapedString=false;
                            lineStart=false;
                            continue;
                        }
                    }

                    if( lineStart && line.TrimStart().StartsWith("#") )
                    {
                        if( line.TrimStart().StartsWith("#region") )
                            Response.Write("<div class=region>");

                        int pos=line.IndexOf("#");
                        Emit(line.Substring(0,pos));
                        Response.Write("<span class=preprocessor>");
                        Emit(line.Substring(pos));
                        Response.Write("</span>");

                        if( line.TrimStart().StartsWith("#endregion") )
                        {
                            Response.Write("</div>");
                            nobr=true;
                        }

                        line="";
                    }

                    int lineCommentStart=line.IndexOf("//");
                    int runningCommentStart=line.IndexOf("/*");
                    int stringStart=line.IndexOf("\"");
                    int escapedStringStart=line.IndexOf("@\"");

                    int firstItem=NearestFound(
                        lineCommentStart,
                        runningCommentStart,
                        stringStart,
                        escapedStringStart );

                    if( firstItem==lineCommentStart )
                    {
                        if( lineStart
                            && line.TrimStart().StartsWith("//") )
                        {
                            Response.Write("<div class=comment>");
                            Emit(line);
                            Response.Write("</div>");
                            nobr=true;
                            line="";
                        }
                        else
                        {
                            DrawCleanCode(line.Substring(0,firstItem));
                            Response.Write("<span class=comment>");
                            Emit(line.Substring(firstItem));
                            Response.Write("</span>");
                            line="";
                        }
                        lineStart=false;
                        continue;
                    }
                    else if( firstItem==runningCommentStart )
                    {
                        if( lineStart
                            && line.StartsWith("/*")
                            && line.Substring(runningCommentStart+"/*".Length).IndexOf("*/")<0 )
                        {
                            Response.Write("<div class=comment>");
                            Emit(line);
                            Response.Write("</div>");
                            nobr=true;
                            Response.Write("<span class=comment>");
                            runningComment=true;
                            line="";
                            lineStart=false;
                        }
                        else
                        {
                            DrawCleanCode(line.Substring(0,runningCommentStart));
                            Response.Write("<span class=comment>");
                            Emit("/*");
                            line=line.Substring(runningCommentStart+"/*".Length);
                            runningComment=true;
                            lineStart=false;
                        }                        
                        continue;
                    }
                    else if( firstItem==stringStart )
                    {
                        DrawCleanCode(line.Substring(0,stringStart));
                        Response.Write("<span class=string>");
                        Emit("\"");
                        line=line.Substring(stringStart+"\"".Length);
                        
                        while( line!="" && line!=null )
                        {
                            int slash=line.IndexOf("\\");
                            int quot=line.IndexOf("\"");
                            
                            int firstStringItem=NearestFound(
                                slash,
                                quot );

                            if( firstStringItem==slash )
                            {
                                Emit(line.Substring(0,slash+2));
                                line=line.Substring(slash+2);
                            }
                            else if( firstStringItem==quot )
                            {
                                Emit(line.Substring(0,quot));
                                Emit("\"");
                                line=line.Substring(quot+"\"".Length);
                                break;
                            }
                            else
                            {
                                Emit(line);
                                line="";
                                break;
                            }
                        }

                        Response.Write("</span>");
                        lineStart=false;
                    }
                    else if( firstItem==escapedStringStart )
                    {
                        DrawCleanCode(line.Substring(0,escapedStringStart ));
                        Response.Write("<span class=string>");
                        Emit("@\"");
                        line=line.Substring(escapedStringStart+"@\"".Length);
                        escapedString=true;
                        lineStart=false;
                        continue;
                    }
                    else
                    {
                        DrawCleanCode(line);
                        line="";
                        lineStart=false;


                    }
                }

                if( nobr )
                    Response.WriteLine("");
                else
                    EmitLine("");
            }

            Response.WriteLine( "</div>" );
            Response.WriteLine( "<hr>" );
            Response.WriteLine( "<font size=-2>"+strings.Count+" lines</font><br>" );
            Response.WriteLine( "<font size=-2> Converter by Oleg Mihailik, 2004. v"+GetType().Assembly.GetName().Version+"</font>" );
            Response.WriteLine( "</body>" );
            Response.WriteLine( "</html>" );

            Response.EndResponse();
        }

        static int NearestFound(params int[] args)
        {
            int result=-1;
            foreach( int i in args )
            {
                if( i>=0 )
                {
                    if( result<0 )
                        result=i;
                    else if( i<result )
                        result=i;
                }
            }

            if( result==-1 )
                result=0;

            return result;
        }

        static int Min(params int[] args)
        {
            int min=args[0];
            for( int i=1; i<args.Length; i++ )
                if( args[i]<min )
                    min=args[i];

            return min;
        }

        void DrawCleanCode(string code)
        {
            string word=null;
            string dirt=null;
            foreach( char c in code )
            {
                if( char.IsLetter(c)
                    || char.IsDigit(c) )
                {
                    if( dirt!=null )
                        Emit(dirt);
                    dirt=null;

                    word+=c;
                }
                else
                {
                    if( word!=null )
                        DrawWord(word);
                    
                    word=null;
                    dirt+=c;
                }
            }

            if( word!=null )
                DrawWord(word);
            else if( dirt!=null )
                Emit(dirt);
        }

        void DrawWord(string word)
        {
            if( keywords.Contains(word) )
            {
                Response.Write("<span class=keyword>");
                Emit(word);
                Response.Write("</span>");
            }
            else
            {
                Emit(word);
            }
        }

        void Emit(string text)
        {
            Response.Write(
                text
                .Replace("&","&amp;")
                .Replace("\t","    ")
                .Replace("  "," &nbsp;")                
                .Replace("<","&lt;")
                .Replace(">","&gt;") );
        }

        void EmitLine(string line)
        {
            Emit(line);
            Response.WriteLine("<br>");
        }

        void EmitCss()
        {
            Response.WriteLine( "<style type=\"text/css\">" );

            using( StreamReader cssReader=new StreamReader(
                       GetType().Assembly.GetManifestResourceStream(GetType().Namespace+".code.css"),
                       true ) )
            {
                while( true )
                {
                    string line=cssReader.ReadLine();
                    if( line==null )
                        break;
                    else
                        Response.WriteLine( line );
                }
            }

            Response.WriteLine( "</style>" );
        }

        ArrayList GetKeywords()
        {
            ArrayList result=new ArrayList();
            using( StreamReader cssReader=new StreamReader(
                       GetType().Assembly.GetManifestResourceStream(GetType().Namespace+".keywords.txt"),
                       true ) )
            {
                while( true )
                {
                    string line=cssReader.ReadLine();
                    if( line==null )
                        break;
                    
                    foreach( string part in line.Split() )
                        if( part!="" )
                            result.Add(part);
                }
            }

            return result;
        }
    }
}