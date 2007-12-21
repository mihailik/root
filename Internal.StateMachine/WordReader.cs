using System;
using System.Collections.Generic;
using System.Text;

namespace Mihailik.Net.Internal.StateMachine
{
	internal struct WordReader
	{
		enum ReaderState
		{
			KnownWord,
			AfterKnownWord,
			UnknownWord,
			Succeed
		}

		public struct Generator
		{
			byte[] parseDefinition;
			byte[] stoppers;
			string[] knownWords;

			public Generator(
				string stopperChars,
				string[] knownWords)
			{
				this.stoppers = new byte[stopperChars.Length];
				for( int i = 0; i < stopperChars.Length; i++ )
				{
					byte stopByte = (byte)stopperChars[i];
					
					if( stopperChars[i] != (char)stopByte )
						throw new ArgumentException("Non-ASCII char at index " + i + ".", "stopperChars");

					stoppers[i] = (byte)stopperChars[i];
				}

				this.knownWords = knownWords;

				List<ByteNode> nodes = BuildNodes("", knownWords);
				List<byte> parseDefinitionBuilder = new List<byte>();

				GenerateDefinition(nodes, parseDefinitionBuilder);
				this.parseDefinition = parseDefinitionBuilder.ToArray();
			}

			static void GenerateDefinition(List<ByteNode> nodes, List<byte> output)
			{
				int baseIndex = output.Count;
				foreach( ByteNode n in nodes )
				{
					output.Add(n.Byte);
					output.Add(0);
				}

				output.Add(0);

				foreach( ByteNode n in nodes )
				{
					output.Add((byte)n.KeywordIndex);

					output[baseIndex + 1] = (byte)output.Count;
					if( n.NextByteNodes != null && n.NextByteNodes.Count > 0 )
					{
						GenerateDefinition(n.NextByteNodes, output);
					}
					else
					{
						output.Add(0);
					}

					baseIndex += 2;
				}
			}

			static List<ByteNode> BuildNodes(string startsWith, string[] knownWords)
			{
				Dictionary<string,ByteNode> nodesStartingWith = new Dictionary<string,ByteNode>();
				foreach( string word in knownWords )
				{
					if( word.Length>startsWith.Length && word.StartsWith(startsWith, StringComparison.Ordinal) )
					{
						string nextStartsWith = word.Substring(0,startsWith.Length+1);
						if( !nodesStartingWith.ContainsKey(nextStartsWith) )
						{
							ByteNode wordNode = new ByteNode();
							wordNode.Byte = (byte)word[startsWith.Length];
							if( word[startsWith.Length] != (char)wordNode.Byte )
								throw new ArgumentException("Known word contains non-ASCII character.");
							wordNode.KeywordIndex = Array.IndexOf(knownWords, word.Substring(0,startsWith.Length+1));
							if( wordNode.KeywordIndex==-1 )
								wordNode.KeywordIndex = Array.IndexOf(knownWords, word);
							wordNode.NextByteNodes = BuildNodes(nextStartsWith, knownWords);
							nodesStartingWith.Add(nextStartsWith, wordNode);
						}
					}
				}
				return new List<ByteNode>(nodesStartingWith.Values);
			}

			class ByteNode
			{
				public byte Byte;
				public int KeywordIndex;
				public List<ByteNode> NextByteNodes;
			}

			public WordReader GetReader()
			{
				return new WordReader(parseDefinition, stoppers, knownWords);
			}
		}

		const byte CR = (byte)'\r';
		const byte LF = (byte)'\n';
		const byte Space = (byte)' ';
		const byte TAB = (byte)'\t';
		const byte Colon = (byte)':';
		const byte Percent = (byte)'%';

		string m_Word;
		int m_KnownWordIndexPlus1;
		int m_ReadByteCount;

		ReaderState currentState;
		bool m_IsFailed;

		// [{previous} <knownWordIndex> ] <nextByte>, <newOffset> <nextByte>, <newOffset> ... <zero-byte>
		byte[] parseDefinitionBuffer;
		byte[] stoppers;
		string[] knownWords;
		int parseDefinitionOffset;
		StringBuilder wordBuilder;

		private WordReader(byte[] parseDefinition, byte[] stoppers, string[] knownWords)
		{
			this.parseDefinitionBuffer = parseDefinition;
			this.stoppers = stoppers;
			this.knownWords = knownWords;

			this.m_Word = null;
			this.m_KnownWordIndexPlus1 = 0;
			this.m_ReadByteCount = 0;
			this.currentState = ReaderState.KnownWord;
			this.m_IsFailed = false;

			this.parseDefinitionOffset = 0;
			this.wordBuilder = null;
		}

