using System;
using System.Collections.Generic;
using System.Text;

namespace Mihailik.Net.Internal.StateMachine
{
	public struct HttpHeaderLineReader : IReader
	{
		enum ReaderState
		{
			LeadingSpace,
			
			Name,
			Name_TrailingSpace,

			Colon_TrailingSpace,

			Value,

			Value_CRExpecingLF,

			EmptyLine_CRExpectingLF,

			NameValueSucceed,
			EmptyLineSucceed
		}

		const byte CR = (byte)'\r';
		const byte LF = (byte)'\n';
		const byte Space = (byte)' ';
		const byte TAB = (byte)'\t';
		const byte Colon = (byte)':';
		const byte Percent = (byte)'%';

        static WordReader.Generator nameReaderGenerator = new WordReader.Generator(
            " \t:",
			new string[] { "Host", "Transfer-Encoding", "Content-Length", "Encoding", "Accept", "Connection", "User-Agent" });

        static WordReader.Generator valueReaderGenerator = new WordReader.Generator(
            "\r",
            new string[] { "chunked", "Keep-Alive", "Close" });

		ReaderState currentState;

		string m_Name;
		int m_KnownNameIndexPlus1;
		string m_Value;
		int m_KnownValueIndexPlus1;
        int m_ReadByteCount;
		string m_FailureDescription;

        WordReader reader;

        public int Read(byte[] buffer, int offset, int length)
        {
            int readCount = 0;
            byte nextByte = buffer[offset + readCount];
            switch (currentState)
            {
                case ReaderState.LeadingSpace:
                    if (nextByte == Space || nextByte == TAB)
                    {
                        readCount++;
                        if (readCount == length)
                        {
                            m_ReadByteCount += readCount;
                            return readCount;
                        }
                        nextByte = buffer[offset + readCount];
                        goto case ReaderState.LeadingSpace;
                    }
                    else if( nextByte == CR )
                    {
                        readCount++;
                        currentState = ReaderState.EmptyLine_CRExpectingLF;
                        if (readCount == length)
                        {
                            m_ReadByteCount += readCount;
                            return readCount;
                        }
                        nextByte = buffer[offset + readCount];
                        goto case ReaderState.EmptyLine_CRExpectingLF;
                    }
                    else
                    {
                        reader = nameReaderGenerator.GetReader();
                        currentState = ReaderState.Name;
                        goto case ReaderState.Name;
                    }

                case ReaderState.Name:
                    readCount += reader.Read(buffer, offset + readCount, length - readCount);

                    if (reader.IsFailed)
                    {
						m_ReadByteCount += readCount;
						m_FailureDescription = "Invalid character in header name.";
						return readCount;
                    }

					if( reader.IsSucceed )
					{
						nextByte = buffer[offset + readCount];

						if( reader.Word.Length == 0 )
						{
							if( nextByte == CR )
							{
								readCount++;
								currentState = ReaderState.EmptyLine_CRExpectingLF;

								if( readCount == length )
								{
									m_ReadByteCount += readCount;
									return readCount;
								}

								nextByte = buffer[offset + readCount];
								goto case ReaderState.EmptyLine_CRExpectingLF;
							}
							else
							{
								m_ReadByteCount += readCount;
								m_FailureDescription = "Header name is empty.";
								return readCount;
							}
						}

						m_Name = reader.Word;
						m_KnownNameIndexPlus1 = reader.KnownWordIndex + 1;
						currentState = ReaderState.Name_TrailingSpace;
						goto case ReaderState.Name_TrailingSpace;
					}
					else
					{
						m_ReadByteCount += readCount;
						return readCount;
					}

                case ReaderState.Name_TrailingSpace:
					if( nextByte == Space || nextByte == TAB )
					{
						readCount++;
						if( readCount == length )
						{
							m_ReadByteCount += readCount;
							return readCount;
						}
						nextByte = buffer[offset + readCount];
						goto case ReaderState.Name_TrailingSpace;
					}
					else if( nextByte == Colon )
					{
						readCount++;
						currentState = ReaderState.Colon_TrailingSpace;
						if( readCount == length )
						{
							m_ReadByteCount += readCount;
							return readCount;
						}
						nextByte = buffer[offset + readCount];
						goto case ReaderState.Colon_TrailingSpace;
					}
					else
					{
						m_ReadByteCount += readCount;
						m_FailureDescription = "Colon expected.";
						return readCount;
					}

                case ReaderState.Colon_TrailingSpace:
					if( nextByte == Space || nextByte == TAB )
					{
						readCount++;
						if( readCount == length )
						{
							m_ReadByteCount += readCount;
							return readCount;
						}
						nextByte = buffer[offset + readCount];
						goto case ReaderState.Colon_TrailingSpace;
					}
					else
					{
						reader = valueReaderGenerator.GetReader();
						currentState = ReaderState.Value;
						if( readCount == length )
						{
							m_ReadByteCount += readCount;
							return readCount;
						}
						nextByte = buffer[offset + readCount];
						goto case ReaderState.Value;
					}

                case ReaderState.Value:
					readCount += reader.Read(buffer, offset + readCount, length - readCount);

					if( reader.IsFailed )
					{
						m_ReadByteCount += readCount;
						m_FailureDescription = "Invalid character in header value.";
						return readCount;
					}

					if( reader.IsSucceed )
					{
						m_Value = reader.Word;
						m_KnownValueIndexPlus1 = reader.KnownWordIndex + 1;

						readCount++;
						currentState = ReaderState.Value_CRExpecingLF;

						if( readCount == length )
						{
							m_ReadByteCount += readCount;
							return readCount;
						}

						nextByte = buffer[offset + readCount];
						goto case ReaderState.Value_CRExpecingLF;
					}
					else
					{
						m_ReadByteCount += readCount;
						return readCount;
					}

                case ReaderState.Value_CRExpecingLF:
					if( nextByte == LF )
					{
						readCount++;
						m_ReadByteCount += readCount;
						currentState = ReaderState.NameValueSucceed;
						return readCount;
					}
					else
					{
						m_ReadByteCount += readCount;
						m_FailureDescription = "LF expected after CR after header line.";
						return readCount;
					}

                case ReaderState.EmptyLine_CRExpectingLF:
					if( nextByte == LF )
					{
						readCount++;
						m_ReadByteCount += readCount;
						currentState = ReaderState.EmptyLineSucceed;
						return readCount;
					}
					else
					{
						m_ReadByteCount += readCount;
						m_FailureDescription = "LF expected after CR after header.";
						return readCount;
					}
                
                case ReaderState.NameValueSucceed:
                    throw new InvalidOperationException("Reader already failed.");
                
                case ReaderState.EmptyLineSucceed:
                    throw new InvalidOperationException("Reader already succeed.");

                default:
                    throw new NotImplementedException();
            }
        }

