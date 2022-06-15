using LoginFlow.Models;
using LoginFlow.Repositories.Configuration;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace LoginFlow.Repositories
{
    public class RepositoryContext : IdentityDbContext<User>
    {
        public RepositoryContext(DbContextOptions options) : base(options)
        {
        }

        public DbSet<Customer>? Customers { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure default roles and admins
            modelBuilder.ApplyConfiguration(new RoleConfiguration());
            modelBuilder.ApplyConfiguration(new AdminConfiguration());
            modelBuilder.ApplyConfiguration(new AdminWithRoleConfiguration());
            modelBuilder.ApplyConfiguration(new CustomerConfiguration());


            // Customer
            var customerBuilder = modelBuilder.Entity<Customer>();
            customerBuilder.ToTable("Customer");
            customerBuilder.HasAlternateKey(c => c.UserName);
        }
    }
}
