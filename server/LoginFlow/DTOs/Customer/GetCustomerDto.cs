using System.ComponentModel.DataAnnotations.Schema;

namespace LoginFlow.DTOs.Customer
{
    public class GetCustomerDto
    {
        public int Id { get; set; }
        public string? UserName { get; set; }
        public string? Email { get; set; }
        public string? Phone1 { get; set; }
        public string? Phone2 { get; set; }

        public DateTime CreatedAtUtc { get; init; }
        public DateTime UpdatedAtUtc { get; set; }
    }
}
