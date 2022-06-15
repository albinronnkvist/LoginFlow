using MailKit.Security;
using MimeKit;

namespace LoginFlow.Helpers.MailingHelpers.EmailHelpers
{
    public class EmailSender : IEmailSender
    {
        private readonly EmailConfigurationFromSecrets _emailConfiguration;
        private readonly ILogger<EmailSender> _logger;

        public EmailSender(EmailConfigurationFromSecrets emailConfiguration, ILogger<EmailSender> logger)
        {
            _emailConfiguration = emailConfiguration;
            _logger = logger;
        }

        public async Task<bool> SendEmailAsync(EmailMessage message)
        {
            var emailMessage = CreateEmailMessage(message);
            var wasSent = await SendAsync(emailMessage);

            return wasSent;
        }


        public string PopulateCodeBody(string name, string code)
        {
            var body = "<body>"
                + $"<p style='font-size: 32px; color: #16c090'; text-align: center;><b>{code}</b></p>"
                + $"<p style='color: #001a3b' text-align: center;>Your temporary code</p> <br /><br /><br /><br />" 
                + "<i>The code is valid for 3 minutes. Ask for a new one of it has expired.</i>"
                + "</body>";

            return body;
        }

        private MimeMessage CreateEmailMessage(EmailMessage message)
        {
            var emailMessage = new MimeMessage();
            emailMessage.From.Add(new MailboxAddress("", _emailConfiguration.From));
            emailMessage.To.AddRange(message.To);
            emailMessage.Subject = message.Subject;
            emailMessage.Body = new TextPart(MimeKit.Text.TextFormat.Html) { Text = message.Content };

            return emailMessage;
        }



        private async Task<bool> SendAsync(MimeMessage mailMessage)
        {
            using (var client = new MailKit.Net.Smtp.SmtpClient())
            {
                try
                {
                    await client.ConnectAsync(_emailConfiguration.SmtpServer, _emailConfiguration.Port, SecureSocketOptions.StartTls);
                    client.AuthenticationMechanisms.Remove("XOAUTH2");
                    await client.AuthenticateAsync(_emailConfiguration.UserName, _emailConfiguration.Password);

                    await client.SendAsync(mailMessage);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex.Message, ex);
                    return false;
                }
                finally
                {
                    await client.DisconnectAsync(true);
                    client.Dispose();
                }
            }

            return true;
        }
    }
}
