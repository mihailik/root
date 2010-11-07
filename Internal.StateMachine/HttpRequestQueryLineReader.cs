using System;
using System.Collections.Generic;
using System.Text;

namespace Mihailik.Net.Internal.StateMachine
{
	public struct HttpRequestQueryLineReader
	{
		enum ReaderState
		{
			Initial,
			Initial_CRExpectingLF,

			HttpMethod,
			HttpMethod_TrailingSpace,

			RawUrl,
			RawUrl_TrailingSpace,

			ProtocolVersion_H, ProtocolVersion_HT, ProtocolVersion_HTT, ProtocolVersion_HTTP, ProtocolVersion_HTTPSlash, ProtocolVersion_HTTPSlash1, ProtocolVersion_HTTPSlash1Dot,
			ProtocolVersion_HTTPSlash1Dot1,
			ProtocolVersion_HTTPSlash1Dot0,
			ProtocolVersion_TrailingSpace,
			ProtocolVersion_CRExpectingLF,

			Succeed
		}

		const byte CR = (byte)'\r';
		const byte LF = (byte)'\n';
		const byte Space = (byte)' ';
		const byte TAB = (byte)'\t';
		const byte Colon = (byte)':';
		const byte Percent = (byte)'%';

		static readonly IgnoreCaseWordReader.Generator httpMethodReaderGenerator = new IgnoreCaseWordReader.Generator(
			" \t",
			new string[] { "GET", "HEAD", "DELETE", "POST", "PUT", "CONNECT" });

		static readonly IgnoreCaseWordReader.Generator rawUrlReaderGenerator = new IgnoreCaseWordReader.Generator(
			" \t",
			new string[] { "/", "/index.htm", "/default.aspx", "/index.html" });

		ReaderState currentState;
		string m_HttpMethod;
		int m_KnownHttpMethodIndex;
		string m_RawUrl;
		Version m_ProtocolVersion;

		int m_ReadByteCount;
		string m_FailureDescription;

		IgnoreCaseWordReader wordReader;

