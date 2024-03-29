#define TRACE_EXTERNAL_CALLS

using System;

using System.IO;
using System.Text;
using System.Runtime.InteropServices;

namespace Mihailik.InternetExplorer
{
    public class PluggableProtocolResponse
    {
        internal PluggableProtocolResponse(
            PluggableProtocolHandler handler,
            NativeMethods.IInternetProtocolSink sink )
        {
            this.handler=handler;
            this.m_Sink=sink;
        }

        string m_ContentType;
        InternalOutputStream m_OutputStream;
        Encoding m_ContentEncoding=Encoding.UTF8;
        
        bool m_IsBuffered=true;
        bool isWriteStarted;
        bool isWriteCompleted;
        bool isReadFinished;
        
        StreamWriter innerWriter;
        
        PluggableProtocolHandler handler;
        NativeMethods.IInternetProtocolSink m_Sink;

        #region InternalOutputStream
        class InternalOutputStream : System.IO.Stream
        {                
            readonly PluggableProtocolResponse response;
            byte[] innerBuffer;
            
            int m_Position=0;
            int m_Length;

            internal InternalOutputStream(PluggableProtocolResponse response)
            {
                this.response=response;                
            }

            public override bool CanRead
            {
                get
                {
                    lock( response.handler.sync )
                    {
                        if( !response.m_IsBuffered )
                            return false;
                        else if( response.isWriteCompleted )
                            return false;
                        else
                            return true;
                    }
                }
            }

            public override bool CanSeek
            {
                get
                {
                    lock( response.handler.sync )
                    {
                        if( !response.m_IsBuffered )
                            return false;
                        else if( response.isWriteCompleted )
                            return false;
                        else
                            return true;
                    }
                }
            }

            public override bool CanWrite
            {
                get
                {
                    lock( response.handler.sync )
                    {
                        if( response.isWriteCompleted )
                            return false;
                        else
                            return true;
                    }
                }
            }

            public override void Close()
            {
                // nothing
            }

            public override void Flush()
            {
            }

            public override long Length
            {
                get
                {
                    lock( response.handler.sync )
                    {
                        if( !response.m_IsBuffered )
                            throw new NotSupportedException();
                    
                        if( response.isWriteCompleted )
                            return 0;
                        else
                            return m_Length;
                    }
                }
            }

            internal int InternalLength
            {
                get { lock( response.handler.sync ) return m_Length; }
            }

            public override long Position
            {
                get
                {
                    lock( response.handler.sync )
                    {
                        if( !response.m_IsBuffered )
                            throw new NotSupportedException();
                    
                        if( response.isWriteCompleted )
                            return 0;
                        else
                            return m_Position;

                    }
                }
                set
                {
                    lock( response.handler.sync )
                    {
                        if( !response.m_IsBuffered )
                            throw new NotSupportedException();
                    
                        if( response.isWriteCompleted )
                            throw new NotSupportedException();
                        else
                            m_Position=(int)value;
                    }
                }
            }

            public override int Read(byte[] buffer, int offset, int count)
            {
                lock( response.handler.sync )
                {
                    if( !response.m_IsBuffered )
                        throw new NotSupportedException();
                    
                    if( response.isWriteCompleted )
                        throw new NotSupportedException();

                    if( buffer==null )
                        throw new ArgumentNullException("buffer");
                    if( offset<0 )
                        throw new ArgumentOutOfRangeException("offset");
                    if( count<0 )
                        throw new ArgumentOutOfRangeException("count");

                    count=Math.Min(count,m_Length-m_Position);
                    if( count<=0 )
                        return 0;

                    System.Array.Copy(
                        innerBuffer, m_Position,
                        buffer, offset,
                        count );
                    m_Position+=count;
                    return count;
                }                
            }

            public override long Seek(long offset, SeekOrigin origin)
            {
                lock( response.handler.sync )
                {
                    if( !response.m_IsBuffered )
                        throw new NotSupportedException();
                    
                    if( response.isWriteCompleted )
                        throw new NotSupportedException();

                    int newPosition;
                    switch( origin )
                    {
                        case SeekOrigin.Begin:                        
                            newPosition=(int)offset;
                            break;

                        case SeekOrigin.Current:
                            newPosition=m_Position+(int)offset;
                            break;

                        case SeekOrigin.End:
                            newPosition=m_Length-(int)offset;
                            break;

                        default:
                            throw new ArgumentOutOfRangeException("origin");
                    }

                    if( newPosition<0 )
                        throw new ArgumentOutOfRangeException("offset");

                    m_Position=newPosition;
                    return m_Position;
                }
            }

