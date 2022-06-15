namespace LoginFlow.Exceptions.Conflict
{
    public class CustomerConflictException : ConflictException
    {
        public CustomerConflictException(string message)
            : base(message)
        {
        }
    }
}
