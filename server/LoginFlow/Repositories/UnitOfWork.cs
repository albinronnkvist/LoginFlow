/*
 *  Unit of work handles all repositories and 
 *  groups one or more transactions into a single transaction or "unit of work"
 *  so that all operations either pass or fail as one unit.
 */

using LoginFlow.Repositories.Implementations;
using LoginFlow.Repositories.Interfaces;

namespace LoginFlow.Repositories
{
    public sealed class UnitOfWork : IUnitOfWork
    {
        // Inject DbContext and repos
        // Lazy load repos so that they are only created when they are accessed for the first time. 
        private readonly RepositoryContext _repositoryContext;
        private readonly Lazy<ICustomerRepository> _customerRepository;

        public UnitOfWork(RepositoryContext repositoryContext)
        {
            _repositoryContext = repositoryContext;
            _customerRepository = new Lazy<ICustomerRepository>(() =>
                new CustomerRepository(repositoryContext));
        }

        public ICustomerRepository Customer => _customerRepository.Value;

        // SaveChanges()-method in UoW makes it possible to save changes in multiple repos with one action. 
        public async Task SaveAsync() => await _repositoryContext.SaveChangesAsync();
    }
}