		public int Read(byte[] buffer, int offset, int length)
		{
			int readCount = 0;
			byte nextByte = buffer[offset + readCount];

			switch( currentState )
			{
				#region Initial
				case ReaderState.Initial:
					if( nextByte == CR )
					{
						goto case ReaderState.Initial_CRExpectingLF;
					}
					else
					{
						wordReader = httpMethodReaderGenerator.GetReader();
						currentState = ReaderState.HttpMethod;
						goto case ReaderState.HttpMethod;
					}

				case ReaderState.Initial_CRExpectingLF:
					if( nextByte == LF )
					{
						wordReader = httpMethodReaderGenerator.GetReader();
						currentState = ReaderState.HttpMethod;
						goto case ReaderState.HttpMethod;
					}
					else
					{
						m_ReadByteCount += readCount;
						m_FailureDescription = "LF expected after CR at the first byte of request.";
						return readCount;
					}
				#endregion

				#region HttpMethod
				case ReaderState.HttpMethod:
					readCount += wordReader.Read(buffer, offset + readCount, length - readCount);

					if( wordReader.IsFailed )
					{
						m_ReadByteCount += readCount;
						m_FailureDescription = "Invalid character in HttpMethod.";
						return readCount;
					}

					if( wordReader.IsSucceed )
					{
						m_HttpMethod = wordReader.Word;
						m_KnownHttpMethodIndex = wordReader.KnownWordIndex;
						wordReader = default(IgnoreCaseWordReader);

						currentState = ReaderState.HttpMethod_TrailingSpace;

						readCount++;
						if (readCount >= length)
						{
							m_ReadByteCount += readCount;
							return readCount;
						}

						nextByte = buffer[offset + readCount];
						goto case ReaderState.HttpMethod_TrailingSpace;
					}

					m_ReadByteCount += readCount;
					return readCount;

				case ReaderState.HttpMethod_TrailingSpace:
					if( nextByte == Space || nextByte == TAB )
					{
						readCount++;
						if( readCount >= length )
						{
							m_ReadByteCount += readCount;
							return readCount;
						}
						goto case ReaderState.HttpMethod_TrailingSpace;
					}
					else
					{
						wordReader = rawUrlReaderGenerator.GetReader();
						currentState = ReaderState.RawUrl;
						goto case ReaderState.RawUrl;
					}
				#endregion

				#region RawUrl
				case ReaderState.RawUrl:
					readCount += wordReader.Read(buffer, offset + readCount, length - readCount);

					if( wordReader.IsFailed )
					{
						m_ReadByteCount += readCount;
						m_FailureDescription = "Invalid character in RawUrl.";
						return readCount;
					}

					if( wordReader.IsSucceed )
					{
						m_RawUrl = wordReader.Word;
						wordReader = default(IgnoreCaseWordReader);

						currentState = ReaderState.RawUrl_TrailingSpace;
						
						readCount++;
						if (readCount >= length)
						{
							m_ReadByteCount += readCount;
							return readCount;
						}

						nextByte = buffer[offset + readCount];
						goto case ReaderState.RawUrl_TrailingSpace;
					}

					m_ReadByteCount += readCount;
					return readCount;

				case ReaderState.RawUrl_TrailingSpace:
					if( nextByte == Space || nextByte == TAB )
					{
						readCount++;
						if( readCount >= length )
						{
							m_ReadByteCount += readCount;
							return readCount;
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
							return readCount;
						}
						nextByte = buffer[offset+readCount];
						goto case ReaderState.ProtocolVersion_H;
					}
					else
					{
						m_ReadByteCount += readCount;
						m_FailureDescription = "Invalid character in ProtocolVersion.";
						return readCount;
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
							return readCount;
						}
						nextByte = buffer[offset + readCount];
						goto case ReaderState.ProtocolVersion_HT;
					}
					else
					{
						m_ReadByteCount += readCount;
						m_FailureDescription = "Invalid character in ProtocolVersion.";
						return readCount;
					}

				case ReaderState.ProtocolVersion_HT:
					if( nextByte == (byte)'T' )
					{
						readCount++;
						currentState = ReaderState.ProtocolVersion_HTT;
						if( readCount >= length )
						{
							m_ReadByteCount += readCount;
							return readCount;
						}
						nextByte = buffer[offset + readCount];
						goto case ReaderState.ProtocolVersion_HTT;
					}
					else
					{
						m_ReadByteCount += readCount;
						m_FailureDescription = "Invalid character in ProtocolVersion.";
						return readCount;
					}

				case ReaderState.ProtocolVersion_HTT:
					if( nextByte == (byte)'P' )
					{
						readCount++;
						currentState = ReaderState.ProtocolVersion_HTTP;
						if( readCount >= length )
						{
							m_ReadByteCount += readCount;
							return readCount;
						}
						nextByte = buffer[offset + readCount];
						goto case ReaderState.ProtocolVersion_HTTP;
					}
					else
					{
						m_ReadByteCount += readCount;
						m_FailureDescription = "Invalid character in ProtocolVersion.";
						return readCount;
					}

				case ReaderState.ProtocolVersion_HTTP:
					if( nextByte == (byte)'/' )
					{
						readCount++;
						currentState = ReaderState.ProtocolVersion_HTTPSlash;
						if( readCount >= length )
						{
							m_ReadByteCount += readCount;
							return readCount;
						}
						nextByte = buffer[offset + readCount];
						goto case ReaderState.ProtocolVersion_HTTPSlash;
					}
					else
					{
						m_ReadByteCount += readCount;
						m_FailureDescription = "Invalid character in ProtocolVersion.";
						return readCount;
					}

				case ReaderState.ProtocolVersion_HTTPSlash:
					if( nextByte == (byte)'1' )
					{
						readCount++;
						currentState = ReaderState.ProtocolVersion_HTTPSlash1;
						if( readCount >= length )
						{
							m_ReadByteCount += readCount;
							return readCount;
						}
						nextByte = buffer[offset + readCount];
						goto case ReaderState.ProtocolVersion_HTTPSlash1;
					}
					else
					{
						m_ReadByteCount += readCount;
						m_FailureDescription = "Invalid character in ProtocolVersion.";
						return readCount;
					}

				case ReaderState.ProtocolVersion_HTTPSlash1:
					if( nextByte == (byte)'.' )
					{
						readCount++;
						currentState = ReaderState.ProtocolVersion_HTTPSlash1Dot;
						if( readCount >= length )
						{
							m_ReadByteCount += readCount;
							return readCount;
						}
						nextByte = buffer[offset + readCount];
						goto case ReaderState.ProtocolVersion_HTTPSlash1Dot;
					}
					else
					{
						m_ReadByteCount += readCount;
						m_FailureDescription = "Invalid character in ProtocolVersion.";
						return readCount;
					}

				case ReaderState.ProtocolVersion_HTTPSlash1Dot:
					if( nextByte == (byte)'1' )
					{
						readCount++;
						currentState = ReaderState.ProtocolVersion_HTTPSlash1Dot1;
						if( readCount >= length )
						{
							m_ReadByteCount += readCount;
							return readCount;
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
							return readCount;
						}
						nextByte = buffer[offset + readCount];
						goto case ReaderState.ProtocolVersion_HTTPSlash1Dot0;
					}
					else
					{
						m_ReadByteCount += readCount;
						m_FailureDescription = "Invalid character in ProtocolVersion.";
						return readCount;
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
							return readCount;
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
							return readCount;
						}
						nextByte = buffer[offset + readCount];
						goto case ReaderState.ProtocolVersion_TrailingSpace;
					}
					else
					{
						m_ReadByteCount += readCount;
						m_FailureDescription = "Invalid character in ProtocolVersion.";
						return readCount;
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
							return readCount;
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
							return readCount;
						}
						nextByte = buffer[offset + readCount];
						goto case ReaderState.ProtocolVersion_TrailingSpace;
					}
					else
					{
						m_ReadByteCount += readCount;
						m_FailureDescription = "Invalid character in ProtocolVersion.";
						return readCount;
					}

