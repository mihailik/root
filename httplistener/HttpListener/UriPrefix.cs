using System;
using System.Collections.Generic;
using System.Text;

namespace Mihailik.Net
{
    internal struct UriPrefix : IEquatable<UriPrefix>
    {
        public readonly string Scheme;
        public readonly string Host;
        public readonly int Port;
        public readonly string Path;
        public readonly UriPrefixKind Kind;

        private UriPrefix(string scheme, string host, int port, string path, UriPrefixKind kind)
        {
            this.Scheme = scheme;
            this.Host = host;
            this.Port = port;
            this.Path = path;
            this.Kind = kind;
        }

        public static bool TryParse(string prefix, out UriPrefix result)
        {
            string scheme;
            string host;
            string port;
            string path;

            int schemeLength;
            if (prefix.StartsWith("http:", StringComparison.OrdinalIgnoreCase))
            {
                scheme = "http";
                schemeLength = "http:".Length;
            }
            else if (prefix.StartsWith("https:", StringComparison.OrdinalIgnoreCase))
            {
                scheme = "https";
                schemeLength = "https:".Length;
            }
            else
            {
                result = default(UriPrefix);
                return false;
            }

            if (prefix.Length > schemeLength
                && prefix[schemeLength] == '/')
            {
                schemeLength++;
                if (prefix.Length > schemeLength
                && prefix[schemeLength] == '/')
                {
                    schemeLength++;
                }
            }

            if (prefix.Length == schemeLength)
            {
                result = default(UriPrefix);
                return false;
            }

            int portDelimiterPos = prefix.IndexOf(':', schemeLength);
            int slashPos = prefix.IndexOf('/', schemeLength);

            if (portDelimiterPos < 0)
            {
                if (slashPos < 0)
                {
                    host = prefix.Substring(schemeLength);
                    port = null;
                    path = null;
                }
                else
                {
                    host = prefix.Substring(schemeLength, slashPos - schemeLength);
                    port = null;
                    path = prefix.Substring(slashPos);
                }
            }
            else
            {
                if (slashPos < 0)
                {
                    if (portDelimiterPos == prefix.Length - 1)
                    {
                        result = default(UriPrefix);
                        return false;
                    }

                    host = prefix.Substring(schemeLength, portDelimiterPos - schemeLength);
                    port = prefix.Substring(portDelimiterPos + 1);
                    path = null;
                }
                else
                {
                    if (portDelimiterPos < slashPos)
                    {
                        host = prefix.Substring(schemeLength, portDelimiterPos - schemeLength);
                        port = prefix.Substring(portDelimiterPos + 1, slashPos - portDelimiterPos - 1);
                        path = prefix.Substring(slashPos);
                    }
                    else
                    {
                        host = prefix.Substring(schemeLength, slashPos - schemeLength);
                        port = null;
                        path = prefix.Substring(slashPos);
                    }
                }
            }

            if (string.IsNullOrEmpty(host))
            {
                result = default(UriPrefix);
                return false;
            }

            int portNum;

            if (port == null)
            {
                portNum = 80;
            }
            else
            {
                if (!int.TryParse(
                        port,
                        System.Globalization.NumberStyles.Integer,
                        System.Globalization.CultureInfo.InvariantCulture,
                        out portNum))
                {
                    result = default(UriPrefix);
                    return false;
                }
            }

            UriPrefixKind kind;

            if (host == "*")
            {
                host = null;
                kind = UriPrefixKind.AllHosts;
            }
            else if (host == "+")
            {
                host = null;
                kind = UriPrefixKind.OtherHosts;
            }
            else
            {
                kind = UriPrefixKind.ExactHost;
            }

            if (path == null)
                path = "/";

            result = new UriPrefix(scheme, host, portNum, path, kind);
            return true;
        }

        public UriPrefix StripPath()
        {
            return new UriPrefix(this.Scheme, this.Host, this.Port, null, this.Kind);
        }

        public override string ToString()
        {
            return "{"+this.Kind+" "+Scheme+"://"+Host+":"+Port+Path+"}";
        }

        #region Equality override

        public override int GetHashCode()
        {
            return
                (Scheme==null ? 0 : Scheme.GetHashCode())+
                (Host==null ? 0 : Host.GetHashCode())+
                Port.GetHashCode()+
                (Path==null ? 0 : Path.GetHashCode());
        }

        public override bool Equals(object obj)
        {
            if (obj is UriPrefix)
            {
                UriPrefix other = (UriPrefix)obj;
                return this.Equals(other);
            }
            else
            {
                return false;
            }
        }

        private bool Equals(UriPrefix other)
        {
            if (ReferenceEquals(other, null))
                return false;

            return
                string.Equals(this.Scheme, other.Scheme, StringComparison.OrdinalIgnoreCase)
                && string.Equals(this.Host, other.Host, StringComparison.OrdinalIgnoreCase)
                && this.Port == other.Port
                && string.Equals(this.Path, other.Path, StringComparison.OrdinalIgnoreCase);
        }

        public static bool operator ==(UriPrefix p1, UriPrefix p2)
        {
            if (ReferenceEquals(p1, p2))
                return true;
            else if (ReferenceEquals(p1, null))
                return false;
            else
                return p1.Equals(p2);
        }

        public static bool operator !=(UriPrefix p1, UriPrefix p2)
        {
            return !(p1==p2);
        }

        bool IEquatable<UriPrefix>.Equals(UriPrefix other)
        {
            return this.Equals(other);
        }
        #endregion

        public static UriPrefix Parse(string p)
        {
            UriPrefix result;
            if (!TryParse(p, out result))
                throw new FormatException("URI prefix format invalid.");
            else
                return result;
        }
    }
}
