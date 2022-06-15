using LoginFlow.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
namespace LoginFlow.Repositories.Configuration
{
    public class CustomerConfiguration : IEntityTypeConfiguration<Customer>
    {
        public void Configure(EntityTypeBuilder<Customer> builder)
        {
            var customer = new Customer
            {
                Id = 1,
                UserName = "albin",
                Email = "albin@gmail.com",
                Phone1 = "0735854733",
                Phone2 = "0735854733"
            };

            builder.HasData(customer);
        }
    }
}
