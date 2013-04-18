using System;
using System.Threading;

namespace Mihailik.Collections
{
    partial class AsyncQueue<T>
    {
        private sealed class WaitingAsyncResult : AsyncResultBase
        {
            readonly object InternalSyncRoot;
            WaitHandle m_AsyncWaitHandle;
            bool m_IsCompleted;

            public WaitingAsyncResult(AsyncCallback callback, object state, object internalSyncRoot)
                :base(callback,state)
            {
                if( internalSyncRoot == null )
                    throw new ArgumentNullException("internalSyncRoot");

                this.InternalSyncRoot = internalSyncRoot;
            }

            public override WaitHandle AsyncWaitHandle
            {
                get
                {
                    if( m_AsyncWaitHandle == null )
                    {
                        lock( InternalSyncRoot )
                        {
                            if( this.IsCompleted )
                                m_AsyncWaitHandle = NoWaitHandle.Instance;
                            else
                                m_AsyncWaitHandle = new ManualResetEvent(false);
                        }
                    }
                    return m_AsyncWaitHandle;
                }
            }

            public override bool CompletedSynchronously
            {
                get { return false; }
            }

            public override bool IsCompleted
            {
                get
                {
                    lock( InternalSyncRoot )
                    {
                        return m_IsCompleted;
                    }
                }
            }

            internal override void InternalSetCompletedInvokeCallback()
            {
                lock( InternalSyncRoot )
                {
                    if( this.IsCompleted )
                        throw new InvalidOperationException("Already transited to completed state.");

                    m_IsCompleted = true;
                    if( m_AsyncWaitHandle != null )
                    {
                        ManualResetEvent evtHandle = (ManualResetEvent)m_AsyncWaitHandle;
                        evtHandle.Set();
                    }

                    Monitor.PulseAll(InternalSyncRoot);

                    // It is important to fire callback after evtHandle.Set() when FastAsyncCallbacks set to TRUE
                    InvokeCallback();
                }
            }
        }
    }
}