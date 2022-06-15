using System.ComponentModel.DataAnnotations;

namespace LoginFlow.DTOs.User
{
    public class AdminUpdateUserDto
    {
        public string? FullName { get; set; }

        [Required(ErrorMessage = "Username is required")]
        public string? UserName { get; set; }

        [Required(ErrorMessage = "Email is required")]
        [EmailAddress]
        public string? Email { get; set; }

        public string? PhoneNumber { get; set; }
    }
}
