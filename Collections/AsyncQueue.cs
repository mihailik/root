using System;
using System.Collections.Generic;
using System.Threading;

namespace Mihailik.Collections
{
    public sealed partial class AsyncQueue<T>
    {
        readonly object InternalSyncRoot = new object();

        readonly Queue<T> InnerQueue;
        readonly Queue<WaitingAsyncResult> waitingRequestQueue = new Queue<WaitingAsyncResult>();
        readonly List<AsyncResultBase> completedRequests = new List<AsyncResultBase>();

        bool m_SynchronousCallbacks = true;

        public AsyncQueue()
        {
            InnerQueue = new Queue<T>();
        }

        public AsyncQueue(IEnumerable<T> items)
        {
            InnerQueue = new Queue<T>(items);
        }

        public AsyncQueue(int capacity)
        {
            InnerQueue = new Queue<T>(capacity);
        }

        public bool SynchronousCallbacks
        {
            get { return m_SynchronousCallbacks; }
            set { m_SynchronousCallbacks = value; }
        }


        public T[] DequeueAll()
        {
            lock( InternalSyncRoot )
            {
                T[] result = InnerQueue.ToArray();
                InnerQueue.Clear();
                return result;
            }
        }

        public void Enqueue(T item)
        {
            lock( InternalSyncRoot )
            {
                if( waitingRequestQueue.Count > 0 )
                {
                    WaitingAsyncResult request = waitingRequestQueue.Dequeue();                   
                    request.ResultItem = item;
                    completedRequests.Add(request);
                    request.InternalSetCompletedInvokeCallback();
                }
                else
                {
                    InnerQueue.Enqueue(item);
                }
            }
        }

        public T Dequeue()
        {
            return EndDequeue(BeginDequeue(null, null));
        }

        public IAsyncResult BeginDequeue(AsyncCallback callback, object state)
        {
            lock( InternalSyncRoot )
            {
                if( InnerQueue.Count > 0 )
                {
                    T item = InnerQueue.Dequeue();
                    AlreadyCompletedAsyncResult result = new AlreadyCompletedAsyncResult(callback, state, item);
                    result.SynchronousCallbacks = this.m_SynchronousCallbacks;
                    result.InternalSetCompletedInvokeCallback();
                    completedRequests.Add(result);
                    return result;
                }
                else
                {
                    WaitingAsyncResult result = new WaitingAsyncResult(callback, state, this.InternalSyncRoot);
                    result.SynchronousCallbacks = this.m_SynchronousCallbacks;
                    waitingRequestQueue.Enqueue(result);
                    return result;
                }
            }
        }

        public T EndDequeue(IAsyncResult ar)
        {
            if( ar == null )
                throw new ArgumentNullException("ar");

            lock( InternalSyncRoot )
            {
                AsyncResultBase asyncResult = ar as AsyncResultBase;
                if( asyncResult == null )
                    throw new ArgumentException("Only instances returned from BeginDequeue may be used as EndDequeue arguments.", "ar");

                if( completedRequests.Contains(asyncResult) )
                {
                    completedRequests.Remove(asyncResult);
                    return asyncResult.ResultItem;
                }
                else
                {
                    WaitingAsyncResult waitingResult = asyncResult as WaitingAsyncResult;
                    if( waitingResult==null
                        || waitingRequestQueue.Contains(waitingResult)==false )
                        throw new ArgumentException("Only instances returned from BeginDequeue of same queue may be used as EndDequeue arguments.", "ar");

                    while( true )
                    {
                        Monitor.Wait(InternalSyncRoot);
                        if( completedRequests.Contains(asyncResult) )
                        {
                            completedRequests.Remove(asyncResult);
                            return asyncResult.ResultItem;
                        }
                    }
                }
            }
        }
    }
}
