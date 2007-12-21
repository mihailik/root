using System;
using System.Threading;

namespace Mihailik.Collections
{
    partial class AsyncQueue<T>
    {
        private abstract class AsyncResultBase : IAsyncResult
        {
            readonly AsyncCallback m_Callback;
            readonly object m_AsyncState;

            public T ResultItem;
            public bool SynchronousCallbacks = true;

            protected AsyncResultBase(AsyncCallback callback, object state)
            {
                this.m_Callback = callback;
                this.m_AsyncState = state;
            }

            public object AsyncState
            {
                get { return m_AsyncState; }
            }

            public abstract WaitHandle AsyncWaitHandle { get; }
            public abstract bool CompletedSynchronously { get; }
            public abstract bool IsCompleted { get; }

            internal abstract void InternalSetCompletedInvokeCallback();

            protected void InvokeCallback()
            {
                if( this.m_Callback != null )
                {
                    if( SynchronousCallbacks )
                        InternalInvokeCallback(null);
                    else
                        ThreadPool.QueueUserWorkItem(InternalInvokeCallback);
                }
            }

            void InternalInvokeCallback(object dummy)
            {
                try { m_Callback(this); }
                catch { }
            }
        }
    }
}