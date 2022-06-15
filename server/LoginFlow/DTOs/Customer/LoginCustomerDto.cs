using System.ComponentModel.DataAnnotations;

namespace LoginFlow.DTOs.Customer
{
    public class LoginCustomerDto
    {
        [Required(ErrorMessage = "Username is required")]
        public string? UserName { get; init; }

        [Required(ErrorMessage = "Temporary code is required")]
        public string? TempCode { get; init; }
    }
}
