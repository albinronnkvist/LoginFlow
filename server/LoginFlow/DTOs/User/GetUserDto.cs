namespace LoginFlow.DTOs.User
{
    public class GetUserDto
    {
        public string? Id { get; set; }

        public string? FullName { get; set; }

        public string? UserName { get; set; }

        public string? Email { get; set; }

        public string? PhoneNumber { get; set; }

        public ICollection<string>? Roles { get; set; }
    }
}
