/*
 *  Base repository to handle all basic operations for repositories. 
 */
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace LoginFlow.Repositories
{
    // The abstract-keyword indicates that a class is intended only
    // to be a base class of other classes, not instantiated on its own.
    public abstract class RepositoryBase<T> : IRepositoryBase<T> where T : class
    {
        // Inject DbContext
        protected RepositoryContext _repositoryContext;
        public RepositoryBase(RepositoryContext repositoryContext)
        {
            _repositoryContext = repositoryContext;
        }


        // All basic operations
        // Boolean "trackChanges" in FindAllAsync and FindByConditionAsync toggles tracking of entities
        // Set<T> creates a DbSet<TEntity> that can be used to query and save instances of that specific TEntity
        public async Task<T>? FindOneAsync(int id) => await _repositoryContext.Set<T>().FindAsync(id);

        public async Task<T>? FindOneByConditionAndIncludeAsync(Expression<Func<T, bool>> whereExpression, Expression<Func<T, object>> includeExpression, bool trackChanges) =>
            trackChanges ? await _repositoryContext.Set<T>().Where(whereExpression).Include(includeExpression).FirstOrDefaultAsync() : await _repositoryContext.Set<T>().Where(whereExpression).Include(includeExpression).AsNoTracking().FirstOrDefaultAsync();

        public async Task<T>? FindOneByConditionAsync(Expression<Func<T, bool>> expression, bool trackChanges) =>
            trackChanges ? await _repositoryContext.Set<T>().Where(expression).FirstOrDefaultAsync() : await _repositoryContext.Set<T>().Where(expression).AsNoTracking().FirstOrDefaultAsync();

        public async Task<IEnumerable<T>> FindAllAsync(bool trackChanges) =>
            trackChanges ? await _repositoryContext.Set<T>().ToListAsync() : await _repositoryContext.Set<T>().AsNoTracking().ToListAsync();

        public async Task<IEnumerable<T>> FindAllIncludeAsync(Expression<Func<T, object>> expression, bool trackChanges) =>
            trackChanges ? await _repositoryContext.Set<T>().Include(expression).ToListAsync() : await _repositoryContext.Set<T>().Include(expression).AsNoTracking().ToListAsync();

        public async Task<IEnumerable<T>> FindByConditionAsync(Expression<Func<T, bool>> expression, bool trackChanges) =>
            trackChanges ? await _repositoryContext.Set<T>().Where(expression).ToListAsync() : await _repositoryContext.Set<T>().Where(expression).AsNoTracking().ToListAsync();
        public async Task<IEnumerable<T>> FindByConditionAndIncludeAsync(Expression<Func<T, bool>> whereExpression, Expression<Func<T, object>> includeExpression, bool trackChanges) =>
            trackChanges ? await _repositoryContext.Set<T>().Where(whereExpression).Include(includeExpression).ToListAsync() : await _repositoryContext.Set<T>().Where(whereExpression).Include(includeExpression).AsNoTracking().ToListAsync();

        public void Add(T entity) => _repositoryContext.Set<T>().Add(entity);
        public void AddRange(IEnumerable<T> entities) => _repositoryContext.Set<T>().AddRange(entities);
        public void Remove(T entity) => _repositoryContext.Set<T>().Remove(entity);
        public void RemoveRange(IEnumerable<T> entities) => _repositoryContext.Set<T>().RemoveRange(entities);
    }
}
