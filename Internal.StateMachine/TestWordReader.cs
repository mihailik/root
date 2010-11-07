using System;
using System.Collections.Generic;
using System.Text;
using System.Diagnostics;

namespace Mihailik.Net.Internal.StateMachine
{
	internal static class TestWordReader
	{
		private class TestInputData
		{
			public string InputString;
			public int[] ChunkSizes;
			public string ExpectedResult;
		}

		public static void Test1(string stopperChars, string[] knownWords)
		{
			IgnoreCaseWordReader.Generator gen = new IgnoreCaseWordReader.Generator(stopperChars, knownWords);

			List<string> inputStringCases = new List<string>();
			List<string> expectedResults = new List<string>();
			foreach( string w in knownWords )
			{
				foreach (char stop in stopperChars)
				{
					inputStringCases.Add(w + stop + w); expectedResults.Add(w);
					inputStringCases.Add(w + "aaa" + stop + w); expectedResults.Add(w+"aaa");
				}
			}

			Random rnd = new Random();
			for( int i = 0; i < 10; i++ )
			{
				int count = rnd.Next(10) + 1;
				StringBuilder buf = new StringBuilder();
				for( int j = 0; j < count; j++ )
				{
					buf.Append((char)(33 + rnd.Next(90)));
				}
				foreach( char stop in stopperChars )
				{
					inputStringCases.Add(buf.ToString() + stop + buf);
					expectedResults.Add(buf+"");
				}
			}

			int maxSize = 0;
			foreach( string s in inputStringCases )
			{
				maxSize = Math.Max(maxSize, s.Length);
			}

			List<List<int>> chunkSizeCases = new List<List<int>>();
			for( int i = 1; i < maxSize+2; i++ )
			{
				chunkSizeCases.Add(new List<int>(new int[] { i }));
			}

			for( int i = 0; i < maxSize*2; i++ )
			{
				List<int> l = new List<int>();
				chunkSizeCases.Add(l);
				for( int j = 0; j < maxSize; j++ )
				{
					l.Add(rnd.Next(maxSize / 3)+1);
				}
			}

			List<TestInputData> testCases = new List<TestInputData>();
			for( int i = 0; i<inputStringCases.Count; i++ )
			{
				string str = inputStringCases[i];
				foreach( List<int> sz in chunkSizeCases )
				{
					TestInputData t = new TestInputData();
					t.InputString = str;
					t.ExpectedResult = expectedResults[i];
					t.ChunkSizes = sz.ToArray();
					testCases.Add(t);
				}
			}
			foreach( TestInputData t in testCases.ToArray() )
			{
				TestInputData t1 = new TestInputData();
				t1.InputString = t.InputString.Substring(0, t.ExpectedResult.Length) + (char)2 + t.InputString.Substring(t.ExpectedResult.Length);
				t1.ExpectedResult = null;
				t1.ChunkSizes = t.ChunkSizes;
				testCases.Add(t1);

				TestInputData t2 = new TestInputData();
				t2.InputString = t.InputString.Substring(0, t.ExpectedResult.Length-1) + (char)2 + t.InputString.Substring(t.ExpectedResult.Length-1);
				t2.ExpectedResult = null;
				t2.ChunkSizes = t.ChunkSizes;
				testCases.Add(t2);
			}

			DateTime nextReport = DateTime.UtcNow;
			for( int iTest = 0; iTest<testCases.Count; iTest++ )
			{
				if( (iTest == 0) || (DateTime.UtcNow > nextReport) || (iTest == testCases.Count-1) )
				{
					Console.Write("Testing: " + iTest + "/" + testCases.Count + "...\r");
					nextReport = DateTime.UtcNow.AddSeconds(0.5);
				}

				TestInputData test = testCases[iTest];
				byte[] inputBytes = new byte[test.InputString.Length];
				for( int i = 0; i < test.InputString.Length; i++ )
				{
					inputBytes[i] = (byte)test.InputString[i];
				}

				// Replay from here
				IgnoreCaseWordReader reader = gen.GetReader();

				int readByteCount = 0;
				int totalChunkIndex = -1;
				while( true )
				{
					for( int i = 0; i < test.ChunkSizes.Length; i++ )
					{
						totalChunkIndex++;

						if( reader.ReadByteCount != readByteCount )
							Debugger.Break();

						if( reader.IsFailed || reader.IsSucceed )
							break;

						int testChunkSize = test.ChunkSizes[i];
						int chunkSize = Math.Min(testChunkSize, inputBytes.Length - readByteCount);

						if( chunkSize == 0 )
							Debugger.Break();

						reader.Read(inputBytes, readByteCount, chunkSize);

						if( reader.IsFailed )
						{
							if( test.ExpectedResult != null )
								Debugger.Break();
							else
								break;
						}

						if( !reader.IsFailed && !reader.IsSucceed )
							readByteCount += chunkSize;

						if( reader.IsSucceed )
						{
							if( reader.Word != test.ExpectedResult )
								Debugger.Break();
							break;
						}
					}

					if( reader.IsFailed || reader.IsSucceed )
						break;
				}
			}

			Console.WriteLine();
		}
	}
}