            void EnsureCapacity(int value)
            {
                if( value<=m_Length )
                    return;

                value=Math.Max(16,value);

                if( innerBuffer==null )
                    innerBuffer=new byte[value];
                else if( innerBuffer.Length<value )
                {
                    value=Math.Max( innerBuffer.Length*2, value );

                    byte[] newBuffer=new byte[value];
                    System.Array.Copy(
                        innerBuffer, newBuffer, m_Length );
                    innerBuffer=newBuffer;
                }
            }

            void InternalSetLength(int value)
            {
                if( value==0 )
                {
                    innerBuffer=null;
                    m_Length=0;
                }
                else
                {
                    if( innerBuffer==null )
                    {
                        EnsureCapacity(value);
                        m_Length=value;
                    }
                    else if( m_Length>value )
                    {
                        m_Length=value;
                    }
                    else if( m_Length<value )
                    {
                        if( innerBuffer.Length<value )
                        {
                            EnsureCapacity(value); // new array
                            m_Length=(int)value;
                        }
                        else
                        {
                            System.Array.Clear( innerBuffer, m_Length, value-m_Length );
                            m_Length=value;
                        }
                    }
                }
            }

            public override void SetLength(long value)
            {
                lock( response.handler.sync )
                {
                    if( !response.m_IsBuffered )
                        throw new NotSupportedException();
                    
                    if( response.isWriteCompleted )
                        throw new NotSupportedException();

                    if( value<0 )
                        throw new ArgumentOutOfRangeException("value");

                    InternalSetLength((int)value);
                }
            }

            public override void Write(byte[] buffer, int offset, int count)
            {
                lock( response.handler.sync )
                {
                    if( response.isWriteCompleted )
                        throw new NotSupportedException();

                    if( buffer==null )
                        throw new ArgumentNullException("buffer");

                    if( offset<0 )
                        throw new ArgumentOutOfRangeException("offset");

                    if( count<0 )
                        throw new ArgumentOutOfRangeException("count");

                    if( count==0 )
                        return;

                    if( m_Position+count>m_Length )
                        InternalSetLength(m_Position+count);

                    System.Array.Copy(
                        buffer, offset,
                        innerBuffer, m_Position,
                        count );
                    m_Position+=count;
                }

                response.setWriteStarted();
            }

            internal byte[] Buffer
            {
                get { lock( response.handler.sync ) return innerBuffer; }
            }            

            internal int ProtocolReadPosition;
        }
        #endregion

        public bool IsBuffered
        {
            get { lock( handler.sync ) return m_IsBuffered; }
            set
            {
                lock( handler.sync )
                {
                    if( isWriteStarted )
                        throw new InvalidOperationException("Cannot change IsBuffered after write started.");

                    m_IsBuffered=value;
                }
            }
        }

        public string ContentType
        {
            get { lock( handler.sync ) return m_ContentType; }
            set
            {
                lock( handler.sync )
                {
                    if( !m_IsBuffered
                        && isWriteStarted )
                        throw new InvalidOperationException("Cannot set ContentType property after unbuffered stream write started.");

                    if( isWriteCompleted )
                        throw new InvalidOperationException("Cannot set ContentType property after write completed.");
                
                    m_ContentType=value;
                }
            }
        }

        public Stream OutputStream
        {
            get
            {
                lock( handler.sync )
                {
                    if( isWriteCompleted )
                        m_OutputStream=null;
                    else if( m_OutputStream==null )
                        m_OutputStream=new InternalOutputStream(this);

                    return m_OutputStream;
                }
            }
        }

        public Encoding ContentEncoding
        {
            get { lock( handler.sync ) return m_ContentEncoding; }
            set
            {
                lock( handler.sync )
                {
                    if( value==null )
                        throw new ArgumentNullException("value");

                    if( isWriteCompleted )
                        throw new InvalidOperationException("Cannot change ContentEncoding property after write completed.");

                    if( value==m_ContentEncoding )
                        return;

                    m_ContentEncoding=value;

                    CleanInnerWriter();                    
                }
            }
        }

