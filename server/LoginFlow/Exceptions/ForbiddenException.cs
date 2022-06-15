namespace LoginFlow.Exceptions
{
    public class ForbiddenException : Exception
    {
        protected ForbiddenException(string message) : base(message)
        {
        }
    }
}
