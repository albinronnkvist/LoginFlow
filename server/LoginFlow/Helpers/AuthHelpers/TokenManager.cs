/*
 *  Handle Jwt and refresh tokens.
 */
using LoginFlow.DTOs.User;
using LoginFlow.Exceptions.Unauthorized;
using LoginFlow.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace LoginFlow.Helpers.AuthHelpers
{
    public class TokenManager
    {
        private readonly UserManager<User> _userManager;
        private readonly IConfiguration _configuration;
        private User? _user;

        public TokenManager(UserManager<User> userManager, IConfiguration configuration)
        {
            _userManager = userManager;
            _configuration = configuration;
        }

        // Validate user by checking if name exists and if password is correct.
        public async Task<bool> ValidateUser(LoginUserDto userFromClient)
        {
            _user = await _userManager.FindByNameAsync(userFromClient.UserName);
            var result = (_user != null && await _userManager.CheckPasswordAsync(_user, userFromClient.Password));
            
            if (!result)
            {
                throw new UserUnauthorizedException("Wrong username or password");
            }

            _user.RefreshTokenExpireAtUtc = DateTime.UtcNow.AddDays(1);

            return result;
        }

        // Get the secret key from user secrets.
        // Create a new cryptographic symmetric key.
        // And create signing credentials that represents the cryptographic
        // key and security algorithm that are used to generate a digital signature.
        private SigningCredentials GetSigningCredentials()
        {
            var key = Encoding.UTF8.GetBytes(_configuration.GetSection("AuthenticationSecrets:JwtKey").Value);
            var secret = new SymmetricSecurityKey(key);
            return new SigningCredentials(secret, SecurityAlgorithms.HmacSha512Signature);
        }

        // Add claims(information) about the user, including it's roles. 
        private async Task<List<Claim>> GetClaims()
        {
            var claims = new List<Claim>
            {
                // ? Double claims beacuse Identity claim names are very long. Haven't found a fix yet.
                new Claim(ClaimTypes.Name, _user.UserName),
                new Claim("username", _user.UserName),
                new Claim(ClaimTypes.Email, _user.Email),
                new Claim("email", _user.Email),
                new Claim(ClaimTypes.NameIdentifier, _user.Id),
                new Claim("id", _user.Id),
                new Claim("refreshExpireAtUtc", new DateTimeOffset(_user.RefreshTokenExpireAtUtc).ToUnixTimeMilliseconds().ToString())
            };

            // ? identity returns a single string if the user only has one role,
            // and an array of strings if the user has many roles. 
            // I always want to return an array to make it easier for the client to handle roles.
            var roles = await _userManager.GetRolesAsync(_user);
            var rolesList = new List<string>();

            if (roles.Count <= 0)
            {
                claims.Add(new Claim("roles", JsonSerializer.Serialize(rolesList), JsonClaimValueTypes.JsonArray));
            }
            else
            {
                foreach (var role in roles)
                {
                    if (roles.Count == 1)
                    {
                        rolesList.Add(role);
                        claims.Add(new Claim(ClaimTypes.Role, role));
                        claims.Add(new Claim("roles", JsonSerializer.Serialize(rolesList), JsonClaimValueTypes.JsonArray));
                    }
                    else
                    {
                        claims.Add(new Claim(ClaimTypes.Role, role));
                        claims.Add(new Claim("roles", role));
                    }
                }
            }

            return claims;
        }

        // Add the description of the token with information about the user and how to verify the token.
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
        // and return a principal which holds identities with claims (information about the user)
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
                throw new UserUnauthorizedException("Incorrect credentials, login again");
            }

            return principal;
        }

        // Create the token
        public async Task<TokenDto> CreateToken(bool updateRefreshExpiration)
        {
            // Get credentials and claims and pass it to the token descriptor,
            // which will be passed to the actual token we are creating
            var signingCredentials = GetSigningCredentials();
            var claims = await GetClaims();
            var tokenDescriptor = GetTokenDescriptor(signingCredentials, claims);

            // Create a refresh token
            var refreshToken = GenerateRefreshToken();
            
            // Add the refresh token to the user object
            _user.RefreshToken = refreshToken;

            // Update the expiration date of the refreh token, only if we passed true into CreateToken().
            // We only want to update this when the user logs in from scratch,
            // not when we are generating a new access token from the refresh token.
            if(updateRefreshExpiration)
            {
                _user.RefreshTokenExpireAtUtc = DateTime.UtcNow.AddDays(1);
            }

            // Update the user in the database with the refresh token and the expiration date.
            await _userManager.UpdateAsync(_user);

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

            // Check if user exists,
            // if the refresh token from the client and the refresh token in the database match
            // and if the refresh token has expired.
            var user = await _userManager.FindByNameAsync(principal.Identity.Name);
            if (user == null || user.RefreshToken != tokenDto.RefreshToken || user.RefreshTokenExpireAtUtc <= DateTime.UtcNow)
            {
                throw new UserUnauthorizedException("Incorrect credentials, login again");
            }
            
            // set user from database as the current user we are handling(_user)
            _user = user;

            // Return a new token without updating the refresh tokens expiration time.
            // We don't want to update the expiration time since the user isn't logging in manually, we only
            // want to provide a fresh access token.
            return await CreateToken(updateRefreshExpiration: false);
        }
    }
}
