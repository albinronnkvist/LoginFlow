namespace LoginFlow.Exceptions.BadRequest
{
    public class CustomerBadRequestException : BadRequestException
    {
        public CustomerBadRequestException(string description)
            : base(description)
        {
        }
    }
}
