using System;
using System.Collections.Generic;
using System.Linq;
using System.IO;

namespace Mi.PE.PEFormat
{
    public sealed class RvaStream : Stream
    {
        public struct Range
        {
            public uint PhysicalAddress;
            public uint VirtualAddress;
            public uint Size;
        }

        const string RawStreamIsNotPositionedWithinAnyOfTheSections = "Raw stream is not positioned within any of the sections.";

        readonly Stream rawStream;
        readonly Range[] sectionRanges;

        public RvaStream(Stream rawStream, params Range[] sectionRanges)
        {
            if (rawStream == null)
                throw new ArgumentNullException("rawStream");
            if (sectionRanges == null)
                throw new ArgumentNullException("sectionRanges");
            if (!rawStream.CanRead || !rawStream.CanSeek)
                throw new ArgumentException("Underlying stream should support reading and seeking.", "rawStream");
            if (sectionRanges.Length == 0)
                throw new ArgumentException("At least one section must be specified for RVA positional arithmetics to work.", "sectionRanges");

            this.rawStream = rawStream;

            // Careful: no copying here
            // (should be fine unless the caller is actively malicious
            // or actiely stupid)
            this.sectionRanges = sectionRanges;
        }

        public override bool CanRead { get { return true; } }
        public override bool CanSeek { get { return true; } }

        /// <summary> Writing is not supported. </summary>
        public override bool CanWrite { get { return false; } }

        /// <summary> Flush supported, will throw. </summary>
        public override void Flush() { throw new NotSupportedException(); }
        
        /// <summary> SetLength is not supported, will throw. </summary>
        public override void SetLength(long value) { throw new NotSupportedException(); }
        
        /// <summary> Write is not supported, will throw. </summary>
        public override void Write(byte[] buffer, int offset, int count) { throw new NotSupportedException(); }

        /// <summary> BeginWrite is not supported, will throw. </summary>
        public override IAsyncResult BeginWrite(byte[] buffer, int offset, int count, AsyncCallback callback, object state) { throw new NotSupportedException(); }

        /// <summary> BeginWrite is not supported, will throw. </summary>
        public override void EndWrite(IAsyncResult asyncResult) { throw new NotSupportedException(); }

        /// <summary> Forwarding to the underlying raw stream. </summary>
        public override bool CanTimeout { get { return rawStream.CanTimeout; } }

        /// <summary> Forwarding to the underlying raw stream. </summary>
        public override int ReadTimeout { get { return rawStream.ReadTimeout; } set { rawStream.ReadTimeout = value; } }

        /// <summary> Forwarding to the underlying raw stream. </summary>
        public override IAsyncResult BeginRead(byte[] buffer, int offset, int count, AsyncCallback callback, object state) { return this.rawStream.BeginRead(buffer, offset, GetReadSize(count), callback, state); }

        /// <summary> Forwarding to the underlying raw stream. </summary>
        public override int EndRead(IAsyncResult asyncResult) { return this.rawStream.EndRead(asyncResult); }

        public override long Length
        {
            get
            {
                long length = 0;
                for (int i = 0; i < sectionRanges.Length; i++)
                {
                    length = Math.Max(length, sectionRanges[i].VirtualAddress + sectionRanges[i].Size);
                }
                return length;
            }
        }

        public override long Position
        {
            get
            {
                long physicaPosition = rawStream.Position;
                foreach (var range in this.sectionRanges)
                {
                    if (physicaPosition >= range.PhysicalAddress)
                    {
                        long rangeOffset = physicaPosition - range.PhysicalAddress;
                        if (rangeOffset < range.Size)
                            return range.VirtualAddress + rangeOffset;
                    }
                }

                throw new IOException(RawStreamIsNotPositionedWithinAnyOfTheSections);
            }
            set
            {
                foreach (var range in this.sectionRanges)
                {
                    if (value >= range.VirtualAddress)
                    {
                        long rangeOffset = value - range.VirtualAddress;
                        if (rangeOffset < range.Size)
                        {
                            this.rawStream.Position = range.PhysicalAddress + rangeOffset;
                            return;
                        }
                    }
                }

                throw new ArgumentOutOfRangeException("value", "Position is not within any of the section ranges.");
            }
        }

        public override int Read(byte[] buffer, int offset, int count)
        {
            return this.rawStream.Read(buffer, offset, GetReadSize(count));
        }

        int GetReadSize(int requestedCount)
        {
            long physicaPosition = rawStream.Position;
            foreach (var range in this.sectionRanges)
            {
                if (physicaPosition >= range.PhysicalAddress)
                {
                    long rangeOffset = physicaPosition - range.PhysicalAddress;
                    if (rangeOffset < range.Size)
                    {
                        int rangeChunkSize = (int)Math.Min(requestedCount, range.Size - rangeOffset);
                        return rangeChunkSize;
                    }
                }
            }

            throw new IOException(RawStreamIsNotPositionedWithinAnyOfTheSections);
        }

        public override long Seek(long offset, SeekOrigin origin)
        {
            switch (origin)
            {
                case SeekOrigin.Begin:
                    this.Position = offset;
                    break;

                case SeekOrigin.Current:
                    this.Position += offset;
                    break;

                case SeekOrigin.End:
                    this.Position = this.Length + offset;
                    break;

                default:
                    throw new ArgumentException("Unexpected value of "+origin.GetType().Name+".", "origin");
            }

            return this.Position;
        }
    }
}