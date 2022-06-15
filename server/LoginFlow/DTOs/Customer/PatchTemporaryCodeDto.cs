using System.ComponentModel.DataAnnotations;

namespace LoginFlow.DTOs.Customer
{
    public class PatchTemporaryCodeDto
    {
        [Required(ErrorMessage = "Username is required")]
        public string? UserName { get; init; }
    }
}
