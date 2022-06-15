namespace LoginFlow.Helpers.MailingHelpers.EmailHelpers
{
    public interface IEmailSender
    {
        Task<bool> SendEmailAsync(EmailMessage message);

        string PopulateCodeBody(string name, string code);
    }
}
