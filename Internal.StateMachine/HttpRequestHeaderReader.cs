using System;
using System.Collections.Generic;
using System.Text;
using System.Collections.Specialized;
using System.Net;

namespace Mihailik.Net.Internal.StateMachine
{
	public struct HttpRequestHeaderReader : ITestReader
	{
		enum ReaderState
		{
			QueryLine,
			HeaderLine,
			Completed
		}

        [Flags]
        enum SensitiveHeaders
        {
            ContentLength = 1,
            Connection = 2
        }

		HttpRequestQueryLineReader queryLineReader;
		HttpHeaderLineReader headerLineReader;

		ReaderState currentState;
		string m_FailureDescription;
		int m_ReadByteCount;
		WebHeaderCollection m_Headers;

		string m_Host;
        bool m_UseChunkedEncoding;
        long m_ContentLength64;
        bool m_KeepAlive;
        string m_UserAgent;
        bool m_HasEntityBody;

        SensitiveHeaders sensitiveHeadersPresent;

		public int Read(byte[] buffer, int offset, int length)
		{
			int readCount = 0;
			switch( currentState )
			{
				case ReaderState.QueryLine:
					readCount += queryLineReader.Read(buffer, offset+readCount, length-readCount);
					if( queryLineReader.IsFailed )
					{
						m_ReadByteCount += readCount;
						m_FailureDescription = queryLineReader.FailureDescription;
						return readCount;
					}
					else if( queryLineReader.IsSucceed )
					{
                        switch (queryLineReader.KnownHttpMethodIndex)
                        {
                            case 0: // GET
                            case 1: // HEAD
                            case 2: // DELETE
                                m_HasEntityBody = false;
                                break;

                            case 4: // POST
                            case 5: // PUT
                            case 6: // CONNECT
                                m_HasEntityBody = true;
                                break;
                        }

                        
                        currentState = ReaderState.HeaderLine;
						headerLineReader = new HttpHeaderLineReader();
						if( readCount == length )
						{
							m_ReadByteCount += readCount;
							return readCount;
						}
						else
						{
							goto case ReaderState.HeaderLine;
						}
					}
					else
					{
						m_ReadByteCount += readCount;
						return readCount;
					}

				case ReaderState.HeaderLine:
					readCount += headerLineReader.Read(buffer, offset + readCount, length - readCount);
					if( headerLineReader.IsFailed )
					{
						m_ReadByteCount += readCount;
						m_FailureDescription = headerLineReader.FailureDescription;
						return readCount;
					}
					else if( headerLineReader.IsSucceed )
					{
						if( headerLineReader.IsEmptyLine )
						{
							if( m_Host != null )
							{
                                if ((sensitiveHeadersPresent & SensitiveHeaders.ContentLength) != 0 && m_ContentLength64==0)
                                    m_HasEntityBody = false;

                                if ((sensitiveHeadersPresent & SensitiveHeaders.Connection) == 0)
                                    m_KeepAlive = queryLineReader.ProtocolVersion == HttpVersion.Version11;

                                m_ReadByteCount += readCount;
								currentState = ReaderState.Completed;
								return readCount;
							}
							else
							{
								m_ReadByteCount += readCount;
								m_FailureDescription = "Host header is absent.";
								return readCount;
							}
						}
						else
						{
                            switch (headerLineReader.KnownNameIndex)
                            {
                                case 0: // Host
                                    m_Host = headerLineReader.Value;
                                    break;

                                case 1: // Transfer-Encoding
                                    if (headerLineReader.KnownValueIndex == 0) // chunked
                                    {
                                        m_UseChunkedEncoding = true;
                                    }
                                    else
                                    {
                                        m_FailureDescription = "Transfer-Encoding unknown.";
                                        m_ReadByteCount += readCount;
                                        return readCount;
                                    }
                                    break;

                                case 2: // Content-Length
                                    sensitiveHeadersPresent |= SensitiveHeaders.ContentLength;
                                    long parseContentLength;
                                    if (long.TryParse(headerLineReader.Value, System.Globalization.NumberStyles.Integer, System.Globalization.CultureInfo.InvariantCulture, out parseContentLength))
                                    {
                                        m_ContentLength64 = parseContentLength;
                                    }
                                    else
                                    {
                                        m_FailureDescription = "Content-Length number format invalid.";
                                        m_ReadByteCount += readCount;
                                        return readCount;
                                    }
                                    break;

                                case 3: // Encoding
                                    
                                    break;

                                case 4: // Accept

                                    break;

                                case 5: // Connection
                                    sensitiveHeadersPresent |= SensitiveHeaders.Connection;
                                    if (headerLineReader.KnownValueIndex == 1) // Keep-Alive
                                    {
                                        m_KeepAlive = true;
                                    }
                                    else if (headerLineReader.KnownValueIndex == 2) // Close
                                    {
                                        m_KeepAlive = false;
                                    }
                                    else
                                    {
                                        m_FailureDescription = "Connection header value invalid.";
                                        m_ReadByteCount += readCount;
                                        return readCount;
                                    }
                                    break;

                                case 6: // User-Agent
                                    m_UserAgent = headerLineReader.Value;
                                    break;

                                default:
                                    break;
                            }

							if( m_Headers == null )
							{
								m_Headers = new WebHeaderCollection();
							}
							m_Headers.Add(headerLineReader.Name, headerLineReader.Value);

							headerLineReader = new HttpHeaderLineReader();
							if( readCount == length )
							{
								m_ReadByteCount += readCount;
								return readCount;
							}
							else
							{
								goto case ReaderState.HeaderLine;
							}
						}
					}
					else
					{
						m_ReadByteCount += readCount;
						return readCount;
					}

				case ReaderState.Completed:
					throw new InvalidOperationException("Reader already completed.");
				
				default:
					throw new InvalidOperationException();
			}
		}

		public bool IsFailed { get { return m_FailureDescription != null; } }
		public bool IsSucceed { get { return currentState == ReaderState.Completed; } }
		public string FailureDescription { get { return m_FailureDescription; } }
		public int ReadByteCount { get { return m_ReadByteCount; } }

        public NameValueCollection Headers { get { return m_Headers; } }

        public string Host { get { return m_Host; } }
        public bool UseChunkedEncoding { get { return m_UseChunkedEncoding; } }
        public long ContentLength64 { get {return m_ContentLength64; } }
        public bool KeepAlive { get { return m_KeepAlive; } }
        public string UserAgent { get { return m_UserAgent; } }
        public bool HasEntityBody { get { return m_HasEntityBody; } }

        public override string ToString()
        {
            if (IsFailed)
                return "{Failed at " + currentState + " " + this.FailureDescription + "}";

            switch (currentState)
            {
                case ReaderState.QueryLine:
                    return "{"+currentState+" "+queryLineReader+"}";

                case ReaderState.HeaderLine:
                    return "{" + currentState + " " + queryLineReader + " " + headerLineReader + (this.Headers == null ? "" : " " + this.Headers.ToString().Replace("\r","\\r").Replace("\n","\\n")) + "}";

                case ReaderState.Completed:
                    return "{" + currentState + " " + queryLineReader + (this.Headers == null ? "" : " " + this.Headers.ToString().Replace("\r", "\\r").Replace("\n", "\\n")) + "}";

                default:
                    return "{currentState:"+currentState+"}";
            }
        }
    
    }
}
