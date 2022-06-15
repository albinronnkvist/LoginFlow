using LoginFlow.Repositories.Interfaces;

namespace LoginFlow.Repositories
{
    public interface IUnitOfWork
    {
        ICustomerRepository Customer { get; }

        Task SaveAsync();
    }
}
