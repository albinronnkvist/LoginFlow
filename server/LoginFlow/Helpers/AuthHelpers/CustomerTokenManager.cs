using LoginFlow.DTOs.Customer;
using LoginFlow.DTOs.User;
using LoginFlow.Exceptions.Unauthorized;
using LoginFlow.Models;
using LoginFlow.Repositories;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace LoginFlow.Helpers.AuthHelpers
{
    public class CustomerTokenManager
    {
        private readonly IConfiguration _configuration;
        private readonly IUnitOfWork _db;
        private Customer? _customer;

        public CustomerTokenManager(IConfiguration configuration, IUnitOfWork db)
        {
            _configuration = configuration;
            _db = db;
        }

        // Validate customer by checking if license plate exists in db.
        public async Task<bool> ValidateCustomer(LoginCustomerDto req)
        {
            // Find customer in db by license plate
            var customer = await _db.Customer
                .FindOneByConditionAsync(c => c.UserName.ToLower()
                .Equals(req.UserName.ToLower()), 
                    trackChanges: true);

            if (customer == null)
            {
                return false;
            }

            _customer = customer;
            _customer.RefreshTokenExpireAtUtc = DateTime.UtcNow.AddHours(1);

            return true;
        }

        public bool ValidateCode(LoginCustomerDto req)
        {
            // Check if input code match the code in db,
            // or if the code has expired.
            var validCode = PasswordHelper.Validate(req.TempCode, _customer.TempCode, _customer.TempCodeSalt);
            if (!validCode || _customer.TempCodeExpireAtUtc <= DateTime.UtcNow)
            {
                return false;
            }

            return true;
        }

        private SigningCredentials GetSigningCredentials()
        {
            var key = Encoding.UTF8.GetBytes(_configuration.GetSection("AuthenticationSecrets:JwtKey").Value);
            var secret = new SymmetricSecurityKey(key);
            return new SigningCredentials(secret, SecurityAlgorithms.HmacSha512Signature);
        }

        private List<Claim> GetClaims()
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, _customer.Id.ToString()),
                new Claim("id", _customer.Id.ToString()),
                new Claim(ClaimTypes.Name, _customer.UserName),
                new Claim("username", _customer.UserName),
                new Claim("email", _customer.Email),
                new Claim("phone1", _customer.Phone1),
                new Claim("phone2", _customer.Phone2),
                new Claim("refreshExpireAtUtc", new DateTimeOffset(DateTime.UtcNow.AddHours(1)).ToUnixTimeMilliseconds().ToString())
            };

            return claims;
        }

        private JwtSecurityToken GetTokenDescriptor(SigningCredentials signingCredentials, List<Claim> claims)
        {
            var tokenOptions = new JwtSecurityToken
            (
                issuer: _configuration.GetSection("AuthenticationSecrets:ValidIssuer").Value,
                audience: _configuration.GetSection("AuthenticationSecrets:ValidAudience").Value,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(10),
                signingCredentials: signingCredentials
            );

            return tokenOptions;
        }

        // Generate a random cryptographic number that represents the refresh token
        private static string GenerateRefreshToken()
        {
            var randomNumber = new byte[32];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(randomNumber);
                return Convert.ToBase64String(randomNumber);
            }
        }

        // Validate an access token,
        // and return a principal which holds identities with claims (information about the customer)
        private ClaimsPrincipal GetPrincipalFromExpiredToken(string token)
        {
            // Parameters for validating token. Has to be the same as when we created the token.
            var tokenValidationParameters = new TokenValidationParameters
            {
                ValidateAudience = true,
                ValidateIssuer = true,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration.GetSection("AuthenticationSecrets:JwtKey").Value)),
                ValidateLifetime = true,
                ValidIssuer = _configuration.GetSection("AuthenticationSecrets:ValidIssuer").Value,
                ValidAudience = _configuration.GetSection("AuthenticationSecrets:ValidAudience").Value,
            };

            // Read and validate the JWT
            var tokenHandler = new JwtSecurityTokenHandler();
            SecurityToken securityToken;
            var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out securityToken);

            var jwtSecurityToken = securityToken as JwtSecurityToken;
            if (jwtSecurityToken == null || !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha512Signature,
            StringComparison.InvariantCultureIgnoreCase))
            {
                throw new CustomerUnauthorizedException("Incorrect credentials, login again");
            }

            return principal;
        }

        // Create the token
        public async Task<TokenDto> CreateToken(bool updateRefreshExpiration)
        {
            // Get credentials and claims and pass it to the token descriptor,
            // which will be passed to the actual token we are creating
            var signingCredentials = GetSigningCredentials();
            var claims = GetClaims();
            var tokenDescriptor = GetTokenDescriptor(signingCredentials, claims);

            // Create a refresh token
            var refreshToken = GenerateRefreshToken();

            // Add the refresh token to the user object
            _customer.RefreshToken = refreshToken;

            // Expire temp code
            _customer.TempCodeExpireAtUtc = DateTime.UtcNow;

            // Update the expiration date of the refreh token, only if we passed true into CreateToken().
            // We only want to update this when the user logs in from scratch,
            // not when we are generating a new access token from the refresh token.
            if (updateRefreshExpiration)
            {
                _customer.RefreshTokenExpireAtUtc = DateTime.UtcNow.AddHours(1);
            }

            await _db.SaveAsync();

            // Create the access token with the content of the token descriptor.
            var accessToken = new JwtSecurityTokenHandler().WriteToken(tokenDescriptor);

            // Create a TokenDto which holds both the access token and the refresh token
            var token = new TokenDto(accessToken, refreshToken);

            // Return both tokens
            return token;
        }

        // Get a new access token from the refresh token
        public async Task<TokenDto> RefreshToken(TokenDto tokenDto)
        {
            // Get principal from an access token
            var principal = GetPrincipalFromExpiredToken(tokenDto.AccessToken);

            // Check if customer exists
            var customer = await _db.Customer
                .FindOneByConditionAsync(c => c.UserName.ToLower()
                .Equals(principal.FindFirstValue(ClaimTypes.Name).ToLower()), 
                    trackChanges: false);
            if (customer == null || customer.RefreshToken != tokenDto.RefreshToken || customer.RefreshTokenExpireAtUtc <= DateTime.UtcNow)
            {
                throw new CustomerUnauthorizedException("Incorrect credentials, login again");
            }

            _customer = customer;

            // Return a new token without updating the refresh tokens expiration time.
            // We don't want to update the expiration time since the user isn't logging in manually, we only
            // want to provide a fresh access token.
            return await CreateToken(updateRefreshExpiration: false);
        }
    }
}
