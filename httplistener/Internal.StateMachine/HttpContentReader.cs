using System;
using System.Collections.Generic;
using System.Text;

namespace Mihailik.Net.Internal.StateMachine
{
    internal sealed class HttpContentReader
    {
        enum ReaderState
        {
            ConnectionCloseReading,

            ContentLengthReading, ContentLengthReadFinished,

            ChunkSizeExpected,
            ChunkSizeLFExpected,
            ChunkData,
            ChunkDataCRExpected,
            ChunkDataLFExpected,
            ChunkedSkipHeadersExpected,
            ChunkedSkipHeaders,
            ChunkedSkipHeadersLFExpected,
            ChunkedFinishLFExpected,
            ChunkedReadFinished
        }

        const byte CR = (byte)'\r';
        const byte LF = (byte)'\n';
        const byte Space = (byte)' ';
        const byte TAB = (byte)'\t';
        const byte Colon = (byte)':';
        const byte Percent = (byte)'%';
        const byte Digit0 = (byte)'0';
        const byte Digit9 = (byte)'9';
        const byte SmallA = (byte)'a';
        const byte SmallF = (byte)'f';
        const byte BigA = (byte)'A';
        const byte BigF = (byte)'F';

        const int MaxChunkSize = 1024 * 1024 * 128;

        ReaderState currentState;
        string m_FailureDescription;
        int m_ReadByteCount;
        List<ArraySegment<byte>> m_DataChunks = new List<ArraySegment<byte>>();
        long contentLength;
        int chunkSize;
        int chunkReadSize;
        int chunkSizeDigitCount;

        private HttpContentReader(ReaderState currentState)
        {
            this.currentState = currentState;
        }

