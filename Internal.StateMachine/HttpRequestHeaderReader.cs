using System;
using System.Collections.Generic;
using System.Text;
using System.Collections.Specialized;
using System.Net;

namespace Mihailik.Net.Internal.StateMachine
{
	public sealed class HttpRequestHeaderReader
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

		public HttpRequestQueryLineReader QueryLineReader;
		HttpHeaderLineReader headerLineReader;

		ReaderState currentState;

		public string FailureDescription;
		public int ReadByteCount;
		public WebHeaderCollection Headers;

		public string Host;
		public bool UseChunkedEncoding;
		public long ContentLength64;
		public bool KeepAlive;
		public string UserAgent;
		public bool HasEntityBody;

		SensitiveHeaders sensitiveHeadersPresent;

		public int Read(byte[] buffer, int offset, int length)
		{
			int readCount = 0;
			switch( currentState )
			{
				case ReaderState.QueryLine:
					readCount += QueryLineReader.Read(buffer, offset+readCount, length-readCount);
					if( QueryLineReader.IsFailed )
					{
						ReadByteCount += readCount;
						FailureDescription = QueryLineReader.FailureDescription;
						return readCount;
					}
					else if( QueryLineReader.IsSucceed )
					{
						switch (QueryLineReader.KnownHttpMethodIndex)
						{
							case 0: // GET
							case 1: // HEAD
							case 2: // DELETE
								HasEntityBody = false;
								break;

							case 4: // POST
							case 5: // PUT
							case 6: // CONNECT
								HasEntityBody = true;
								break;
						}

						
						currentState = ReaderState.HeaderLine;
						headerLineReader = new HttpHeaderLineReader();
						if( readCount == length )
						{
							ReadByteCount += readCount;
							return readCount;
						}
						else
						{
							goto case ReaderState.HeaderLine;
						}
					}
					else
					{
						ReadByteCount += readCount;
						return readCount;
					}

				case ReaderState.HeaderLine:
					readCount += headerLineReader.Read(buffer, offset + readCount, length - readCount);
					if( headerLineReader.IsFailed )
					{
						ReadByteCount += readCount;
						FailureDescription = headerLineReader.FailureDescription;
						return readCount;
					}
					else if( headerLineReader.IsSucceed )
					{
						if( headerLineReader.IsEmptyLine )
						{
							if( Host != null )
							{
								if ((sensitiveHeadersPresent & SensitiveHeaders.ContentLength) != 0 && ContentLength64==0)
									HasEntityBody = false;

								if ((sensitiveHeadersPresent & SensitiveHeaders.Connection) == 0)
									KeepAlive = QueryLineReader.ProtocolVersion == HttpVersion.Version11;

								ReadByteCount += readCount;
								currentState = ReaderState.Completed;
								return readCount;
							}
							else
							{
								ReadByteCount += readCount;
								FailureDescription = "Host header is absent.";
								return readCount;
							}
						}
						else
						{
							switch (headerLineReader.KnownNameIndex)
							{
								case 0: // Host
									Host = headerLineReader.Value;
									break;

								case 1: // Transfer-Encoding
									if (headerLineReader.KnownValueIndex == 0) // chunked
									{
										UseChunkedEncoding = true;
									}
									else
									{
										FailureDescription = "Transfer-Encoding unknown.";
										ReadByteCount += readCount;
										return readCount;
									}
									break;

								case 2: // Content-Length
									sensitiveHeadersPresent |= SensitiveHeaders.ContentLength;
									long parseContentLength;
									if (long.TryParse(headerLineReader.Value, System.Globalization.NumberStyles.Integer, System.Globalization.CultureInfo.InvariantCulture, out parseContentLength))
									{
										ContentLength64 = parseContentLength;
									}
									else
									{
										FailureDescription = "Content-Length number format invalid.";
										ReadByteCount += readCount;
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
										KeepAlive = true;
									}
									else if (headerLineReader.KnownValueIndex == 2) // Close
									{
										KeepAlive = false;
									}
									else
									{
										FailureDescription = "Connection header value invalid.";
										ReadByteCount += readCount;
										return readCount;
									}
									break;

								case 6: // User-Agent
									UserAgent = headerLineReader.Value;
									break;

								default:
									break;
							}

							if( Headers == null )
							{
								Headers = new WebHeaderCollection();
							}
							Headers.Add(headerLineReader.Name, headerLineReader.Value);

							headerLineReader = new HttpHeaderLineReader();
							if( readCount == length )
							{
								ReadByteCount += readCount;
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
						ReadByteCount += readCount;
						return readCount;
					}

				case ReaderState.Completed:
					throw new InvalidOperationException("Reader already completed.");
				
				default:
					throw new InvalidOperationException();
			}
		}

		public bool IsFailed { get { return FailureDescription != null; } }
		public bool IsSucceed { get { return currentState == ReaderState.Completed; } }

		public bool IsContentLength64Present { get { return (sensitiveHeadersPresent & SensitiveHeaders.ContentLength) == SensitiveHeaders.ContentLength; } }

		public override string ToString()
		{
			if (IsFailed)
				return "{Failed at " + currentState + " " + this.FailureDescription + "}";

			switch (currentState)
			{
				case ReaderState.QueryLine:
					return "{"+currentState+" "+QueryLineReader+"}";

				case ReaderState.HeaderLine:
					return "{" + currentState + " " + QueryLineReader + " " + headerLineReader + (this.Headers == null ? "" : " " + this.Headers.ToString().Replace("\r","\\r").Replace("\n","\\n")) + "}";

				case ReaderState.Completed:
					return "{" + currentState + " " + QueryLineReader + (this.Headers == null ? "" : " " + this.Headers.ToString().Replace("\r", "\\r").Replace("\n", "\\n")) + "}";

				default:
					return "{currentState:"+currentState+"}";
			}
		}
	
	}
}