		public int Read(byte[] buffer, int offset, int length)
		{
			if( m_IsFailed )
			{
				throw new InvalidOperationException("Reader already failed.");
			}

			int readCount = 0;

			byte nextByte = buffer[offset];

			switch( currentState )
			{
				case ReaderState.KnownWord:
					int newParseDefinitionOffset = parseDefinitionOffset;
					byte checkByte = parseDefinitionBuffer[newParseDefinitionOffset];
					while( true )
					{
						if( checkByte == 0 )
						{
							if( readCount == 0 && m_ReadByteCount == 0 )
							{
								currentState = ReaderState.UnknownWord;
								goto case ReaderState.UnknownWord;
							}
							
							string wholeKnownWord = knownWords[parseDefinitionBuffer[parseDefinitionOffset-1]];
							if( wholeKnownWord.Length == m_ReadByteCount + readCount )
							{
								currentState = ReaderState.AfterKnownWord;
								goto case ReaderState.AfterKnownWord;
							}
							else
							{
								wordBuilder = new StringBuilder(wholeKnownWord, 0, m_ReadByteCount + readCount, m_ReadByteCount + readCount + 2);
								currentState = ReaderState.UnknownWord;
								goto case ReaderState.UnknownWord;
							}
						}
						else if( nextByte == checkByte )
						{
							newParseDefinitionOffset = parseDefinitionBuffer[newParseDefinitionOffset+1];
							readCount++;

							checkByte = parseDefinitionBuffer[newParseDefinitionOffset];
							if( newParseDefinitionOffset == 0 )
							{
								currentState = ReaderState.AfterKnownWord;

								if( readCount == length )
								{
									m_ReadByteCount += readCount;
									return readCount;
								}

								nextByte = buffer[offset + readCount];
								goto case ReaderState.AfterKnownWord;
							}
							else
							{
								parseDefinitionOffset = newParseDefinitionOffset;
								if( readCount == length )
								{
									m_ReadByteCount += readCount;
									return readCount;
								}

								nextByte = buffer[offset + readCount];
								continue;
							}
						}

						newParseDefinitionOffset += 2;
						checkByte = parseDefinitionBuffer[newParseDefinitionOffset];
					}

				case ReaderState.AfterKnownWord:
					if( Array.IndexOf(stoppers, nextByte) >= 0 )
					{
						int setKnownWordIndex = parseDefinitionBuffer[parseDefinitionOffset - 1];
						m_KnownWordIndexPlus1 = setKnownWordIndex + 1;
						m_Word = knownWords[setKnownWordIndex];
						currentState = ReaderState.Succeed;
						m_ReadByteCount += readCount;
						return readCount;
					}
					else
					{
						string wholeKnownWord = knownWords[parseDefinitionBuffer[parseDefinitionOffset - 1]];
						wordBuilder = new StringBuilder(wholeKnownWord, 0, m_ReadByteCount + readCount, m_ReadByteCount + readCount + 2);
						currentState = ReaderState.UnknownWord;
						goto UnknownWordNoStopper;
					}

				case ReaderState.UnknownWord:
					if( Array.IndexOf(stoppers, nextByte) >= 0 )
					{
						if( wordBuilder == null )
						{
							char[] resultArray = new char[readCount];
							for( int i = 0; i < readCount; i++ )
							{
								resultArray[i] = (char)buffer[offset + i];
							}
							m_ReadByteCount += readCount;
							m_Word = new string(resultArray);
							currentState = ReaderState.Succeed;
							return readCount;
						}
						else
						{
							m_ReadByteCount += readCount;
							m_Word = wordBuilder.ToString();
							currentState = ReaderState.Succeed;
							return readCount;
						}
					}

				UnknownWordNoStopper:
					if( nextByte<Space && nextByte!=TAB )
					{
						m_ReadByteCount += readCount;
						m_IsFailed = true;
						return readCount;
					}
					else
					{
						if( wordBuilder!=null )
							wordBuilder.Append((char)nextByte);

						readCount++;
						if( readCount == length )
						{
							if( wordBuilder==null )
							{
								wordBuilder = new StringBuilder(readCount);
								for( int i = 0; i < readCount; i++ )
								{
									wordBuilder.Append((char)buffer[offset + i]);
								}
							}
							m_ReadByteCount += readCount;
							return readCount;
						}

						nextByte = buffer[offset + readCount];
						goto case ReaderState.UnknownWord;
					}

				case ReaderState.Succeed:
					throw new InvalidOperationException("Reader has already completed.");

				default:
					throw new InvalidOperationException();
			}
		}

		public bool IsFailed { get { return m_IsFailed; } }
		public bool IsSucceed { get { return currentState == ReaderState.Succeed; } }
		public string Word { get { return m_Word; } }
		public int KnownWordIndex { get { return m_KnownWordIndexPlus1 - 1; } }
		public int ReadByteCount { get { return m_ReadByteCount; } }

		public override string ToString()
		{
			if( this.IsFailed )
			{
				return "{Failed at "+this.ReadByteCount+" "+ this.currentState+"}";
			}
			else if( this.IsSucceed )
			{
				return "{" + (KnownWordIndex >= 0 ? "[" + KnownWordIndex + "]" : "") + this.Word + " Succeed}";
			}
			else
			{
				if( currentState == ReaderState.KnownWord )
				{
                    if (parseDefinitionOffset == 0)
                        return "{" + currentState + "}";

                    int currentKnownWordIndex = parseDefinitionBuffer[parseDefinitionOffset - 1];
					string currentKnownWord = knownWords[currentKnownWordIndex];
					if( currentKnownWord.Length <= this.ReadByteCount )
					{
						return "{[" + currentKnownWordIndex + "]" + currentKnownWord + "... " + currentState + "}";
					}
					else
					{
						return "{[" + currentKnownWordIndex + "]" + currentKnownWord.Substring(0, this.ReadByteCount) + "?" + currentKnownWord.Substring(this.ReadByteCount) + " " + currentState + "}";
					}
				}
				else if( currentState == ReaderState.AfterKnownWord )
				{
					int currentKnownWordIndex = parseDefinitionBuffer[parseDefinitionOffset - 1];
					string currentKnownWord = knownWords[currentKnownWordIndex];
					return "{[" + currentKnownWordIndex + "]" + currentKnownWord + "... " + currentState + "}";
				}
                else if (currentState == ReaderState.UnknownWord)
                {
                    if (wordBuilder == null)
                        return "{" + currentState + "}";
                    else
                        return "{" + wordBuilder.ToString() + "... " + currentState + "}";
                }
                else
                {
                    return "{currentState:" + currentState + "}";
                }
			}
		}
	}
}
