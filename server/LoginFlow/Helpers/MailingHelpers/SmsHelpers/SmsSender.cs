using Newtonsoft.Json;

namespace LoginFlow.Helpers.MailingHelpers.SmsHelpers
{
    public class SmsSender : ISmsSender
    {
        private readonly IHttpClientFactory _httpClient;
        private readonly ILogger<SmsSender> _logger;

        public SmsSender(IHttpClientFactory httpClient, ILogger<SmsSender> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
        }


        public async Task<bool> SendSmsAsync(SmsMessage message)
        {
            var smsMessage = CreateSmsMessage(message);
            var wasSent = await SendAsync(smsMessage);

            return wasSent;
        }

        private static string CreateSmsMessage(SmsMessage smsMessage)
        {
            var number = smsMessage.Number;
            var message = smsMessage.Message;

            var fullUrl = $"{number}?message={message}";
            return fullUrl;
        }

        public string PopulateCodeBody(string name, string code)
        {
            var body = $"{code}";

            return body;
        }

        private async Task<bool> SendAsync(string url)
        {
            try
            {
                var httpClient = _httpClient.CreateClient("Telavox");
                var response = await httpClient.GetAsync(url);
                var result = await response.Content.ReadAsStringAsync();
                var message = JsonConvert.DeserializeObject<SmsResponse>(result);

                // Telavox returns "OK" if successful or an error message if not successful.
                if (message.Message == "OK")
                {
                    return true;
                }
                else
                {
                    _logger.LogError(message.Message);
                    return false;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message, ex);
                return false;
            }
        }
    }
}
