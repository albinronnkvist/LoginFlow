namespace LoginFlow.Exceptions.UnprocessableEntity
{
    public class GenericUnprocessableEntityException : UnprocessableEntityException
    {
        public GenericUnprocessableEntityException(string model) 
            : base(model)
        {
        }
    }
}
