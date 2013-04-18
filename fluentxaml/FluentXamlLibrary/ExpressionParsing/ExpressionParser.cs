using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace FluentXamlLibrary.ExpressionParsing
{
    internal static class ExpressionParser
    {
        public static ExpressionNode ParseExpression(string expression)
        {
            if (expression == null)
                throw new ArgumentNullException("expression");

            return ParseExpression(expression, 0, expression.Length);
        }

        public static ExpressionNode ParseExpression(string expression, int offset, int length)
        {
            var seg = new StringSegment(expression, offset, length);
            var resultExpr = ParseExpression(ref seg);
            if (seg.Length != 0)
                throw new FormatException("Unexpected character '"+seg[0]+"' in expression.");
            return resultExpr;
        }

        static ExpressionNode ParseExpression(ref StringSegment expressionString)
        {
            ExpressionNode contextExpr = null;

            while (true)
            {
                expressionString = expressionString.TrimStart();

                if (expressionString.Length == 0)
                    break;

                char nextChar = expressionString[0];

                switch (nextChar)
                {
                    case '.':
                        ParseMemberAccess(ref expressionString, ref contextExpr);
                        break;

                    case '(':
                        ParseBrackets(ref expressionString, ref contextExpr);
                        break;

                    case '+':
                    case '-':
                        ParseAdditiveOperation(ref expressionString, ref contextExpr);
                        break;

                    case '*':
                    case '/':
                        ParseMultiplicativeOperation(ref expressionString, ref contextExpr);
                        break;

                    case '#':
                        if (contextExpr != null)
                            throw new FormatException("Id access is unexpected after expression.");
                        contextExpr = ParseIdNode(ref expressionString);
                        break;

                    case '@':
                        if (contextExpr != null)
                            throw new FormatException("Keyword is unexpected after expression.");
                        contextExpr = ParseKeywordNode(ref expressionString);
                        break;

                    case '`':
                    case '\'':
                    case '"':
                        if (contextExpr != null)
                            throw new FormatException("String literal is unexpected after expression.");
                        contextExpr = ParseStringLiteral(ref expressionString);
                        break;

                    default:
                        if (nextChar >= '0' && nextChar <= '9')
                        {
                            if (contextExpr != null)
                                throw new FormatException("Number is unexpected after expression.");
                            contextExpr = ParseNumber(ref expressionString);
                        }
                        else if (nextChar == '_' || char.IsLetter(nextChar))
                        {
                            if (contextExpr != null)
                                throw new FormatException("Id access is unexpected after expression.");
                            contextExpr = ParseNameNode(ref expressionString);
                        }
                        else
                        {
                            return contextExpr;
                        }
                        break;
                }
            }

            return contextExpr;
        }

        private static ConstantExpression ParseStringLiteral(ref StringSegment expressionString)
        {
            char quoteChar = expressionString[0];
            expressionString = expressionString.Substring(1);
            int closingQuotePos = expressionString.IndexOf(quoteChar);

            if (closingQuotePos < 0)
                throw new FormatException("String literal has no closing quote.");

            string str = expressionString.Substring(0, closingQuotePos).ToString();
            expressionString = expressionString.Substring(closingQuotePos + 1);
            var result = new ConstantExpression(str);
            return result;
        }

        private static NameExpression ParseNameNode(ref StringSegment expressionString)
        {
            if (!char.IsLetterOrDigit(expressionString[0])
                && expressionString[0]!='_')
                throw new InvalidOperationException();

            string name = ParseIdentifier(ref expressionString);
            var result = new NameExpression(name);
            return result;
        }

        private static ConstantExpression ParseNumber(ref StringSegment expressionString)
        {
            bool dotPassed = false;
            int numLength = 0;
            for (int i = 0; i < expressionString.Length; i++)
            {
                char nextChar = expressionString[i];
                if (nextChar >= '0' && nextChar <= '9')
                {
                    numLength++;
                    continue;
                }
                else if (!dotPassed && nextChar == '.')
                {
                    dotPassed = true;
                    numLength++;
                }
                else
                {
                    break;
                }
            }

            string numPiece = expressionString.Substring(0, numLength).ToString();
            
            object value;
            if (dotPassed)
            {
                value = decimal.Parse(numPiece, System.Globalization.CultureInfo.InvariantCulture);
            }
            else
            {
                int intValue;
                if (int.TryParse(numPiece, System.Globalization.NumberStyles.Number, System.Globalization.CultureInfo.InvariantCulture, out intValue))
                    value = intValue;
                else
                    value = decimal.Parse(numPiece, System.Globalization.CultureInfo.InvariantCulture);
            }

            expressionString = expressionString.Substring(numLength);

            return new ConstantExpression(value); 
        }

        private static IdExpression ParseIdNode(ref StringSegment expressionString)
        {
            if (expressionString[0] != '#')
                throw new InvalidOperationException();

            expressionString = expressionString.Substring(1);
            string id = ParseIdentifier(ref expressionString);
            var result = new IdExpression(id);
            return result;
        }

        private static RelativeSourceExpression ParseKeywordNode(ref StringSegment expressionString)
        {
            if (expressionString[0] != '@')
                throw new InvalidOperationException();

            expressionString = expressionString.Substring(1);
            string keyword = ParseIdentifier(ref expressionString);
            var result = new RelativeSourceExpression(keyword);
            return result;
        }

        private static string ParseIdentifier(ref StringSegment expressionString)
        {
            int idLength = 0;
            for (int i = 0; i < expressionString.Length; i++)
            {
                char nextChar = expressionString[i];
                bool isAcceptableIdCharacter =
                    (i == 0 ? char.IsLetter(nextChar) : char.IsLetterOrDigit(nextChar))
                    || nextChar == '_';

                if (!isAcceptableIdCharacter)
                    break;
                else
                    idLength++;
            }

            if (idLength == 0)
                throw new FormatException("Unexpected character at the start of identifier.");

            string id = expressionString.Substring(0, idLength).ToString();
            expressionString = expressionString.Substring(idLength);
            return id;
        }

        private static void ParseMultiplicativeOperation(
            ref StringSegment expressionString,
            ref ExpressionNode contextExpr)
        {
            if (contextExpr == null)
                throw new FormatException("Unexpected binary operation " + expressionString[0] + " without left operand.");

            char operationChar = expressionString[0];
            expressionString = expressionString.Substring(1);

            var rightOperand = ParseExpression(ref expressionString);

            List<AdditiveExpressionOperand> overarchingAdditiveExpressionOperands = null;
            bool isMultiplicativeExpressionSubtract = false;
            var multiplicativeExpressionOperands = new List<MultiplicativeExpressionOperand>();

            if (contextExpr is AdditiveExpression)
            {
                var addit = ((AdditiveExpression)contextExpr);

                overarchingAdditiveExpressionOperands = new List<AdditiveExpressionOperand>();

                overarchingAdditiveExpressionOperands.AddRange(
                    addit.Operands.Take(addit.Operands.Count - 1));

                var lastLeftExpressionOperand = addit.Operands.Last();
                isMultiplicativeExpressionSubtract = lastLeftExpressionOperand.IsSubtract;
                multiplicativeExpressionOperands.Add(new MultiplicativeExpressionOperand(lastLeftExpressionOperand.Operand, false));
            }
            else
            {
                multiplicativeExpressionOperands.Add(new MultiplicativeExpressionOperand(contextExpr, false));
            }
            
            if( rightOperand is AdditiveExpression )
            {
                var addit = ((AdditiveExpression)rightOperand);

                if( overarchingAdditiveExpressionOperands==null )
                    overarchingAdditiveExpressionOperands = new List<AdditiveExpressionOperand>();

                var firstRightExpressionOperand = addit.Operands.First();

                multiplicativeExpressionOperands.Add(
                    new MultiplicativeExpressionOperand(
                        firstRightExpressionOperand.Operand,
                        operationChar == '/'));

                overarchingAdditiveExpressionOperands.Add(
                    new AdditiveExpressionOperand(
                        new MultiplicativeExpression(multiplicativeExpressionOperands),
                        firstRightExpressionOperand.IsSubtract));

                overarchingAdditiveExpressionOperands.AddRange(
                    addit.Operands.Skip(1));
            }
            else
            {
                multiplicativeExpressionOperands.Add(new MultiplicativeExpressionOperand(rightOperand, operationChar=='/'));
            }

            if (overarchingAdditiveExpressionOperands == null)
            {
                contextExpr = new MultiplicativeExpression(multiplicativeExpressionOperands);
            }
            else
            {
                contextExpr = new AdditiveExpression(overarchingAdditiveExpressionOperands);
            }
        }

        private static void ParseAdditiveOperation(ref StringSegment expressionString, ref ExpressionNode contextExpr)
        {
            char operationChar = expressionString[0];

            expressionString = expressionString.Substring(1);

            if (contextExpr == null)
            {
                var operand = ParseExpression(ref expressionString);
                contextExpr = new AdditiveExpression(new [] { new AdditiveExpressionOperand(operand, operationChar=='-') });
            }
            else
            {
                var rightOperand = ParseExpression(ref expressionString);

                var operands = new List<AdditiveExpressionOperand>();

                if (contextExpr is AdditiveExpression)
                {
                    operands.AddRange(
                        ((AdditiveExpression)contextExpr).Operands);
                }
                else
                {
                    operands.Add(new AdditiveExpressionOperand(contextExpr, false));
                }

                if (rightOperand is AdditiveExpression)
                {
                    var rightListFirstOperand = ((AdditiveExpression)rightOperand).Operands.First();
                    if (operationChar == '-')
                        rightListFirstOperand = new AdditiveExpressionOperand(
                            rightListFirstOperand.Operand,
                            !rightListFirstOperand.IsSubtract);

                    operands.Add(rightListFirstOperand);

                    operands.AddRange(
                        ((AdditiveExpression)rightOperand).Operands.Skip(1));
                }
                else
                {
                    operands.Add(new AdditiveExpressionOperand(rightOperand, operationChar == '-'));
                }

                contextExpr = new AdditiveExpression(operands);
            }
        }

        private static void ParseBrackets(ref StringSegment expressionString, ref ExpressionNode contextExpr)
        {
            if (contextExpr == null)
            {
                expressionString = expressionString.Substring(1);
                var innerExpression = ParseExpression(ref expressionString);
                if (!expressionString.StartsWith(')'))
                    throw new FormatException("Closing bracket expected.");
                expressionString = expressionString.Substring(1);
                contextExpr = new BracketExpression(innerExpression);
            }
            else
            {
                var arguments = new List<ExpressionNode>();
                while (true)
                {
                    if (expressionString.StartsWith(')'))
                        break;

                    expressionString = expressionString.Substring(1);

                    var arg = ParseExpression(ref expressionString);
                    if (arg == null)
                        break;

                    arguments.Add(arg);

                    if (!expressionString.StartsWith(',')
                        && !expressionString.StartsWith(')'))
                        throw new FormatException("Comma for next argument or closing bracket expected.");
                }

                if (!expressionString.StartsWith(')'))
                    throw new FormatException("Closing bracket expected.");

                if (!(contextExpr is MemberAccessExpression))
                    throw new FormatException("Syntactic error: method invokation requires method name.");

                var memberAccessExpr = (MemberAccessExpression)contextExpr;

                ExpressionNode thisExpr;
                string methodName;

                int memberAccessLastDotPos = memberAccessExpr.MemberName.LastIndexOf('.');
                if( memberAccessLastDotPos>0 )
                {
                    methodName = memberAccessExpr.MemberName.Substring(memberAccessLastDotPos+1);
                    thisExpr = new MemberAccessExpression(
                        memberAccessExpr.ThisExpression,
                        memberAccessExpr.MemberName.Substring(0, memberAccessLastDotPos));
                }
                else
                {
                    methodName = memberAccessExpr.MemberName;
                    thisExpr = memberAccessExpr.ThisExpression;
                }

                expressionString = expressionString.Substring(1);

                contextExpr = new MethodExpression(thisExpr, methodName, arguments);
            }
        }

        static void ParseMemberAccess(ref StringSegment expressionString, ref ExpressionNode contextExpr)
        {
            if (contextExpr == null)
                throw new ArgumentNullException("contextExpr");
            if (!expressionString.StartsWith('.'))
                throw new InvalidOperationException();

            expressionString = expressionString.Substring(1);

            string memberName = ParseIdentifier(ref expressionString);

            contextExpr = new MemberAccessExpression(contextExpr, memberName);
        }
    }
}
