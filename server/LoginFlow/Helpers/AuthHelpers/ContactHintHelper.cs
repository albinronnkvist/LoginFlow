namespace LoginFlow.Helpers.AuthHelpers
{
    public static class ContactHintHelper
    {
        public static string EmailHint(string email)
        {
            var emailParts = email.Split('@');
            var firstLetter = emailParts[0][0];
            var lastLetter = emailParts[0][^1..];

            var asterix = "";
            for (int i = 0; i < emailParts[0].Length - 2; i++)
            {
                asterix += "*";
            }

            return $"{firstLetter}{asterix}{lastLetter}@{emailParts[1]}";
        }

        public static string SmsHint(string phoneNumber)
        {
            var phone = phoneNumber;
            var phoneHint = phone[^4..];

            var asterix = "";
            for (int i = 0; i < phone.Length - 4; i++)
            {
                asterix += "*";
            }
            return $"{asterix}{phoneHint}";
        }
    }
}
