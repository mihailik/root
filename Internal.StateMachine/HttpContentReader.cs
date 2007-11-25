using System;
using System.Collections.Generic;
using System.Text;

namespace Mihailik.Net.Internal.StateMachine
{
    internal sealed partial class HttpContentReader
    {
        enum ReaderKind
        {

        }

        public IEnumerable<ArraySegment<byte>> Read(byte[] buffer, int offset, int length)
        {
            throw new NotImplementedException();
        }
    }
}
