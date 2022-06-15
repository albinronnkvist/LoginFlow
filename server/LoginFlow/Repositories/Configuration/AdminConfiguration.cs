using LoginFlow.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LoginFlow.Repositories.Configuration
{
    public class AdminConfiguration : IEntityTypeConfiguration<User>
    {
        private const string adminId = "B22698B8-42A2-4115-9631-1C2D1E2AC5F7";

        public void Configure(EntityTypeBuilder<User> builder)
        {
            var admin = new User
            {
                Id = adminId,
                UserName = "abbe",
                NormalizedUserName = "ABBE",
                FullName = "Albin Rönnkvist",
                Email = "albin@gmail.com",
                NormalizedEmail = "ALBIN@GMAIL.COM"
            };

            admin.PasswordHash = PassGenerate(admin);

            builder.HasData(admin);
        }

        public string PassGenerate(User user)
        {
            var passHash = new PasswordHasher<User>();
            return passHash.HashPassword(user, "Abc123!valid");
        }
    }
}
