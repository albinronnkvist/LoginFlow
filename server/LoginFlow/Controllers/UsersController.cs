using AutoMapper;
using LoginFlow.DTOs.User;
using LoginFlow.Exceptions.BadRequest;
using LoginFlow.Exceptions.NotFound;
using LoginFlow.Exceptions.Unauthorized;
using LoginFlow.Models;
using LoginFlow.Helpers.AuthHelpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.JsonPatch;
using LoginFlow.Filters;
using LoginFlow.Helpers.ErrorHelpers;
using LoginFlow.Helpers.MailingHelpers.EmailHelpers;
using Microsoft.AspNetCore.WebUtilities;
using LoginFlow.Exceptions;

namespace LoginFlow.Controllers
{
    [ApiVersion("1.0")]
    [ApiExplorerSettings(GroupName = "v1")]
    [Authorize(Roles = "Administrator, Manager, Employee")]
    [Route("api/v{v:apiversion}/users")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IMapper _mapper;
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly TokenManager _tokenManager;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IEmailSender _emailSender;

        public UsersController(IMapper mapper,
            UserManager<User> userManager,
            RoleManager<IdentityRole> roleManager,
            TokenManager tokenManager,
            IHttpContextAccessor httpContextAccessor,
            IEmailSender emailSender)
        {
            _mapper = mapper;
            _userManager = userManager;
            _roleManager = roleManager;
            _tokenManager = tokenManager;
            _httpContextAccessor = httpContextAccessor;
            _emailSender = emailSender;
        }



        // GET api/v1/users
        [Authorize(Roles = "Administrator, Manager")]
        [HttpGet]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _userManager.Users.ToListAsync();

            var usersDTOs = new List<GetUserDto>();
            foreach (var user in users)
            {
                var userDTO = _mapper.Map<GetUserDto>(user);
                var roles = await _userManager.GetRolesAsync(user);

                userDTO.Roles = roles;

                usersDTOs.Add(userDTO);
            }

            return Ok(usersDTOs);
        }

        // GET api/v1/users/roles
        [Authorize(Roles = "Administrator, Manager")]
        [HttpGet("roles")]
        public async Task<IActionResult> GetAllUserRoles()
        {
            var roles = await _roleManager.Roles.ToListAsync();

            return Ok(roles);
        }



        // POST api/v1/users/register
        [Authorize(Roles = "Administrator, Manager")]
        [HttpPost("register")]
        [ServiceFilter(typeof(ModelValidationFilter))]
        public async Task<IActionResult> RegisterUser([FromBody] RegisterUserDto userFromClient)
        {
            var roleClaims = _httpContextAccessor.HttpContext?.User.FindAll(ClaimTypes.Role);
            RolesHelper.ValidateRoles(userFromClient.Roles, roleClaims);

            var user = _mapper.Map<User>(userFromClient);
            var createResult = await _userManager.CreateAsync(user, userFromClient.Password);
            if (!createResult.Succeeded)
            {
                foreach (var error in createResult.Errors)
                {
                    ModelState.TryAddModelError(error.Code, error.Description);
                }
                ThrowUnproccesableEntityExceptionHelper.ThrowException(ModelState);
            }

            if (userFromClient.Roles.Any())
            {
                try
                {
                    await _userManager.AddToRolesAsync(user, userFromClient.Roles);
                }
                catch
                {
                    return Created("", new { Message = "User was created but no roles were added" });
                }
            }

            return StatusCode(201);
        }

        // POST api/v1/users/login
        [AllowAnonymous]
        [HttpPost("login")]
        [ServiceFilter(typeof(ModelValidationFilter))]
        public async Task<IActionResult> LoginUser([FromBody] LoginUserDto userFromClient)
        {
            if (!await _tokenManager.ValidateUser(userFromClient))
            {
                throw new UserRefreshTokenBadRequestException();
            }

            var token = await _tokenManager.CreateToken(updateRefreshExpiration: true);

            return Ok(token);
        }

        // POST api/v1/users/refresh
        [AllowAnonymous]
        [HttpPost("refresh")]
        [ServiceFilter(typeof(ModelValidationFilter))]
        public async Task<IActionResult> RefreshUserTokens([FromBody] TokenDto tokenDto)
        {
            var token = await _tokenManager.RefreshToken(tokenDto);

            return Ok(token);
        }

