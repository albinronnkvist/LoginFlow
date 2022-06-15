using System.Security.Cryptography;
using System.Text;

namespace LoginFlow.Helpers.AuthHelpers
{
    public class PasswordHelper
    {
        public static string GenerateRandomSixLetterCode()
        {
            Random res = new Random();

            // String that contain both alphabets and numbers
            string str = "abcdefghijklmnopqrstuvwxyz0123456789";
            int size = 6;

            // Initializing the empty string
            string randomstring = "";

            for (int i = 0; i < size; i++)
            {
                int x = res.Next(str.Length);

                randomstring = randomstring + str[x];
            }

            return randomstring;
        }

        public static byte[] GenerateRandomSalt()
        {
            byte[] salt = new byte[32];
            RandomNumberGenerator rng = RandomNumberGenerator.Create();
            rng.GetBytes(salt);

            return salt;
        }

        public static byte[] SaltAndHash(string code, byte[] salt)
        {
            string saltedCode = code + salt;

            SHA512 sha = SHA512.Create();
            var hash = sha.ComputeHash(Encoding.Unicode.GetBytes(saltedCode));

            return hash;
        }

        public static bool Validate(string code, byte[] codeHash, byte[] codeSalt)
        {
            // Generate a new hash value with the input code and the salt from the database.
            var newHash = SaltAndHash(code, codeSalt);

            // Loop the entire length of the new hash value
            for (int i = 0; i < newHash.Length; i++)
            {
                // Compare the value of every index in both byte arrays(new hash and hash from the database)
                // If they do not match, return false.
                if (newHash[i] != codeHash[i])
                {
                    return false;
                }
            }

            // If they match, return true.
            return true;
        }
    }
}
