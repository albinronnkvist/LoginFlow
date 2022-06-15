namespace LoginFlow.Exceptions
{
    public class InternalServerErrorException : Exception
    {
        public InternalServerErrorException(string message)
            : base($"Internt serverfel: {message}")
        {
        }
    }
}