        // POST api/v1/users/forgot-password
        [AllowAnonymous]
        [HttpPost("forgot-password")]
        [ServiceFilter(typeof(ModelValidationFilter))]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto req)
        {
            var user = await _userManager.FindByEmailAsync(req.Email);
            if (user == null) throw new CustomerNotFoundException($"Hittade ingen användare med e-postadressen: {req.Email}");

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var param = new Dictionary<string, string?>
            {
                {"token", token },
                {"email", req.Email }
            };

            var callback = QueryHelpers.AddQueryString(req.ClientURI, param);

            var message = new EmailMessage(new string[]
                { user.Email },
                $"Reset password",
                $"Click the following link to reset your password: {callback}");

            var emailWasSent = await _emailSender.SendEmailAsync(message);

            if(!emailWasSent)
            {
                throw new InternalServerErrorException("Could not send you the link, try again later");
            }

            return NoContent();
        }

        // POST api/v1/users/reset-password
        [AllowAnonymous]
        [HttpPost("reset-password")]
        [ServiceFilter(typeof(ModelValidationFilter))]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto req)
        {
            var user = await _userManager.FindByEmailAsync(req.Email);
            if (user == null) throw new UserNotFoundException(req.Email);

            var resetPassResult = await _userManager.ResetPasswordAsync(user, req.Token, req.Password);
            if (!resetPassResult.Succeeded)
            {
                foreach (var error in resetPassResult.Errors)
                {
                    ModelState.TryAddModelError(error.Code, error.Description);
                }

                ThrowUnproccesableEntityExceptionHelper.ThrowException(ModelState);
            }

            return NoContent();
        }



        // PUT api/v1/users/[id]
        [Authorize(Roles = "Administrator, Manager, Employee")]
        [HttpPut("{id}")]
        [ServiceFilter(typeof(ModelValidationFilter))]
        public async Task<IActionResult> UpdateUser([FromBody] UpdateUserDto userFromClient, string id)
        {
            var username = _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (username == null || username.ToString() != id)
            {
                throw new UserUnauthorizedException("Unauthorized");
            }

            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
            {
                throw new UserNotFoundException(id);
            }

            user.FullName = userFromClient.FullName;
            user.Email = userFromClient.Email;
            user.PhoneNumber = userFromClient.PhoneNumber;

            var updateResult = await _userManager.UpdateAsync(user);
            if (!updateResult.Succeeded)
            {
                foreach (var error in updateResult.Errors)
                {
                    ModelState.TryAddModelError(error.Code, error.Description);
                }
                ThrowUnproccesableEntityExceptionHelper.ThrowException(ModelState);
            }

            return NoContent();
        }

        // PATCH api/v1/users/admin/[id]
        [Authorize(Roles = "Administrator, Manager")]
        [HttpPatch("admin/{id}")]
        [ServiceFilter(typeof(ModelValidationFilter))]
        public async Task<IActionResult> AdminPartialUpdateUser(string id, [FromBody] JsonPatchDocument<AdminUpdateUserDto> req)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
            {
                throw new UserNotFoundException(id);
            }

            // Only administrators can edit other administrators
            var roles = await _userManager.GetRolesAsync(user);
            var roleClaims = _httpContextAccessor.HttpContext?.User.FindAll(ClaimTypes.Role);
            RolesHelper.ValidateRoles(roles, roleClaims);

            var userToPatch = _mapper.Map<AdminUpdateUserDto>(user);
            req.ApplyTo(userToPatch, ModelState);
            if (!TryValidateModel(userToPatch))
            {
                ThrowUnproccesableEntityExceptionHelper.ThrowException(ModelState);
            }
            _mapper.Map(userToPatch, user);
            var updateResult = await _userManager.UpdateAsync(user);
            if (!updateResult.Succeeded)
            {
                foreach (var error in updateResult.Errors)
                {
                    ModelState.TryAddModelError(error.Code, error.Description);
                }

                ThrowUnproccesableEntityExceptionHelper.ThrowException(ModelState);
            }

            return NoContent();
        }

        
        
        // DELETE api/v1/users/[id]
        [Authorize(Roles = "Administrator, Manager, Employee")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(string id)
        {
            var idClaim = _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (idClaim == null || idClaim != id)
            {
                throw new UserUnauthorizedException("Unauthorized");
            }

            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
            {
                throw new UserNotFoundException(id);
            }

            await _userManager.DeleteAsync(user);

            return NoContent();
        }

        // DELETE api/v1/users/[id]
        [Authorize(Roles = "Administrator, Manager")]
        [HttpDelete("admin/{id}")]
        public async Task<IActionResult> AdminDeleteUser(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
            {
                throw new UserNotFoundException(id);
            }

            var roles = await _userManager.GetRolesAsync(user);
            var roleClaims = _httpContextAccessor.HttpContext?.User.FindAll(ClaimTypes.Role);
            RolesHelper.ValidateRoles(roles, roleClaims);

            await _userManager.DeleteAsync(user);

            return NoContent();
        }
    }
}
