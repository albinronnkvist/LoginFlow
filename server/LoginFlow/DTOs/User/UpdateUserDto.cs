using System.ComponentModel.DataAnnotations;

namespace LoginFlow.DTOs.User
{
    public class UpdateUserDto
    {
        public string? FullName { get; set; }

        [Required(ErrorMessage = "Email is required")]
        [EmailAddress]
        public string? Email { get; set; }

        public string? PhoneNumber { get; set; }
    }
}
