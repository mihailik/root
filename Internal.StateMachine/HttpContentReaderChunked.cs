using System;
using System.Collections.Generic;
using System.Text;

namespace Mihailik.Net.Internal.StateMachine
{
    partial class HttpContentReader
    {
        enum ChunkedReaderState
        {
            ChunkSizeExpected,
            ChunkSizeLFExpected,
            ChunkData,
            ChunkDataCRExpected,
            ChunkDataLFExpected,
            SkipHeadersExpected,
            SkipHeaders,
            SkipHeadersLFExpected,
            FinishLFExpected,
            Complete
        }

        ChunkedReaderState currentChunkedReaderState;
        int chunkSize;
        int chunkSizeDigitCount;
        int chunkReadSize;
        const int MaxChunkSize = 1024 * 1024 * 128;

        IEnumerable<ArraySegment<byte>> ReadChunked(byte[] buffer, int offset, int length)
        {
            throw new NotImplementedException();
        }
    }
}
