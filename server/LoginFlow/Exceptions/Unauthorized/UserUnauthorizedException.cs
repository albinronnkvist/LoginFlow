namespace LoginFlow.Exceptions.Unauthorized
{
    public class UserUnauthorizedException : UnauthorizedException
    {
        public UserUnauthorizedException(string message)
            : base(message)
        {
        }
    }
}