        public void Write(object obj)
        {
            Write(obj+"");
        }

        public void WriteLine(object obj)
        {
            WriteLine(obj+"");
        }

        public void Write(string str)
        {
            if( str!=null && str!="" )
            {
                lock( handler.sync )
                {
                    needInnerWriter();
                    innerWriter.Write(str);
                }
            }
        }

        public void WriteLine(string line)
        {
            lock( handler.sync )
            {
                needInnerWriter();
                innerWriter.WriteLine(line);
            }
        }

        public void Write(string format, params object[] arguments)
        {
            if( format!=null && format!="" )
            {
                lock( handler.sync )
                {
                    needInnerWriter();
                    innerWriter.Write(format,arguments);
                }
            }
        }

        public void WriteLine(string format, params object[] arguments)
        {
            lock( handler.sync )
            {
                needInnerWriter();
                innerWriter.WriteLine(format,arguments);
            }
        }

        public void EndResponse()
        {
            lock( handler.sync )
            {
                if( isWriteCompleted )
                    return;

                CleanInnerWriter();
                System.Diagnostics.Trace.WriteLine("EndResponse");
                isWriteCompleted=true;            

            }
            NotifyWriteCompleted();
        }

        #region Dispose
        public void Dispose()
        {
            Dispose(true);
        }

        protected void Dispose(bool isDisposing)
        {
            if( isDisposing )
            {
                GC.SuppressFinalize(this);

                CleanOutputStream();
                CleanInnerWriter();
            }

            try { Marshal.ReleaseComObject(m_Sink); }
            catch {}
        }

        ~PluggableProtocolResponse()
        {
            Dispose(false);
        }
        #endregion

        void CleanOutputStream()
        {
            IDisposable disposeObj=m_OutputStream as IDisposable;
            m_OutputStream=null;
            if( disposeObj!=null )
                disposeObj.Dispose();
        }

        void CleanInnerWriter()
        {
            IDisposable disposeObj=innerWriter as IDisposable;
            innerWriter=null;
            if( disposeObj!=null )
                disposeObj.Dispose();            
        }

        void needInnerWriter()
        {
            if( isWriteCompleted )
                throw new InvalidOperationException("Cannot access internal StreamWriter after write response completed.");

            if( innerWriter==null )
                innerWriter=new StreamWriter( OutputStream, m_ContentEncoding );
        }

        void setWriteStarted()
        {
            lock( handler.sync )
            {
                if( isWriteStarted )
                    return;

                isWriteStarted=true;

                if( m_Sink==null )
                    return;
            }

//            m_Sink.ReportProgress(
//                NativeMethods.BINDSTATUS.BINDSTATUS_VERIFIEDMIMETYPEAVAILABLE,
//                m_ContentType );

            if( !m_IsBuffered )
            {
#if TRACE_EXTERNAL_CALLS
                TraceHelper.TraceMethod(
                    "Sink.ReportData(BSCF_FIRSTDATANOTIFICATION, "+
                    (m_OutputStream==null ? 0 : m_OutputStream.InternalLength)+", 0)" );
                try
                {
#endif

                    m_Sink.ReportData(
                        NativeMethods.BSCF.BSCF_FIRSTDATANOTIFICATION, // | NativeMethods.BSCF.BSCF_AVAILABLEDATASIZEUNKNOWN,
                        m_OutputStream==null ? 0 : m_OutputStream.InternalLength,
                        0 );
#if TRACE_EXTERNAL_CALLS
                }
                catch( Exception reportDataError )
                {
                    TraceHelper.TraceException(
                        this,
                        reportDataError );
                    throw reportDataError;
                }
#endif

            }
        }

        internal void NotifySinkAbort(Exception abortException)
        {
            if( m_Sink==null )
                return;

            if( abortException==null )
                abortException=new Exception("Abort");

#if TRACE_EXTERNAL_CALLS
                TraceHelper.TraceMethod(
                    "Sink.ReportResult("+
                    Marshal.GetHRForException(abortException)+", 0, \""+abortException.Message+"\")" );
                try
                {
#endif

            m_Sink.ReportResult(
                Marshal.GetHRForException(abortException),
                0,
                abortException.Message );

#if TRACE_EXTERNAL_CALLS
                }
                catch( Exception reportResultError )
                {
                    TraceHelper.TraceException(
                        this,
                        reportResultError );
                    throw reportResultError;
                }
#endif
        }

