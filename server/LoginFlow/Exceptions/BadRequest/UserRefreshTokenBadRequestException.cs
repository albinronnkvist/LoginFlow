namespace LoginFlow.Exceptions.BadRequest
{
    public class UserRefreshTokenBadRequestException : BadRequestException
    {
        public UserRefreshTokenBadRequestException()
            : base("Dina autentiseringsuppgifter stämmer inte, vänligen logga in på nytt.")
        {
        }
    }
}
