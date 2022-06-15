namespace LoginFlow.Exceptions.NotFound
{
    public sealed class UserNotFoundException : NotFoundException
    {
        public UserNotFoundException(string id)
            : base($"Användaren med id: {id} existerar inte.")
        {
        }
    }
}
