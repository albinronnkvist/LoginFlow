namespace LoginFlow.Exceptions.Unauthorized
{
    public class CustomerUnauthorizedException : UnauthorizedException
    {
        public CustomerUnauthorizedException(string message)
            : base(message)
        {
        }
    }
}
