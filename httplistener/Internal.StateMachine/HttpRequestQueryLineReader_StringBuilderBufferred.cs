using System;
using System.Collections.Generic;
using System.Text;

namespace Mihailik.Net.Internal.StateMachine
{
	public sealed class HttpRequestQueryLineReader_StringBuilderBufferred
	{
		enum ReaderState
		{
			Initial,
			Initial_CRExpectingLF,

			HttpMethod_Initial,
			HttpMethod_AfterG, HttpMethod_AfterGE, HttpMethod_AfterGET,
			HttpMethod_AfterP, HttpMethod_AfterPO, HttpMethod_AfterPOS, HttpMethod_AfterPOST,
			/*HttpMethod_AfterP,*/ HttpMethod_AfterPU, HttpMethod_AfterPUT,
			HttpMethod_AfterH, HttpMethod_AfterHE, HttpMethod_AfterHEA, HttpMethod_AfterHEAD,
			HttpMethod_ExpectingMore,
			HttpMethod_TrailingSpace,

			RawUrl,
			RawUrl_TrailingSpace,

			ProtocolVersion_H, ProtocolVersion_HT, ProtocolVersion_HTT, ProtocolVersion_HTTP, ProtocolVersion_HTTPSlash, ProtocolVersion_HTTPSlash1, ProtocolVersion_HTTPSlash1Dot,
			ProtocolVersion_HTTPSlash1Dot1,
			ProtocolVersion_HTTPSlash1Dot0,
			ProtocolVersion_TrailingSpace,
			ProtocolVersion_CRExpectingLF,

			Succeed,
			Failed
		}

		const byte CR = (byte)'\r';
		const byte LF = (byte)'\n';
		const byte Space = (byte)' ';
		const byte TAB = (byte)'\t';
		const byte Colon = (byte)':';
		const byte Percent = (byte)'%';

		ReaderState currentState;
		string m_HttpMethod;
		string m_RawUrl;
		Version m_ProtocolVersion;

		int m_ReadByteCount;
		string m_FailureDescription;

		StringBuilder buf;

