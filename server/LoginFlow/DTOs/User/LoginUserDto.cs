using System.ComponentModel.DataAnnotations;

namespace LoginFlow.DTOs.User
{
    public class LoginUserDto
    {
        [Required(ErrorMessage = "Username is required")]
        public string? UserName { get; init; }

        [Required(ErrorMessage = "Password is required")]
        public string? Password { get; init; }
    }
}