        public int Read(byte[] buffer, int offset, int length)
        {
            if (this.IsFailed)
                throw new InvalidOperationException("Reader already finished.");

            m_DataChunks.Clear();
            int readCount = 0;

            byte nextByte = buffer[offset + readCount];

            switch (currentState)
            {
                case ReaderState.ConnectionCloseReading:
                    m_ReadByteCount += length;
                    m_DataChunks.Add(new ArraySegment<byte>(buffer, offset, length));
                    return length;

                case ReaderState.ContentLengthReading:
                    readCount = (int)Math.Min(length, contentLength - this.ReadByteCount);
                    m_ReadByteCount += readCount;
                    m_DataChunks.Add(new ArraySegment<byte>(buffer, offset, length));

                    if (this.ReadByteCount == contentLength)
                        currentState = ReaderState.ContentLengthReadFinished;
                    return readCount;

                case ReaderState.ContentLengthReadFinished:
                    throw new InvalidOperationException("Reader already finished.");

                case ReaderState.ChunkSizeExpected:
                    if (nextByte == CR)
                    {
                        currentState = ReaderState.ChunkSizeLFExpected;
                        readCount++;
                        if (readCount == length)
                        {
                            m_ReadByteCount += readCount;
                            return readCount;
                        }
                        nextByte = buffer[offset + readCount];
                        goto case ReaderState.ChunkSizeLFExpected;
                    }
                    else if (nextByte >= Digit0 && nextByte <= Digit9)
                    {
                        chunkSizeDigitCount++;
                        chunkSize = chunkSize * 16 + nextByte - Digit0;
                    }
                    else if (nextByte >= SmallA && nextByte <= SmallF)
                    {
                        chunkSizeDigitCount++;
                        chunkSize = chunkSize * 16 + nextByte - SmallA + 0xa;
                    }
                    else if (nextByte >= BigA && nextByte <= BigF)
                    {
                        chunkSizeDigitCount++;
                        chunkSize = chunkSize * 16 + nextByte - SmallA + 0xa;
                    }
                    else
                    {
                        m_FailureDescription = "Invalid character in chunk size.";
                        m_ReadByteCount += readCount;
                        return readCount;
                    }

                    if (chunkSize > MaxChunkSize)
                    {
                        m_FailureDescription = "Chunk size too big.";
                        m_ReadByteCount += readCount;
                        return readCount;
                    }
                    readCount++;
                    if (readCount == length)
                    {
                        m_ReadByteCount += readCount;
                        return readCount;
                    }
                    nextByte = buffer[offset + readCount];
                    goto case ReaderState.ChunkSizeExpected;


                case ReaderState.ChunkSizeLFExpected:
                    if (nextByte == LF)
                    {
                        readCount++;

                        if (chunkSizeDigitCount == 0)
                        {
                            m_FailureDescription = "Empty chunk size found.";
                            m_ReadByteCount += readCount;
                            return readCount;
                        }

                        if (chunkSize == 0)
                        {
                            currentState = ReaderState.ChunkedSkipHeadersExpected;
                            if (readCount == length)
                            {
                                m_ReadByteCount += readCount;
                                return readCount;
                            }
                            nextByte = buffer[offset + readCount];
                            goto case ReaderState.ChunkedSkipHeadersExpected;
                        }
                        else
                        {
                            currentState = ReaderState.ChunkData;
                            if (readCount == length)
                            {
                                m_ReadByteCount += readCount;
                                return readCount;
                            }
                            nextByte = buffer[offset + readCount];
                            goto case ReaderState.ChunkData;
                        }
                    }
                    else
                    {
                        m_FailureDescription = "LF expected after CR as the end of chunk size line.";
                        m_ReadByteCount += readCount;
                        return readCount;
                    }

                case ReaderState.ChunkData:
                    int dataOffset = offset + readCount;
                    int dataLength = Math.Min(length - readCount, chunkSize - chunkReadSize);
                    chunkReadSize += dataLength;
                    readCount += dataLength;
                    m_DataChunks.Add(new ArraySegment<byte>(buffer, dataOffset, dataLength));

                    if (chunkReadSize == chunkSize)
                    {
                        chunkSize = 0;
                        chunkSizeDigitCount = 0;
                        chunkReadSize = 0;
                        currentState = ReaderState.ChunkDataCRExpected;

                        if (readCount == length)
                        {
                            m_ReadByteCount += readCount;
                            return readCount;
                        }
                        nextByte = buffer[offset + readCount];
                        goto case ReaderState.ChunkDataCRExpected;
                    }
                    else
                    {
                        m_ReadByteCount += readCount;
                        return readCount;
                    }

                case ReaderState.ChunkDataCRExpected:
                    if (nextByte == CR)
                    {
                        readCount++;
                        currentState = ReaderState.ChunkDataLFExpected;
                        if (readCount == length)
                        {
                            m_ReadByteCount += readCount;
                            return readCount;
                        }
                        nextByte = buffer[offset + readCount];
                        goto case ReaderState.ChunkDataLFExpected;
                    }
                    else
                    {
                        m_FailureDescription = "CR/LF expected after the chunk data.";
                        m_ReadByteCount += readCount;
                        return readCount;
                    }

                case ReaderState.ChunkDataLFExpected:
                    if (nextByte == CR)
                    {
                        readCount++;
                        currentState = ReaderState.ChunkSizeExpected;
                        if (readCount == length)
                        {
                            m_ReadByteCount += readCount;
                            return readCount;
                        }
                        nextByte = buffer[offset + readCount];
                        goto case ReaderState.ChunkSizeExpected;
                    }
                    else
                    {
                        m_FailureDescription = "LF expected after CR after the chunk data.";
                        m_ReadByteCount += readCount;
                        return readCount;
                    }

                case ReaderState.ChunkedSkipHeadersExpected:
                    if (nextByte == CR)
                    {
                        currentState = ReaderState.ChunkedFinishLFExpected;
                        readCount++;
                        if (readCount == length)
                        {
                            m_ReadByteCount += readCount;
                            return readCount;
                        }
                        nextByte = buffer[offset + readCount];
                        goto case ReaderState.ChunkedFinishLFExpected;
                    }
                    else
                    {
                        currentState = ReaderState.ChunkedSkipHeaders;
                        readCount++;
                        if (readCount == length)
                        {
                            m_ReadByteCount += readCount;
                            return readCount;
                        }
                        nextByte = buffer[offset + readCount];
                        goto case ReaderState.ChunkedSkipHeaders;
                    }

                case ReaderState.ChunkedSkipHeaders:
                    if (nextByte == CR)
                    {
                        currentState = ReaderState.ChunkedSkipHeadersLFExpected;
                        readCount++;
                        if (readCount == length)
                        {
                            m_ReadByteCount += readCount;
                            return readCount;
                        }
                        nextByte = buffer[offset + readCount];
                        goto case ReaderState.ChunkedSkipHeadersLFExpected;
                    }
                    else if (nextByte < 32 && nextByte != (byte)'\t')
                    {
                        m_FailureDescription = "Invalid symbol in trailing headers.";
                        m_ReadByteCount += readCount;
                        return readCount;
                    }
                    else
                    {
                        readCount++;
                        if (readCount == length)
                        {
                            m_ReadByteCount += readCount;
                            return readCount;
                        }
                        nextByte = buffer[offset + readCount];
                        goto case ReaderState.ChunkedSkipHeaders;
                    }

                case ReaderState.ChunkedSkipHeadersLFExpected:
                    if (nextByte == LF)
                    {
                        currentState = ReaderState.ChunkedSkipHeadersExpected;
                        readCount++;
                        if (readCount == length)
                        {
                            m_ReadByteCount += readCount;
                            return readCount;
                        }
                        nextByte = buffer[offset + readCount];
                        goto case ReaderState.ChunkedSkipHeadersExpected;
                    }
                    else
                    {
                        m_FailureDescription = "LF expected as part of CR/LF sequence after the trailing headers.";
                        m_ReadByteCount += readCount;
                        return readCount;
                    }

                case ReaderState.ChunkedFinishLFExpected:
                    if (nextByte == LF)
                    {
                        currentState = ReaderState.ChunkedReadFinished;
                        readCount++;
                        m_ReadByteCount += readCount;
                        return readCount;
                    }
                    else
                    {
                        m_FailureDescription = "LF expected as part of CR/LF sequence at the end of the content.";
                        m_ReadByteCount += readCount;
                        return readCount;
                    }


                case ReaderState.ChunkedReadFinished:
                    throw new InvalidOperationException("Reader already finished.");

                default:
                    throw new InvalidOperationException();
            }
        }

        public bool IsFailed { get { return m_FailureDescription != null; } }
        public bool IsSucceed { get { return currentState == ReaderState.ContentLengthReadFinished || currentState == ReaderState.ChunkedReadFinished; } }
        public string FailureDescription { get { return m_FailureDescription; } }
        public int ReadByteCount { get { return m_ReadByteCount; } }

        public List<ArraySegment<byte>> DataChunks { get { return m_DataChunks; } }

        public static HttpContentReader CreateConnectionClose()
        {
            HttpContentReader result = new HttpContentReader(ReaderState.ConnectionCloseReading);
            return result;
        }

        public static HttpContentReader CreateContentLength(long contentLength)
        {
            HttpContentReader result = new HttpContentReader(ReaderState.ContentLengthReading);
            result.contentLength = contentLength;
            return result;
        }

        public static HttpContentReader CreateChunked()
        {
            HttpContentReader result = new HttpContentReader(ReaderState.ChunkSizeExpected);
            return result;
        }
    }
}