		public void Read(byte[] buffer, int offset, int length)
		{
			int readCount = 0;
			byte nextByte = buffer[offset + readCount];

			int stringStartIndex = -1;

			switch( currentState )
			{
				#region Initial
				case ReaderState.Initial:
					if( nextByte == CR )
						goto case ReaderState.Initial_CRExpectingLF;
					else
						goto case ReaderState.HttpMethod_Initial;

				case ReaderState.Initial_CRExpectingLF:
					if( nextByte == LF )
					{
						goto case ReaderState.HttpMethod_Initial;
					}
					else
					{
						m_ReadByteCount += readCount;
						m_FailureDescription = "LF expected after CR at the first byte of request.";
						currentState = ReaderState.Failed;
						return;
					}
				#endregion

				#region HttpMethod
				case ReaderState.HttpMethod_Initial:
					if( nextByte == (byte)'G' )
					{
						readCount++;
						currentState = ReaderState.HttpMethod_AfterG;
						if( readCount >= length )
						{
							m_ReadByteCount += readCount;
							return;
						}
						nextByte = buffer[offset + readCount];
						goto case ReaderState.HttpMethod_AfterG;
					}
					else if( nextByte == (byte)'P' )
					{
						readCount++;
						currentState = ReaderState.HttpMethod_AfterP;
						if( readCount >= length )
						{
							m_ReadByteCount += readCount;
							return;
						}
						nextByte = buffer[offset + readCount];
						goto case ReaderState.HttpMethod_AfterP;
					}
					else if( nextByte == (byte)'H' )
					{
						readCount++;
						currentState = ReaderState.HttpMethod_AfterH;
						if( readCount >= length )
						{
							m_ReadByteCount += readCount;
							return;
						}
						nextByte = buffer[offset + readCount];
						goto case ReaderState.HttpMethod_AfterH;
					}
					else
					{
						stringStartIndex = offset + readCount;
						buf = new StringBuilder();

						currentState = ReaderState.HttpMethod_ExpectingMore;
						goto case ReaderState.HttpMethod_ExpectingMore;
					}

				#region GET
				case ReaderState.HttpMethod_AfterG:
					if( nextByte == (byte)'E' )
					{
						readCount++;
						currentState = ReaderState.HttpMethod_AfterGE;
						if( readCount >= length )
						{
							m_ReadByteCount += readCount;
							return;
						}
						nextByte = buffer[offset + readCount];
						goto case ReaderState.HttpMethod_AfterGE;
					}
					else
					{
						buf = new StringBuilder();
						buf.Append('G');

						currentState = ReaderState.HttpMethod_ExpectingMore;
						goto case ReaderState.HttpMethod_ExpectingMore;
					}

				case ReaderState.HttpMethod_AfterGE:
					if( nextByte == (byte)'T' )
					{
						readCount++;
						currentState = ReaderState.HttpMethod_AfterGET;
						if( readCount >= length )
						{
							m_ReadByteCount += readCount;
							return;
						}
						nextByte = buffer[offset + readCount];
						goto case ReaderState.HttpMethod_AfterGET;
					}
					else
					{
						buf = new StringBuilder();
						buf.Append("GE");

						currentState = ReaderState.HttpMethod_ExpectingMore;
						goto case ReaderState.HttpMethod_ExpectingMore;
					}

				case ReaderState.HttpMethod_AfterGET:
					if( nextByte == Space || nextByte == TAB )
					{
						m_HttpMethod = "GET";
						readCount++;
						currentState = ReaderState.HttpMethod_TrailingSpace;
						if( readCount >= length )
						{
							m_ReadByteCount += readCount;
							return;
						}
						goto case ReaderState.HttpMethod_TrailingSpace;
					}
					else
					{
						buf = new StringBuilder();
						buf.Append("GET");

						currentState = ReaderState.HttpMethod_ExpectingMore;
						goto case ReaderState.HttpMethod_ExpectingMore;
					}
				#endregion

				#region POST
				case ReaderState.HttpMethod_AfterP:
					if( nextByte == (byte)'O' )
					{
						readCount++;
						currentState = ReaderState.HttpMethod_AfterPO;
						if( readCount >= length )
						{
							m_ReadByteCount += readCount;
							return;
						}
						nextByte = buffer[offset + readCount];
						goto case ReaderState.HttpMethod_AfterPO;
					}
					else if( nextByte == (byte)'U' )
					{
						readCount++;
						currentState = ReaderState.HttpMethod_AfterPU;
						if( readCount >= length )
						{
							m_ReadByteCount += readCount;
							return;
						}
						nextByte = buffer[offset + readCount];
						goto case ReaderState.HttpMethod_AfterPU;
					}
					else
					{
						buf = new StringBuilder();
						buf.Append('P');

						currentState = ReaderState.HttpMethod_ExpectingMore;
						goto case ReaderState.HttpMethod_ExpectingMore;
					}

				case ReaderState.HttpMethod_AfterPO:
					if( nextByte == (byte)'S' )
					{
						readCount++;
						currentState = ReaderState.HttpMethod_AfterPOS;
						if( readCount >= length )
						{
							m_ReadByteCount += readCount;
							return;
						}
						nextByte = buffer[offset + readCount];
						goto case ReaderState.HttpMethod_AfterPOS;
					}
					else
					{
						buf = new StringBuilder();
						buf.Append("PO");

						currentState = ReaderState.HttpMethod_ExpectingMore;
						goto case ReaderState.HttpMethod_ExpectingMore;
					}

				case ReaderState.HttpMethod_AfterPOS:
					if( nextByte == (byte)'T' )
					{
						readCount++;
						currentState = ReaderState.HttpMethod_AfterPOST;
						if( readCount >= length )
						{
							m_ReadByteCount += readCount;
							return;
						}
						nextByte = buffer[offset + readCount];
						goto case ReaderState.HttpMethod_AfterPOST;
					}
					else
					{
						buf = new StringBuilder();
						buf.Append("POST");

						currentState = ReaderState.HttpMethod_ExpectingMore;
						goto case ReaderState.HttpMethod_ExpectingMore;
					}

				case ReaderState.HttpMethod_AfterPOST:
					if( nextByte == Space || nextByte == TAB )
					{
						m_HttpMethod = "POST";
						readCount++;
						currentState = ReaderState.HttpMethod_TrailingSpace;
						if( readCount >= length )
						{
							m_ReadByteCount += readCount;
							return;
						}
						goto case ReaderState.HttpMethod_TrailingSpace;
					}
					else
					{
						buf = new StringBuilder();
						buf.Append("POST");

						currentState = ReaderState.HttpMethod_ExpectingMore;
						goto case ReaderState.HttpMethod_ExpectingMore;
					}
				#endregion

				#region PUT
				case ReaderState.HttpMethod_AfterPU:
					if( nextByte == (byte)'T' )
					{
						readCount++;
						currentState = ReaderState.HttpMethod_AfterPUT;
						if( readCount >= length )
						{
							m_ReadByteCount += readCount;
							return;
						}
						nextByte = buffer[offset + readCount];
						goto case ReaderState.HttpMethod_AfterPUT;
					}
					else
					{
						buf = new StringBuilder();
						buf.Append("PU");

						currentState = ReaderState.HttpMethod_ExpectingMore;
						goto case ReaderState.HttpMethod_ExpectingMore;
					}

				case ReaderState.HttpMethod_AfterPUT:
					if( nextByte == Space || nextByte == TAB )
					{
						m_HttpMethod = "PUT";
						readCount++;
						currentState = ReaderState.HttpMethod_TrailingSpace;
						if( readCount >= length )
						{
							m_ReadByteCount += readCount;
							return;
						}
						goto case ReaderState.HttpMethod_TrailingSpace;
					}
					else
					{
						buf = new StringBuilder();
						buf.Append("PUT");

						currentState = ReaderState.HttpMethod_ExpectingMore;
						goto case ReaderState.HttpMethod_ExpectingMore;
					}
				#endregion

				#region HEAD
				case ReaderState.HttpMethod_AfterH:
					if( nextByte == (byte)'E' )
					{
						readCount++;
						currentState = ReaderState.HttpMethod_AfterHE;
						if( readCount >= length )
						{
							m_ReadByteCount += readCount;
							return;
						}
						nextByte = buffer[offset + readCount];
						goto case ReaderState.HttpMethod_AfterHE;
					}
					else
					{
						buf = new StringBuilder();
						buf.Append('H');

						currentState = ReaderState.HttpMethod_ExpectingMore;
						goto case ReaderState.HttpMethod_ExpectingMore;
					}

				case ReaderState.HttpMethod_AfterHE:
					if( nextByte == (byte)'A' )
					{
						readCount++;
						currentState = ReaderState.HttpMethod_AfterHEA;
						if( readCount >= length )
						{
							m_ReadByteCount += readCount;
							return;
						}
						nextByte = buffer[offset + readCount];
						goto case ReaderState.HttpMethod_AfterHEA;
					}
					else
					{
						buf = new StringBuilder();
						buf.Append("HE");

						currentState = ReaderState.HttpMethod_ExpectingMore;
						goto case ReaderState.HttpMethod_ExpectingMore;
					}

				case ReaderState.HttpMethod_AfterHEA:
					if( nextByte == (byte)'D' )
					{
						readCount++;
						currentState = ReaderState.HttpMethod_AfterHEAD;
						if( readCount >= length )
						{
							m_ReadByteCount += readCount;
							return;
						}
						nextByte = buffer[offset + readCount];
						goto case ReaderState.HttpMethod_AfterHEAD;
					}
					else
					{
						buf = new StringBuilder();
						buf.Append("HEA");

						currentState = ReaderState.HttpMethod_ExpectingMore;
						goto case ReaderState.HttpMethod_ExpectingMore;
					}

				case ReaderState.HttpMethod_AfterHEAD:
					if( nextByte == Space || nextByte == TAB )
					{
						m_HttpMethod = "HEAD";
						readCount++;
						currentState = ReaderState.HttpMethod_TrailingSpace;
						if( readCount >= length )
						{
							m_ReadByteCount += readCount;
							return;
						}
						goto case ReaderState.HttpMethod_TrailingSpace;
					}
					else
					{
						buf = new StringBuilder();
						buf.Append("HEAD");

						currentState = ReaderState.HttpMethod_ExpectingMore;
						goto case ReaderState.HttpMethod_ExpectingMore;
					}
				#endregion

				case ReaderState.HttpMethod_ExpectingMore:
					if( (nextByte >= (byte)'A' && nextByte <= (byte)'Z')
						&& (nextByte >= (byte)'a' && nextByte <= (byte)'z') )
					{
						buf.Append((char)nextByte);
						readCount++;
						if( readCount >= length )
						{
							m_ReadByteCount += readCount;
							return;
						}
						nextByte = buffer[offset + readCount];
						goto case ReaderState.HttpMethod_ExpectingMore;
					}
					else if( nextByte == Space || nextByte == TAB )
					{
						m_HttpMethod = buf.ToString();
						buf = null;
						readCount++;
						currentState = ReaderState.HttpMethod_TrailingSpace;
						if( readCount >= length )
						{
							m_ReadByteCount += readCount;
							return;
						}
						goto case ReaderState.HttpMethod_TrailingSpace;
					}
					else
					{
						m_ReadByteCount = readCount;
						m_FailureDescription = "Invalid character in HttpMethod.";
						currentState = ReaderState.Failed;
						return;
					}

				case ReaderState.HttpMethod_TrailingSpace:
					if( nextByte == Space || nextByte == TAB )
					{
						readCount++;
						if( readCount >= length )
						{
							m_ReadByteCount += readCount;
							return;
						}
						goto case ReaderState.HttpMethod_TrailingSpace;
					}
					else
					{
						buf = new StringBuilder();
						currentState = ReaderState.RawUrl;
						goto case ReaderState.RawUrl;
					}
				#endregion

				#region RawUrl
				case ReaderState.RawUrl:
					if( nextByte > Space )
					{
						buf.Append((char)nextByte);
						readCount++;
						if( readCount >= length )
						{
							m_ReadByteCount += readCount;
							return;
						}
						goto case ReaderState.RawUrl;
					}
					else if( nextByte == Space || nextByte == TAB )
					{
						m_RawUrl = buf.ToString();
						buf = null;
						readCount++;
						currentState = ReaderState.RawUrl_TrailingSpace;
						if( readCount >= length )
						{
							m_ReadByteCount += readCount;
							return;
						}
						goto case ReaderState.RawUrl_TrailingSpace;
					}
					else
					{
						m_ReadByteCount = readCount;
						m_FailureDescription = "Invalid character in RawUrl.";
						currentState = ReaderState.Failed;
						return;
					}

				case ReaderState.RawUrl_TrailingSpace:
					if( nextByte == Space || nextByte == TAB )
					{
						readCount++;
						if( readCount >= length )
						{
							m_ReadByteCount += readCount;
							return;
						}
						goto case ReaderState.RawUrl_TrailingSpace;
					}
					else if( nextByte == (byte)'H' )
					{
						readCount++;
						currentState = ReaderState.ProtocolVersion_H;
						if( readCount >= length )
						{
							m_ReadByteCount += readCount;
							return;
						}
						goto case ReaderState.ProtocolVersion_H;
					}
					else
					{
						m_ReadByteCount = readCount;
						m_FailureDescription = "Invalid character in ProtocolVersion.";
						currentState = ReaderState.Failed;
						return;
					}
				#endregion

				#region ProtocolVersion
				case ReaderState.ProtocolVersion_H:
					if( nextByte == (byte)'T' )
					{
						readCount++;
						currentState = ReaderState.ProtocolVersion_HT;
						if( readCount >= length )
						{
							m_ReadByteCount += readCount;
							return;
						}
						nextByte = buffer[offset + readCount];
						goto case ReaderState.ProtocolVersion_HT;
					}
					else
					{
						m_ReadByteCount = readCount;
						m_FailureDescription = "Invalid character in ProtocolVersion.";
						currentState = ReaderState.Failed;
						return;
					}

				case ReaderState.ProtocolVersion_HT:
					if( nextByte == (byte)'T' )
					{
						readCount++;
						currentState = ReaderState.ProtocolVersion_HTT;
						if( readCount >= length )
						{
							m_ReadByteCount += readCount;
							return;
						}
						nextByte = buffer[offset + readCount];
						goto case ReaderState.ProtocolVersion_HTT;
					}
					else
					{
						m_ReadByteCount = readCount;
						m_FailureDescription = "Invalid character in ProtocolVersion.";
						currentState = ReaderState.Failed;
						return;
					}

				case ReaderState.ProtocolVersion_HTT:
					if( nextByte == (byte)'P' )
					{
						readCount++;
						currentState = ReaderState.ProtocolVersion_HTTP;
						if( readCount >= length )
						{
							m_ReadByteCount += readCount;
							return;
						}
						nextByte = buffer[offset + readCount];
						goto case ReaderState.ProtocolVersion_HTTP;
					}
					else
					{
						m_ReadByteCount = readCount;
						m_FailureDescription = "Invalid character in ProtocolVersion.";
						currentState = ReaderState.Failed;
						return;
					}

				case ReaderState.ProtocolVersion_HTTP:
					if( nextByte == (byte)'/' )
					{
						readCount++;
						currentState = ReaderState.ProtocolVersion_HTTPSlash;
						if( readCount >= length )
						{
							m_ReadByteCount += readCount;
							return;
						}
						nextByte = buffer[offset + readCount];
						goto case ReaderState.ProtocolVersion_HTTPSlash;
					}
					else
					{
						m_ReadByteCount = readCount;
						m_FailureDescription = "Invalid character in ProtocolVersion.";
						currentState = ReaderState.Failed;
						return;
					}

				case ReaderState.ProtocolVersion_HTTPSlash:
					if( nextByte == (byte)'1' )
					{
						readCount++;
						currentState = ReaderState.ProtocolVersion_HTTPSlash1;
						if( readCount >= length )
						{
							m_ReadByteCount += readCount;
							return;
						}
						nextByte = buffer[offset + readCount];
						goto case ReaderState.ProtocolVersion_HTTPSlash1;
					}
					else
					{
						m_ReadByteCount = readCount;
						m_FailureDescription = "Invalid character in ProtocolVersion.";
						currentState = ReaderState.Failed;
						return;
					}

				case ReaderState.ProtocolVersion_HTTPSlash1:
					if( nextByte == (byte)'.' )
					{
						readCount++;
						currentState = ReaderState.ProtocolVersion_HTTPSlash1Dot;
						if( readCount >= length )
						{
							m_ReadByteCount += readCount;
							return;
						}
						nextByte = buffer[offset + readCount];
						goto case ReaderState.ProtocolVersion_HTTPSlash1Dot;
					}
					else
					{
						m_ReadByteCount = readCount;
						m_FailureDescription = "Invalid character in ProtocolVersion.";
						currentState = ReaderState.Failed;
						return;
					}

				case ReaderState.ProtocolVersion_HTTPSlash1Dot:
					if( nextByte == (byte)'1' )
					{
						readCount++;
						currentState = ReaderState.ProtocolVersion_HTTPSlash1Dot1;
						if( readCount >= length )
						{
							m_ReadByteCount += readCount;
							return;
						}
						nextByte = buffer[offset + readCount];
						goto case ReaderState.ProtocolVersion_HTTPSlash1Dot1;
					}
					else if( nextByte == (byte)'0' )
					{
						readCount++;
						currentState = ReaderState.ProtocolVersion_HTTPSlash1Dot0;
						if( readCount >= length )
						{
							m_ReadByteCount += readCount;
							return;
						}
						nextByte = buffer[offset + readCount];
						goto case ReaderState.ProtocolVersion_HTTPSlash1Dot0;
					}
					else
					{
						m_ReadByteCount = readCount;
						m_FailureDescription = "Invalid character in ProtocolVersion.";
						currentState = ReaderState.Failed;
						return;
					}

				case ReaderState.ProtocolVersion_HTTPSlash1Dot1:
					if( nextByte == CR )
					{
						m_ProtocolVersion = System.Net.HttpVersion.Version11;
						readCount++;
						currentState = ReaderState.ProtocolVersion_CRExpectingLF;
						if( readCount >= length )
						{
							m_ReadByteCount += readCount;
							return;
						}
						nextByte = buffer[offset + readCount];
						goto case ReaderState.ProtocolVersion_CRExpectingLF;
					}
					else if( nextByte == Space || nextByte == TAB )
					{
						m_ProtocolVersion = System.Net.HttpVersion.Version11;
						readCount++;
						currentState = ReaderState.ProtocolVersion_TrailingSpace;
						if( readCount >= length )
						{
							m_ReadByteCount += readCount;
							return;
						}
						nextByte = buffer[offset + readCount];
						goto case ReaderState.ProtocolVersion_TrailingSpace;
					}
					else
					{
						m_ReadByteCount = readCount;
						m_FailureDescription = "Invalid character in ProtocolVersion.";
						currentState = ReaderState.Failed;
						return;
					}

				case ReaderState.ProtocolVersion_HTTPSlash1Dot0:
					if( nextByte == CR )
					{
						m_ProtocolVersion = System.Net.HttpVersion.Version10;
						readCount++;
						currentState = ReaderState.ProtocolVersion_CRExpectingLF;
						if( readCount >= length )
						{
							m_ReadByteCount += readCount;
							return;
						}
						nextByte = buffer[offset + readCount];
						goto case ReaderState.ProtocolVersion_CRExpectingLF;
					}
					else if( nextByte == Space || nextByte == TAB )
					{
						m_ProtocolVersion = System.Net.HttpVersion.Version10;
						readCount++;
						currentState = ReaderState.ProtocolVersion_TrailingSpace;
						if( readCount >= length )
						{
							m_ReadByteCount += readCount;
							return;
						}
						nextByte = buffer[offset + readCount];
						goto case ReaderState.ProtocolVersion_TrailingSpace;
					}
					else
					{
						m_ReadByteCount = readCount;
						m_FailureDescription = "Invalid character in ProtocolVersion.";
						currentState = ReaderState.Failed;
						return;
					}

				case ReaderState.ProtocolVersion_TrailingSpace:
					if( nextByte == CR )
					{
						readCount++;
						currentState = ReaderState.ProtocolVersion_CRExpectingLF;
						if( readCount >= length )
						{
							m_ReadByteCount += readCount;
							return;
						}
						goto case ReaderState.ProtocolVersion_CRExpectingLF;
					}
					else if( nextByte == Space || nextByte == TAB )
					{
						readCount++;
						if( readCount >= length )
						{
							m_ReadByteCount += readCount;
							return;
						}
						nextByte = buffer[offset + readCount];
						goto case ReaderState.ProtocolVersion_TrailingSpace;
					}
					else
					{
						m_ReadByteCount = readCount;
						m_FailureDescription = "Invalid character after ProtocolVersion.";
						currentState = ReaderState.Failed;
						return;
					}

				case ReaderState.ProtocolVersion_CRExpectingLF:
					if( nextByte == LF )
					{
						readCount++;
						currentState = ReaderState.Succeed;
						return;
					}
					else
					{
						m_ReadByteCount += readCount;
						m_FailureDescription = "LF expected after CR at the end of query line.";
						currentState = ReaderState.Failed;
						return;
					}
				#endregion

				case ReaderState.Succeed:
					throw new InvalidOperationException("Request read has already succeed.");

				case ReaderState.Failed:
					throw new InvalidOperationException("Request read has already failed.");

				default:
					throw new InvalidOperationException();
			}
		}

		public bool IsFailed { get { return currentState == ReaderState.Failed; } }
		public bool IsSucceed { get { return currentState == ReaderState.Succeed; } }

		public string HttpMethod { get { return m_HttpMethod; } }
		public string RawUrl { get { return m_RawUrl; } }
		public Version ProtocolVersion { get { return m_ProtocolVersion; } }

		public int ReadByteCount { get { return m_ReadByteCount; } }
		public string FailureDescription { get { return m_FailureDescription; } }
	}
}