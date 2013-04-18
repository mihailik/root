using System;
using System.Threading;

namespace Mihailik.Collections
{
    public static class NoWaitHandle
    {
        static readonly AlwaysOnWaitHandle m_Instance = new AlwaysOnWaitHandle();

        public static WaitHandle Instance { get { return m_Instance; } }

        private sealed class AlwaysOnWaitHandle : WaitHandle
        {
            static readonly ManualResetEvent alwaysSetEvent = new ManualResetEvent(true);

            public AlwaysOnWaitHandle()
            {
                base.SafeWaitHandle = alwaysSetEvent.SafeWaitHandle;
            }

            public override bool WaitOne() { return true; }
            public override bool WaitOne(int millisecondsTimeout, bool exitContext) { return true; }
            public override bool WaitOne(TimeSpan timeout, bool exitContext) { return true; }

            protected override void Dispose(bool explicitDisposing)
            {
                return;
            }
        }
    }
}