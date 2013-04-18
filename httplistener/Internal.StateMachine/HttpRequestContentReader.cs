using System;
using System.Collections.Generic;
using System.Text;

namespace Mihailik.Net.Internal.StateMachine
{
	public sealed partial class HttpRequestContentReader
	{
		readonly int contentLength;
		int readLength;

		readonly HttpRequestContentReaderChunked chunkedReader;

		private HttpRequestContentReader(int contentLength, bool chunked)
		{
			this.contentLength = contentLength;
			if( chunked )
				this.chunkedReader = new HttpRequestContentReaderChunked();
		}

		public HttpRequestContentChunk Read(byte[] buffer, int offset, int length)
		{
			if( buffer == null )
				throw new ArgumentNullException("buffer");
			if( offset < 0 || offset >= buffer.Length )
				throw new ArgumentOutOfRangeException("offset", offset, "Offset should be within the buffer size.");

			if( length <= 0 || offset + length > buffer.Length )
				throw new ArgumentOutOfRangeException("length", offset, "Length should be within the buffer size and greater than zero.");

			if( chunkedReader == null )
			{
				if( contentLength == 0 )
				{
					return HttpRequestContentChunk.CreateReadSucceedMoreExpected(offset, length, length);
				}
				else
				{
					int moreLength = Math.Min(contentLength - readLength, length);
					readLength += moreLength;

					if( contentLength == readLength )
						return HttpRequestContentChunk.CreateReadSucceedFinished(offset, moreLength, moreLength);
					else
						return HttpRequestContentChunk.CreateReadSucceedMoreExpected(offset, moreLength, moreLength);
				}
			}
			else
			{
				return chunkedReader.Read(buffer, offset, length);
			}
		}

		public static HttpRequestContentReader CreateConnectionClose()
		{
			return new HttpRequestContentReader(0, false);
		}

		public static HttpRequestContentReader CreateContentLength(int contentLength)
		{
			return new HttpRequestContentReader(contentLength, false);
		}

		public static HttpRequestContentReader CreateChunked()
		{
			return new HttpRequestContentReader(0, true);
		}
	}
}
