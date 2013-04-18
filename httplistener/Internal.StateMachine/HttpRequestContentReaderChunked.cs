using System;
using System.Collections.Generic;
using System.Text;

namespace Mihailik.Net.Internal.StateMachine
{
	public sealed partial class HttpRequestContentReader
	{
		private class HttpRequestContentReaderChunked
		{
			const byte CR = (byte)'\r';
			const byte LF = (byte)'\n';
			const byte Digit0 = (byte)'0';
			const byte Digit9 = (byte)'9';
			const byte SmallA = (byte)'a';
			const byte SmallF = (byte)'f';
			const byte BigA = (byte)'A';
			const byte BigF = (byte)'F';


			enum ParserState
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

			ParserState currentState;
			int chunkSize;
			int chunkSizeDigitCount;
			int chunkReadSize;
			const int MaxChunkSize = 1024 * 1024 * 128;

			public HttpRequestContentChunk Read(byte[] buffer, int offset, int length)
			{
				int dataOffset = 0;
				int dataLength = 0;

				int parsedCount =0;

			ContinueParse:
				while( parsedCount < length )
				{
					switch( currentState )
					{
						case ParserState.ChunkSizeExpected:
							for( int i = 0; i < length - parsedCount; i++ )
							{
								byte b = buffer[offset + parsedCount + i];
								if( b == CR )
								{
									currentState = ParserState.ChunkSizeLFExpected;
									parsedCount += i+1;
									goto ContinueParse;
								}
								else if( b >= Digit0 && b <= Digit9 )
								{
									chunkSizeDigitCount++;
									chunkSize = chunkSize * 16 + b - Digit0;
									if( chunkSize > MaxChunkSize )
										return HttpRequestContentChunk.CreateFailure("Chunk size too big.");
								}
								else if( b >= SmallA && b <= SmallF )
								{
									chunkSizeDigitCount++;
									chunkSize = chunkSize * 16 + b - SmallA + 0xa;
									if( chunkSize > MaxChunkSize )
										return HttpRequestContentChunk.CreateFailure("Chunk size too big.");
								}
								else if( b >= BigA && b <= BigF )
								{
									chunkSizeDigitCount++;
									chunkSize = chunkSize * 16 + b - SmallA + 0xa;
									if( chunkSize > MaxChunkSize )
										return HttpRequestContentChunk.CreateFailure("Chunk size too big.");
								}
								else
								{
									return HttpRequestContentChunk.CreateFailure("Unknown symbol in chunk size.");
								}
							}
							parsedCount = length;
							break;

						case ParserState.ChunkSizeLFExpected:
							{
								byte b = buffer[offset + parsedCount];
								if( b == LF )
								{
									parsedCount++;

									if( chunkSizeDigitCount == 0 )
										return HttpRequestContentChunk.CreateFailure("Empty chunk size found.");

									if( chunkSize == 0 )
									{
										currentState = ParserState.SkipHeadersExpected;
									}
									else
									{
										currentState = ParserState.ChunkData;
									}

									goto ContinueParse;
								}
								else
								{
									return HttpRequestContentChunk.CreateFailure("LF expected after CR as the end of chunk size line.");
								}
							}

						case ParserState.ChunkData:
							if( dataLength == 0 )
							{
								dataOffset = offset + parsedCount;
								dataLength = Math.Min(length - parsedCount, chunkSize-chunkReadSize);
								chunkReadSize += dataLength;

								parsedCount += dataLength;

								if( chunkReadSize < chunkSize )
								{
									return HttpRequestContentChunk.CreateReadSucceedMoreExpected(dataOffset, dataLength, parsedCount);
								}
								else
								{
									chunkSize = 0;
									chunkSizeDigitCount = 0;
									chunkReadSize = 0;
									currentState = ParserState.ChunkDataCRExpected;
									goto ContinueParse;
								}
							}
							else
							{
								return HttpRequestContentChunk.CreateReadSucceedMoreExpected(dataOffset, dataLength, parsedCount);
							}

						case ParserState.ChunkDataCRExpected:
							{
								byte b = buffer[offset + parsedCount];
								if( b == CR )
								{
									parsedCount++;
									currentState = ParserState.ChunkDataLFExpected;
									goto ContinueParse;
								}
								else
								{
									return HttpRequestContentChunk.CreateFailure("CR/LF expected after the chunk data.");
								}
							}

						case ParserState.ChunkDataLFExpected:
							{
								byte b = buffer[offset + parsedCount];
								if( b == LF )
								{
									parsedCount++;
									currentState = ParserState.ChunkSizeExpected;
									goto ContinueParse;
								}
								else
								{
									return HttpRequestContentChunk.CreateFailure("LF expected as part of CR/LF sequence after the chunk data.");
								}
							}

						case ParserState.SkipHeadersExpected:
							{
								byte b = buffer[offset + parsedCount];
								if( b == CR )
								{
									parsedCount++;
									currentState = ParserState.FinishLFExpected;
									goto ContinueParse;
								}
								else
								{
									parsedCount++;
									currentState = ParserState.SkipHeaders;
									goto ContinueParse;
								}
							}

						case ParserState.SkipHeaders:
							{
								for( int i = 0; i < length - parsedCount; i++ )
								{
									byte b = buffer[offset + parsedCount + i];
									if( b == CR )
									{
										parsedCount += i + 1;
										currentState = ParserState.SkipHeadersLFExpected;
										goto ContinueParse;
									}
									else if( b < 32 && b != (byte)'\t' )
									{
										return HttpRequestContentChunk.CreateFailure("Invalid symbol in trailing headers.");
									}
								}
							}
							break;

						case ParserState.SkipHeadersLFExpected:
							{
								byte b = buffer[offset + parsedCount];
								if( b == LF )
								{
									parsedCount++;
									currentState = ParserState.SkipHeadersExpected;
									goto ContinueParse;
								}
								else
								{
									return HttpRequestContentChunk.CreateFailure("LF expected as part of CR/LF sequence after the trailing headers.");
								}
							}

						case ParserState.FinishLFExpected:
							{
								byte b = buffer[offset + parsedCount];
								if( b == LF )
								{
									parsedCount++;
									currentState = ParserState.Complete;
									return HttpRequestContentChunk.CreateReadSucceedFinished(
										dataOffset,
										dataLength,
										parsedCount);
								}
								else
								{
									return HttpRequestContentChunk.CreateFailure("LF expected as part of CR/LF sequence at the end of the content.");
								}
							}

						case ParserState.Complete:
							return HttpRequestContentChunk.CreateReadSucceedFinished(
								dataOffset,
								dataLength,
								parsedCount);
					}
				}

				return HttpRequestContentChunk.CreateReadSucceedMoreExpected(
					dataOffset,
					dataLength,
					parsedCount);
			}
		}
	}
}
