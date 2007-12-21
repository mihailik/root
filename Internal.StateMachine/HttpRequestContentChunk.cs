using System;
using System.Collections.Generic;
using System.Text;

namespace Mihailik.Net.Internal.StateMachine
{
	public struct HttpRequestContentChunk
	{
		private readonly string m_FailureDescription;
		private readonly int m_DataOffset;
		private readonly int m_DataLength;
		private readonly int m_RawChunkLength;
		private readonly bool m_MoreExpected;

		private HttpRequestContentChunk(
			string failureDescription,
			int dataOffset,
			int dataLength,
			int rawChunkLength,
			bool moreExpected)
		{
			this.m_FailureDescription = failureDescription;
			this.m_DataOffset = dataOffset;
			this.m_DataLength = dataLength;
			this.m_RawChunkLength = rawChunkLength;
			this.m_MoreExpected = moreExpected;
		}

		public bool IsFailed
		{
			get { return this.m_FailureDescription != null; }
		}

		public string FailureDescription
		{
			get { return m_FailureDescription; }
		}

		public int DataOffset
		{
			get { return m_DataOffset; }
		}

		public int DataLength
		{
			get { return m_DataLength; }
		}

		public int RawChunkLength
		{
			get { return m_RawChunkLength; }
		}

		public bool MoreExpected
		{
			get { return m_MoreExpected; }
		}

		public static HttpRequestContentChunk CreateFailure(string failureDescription)
		{
			return new HttpRequestContentChunk(
				failureDescription,
				-1, -1, -1, false);
		}

		public static HttpRequestContentChunk CreateReadSucceedMoreExpected(int dataOffset, int dataLength, int rawChunkLength)
		{
			return new HttpRequestContentChunk(
				null,
				dataOffset,
				dataLength,
				rawChunkLength,
				true);
		}

		public static HttpRequestContentChunk CreateReadSucceedFinished(int dataOffset, int dataLength, int rawChunkLength)
		{
			return new HttpRequestContentChunk(
				null,
				dataOffset,
				dataLength,
				rawChunkLength,
				false);
		}
	}
}
