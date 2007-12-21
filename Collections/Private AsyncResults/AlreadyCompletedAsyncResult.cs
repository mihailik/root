using System;
using System.Threading;

namespace Mihailik.Collections
{
    partial class AsyncQueue<T>
    {
        private sealed class AlreadyCompletedAsyncResult : AsyncResultBase
        {
            public AlreadyCompletedAsyncResult(AsyncCallback callback, object state, T resultItem)
                : base(callback, state)
            {
                this.ResultItem = resultItem;
            }

            public override WaitHandle AsyncWaitHandle
            {
                get { return NoWaitHandle.Instance; }
            }

            public override bool CompletedSynchronously { get { return true; } }
            public override bool IsCompleted { get { return true; } }

            internal override void InternalSetCompletedInvokeCallback()
            {
                InvokeCallback();
            }
        }
    }
}