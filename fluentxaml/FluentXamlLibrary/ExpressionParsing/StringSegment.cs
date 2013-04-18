using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace FluentXamlLibrary.ExpressionParsing
{
    public struct StringSegment
    {
        public readonly string String;
        public readonly int Offset;
        public readonly int Length;

        public StringSegment(string @string, int offset, int length)
        {
            if (@string== null)
                throw new ArgumentNullException("string");
            if (offset < 0 || offset > @string.Length)
                throw new ArgumentOutOfRangeException("offset");
            if (length < 0 || offset + length > @string.Length)
                throw new ArgumentOutOfRangeException("length");

            this.String = @string;
            this.Offset = offset;
            this.Length = length;
        }

        public StringSegment TrimStart()
        {
            int newOffset = this.Offset;
            int newLength = this.Length;

            while (newLength > 0 && char.IsWhiteSpace(this.String[newOffset]))
            {
                newOffset++;
                newLength--;
            }

            return new StringSegment(this.String, newOffset, newLength);
        }

        public bool StartsWith(char c)
        {
            if (this.Length == 0)
                return false;

            return this.String[this.Offset] == c;
        }

        public char this[int index]
        {
            get
            {
                if (index<0 || index >= this.Length)
                    return string.Empty[0];
                else
                    return this.String[this.Offset + index];
            }
        }

        public StringSegment Substring(int offset)
        {
            if (offset < 0 || offset > this.Length)
                throw new ArgumentOutOfRangeException("offset");

            return new StringSegment(this.String, this.Offset + offset, this.Length - offset);
        }

        public StringSegment Substring(int offset, int length)
        {
            if (offset < 0 || offset >= this.Length)
                throw new ArgumentOutOfRangeException("offset");
            if( length<0 || offset+length>this.Length)
                throw new ArgumentOutOfRangeException("length");

            return new StringSegment(this.String, this.Offset + offset, length);
        }

        public int IndexOf(char c)
        {
            for (int i = 0; i < this.Length; i++)
            {
                if (this[i] == c)
                    return i;
            }

            return -1;
        }

        public override string ToString()
        {
            return this.Length == 0 ? string.Empty : this.String.Substring(this.Offset, this.Length);
        }
    }
}
