using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;

namespace Mihailik.Net
{
    internal sealed class AsyncResult : IAsyncResult
    {
        readonly object syncRoot;
        readonly object m_AsyncState;
        readonly AsyncCallback callback;
        WaitHandle m_AsyncWaitHandle;

        Exception error;

        public AsyncResult(object syncRoot, AsyncCallback callback, object state)
        {
            this.syncRoot = syncRoot;
            this.callback = callback;
            this.m_AsyncState = state;
        }

        public object AsyncState { get { return this.m_AsyncState; } }
        public bool CompletedSynchronously { get; internal set; }
        public bool IsCompleted { get; private set; }

        public WaitHandle AsyncWaitHandle
        {
            get
            {
                if (m_AsyncWaitHandle == null)
                {
                    lock (syncRoot)
                    {
                        if (this.IsCompleted)
                            m_AsyncWaitHandle = Mihailik.Collections.NoWaitHandle.Instance;
                        else
                            m_AsyncWaitHandle = new ManualResetEvent(false);
                    }
                }
                return m_AsyncWaitHandle;
            }
        }

        public void CompleteSuccessfully()
        {
            lock (syncRoot)
            {
                this.IsCompleted = true;
                Monitor.PulseAll(syncRoot);
            }
        }

        public void CompleteWithError(Exception error)
        {
            lock (syncRoot)
            {
                this.IsCompleted = true;
                this.error = error;
                Monitor.PulseAll(syncRoot);
            }
        }

        public void EndAction()
        {
            while (!this.IsCompleted)
            {
                Monitor.Wait(syncRoot);
            }

            if (this.error != null)
                throw error;
        }
    }
}
