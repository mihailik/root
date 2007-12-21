using System;
using System.Collections.Generic;
using System.Text;
using System.IO;
using System.Diagnostics;

namespace Mihailik.Net.Internal.StateMachine
{
	internal static class ReaderTesting
	{
		public static byte[] TextToBuffer(string testData)
		{
			string result = testData
				.Replace("\r", "")
				.Replace("\n", "")
				.Replace("[CR]", "\r")
				.Replace("[LF]", "\n");
			return Encoding.ASCII.GetBytes(result);
		}

		public static string BufferToText(byte[] buffer)
		{
			return Encoding.ASCII.GetString(buffer)
				.Replace("\r", "[CR]\r")
				.Replace("\n", "[LF]\n")
				.Replace("[CR]\r[LF]\n", "[CR][LF]\r\n");
		}

		public struct TestCase
		{
			public readonly string TestName;
			public readonly string BufferText;
			public readonly string[] States;

			public TestCase(string name, string bufferText, string[] states)
			{
				this.TestName = name;
				this.BufferText = bufferText;
				this.States = states;
			}

			public override string ToString()
			{
				StringBuilder result = new StringBuilder();
				result.Append("#test ");
				result.AppendLine(this.TestName);
				result.Append(this.BufferText);
				if( !this.BufferText.EndsWith("\r") && !this.BufferText.EndsWith("\n") )
					result.AppendLine();
				result.AppendLine("#states");
				foreach( string state in this.States )
				{
					result.AppendLine(state);
				}
				result.AppendLine("#end");

				return result.ToString();
			}
		}

		public static TestCase CreateTemplate<T>(string description, string bufferText)
			where T : IReader, new()
		{
			T reader = new T();
			byte[] buffer = TextToBuffer(bufferText);
			
			List<string> states = new List<string>();
			for( int i = 0; i < buffer.Length; i++ )
			{
				reader.Read(buffer, i, 1);
				states.Add(reader.ToString());
				if( reader.IsFailed )
				{
					break;
				}
			}

			return new TestCase(description, bufferText, states.ToArray());
		}

		public static IEnumerable<TestCase> LoadTests(IEnumerable<string> textLines)
		{
			Queue<string> lines = new Queue<string>(textLines);

			while( lines.Count > 0 )
			{

				string description = null;
				while( lines.Count > 0 )
				{
					string nextLine = lines.Dequeue();
					if( nextLine.StartsWith("#test") )
					{
						description = nextLine.Substring("#test".Length).Trim();
						break;
					}
				}

				if( description == null )
					yield break;

				StringBuilder bufferTextBuilder = new StringBuilder();
				while( lines.Count > 0 )
				{
					string nextLine = lines.Dequeue();
					if( nextLine.StartsWith("#states") )
					{
						break;
					}

					if( bufferTextBuilder.Length > 0 )
						bufferTextBuilder.AppendLine();
					bufferTextBuilder.Append(nextLine);
				}

				List<string> states = new List<string>();
				while( lines.Count > 0 )
				{
					string nextLine = lines.Dequeue();
					if( nextLine.StartsWith("#end") )
					{
						break;
					}

					if( nextLine.Trim().Length != 0 )
					{
						states.Add(nextLine.Trim());
					}
				}

				yield return new TestCase(description, bufferTextBuilder.ToString(), states.ToArray());
			}
		}

		public static void PerformTest<T>(TestCase test)
			where T : IReader, new()
		{
            for (int i = 1; i < test.BufferText.Length+10; i++)
            {
                TestChunkDataSequence<T>(test, i);
            }
		}

		static void TestChunkDataSequence<T>(TestCase test, IEnumerable<int> chunkSizes)
			where T : IReader, new()
		{
			byte[] buffer = TextToBuffer(test.BufferText);
			T reader = new T();
			int index = 0;
			List<string> passedStates = new List<string>();

			foreach( int sz in Repeat(chunkSizes) )
			{
				int readChunkSize = Math.Min(buffer.Length - index, sz);

				int previousReadByteCount = reader.ReadByteCount;
				int readCount = reader.Read(buffer, index, readChunkSize);
				if( previousReadByteCount+readCount != reader.ReadByteCount )
						if( Debugger.IsAttached )
							Debugger.Break();
						else
							throw new Exception("ReadByteCount is incorrect.");

				if( reader.IsFailed )
				{
					int lastStateIndex = test.States.Length - 1;

                    string expectedState = test.States[lastStateIndex];
					if( reader.ToString()!=expectedState )
						if( Debugger.IsAttached )
							Debugger.Break();
						else
							throw new Exception("Incorrect failure state of the reader.");

					if( reader.ReadByteCount != lastStateIndex )
                        if (Debugger.IsAttached)
                            Debugger.Break();
                        else
                            throw new Exception("Failed at wrong place.");

                    return;
				}

                if (readCount <= 0)
                    if (Debugger.IsAttached)
                        Debugger.Break();
                    else
                        throw new Exception("Read method return is zero or negative number.");


				if( readCount != readChunkSize )
                    if (Debugger.IsAttached)
                        Debugger.Break();
                    else
                        throw new Exception("Read method incorrect return.");

                string expectedFailureState = test.States[index+readCount-1];
                if (reader.ToString() != expectedFailureState)
				{
					if( Debugger.IsAttached )
						Debugger.Break();
					else
						throw new Exception("Incorrect state of the reader.");
				}

				passedStates.Add(reader.ToString());

				if( reader.IsSucceed || reader.IsFailed )
					break;

                index+=readCount;
			}
		}

		static IEnumerable<T> Repeat<T>(IEnumerable<T> items)
		{
			while( true )
			{
				foreach( T item in items )
				{
					yield return item;
				}
			}
		}

		static IEnumerable<T> Repeat<T>(params T[] items)
		{
			return Repeat((IEnumerable<T>)items);
		}

		static void TestChunkDataSequence<T>(TestCase test, params int[] chunkSizes)
            where T : IReader, new()
		{
			TestChunkDataSequence<T>(test, (IEnumerable<int>)chunkSizes);
		}
	}
}
