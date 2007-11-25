using System;
using System.Collections.Generic;
using System.Text;

namespace Mihailik.Net.Internal.StateMachine
{
	interface ITestReader
	{
		int Read(byte[] buffer, int offset, int length);
		bool IsFailed { get; }
		bool IsSucceed { get; }
		string FailureDescription { get; }
		int ReadByteCount { get; }
	}
}
