namespace LoginFlow.Exceptions.Conflict
{
    public class UserConflictException : ConflictException
    {
        public UserConflictException(string message)
            : base(message)
        {
        }
    }
}