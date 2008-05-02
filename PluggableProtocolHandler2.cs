using System;
using System.Collections.Generic;
using System.Text;
using System.Runtime.InteropServices;
using System.IO;
using System.Diagnostics;

namespace Mihailik.InternetExplorer
{
    public abstract class PluggableProtocolHandler2 :
        NativeMethods.IInternetProtocol,
        NativeMethods.IInternetProtocolRoot
    {
        enum ProtocolState
        {
            Initialization,
            Initialized,
            Starting,
            Started,
            FirstPortionProduced,
            ProducingFinished,
            Terminated,
            Aborted
        }

        PluggableProtocolRequest2 m_Request;
        ProtocolState m_State;
        bool m_IsSuspended;
        bool m_IsRequestLocked;

        NativeMethods.IInternetProtocolSink m_Sink;
        NativeMethods.IInternetBindInfo m_BindInfo;
        NativeMethods.PI_FLAGS m_Flags;

        public bool IsSuspended
        {
            get { return m_IsSuspended; }
        }

        public bool IsRequestLocked
        {
            get { return m_IsRequestLocked; }
        }

        ProtocolState State
        {
            get { return m_State; }
            set
            {
                Debug.Assert((int)this.State <= (int)value);
                m_State = value;
            }
        }

        NativeMethods.IInternetProtocolSink Sink
        {
            get { return m_Sink; }
        }

        NativeMethods.IInternetBindInfo BindInfo
        {
            get { return m_BindInfo; }
        }

        void ReleaseComSinks()
        {
            if (m_Sink != null)
            {
                Marshal.ReleaseComObject(m_Sink);
                m_Sink = null;
            }

            if (m_BindInfo != null)
            {
                Marshal.ReleaseComObject(m_BindInfo);
                m_BindInfo = null;
            }
        }

        void StartCore(
            string szUrl,
            NativeMethods.IInternetProtocolSink pOIProtSink,
            NativeMethods.IInternetBindInfo pOIBindInfo,
            NativeMethods.PI_FLAGS grfPI,
            int dwReserved)
        {
            Uri url;
            string httpMethod;

            Uri.TryCreate(szUrl, UriKind.Absolute, out url);

            NativeMethods.BINDF bindf;
            NativeMethods.BINDINFO bindinfo = new NativeMethods.BINDINFO();
            bindinfo.cbSize = Marshal.SizeOf(typeof(NativeMethods.BINDINFO));

            //            string userAgent=GetBindString(
            //                bind,
            //                NativeMethods.BINDSTRING.BINDSTRING_USERAGENT );
            //
            //            System.Diagnostics.Trace.WriteLine(
            //                "useragent: "+GetBindString(bind,NativeMethods.BINDSTRING.BINDSTRING_USERAGENT)+"\r\n"+
            //                "url: "+GetBindString(bind,NativeMethods.BINDSTRING.BINDSTRING_URL)+"\r\n"+
            //                "post cookie: "+GetBindString(bind,NativeMethods.BINDSTRING.BINDSTRING_POST_COOKIE)+"\r\n"+
            //                "post MIME: "+GetBindString(bind,NativeMethods.BINDSTRING.BINDSTRING_POST_DATA_MIME) );

            pOIBindInfo.GetBindInfo(out bindf, ref bindinfo);

            switch (bindinfo.dwBindVerb)
            {
                case NativeMethods.BINDVERB.BINDVERB_GET:
                    httpMethod = "GET";
                    break;

                case NativeMethods.BINDVERB.BINDVERB_POST:
                    httpMethod = "POST";
                    break;

                case NativeMethods.BINDVERB.BINDVERB_PUT:
                    httpMethod = "PUT";
                    break;

                case NativeMethods.BINDVERB.BINDVERB_CUSTOM:
                    httpMethod = Marshal.PtrToStringUni(bindinfo.szCustomVerb);
                    break;

                default:
                    httpMethod = null;
                    break;
            }

            m_Request = new PluggableProtocolRequest2(
                szUrl,
                url,
                httpMethod,
                new MemoryStream(new byte[] { }, false));

            m_Sink = pOIProtSink;
            m_BindInfo = pOIBindInfo;
            m_Flags = grfPI;

            this.State = ProtocolState.Initialized;
        }

        void ContinueCore(ref NativeMethods.PROTOCOLDATA pProtocolData)
        {
        }

        void AbortCore(int hrReason, int dwOptions)
        {
            ReleaseComSinks();
            this.State = ProtocolState.Aborted;
        }

        void TerminateCore(int dwOptions)
        {
            ReleaseComSinks();
            this.State = ProtocolState.Terminated;
        }

        void SuspendCore()
        {
            this.m_IsSuspended = true;
        }

        void ResumeCore()
        {
            this.m_IsSuspended = false;
        }

        void ReadCore(IntPtr pv, int cb, out int pcbRead)
        {
            pcbRead = 0;
        }

        void SeekCore(long dlibMove, int dwOrigin, out long plibNewPosition)
        {
            plibNewPosition = 0;
        }

        void LockRequestCore(int dwOptions)
        {
            this.m_IsRequestLocked = true;
        }

        void UnlockRequestCore()
        {
            this.m_IsRequestLocked = false;
        }

        #region IInternetProtocol Members

        void NativeMethods.IInternetProtocol.Start(string szUrl, NativeMethods.IInternetProtocolSink pOIProtSink, NativeMethods.IInternetBindInfo pOIBindInfo, NativeMethods.PI_FLAGS grfPI, int dwReserved)
        {
            this.StartCore(szUrl, pOIProtSink, pOIBindInfo, grfPI, dwReserved);
        }

        void NativeMethods.IInternetProtocol.Continue(ref NativeMethods.PROTOCOLDATA pProtocolData)
        {
            this.ContinueCore(ref pProtocolData);
        }

        void NativeMethods.IInternetProtocol.Abort(int hrReason, int dwOptions)
        {
            this.AbortCore(hrReason, dwOptions);
        }

        void NativeMethods.IInternetProtocol.Terminate(int dwOptions)
        {
            this.TerminateCore(dwOptions);
        }

        void NativeMethods.IInternetProtocol.Suspend()
        {
            this.SuspendCore();
        }

        void NativeMethods.IInternetProtocol.Resume()
        {
            this.ResumeCore();
        }

        int NativeMethods.IInternetProtocol.Read(IntPtr pv, int cb, out int pcbRead)
        {
            this.ReadCore(pv, cb, out pcbRead);
            return 0;
        }

        void NativeMethods.IInternetProtocol.Seek(long dlibMove, int dwOrigin, out long plibNewPosition)
        {
            this.SeekCore(dlibMove, dwOrigin, out plibNewPosition);
        }

        void NativeMethods.IInternetProtocol.LockRequest(int dwOptions)
        {
            this.LockRequestCore(dwOptions);
        }

        void NativeMethods.IInternetProtocol.UnlockRequest()
        {
            this.UnlockRequestCore();
        }

        #endregion

        #region IInternetProtocolRoot Members

        void NativeMethods.IInternetProtocolRoot.Start(string szUrl, NativeMethods.IInternetProtocolSink pOIProtSink, NativeMethods.IInternetBindInfo pOIBindInfo, NativeMethods.PI_FLAGS grfPI, int dwReserved)
        {
            this.StartCore(szUrl, pOIProtSink, pOIBindInfo, grfPI, dwReserved);
        }

        void NativeMethods.IInternetProtocolRoot.Continue(ref NativeMethods.PROTOCOLDATA pProtocolData)
        {
            this.ContinueCore(ref pProtocolData);
        }

        void NativeMethods.IInternetProtocolRoot.Abort(int hrReason, int dwOptions)
        {
            this.AbortCore(hrReason, dwOptions);
        }

        void NativeMethods.IInternetProtocolRoot.Terminate(int dwOptions)
        {
            this.TerminateCore(dwOptions);
        }

        void NativeMethods.IInternetProtocolRoot.Suspend()
        {
            this.SuspendCore();
        }

        void NativeMethods.IInternetProtocolRoot.Resume()
        {
            this.ResumeCore();
        }

        #endregion
    }
}
