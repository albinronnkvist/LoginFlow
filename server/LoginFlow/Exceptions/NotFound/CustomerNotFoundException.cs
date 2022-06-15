namespace LoginFlow.Exceptions.NotFound
{
    public class CustomerNotFoundException : NotFoundException
    {
        public CustomerNotFoundException(string message)
            : base(message)
        {
        }
    }
}
