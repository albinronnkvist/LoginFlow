namespace LoginFlow.Exceptions.Forbidden
{
    public class CustomerForbiddenException : ForbiddenException
    {
        public CustomerForbiddenException(string message)
            : base(message)
        {
        }
    }
}
