using Microsoft.AspNetCore.Identity;

namespace LoginFlow.Models
{
    public class User : IdentityUser
    {
        public string? FullName { get; set; }
        public string? RefreshToken { get; set; }
        public DateTime RefreshTokenExpireAtUtc { get; set; } = DateTime.UtcNow;
    }
}
