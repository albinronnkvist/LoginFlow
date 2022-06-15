namespace LoginFlow.Helpers.MailingHelpers.SmsHelpers
{
    public interface ISmsSender
    {
        string PopulateCodeBody(string name, string code);
        Task<bool> SendSmsAsync(SmsMessage message);
    }
}
