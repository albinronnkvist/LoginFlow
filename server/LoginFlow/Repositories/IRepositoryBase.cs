using System.Linq.Expressions;

namespace LoginFlow.Repositories
{
    public interface IRepositoryBase<T>
    {
        Task<T> FindOneAsync(int id);
        Task<T> FindOneByConditionAndIncludeAsync(Expression<Func<T, bool>> whereExpression, Expression<Func<T, object>> includeExpression, bool trackChanges);
        Task<T> FindOneByConditionAsync(Expression<Func<T, bool>> expression, bool trackChanges);
        Task<IEnumerable<T>> FindAllAsync(bool trackChanges);
        Task<IEnumerable<T>> FindAllIncludeAsync(Expression<Func<T, object>> expression, bool trackChanges);
        Task<IEnumerable<T>> FindByConditionAsync(Expression<Func<T, bool>> expression, bool trackChanges);
        Task<IEnumerable<T>> FindByConditionAndIncludeAsync(Expression<Func<T, bool>> whereExpression, Expression<Func<T, object>> includeExpression, bool trackChanges);
        void Add(T entity);
        void AddRange(IEnumerable<T> entities);
        void Remove(T entity);
        void RemoveRange(IEnumerable<T> entities);
    }
}
