using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

static class DebugExtensions
{
    public static string ToDebugString(this ArraySegment<byte> bytes)
    {
        if (bytes.Array == null)
            return "{Array=null}";
        else
            return "{" + (bytes.Offset == 0 ? "" : bytes.Offset + "-") + bytes.Count + ":" + Encoding.UTF8.GetString(bytes.Array, bytes.Offset, bytes.Count) + "}";
    }

    public static string ToDebugString(this byte[] bytes)
    {
        return "{" + bytes.Length + ":" + Encoding.UTF8.GetString(bytes, 0, bytes.Length) + "}";
    }
}