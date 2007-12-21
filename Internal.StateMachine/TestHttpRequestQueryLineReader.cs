using System;
using System.Collections.Generic;
using System.Text;
using System.Diagnostics;

namespace Mihailik.Net.Internal.StateMachine
{
	internal static class TestHttpRequestQueryLineReader
	{
		class TestData
		{
			public string QueryLine;
			public string HttpMethod;
			public string RawUrl;
			public Version ProtocolVersion;

			public TestData(
				string queryLine,
				string httpMethod, string rawUrl, Version httpVersion)
			{
				this.QueryLine = queryLine;
				this.HttpMethod = httpMethod;
				this.RawUrl = rawUrl;
				this.ProtocolVersion = httpVersion;
			}
		}

		class TestCase
		{
			public TestData Data;
			public List<int> ChunkSizes;
		}

		public static void Test1()
		{
			List<TestData> dataCases = new List<TestData>();
			dataCases.Add(new TestData("GET / HTTP/1.1\r\n", "GET", "/", System.Net.HttpVersion.Version11));
			dataCases.Add(new TestData("POST / HTTP/1.1\r\n", "POST", "/", System.Net.HttpVersion.Version11));
			dataCases.Add(new TestData("HEAD / HTTP/1.1\r\n", "HEAD", "/", System.Net.HttpVersion.Version11));
			dataCases.Add(new TestData("GET / HTTP/1.0\r\n", "GET", "/", System.Net.HttpVersion.Version10));
			dataCases.Add(new TestData("POST / HTTP/1.0\r\n", "POST", "/", System.Net.HttpVersion.Version10));
			dataCases.Add(new TestData("HEAD / HTTP/1.0\r\n", "HEAD", "/", System.Net.HttpVersion.Version10));

			Random rnd = new Random();

			foreach( TestData d in dataCases.ToArray() )
			{
				string[] querySplit = d.QueryLine.Split(' ');
				
				querySplit[1] = Guid.NewGuid().ToString();

				TestData d1 = new TestData(
					string.Join(" ", querySplit),
					d.HttpMethod,
					querySplit[1],
					d.ProtocolVersion);

				dataCases.Add(d1);


				querySplit[1] = Guid.NewGuid().ToString() + Guid.NewGuid().ToString() + Guid.NewGuid().ToString() + Guid.NewGuid().ToString();

				d1 = new TestData(
					string.Join(" ", querySplit),
					d.HttpMethod,
                    querySplit[1],
					d.ProtocolVersion);

				dataCases.Add(d1);
			}

			int maxSize = 0;
			foreach( TestData d in dataCases)
			{
				maxSize = Math.Max(maxSize, d.QueryLine.Length);
			}

			List<List<int>> chunkSizeCases = new List<List<int>>();
			for( int i = 1; i < maxSize + 2; i++ )
			{
				List<int> l = new List<int>();
				chunkSizeCases.Add(l);
				for( int j = 0; j < maxSize; j++ )
				{
					l.Add(i);
				}
			}

			for( int i = 0; i < maxSize * 2; i++ )
			{
				List<int> l = new List<int>();
				chunkSizeCases.Add(l);
				for( int j = 0; j < maxSize; j++ )
				{
					l.Add(rnd.Next(maxSize / 3) + 1);
				}
			}

			List<TestCase> testCases = new List<TestCase>();
			foreach( TestData d in dataCases )
			{
				foreach( List<int> chunkSizes in chunkSizeCases )
				{
					TestCase c = new TestCase();
					c.Data = d;
					c.ChunkSizes = chunkSizes;
					testCases.Add(c);
				}
			}

			DateTime nextReport = DateTime.UtcNow;
			for( int iTest = 0; iTest < testCases.Count; iTest++ )
			{
				if( (iTest == 0) || (DateTime.UtcNow > nextReport) || (iTest == testCases.Count - 1) )
				{
					Console.Write("Testing: " + iTest + "/" + testCases.Count + "...\r");
					nextReport = DateTime.UtcNow.AddSeconds(0.5);
				}

				TestCase test = testCases[iTest];
				byte[] inputBytes = new byte[test.Data.QueryLine.Length];
				for( int i = 0; i < test.Data.QueryLine.Length; i++ )
				{
					inputBytes[i] = (byte)test.Data.QueryLine[i];
				}

				// Replay from here
				HttpRequestQueryLineReader reader = new HttpRequestQueryLineReader();

				int readByteCount = 0;
				int totalChunkIndex = -1;
				while( true )
				{
					for( int i = 0; i < test.ChunkSizes.Count; i++ )
					{
						totalChunkIndex++;

						if( reader.ReadByteCount != readByteCount )
							Debugger.Break();

						int testChunkSize = test.ChunkSizes[i];
						int chunkSize = Math.Min(testChunkSize, inputBytes.Length - readByteCount);

						if( chunkSize == 0 )
							Debugger.Break();

						// Replay from here
						reader.Read(inputBytes, readByteCount, chunkSize);

						if( reader.IsFailed )
						{
							if( test.Data.HttpMethod != null )
								Debugger.Break();
							else
								break;
						}

						readByteCount += chunkSize;

						if( reader.IsSucceed )
						{
							if( reader.HttpMethod != test.Data.HttpMethod )
								Debugger.Break();
							if( reader.RawUrl != test.Data.RawUrl )
								Debugger.Break();
							if( reader.ProtocolVersion != test.Data.ProtocolVersion )
								Debugger.Break();
							break;
						}
					}

					if( reader.IsSucceed || reader.IsFailed )
						break;
				}
			}

			Console.WriteLine();
		}
	}
}
