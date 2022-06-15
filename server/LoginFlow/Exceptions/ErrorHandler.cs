using System.Text.Json;

namespace LoginFlow.Exceptions
{
    public class ErrorHandler
    {
        public int StatusCode { get; set; }
        public string? Message { get; set; }
        public override string ToString() => JsonSerializer.Serialize(this);
    }
}
