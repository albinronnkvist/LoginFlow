using System.ComponentModel.DataAnnotations;

namespace LoginFlow.DTOs.User
{
    public class RegisterUserDto
    {
        public string? FullName { get; set; }

        [Required(ErrorMessage = "Username is required")]
        public string? UserName { get; set; }

        [Required(ErrorMessage = "Password is required")]
        public string? Password { get; set; }

        [Required(ErrorMessage = "Email is required")]
        [EmailAddress]
        public string? Email { get; set; }

        public string? PhoneNumber { get; set; }

        public ICollection<string>? Roles { get; set; }
    }
}
