namespace LoginFlow.Exceptions
{
    public abstract class UnprocessableEntityException : Exception
    {
        protected UnprocessableEntityException(string message) : base(message)
        {
        }
    }
}