				case ReaderState.ProtocolVersion_TrailingSpace:
					if( nextByte == CR )
					{
						readCount++;
						currentState = ReaderState.ProtocolVersion_CRExpectingLF;
						if( readCount >= length )
						{
							m_ReadByteCount += readCount;
							return readCount;
						}
						goto case ReaderState.ProtocolVersion_CRExpectingLF;
					}
					else if( nextByte == Space || nextByte == TAB )
					{
						readCount++;
						if( readCount >= length )
						{
							m_ReadByteCount += readCount;
							return readCount;
						}
						nextByte = buffer[offset + readCount];
						goto case ReaderState.ProtocolVersion_TrailingSpace;
					}
					else
					{
						m_ReadByteCount += readCount;
						m_FailureDescription = "Invalid character after ProtocolVersion.";
						return readCount;
					}

				case ReaderState.ProtocolVersion_CRExpectingLF:
					if( nextByte == LF )
					{
						readCount++;
						m_ReadByteCount += readCount;
						currentState = ReaderState.Succeed;
						return readCount;
					}
					else
					{
						m_ReadByteCount += readCount;
						m_FailureDescription = "LF expected after CR at the end of query line.";
						return readCount;
					}
				#endregion

				case ReaderState.Succeed:
					throw new InvalidOperationException("Request read has already succeed.");

				default:
					throw new InvalidOperationException();
			}
		}

		public bool IsFailed { get { return m_FailureDescription!=null; } }
		public bool IsSucceed { get { return currentState == ReaderState.Succeed; } }

		public string HttpMethod { get { return m_HttpMethod; } }
		public int KnownHttpMethodIndex { get { return m_KnownHttpMethodIndex; } }
		public string RawUrl { get { return m_RawUrl; } }
		public Version ProtocolVersion { get { return m_ProtocolVersion; } }

		public int ReadByteCount { get { return m_ReadByteCount; } }
		public string FailureDescription { get { return m_FailureDescription; } }

		public override string ToString()
		{
			if( this.IsFailed )
			{
				return "{Failed at " + this.ReadByteCount+" "+currentState + " " + this.FailureDescription + "}";
			}
			else
			{
				switch( currentState )
				{
					case ReaderState.Initial:
					case ReaderState.Initial_CRExpectingLF:
						return "{" + currentState + "}";

					case ReaderState.HttpMethod:
						return "{" + currentState + " " + wordReader + "}";

					case ReaderState.HttpMethod_TrailingSpace:
						return "{" + currentState + " " + this.HttpMethod + "}";

					case ReaderState.RawUrl:
						return "{" + currentState + " " + this.HttpMethod + " "+wordReader+"}";

					case ReaderState.RawUrl_TrailingSpace:
						return "{" + currentState + " " + this.HttpMethod + " " + this.RawUrl + "}";

					case ReaderState.ProtocolVersion_H:
					case ReaderState.ProtocolVersion_HT:
					case ReaderState.ProtocolVersion_HTT:
					case ReaderState.ProtocolVersion_HTTP:
					case ReaderState.ProtocolVersion_HTTPSlash:
					case ReaderState.ProtocolVersion_HTTPSlash1:
					case ReaderState.ProtocolVersion_HTTPSlash1Dot:
					case ReaderState.ProtocolVersion_HTTPSlash1Dot1:
					case ReaderState.ProtocolVersion_HTTPSlash1Dot0:
						return "{" + currentState + " " + this.HttpMethod + " " + this.RawUrl + "}";

					case ReaderState.ProtocolVersion_TrailingSpace:
						return "{" + currentState + " " + this.HttpMethod + " " + this.RawUrl + " HTTP/"+this.ProtocolVersion+"}";

					case ReaderState.ProtocolVersion_CRExpectingLF:
						return "{" + currentState + " " + this.HttpMethod + " " + this.RawUrl + " HTTP/" + this.ProtocolVersion + "}";

					case ReaderState.Succeed:
						return "{" + currentState + " " + this.HttpMethod + " " + this.RawUrl + " HTTP/" + this.ProtocolVersion + "}";
					
					default:
						return "{currentState:" + currentState + "}";
				}
			}
		}
	}
}