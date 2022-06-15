namespace LoginFlow.Helpers.MailingHelpers.SmsHelpers
{
    public class SmsMessage
    {
        public string? Number { get; set; }
        public string? Message { get; set; }

        public SmsMessage(string number, string message)
        {
            Number = number;
            Message = message;
        }
    }
}
