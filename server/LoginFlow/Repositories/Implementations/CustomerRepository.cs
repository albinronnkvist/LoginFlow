using LoginFlow.Models;
using LoginFlow.Repositories.Interfaces;

namespace LoginFlow.Repositories.Implementations
{
    public class CustomerRepository : RepositoryBase<Customer>, ICustomerRepository
    {
        public CustomerRepository(RepositoryContext repositoryContext)
            : base(repositoryContext)
        {
        }
    }
}