		public bool IsFailed { get { return m_FailureDescription!=null; } }
		public bool IsSucceed { get { return currentState == ReaderState.NameValueSucceed || currentState == ReaderState.EmptyLineSucceed; } }

		public bool IsEmptyLine { get { return currentState == ReaderState.EmptyLineSucceed; } }
		public string Name { get { return m_Name; } }
		public int KnownNameIndex { get { return m_KnownNameIndexPlus1 - 1; } }
		public string Value { get { return m_Value; } }
		public int KnownValueIndex { get { return m_KnownValueIndexPlus1 - 1; } }

		public string FailureDescription { get { return m_FailureDescription; } }
		public int ReadByteCount { get { return m_ReadByteCount; } }

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
					case ReaderState.LeadingSpace:
						return "{"+currentState+"}";

                    case ReaderState.Name:
						return "{"+currentState+" "+reader+"}";

					case ReaderState.Name_TrailingSpace:
						return "{"+currentState+" "+(this.KnownNameIndex>=0 ? "["+this.KnownNameIndex+"]" : "")+" "+this.Name+"}";

					case ReaderState.Colon_TrailingSpace:
                        return "{" + currentState + " " + (this.KnownNameIndex >= 0 ? "[" + this.KnownNameIndex + "]" : "") + " " + this.Name + " : }";
                    
                    case ReaderState.Value:
                        return "{" + currentState + " " + (this.KnownNameIndex >= 0 ? "[" + this.KnownNameIndex + "]" : "") + " " + this.Name + " : "+reader+"}";
                    
                    case ReaderState.Value_CRExpecingLF:
                        return "{" + currentState + " " + (this.KnownNameIndex >= 0 ? "[" + this.KnownNameIndex + "]" : "") + " " + this.Name + " : " + (this.KnownValueIndex>=0 ? "["+this.KnownValueIndex+"]" : "") + " "+this.Value+"}";

					case ReaderState.EmptyLine_CRExpectingLF:
					case ReaderState.EmptyLineSucceed:
						return "{" + currentState + "}";
					
					case ReaderState.NameValueSucceed:
                        return "{" + currentState + " " + (this.KnownNameIndex >= 0 ? "[" + this.KnownNameIndex + "]" : "") + " " + this.Name + " : " + (this.KnownValueIndex >= 0 ? "[" + this.KnownValueIndex + "]" : "") + " " + this.Value + "}";

					default:
						return "{currentState:"+ currentState+"}";
				}
			}
		}
	}
}
