using System;
using System.Collections;
using System.ComponentModel;
using System.Diagnostics;
using System.Globalization;
using System.IO;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;

namespace Mihailik.InternetExplorer
{
	internal sealed class TraceHelper
	{
		private TraceHelper(){}

        [Conditional("TRACE")]
        public static void TraceException(object @this, Exception err)
        {
            MethodBase method=new StackFrame(1,false).GetMethod();
            StringBuilder output=new StringBuilder();
            output.Append("!! ");
            output.Append( method.ReflectedType.Name );
            if( !method.IsStatic )
            {
                output.Append("#");
                if( @this==null )
                    output.Append("null");
                else
                    output.Append(@this.GetHashCode());
                output.Append(":");
            }
            output.Append(err.ToString());
            Trace.WriteLine(output.ToString());
        }

        [Conditional("TRACE")]
        public static void TraceMethod(object @this, params object[] argValues)
        {
            try
            {
                StackTrace callStack=new StackTrace(1,false);
                MethodBase method=callStack.GetFrame(0).GetMethod();
                StringBuilder output=new StringBuilder();

                output.Append(">");
                output.Append(new string('>',callStack.FrameCount));
                output.Append(" ");
            
                if( @this==null )
                {
                    output.Append( method.ReflectedType.Name );
                    output.Append(": ");
                    output.Append( @this );
                }
                else
                {

                    output.Append( method.ReflectedType.Name );
            
                    if( !method.IsStatic )
                    {
                        output.Append("#");
                        if( @this==null )
                            output.Append("null");
                        else
                            output.Append(@this.GetHashCode());

                        output.Append(".");

                        // for interface methods -- get only interface and method simple names
                        // (skip full namespaces)
                        if( method is MethodInfo )
                        {
                            int lastDot=method.Name.LastIndexOf(".");

                            if( lastDot>0 )
                            {
                                string methodName=method.Name.Substring(lastDot+1);
                                string intfName=method.Name.Substring(0,lastDot);
                                lastDot=intfName.LastIndexOf(".");
                                if( lastDot>0 )
                                    intfName=intfName.Substring(lastDot+1);

                                output.Append(intfName);
                                output.Append(".");
                                output.Append(methodName);
                            }
                            else
                                output.Append( method.Name );
                        }
                        else
                            output.Append(method.Name);
                    }
                    else
                    {
                        output.Append(".");
                        output.Append(method.Name);
                    }

                    output.Append("(");
            
                    ParameterInfo[] args=method.GetParameters();
                    int skipOutParams=0;
                    if( args!=null && args.Length!=0 )
                    {
                        for( int i=0; i<args.Length; i++ )
                        {
                            if( i!=0 )
                                output.Append(", ");
                            else
                                output.Append(" ");

                            if( ( args[i].IsOut || args[i].IsRetval ) //|| args[i].ParameterType.IsByRef +? )
                                && !args[i].IsIn )
                            {
                                output.Append(args[i].Name);
                                output.Append(": ");
                                if( args[i].IsRetval )
                                    output.Append("retval");
                                else
                                    output.Append("out");
                                skipOutParams++;
                            }
                            else
                            {
                                if( argValues==null || i>=argValues.Length )
                                    WriteArgument(output,args[i]);
                                else
                                    WriteArgument(output,args[i],argValues[i-skipOutParams]);
                            }

                            if( i==args.Length-1 )
                                output.Append(" ");
                        }
                    }

                    output.Append(")");

                }

                output.Append(" // Thread#");
                output.Append(Thread.CurrentThread.GetHashCode());


                Trace.WriteLine(output.ToString());
            }
            catch( Exception traceException )
            {
                Trace.WriteLine(
                    "What? "+traceException );
            }
        }

        public static string StringValue(string value)
        {
            if( value==null )
                return "null";

            StringBuilder result=new StringBuilder();

            value=value
                .Replace("\"","\\\"")
                .Replace("\t","\\t")
                .Replace("\n","\\n")
                .Replace("\r","\\r")
                .Replace("\\","\\\\");

            result.Append("\"");
            if( value.Length>40 )
            {
                result.Append(value.Substring(0,40));
                result.Append("...");
            }
            else
            {
                result.Append(value);
            }
            result.Append("\"");

            return result.ToString();
        }

        public static string IntPtrValue(IntPtr value)
        {
            StringBuilder result=new StringBuilder();
            result.Append("0x");
            result.Append( ((IntPtr)value).ToInt64().ToString("X") );
            return result.ToString();
        }

        public static string ComObjectValue(object value)
        {
            StringBuilder result=new StringBuilder();
            IntPtr iunkPtr=Marshal.GetIUnknownForObject(value);
            result.Append("ComObject#");
            result.Append("0x");
            result.Append( iunkPtr.ToInt64().ToString("X"));
            return result.ToString();
        }

        public static string ArrayValue(System.Array array)
        {
            StringBuilder result=new StringBuilder();
            if( array.Rank==1
                && array.GetLowerBound(0)==0 )
            {
                result.Append( array.GetType().GetElementType().Name );
                result.Append("[");
                result.Append(array.Length);
                result.Append("]");
            }
            else
            {
                result.Append("[");                    
                for( int i=0; i<array.Rank; i++ )
                {
                    if( i!=0 )
                        result.Append(",");
                    result.Append(array.GetLowerBound(i));
                    result.Append("..");
                    result.Append(array.GetUpperBound(i));
                }
                result.Append("]");
            }
            return result.ToString();
        }

        public static string ObjectValue(object value)
        {
            StringBuilder result=new StringBuilder();

            if( value==null )
            {
                result.Append("null");
                return result.ToString();
            }

            if( value is string )
            {
                result.Append(StringValue(value as string));
                return result.ToString();
            }

            if( value is IntPtr )
            {
                result.Append(IntPtrValue((IntPtr)value));
                return result.ToString();
            }

            if( value.GetType().IsPrimitive )
            {
                result.Append(value.ToString());
                return result.ToString();
            }

            if( value.GetType().FullName=="System.__ComObject"
                && value.GetType().Assembly==typeof(object).Assembly )
            {
                result.Append(ComObjectValue(value));
                return result.ToString();
            }

            if( value is System.Array )
            {
                result.Append(ArrayValue(value as System.Array));
                return result.ToString();
            }

            if( value.ToString()==value.GetType().FullName )
            {
                result.Append("<");
                result.Append(value.GetType().Name);
                result.Append(">");
                return result.ToString();
            }
            else
            {
                result.Append("<");
                result.Append(value.GetType().Name);
                result.Append(":");
                result.Append(value.ToString());
                result.Append(">");
                return result.ToString();
            }
        }

        static void WriteArgument(StringBuilder output, ParameterInfo arg)
        {
            output.Append(arg.ParameterType);
            //output.Append(": undefined");
        }

        static void WriteArgument(StringBuilder output, ParameterInfo arg, object value)
        {
            output.Append(arg.Name);
            output.Append(": ");

            if( value==null )
            {
                output.Append("null");
                return;
            }

            if( value is string && arg.ParameterType!=typeof(string) )
                output.Append(value as string);
            else 
            {
                if( arg.ParameterType.IsByRef )
                    output.Append("ref ");
                output.Append(ObjectValue(value));
            }
        }
	}
}
