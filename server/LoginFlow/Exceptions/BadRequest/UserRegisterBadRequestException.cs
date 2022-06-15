namespace LoginFlow.Exceptions.BadRequest
{
    public class UserRegisterBadRequestException : BadRequestException
    {
        public UserRegisterBadRequestException(string model)
            : base($"Fel vid registrering: {model}")
        {
        }
    }
}
