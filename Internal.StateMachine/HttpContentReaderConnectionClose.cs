using System;
using System.Collections.Generic;
using System.Text;

namespace Mihailik.Net.Internal.StateMachine
{
    partial class HttpContentReader
    {
        private struct HttpContentReaderConnectionClose
        {
            public IEnumerable<ArraySegment<byte>> Read(byte[] buffer, int offset, int length)
            {
                throw new NotImplementedException();
            }
        }
    }
}