        void SetReadFinish()
        {   
            lock( handler.sync )
                isReadFinished=true;

            if( m_Sink==null )
                return;

#if TRACE_EXTERNAL_CALLS
                TraceHelper.TraceMethod(
                    "Sink.ReportResult(0, 0, null)" );
                try
                {
#endif
            m_Sink.ReportResult( 0, 0, null);
#if TRACE_EXTERNAL_CALLS
                }
                catch( Exception reportResultError )
                {
                    TraceHelper.TraceException(
                        this,
                        reportResultError );
                    throw reportResultError;
                }
#endif
        }

        void NotifyWriteCompleted()
        {
            lock( handler.sync )
            {
                if( m_Sink==null )
                    return;
            }

            if( m_OutputStream!=null
                && m_OutputStream.InternalLength!=0 )
            {
                if( m_IsBuffered )
                {
#if TRACE_EXTERNAL_CALLS
                TraceHelper.TraceMethod(
                    "Sink.ReportData(BSCF_INTERMEDIATEDATANOTIFICATION | BSCF_LASTDATANOTIFICATION, "+
                    (m_OutputStream==null ? 0 : m_OutputStream.InternalLength)+", 0)" );
                try
                {
#endif
                    m_Sink.ReportData(
                        NativeMethods.BSCF.BSCF_INTERMEDIATEDATANOTIFICATION | NativeMethods.BSCF.BSCF_LASTDATANOTIFICATION,
                        m_OutputStream==null ? 0 : m_OutputStream.InternalLength,
                        0 );
#if TRACE_EXTERNAL_CALLS
                }
                catch( Exception reportDataError )
                {
                    TraceHelper.TraceException(
                        this,
                        reportDataError );
                    throw reportDataError;
                }
#endif
                }
                else
                {
#if TRACE_EXTERNAL_CALLS
                TraceHelper.TraceMethod(
                    "Sink.ReportData(BSCF_INTERMEDIATEDATANOTIFICATION | BSCF_LASTDATANOTIFICATION | BSCF_DATAFULLYAVAILABLE, "+
                    (m_OutputStream==null ? 0 : m_OutputStream.InternalLength)+", 0)" );
                try
                {
#endif
                    m_Sink.ReportData(
                        NativeMethods.BSCF.BSCF_FIRSTDATANOTIFICATION | NativeMethods.BSCF.BSCF_LASTDATANOTIFICATION | NativeMethods.BSCF.BSCF_DATAFULLYAVAILABLE,
                        m_OutputStream==null ? 0 : m_OutputStream.InternalLength,
                        m_OutputStream==null ? 0 : m_OutputStream.InternalLength );
#if TRACE_EXTERNAL_CALLS
                }
                catch( Exception reportDataError )
                {
                    TraceHelper.TraceException(
                        this,
                        reportDataError );
                    throw reportDataError;
                }
#endif
                }
            }
            else
            {
                SetReadFinish();
            }
//            m_Sink.ReportProgress(
//                NativeMethods.BINDSTATUS.BINDSTATUS_DOWNLOADINGDATA,
//                "continue" );
            
            //m_Sink.ReportResult( 0, 0, null);
        }

        internal int ProtocolRead( IntPtr pv, int cb, out int pcbRead )
        {
            lock( handler.sync )
            {
                if( isReadFinished )
                {
                    pcbRead=0;
                    return 1; // S_FALSE (completed)
                }

                if( m_OutputStream==null )
                {
                    pcbRead=0;
                    return 0; // S_OK (continue)
                }

                pcbRead=Math.Min(
                    cb,
                    m_OutputStream.InternalLength-m_OutputStream.ProtocolReadPosition );

                if( pcbRead>0 )
                {
                    Marshal.Copy(
                        m_OutputStream.Buffer, m_OutputStream.ProtocolReadPosition,
                        pv, pcbRead );
                    m_OutputStream.ProtocolReadPosition+=pcbRead;

                }
            }

            if( isWriteCompleted
                && m_OutputStream.ProtocolReadPosition==m_OutputStream.InternalLength )
            {
                SetReadFinish();
                return 1;
            }
            else
            {
                return 0;
            }
        }
    }
}
