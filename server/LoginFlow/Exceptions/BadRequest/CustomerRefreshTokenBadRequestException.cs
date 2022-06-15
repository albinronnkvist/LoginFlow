namespace LoginFlow.Exceptions.BadRequest
{
    public class CustomerRefreshTokenBadRequestException : BadRequestException
    {
        public CustomerRefreshTokenBadRequestException()
            : base("Felaktiga autentiseringsuppgifter, vänligen logga in på nytt.")
        {
        }
    }
}
