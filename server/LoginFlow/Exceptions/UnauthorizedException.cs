namespace LoginFlow.Exceptions
{
    public abstract class UnauthorizedException : Exception
    {
        protected UnauthorizedException(string message) : base(message)
        {
        }
    }
}
