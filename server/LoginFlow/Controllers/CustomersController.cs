using AutoMapper;
using LoginFlow.DTOs.Customer;
using LoginFlow.DTOs.User;
using LoginFlow.Exceptions.Unauthorized;
using LoginFlow.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using LoginFlow.Helpers.MailingHelpers.EmailHelpers;
using LoginFlow.Exceptions.NotFound;
using Microsoft.AspNetCore.JsonPatch;
using LoginFlow.Exceptions;
using LoginFlow.Exceptions.Forbidden;
using LoginFlow.Exceptions.BadRequest;
using LoginFlow.Helpers.MailingHelpers.SmsHelpers;
using LoginFlow.Helpers.AuthHelpers;
using LoginFlow.Filters;
using LoginFlow.Helpers.ErrorHelpers;

namespace LoginFlow.Controllers
{
    [ApiVersion("1.0")]
    [ApiExplorerSettings(GroupName = "v1")]
    [Authorize]
    [Route("api/v{v:apiversion}/customers")]
    [ApiController]
    public class CustomersController : ControllerBase
    {
        private readonly IUnitOfWork _db;
        private readonly IMapper _mapper;
        private readonly CustomerTokenManager _customerTokenManager;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IEmailSender _emailSender;
        private readonly ISmsSender _smsSender;

        public CustomersController(
            IUnitOfWork db, 
            IMapper mapper, 
            CustomerTokenManager customerTokenManager,
            IHttpContextAccessor httpContextAccessor,
            IEmailSender emailSender,
            ISmsSender smsSender)
        {
            _db = db;
            _mapper = mapper;
            _customerTokenManager = customerTokenManager;
            _httpContextAccessor = httpContextAccessor;
            _emailSender = emailSender;
            _smsSender = smsSender;
        }



        // GET api/v1/customers
        [Authorize(Roles = "Administrator, Manager, Employee")]
        [HttpGet]
        public async Task<IActionResult> GetAllCustomers()
        {
            var customers = await _db.Customer.FindAllAsync(trackChanges: false);
            var customersDto = _mapper.Map<IEnumerable<GetCustomerDto>>(customers);

            return Ok(customersDto);
        }

        // GET api/v1/customers/[username]
        [HttpGet("{username}", Name = "GetCustomerByUsername")]
        public async Task<IActionResult> GetCustomerByUsername(string username)
        {
            var jwtUsername = _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Name);
            if (jwtUsername == null) throw new CustomerUnauthorizedException("Unauthorized");
            if (jwtUsername.ToLower() != username.ToLower()) throw new CustomerForbiddenException("Unauthorized");

            var customer = await _db.Customer.FindOneByConditionAsync(c => c.UserName.ToLower().Equals(username.ToLower()), trackChanges: false);
            if (customer == null) throw new CustomerNotFoundException($"User with username: {username} could not be found");

            var customerDto = _mapper.Map<GetCustomerDto>(customer);

            return Ok(customerDto);
        }

        // GET api/v1/customers/admin/[username]
        [Authorize(Roles = "Administrator, Manager, Employee")]
        [HttpGet("admin/{username}", Name = "AdminGetCustomerByUsername")]
        public async Task<IActionResult> AdminGetCustomerByUsername(string username)
        {
            var customer = await _db.Customer.FindOneByConditionAsync(c => c.UserName.ToLower().Equals(username.ToLower()), trackChanges: false);
            if (customer == null) throw new CustomerNotFoundException($"User with username: {username} could not be found");

            var customerDto = _mapper.Map<GetCustomerDto>(customer);

            return Ok(customerDto);
        }



        // POST api/v1/customers/temporaryCode
        [AllowAnonymous]
        [HttpPost("temporary-code")]
        [ServiceFilter(typeof(ModelValidationFilter))]
        public async Task<IActionResult> CreateTemporaryCode([FromBody] PatchTemporaryCodeDto req)
        {
            var customer = await _db.Customer
                .FindOneByConditionAsync(c => c.UserName.ToLower() == req.UserName.ToLower(), trackChanges: true);
            if (customer == null) throw new CustomerNotFoundException($"User with username: {req.UserName} could not be found");

            // Throw error if customer does not have contact info
            if (String.IsNullOrEmpty(customer.Email)
                && String.IsNullOrEmpty(customer.Phone1)
                && String.IsNullOrEmpty(customer.Phone2))
            {
                throw new CustomerBadRequestException("Could not send temporary code since you do not have any registered contact information");
            }

            // Generate hashed code and add do user
            var code = PasswordHelper.GenerateRandomSixLetterCode();
            var salt = PasswordHelper.GenerateRandomSalt();
            var hashedCode = PasswordHelper.SaltAndHash(code, salt);
            customer.TempCode = hashedCode;
            customer.TempCodeSalt = salt;
            customer.TempCodeExpireAtUtc = DateTime.UtcNow.AddMinutes(3);
            await _db.SaveAsync();

            // Send to email, phone1 and phone2 (if they exist)
            bool emailWasSent = false;
            bool phone1WasSent = false;
            bool phone2WasSent = false;
            var SentToInfo = new CustomerTempCodeSentToDto();

            if (!String.IsNullOrEmpty(customer.Email))
            {
                var body = _emailSender.PopulateCodeBody(customer.UserName, code);
                var message = new EmailMessage(new string[]
                { customer.Email },
                $"Temporary code for login: {code}",
                body);

                emailWasSent = await _emailSender.SendEmailAsync(message);
                if(emailWasSent)
                {
                    SentToInfo.Email = ContactHintHelper.EmailHint(customer.Email);
                }
            }

            if (!String.IsNullOrEmpty(customer.Phone1))
            {
                var body = _smsSender.PopulateCodeBody(customer.UserName, code);
                var message = new SmsMessage(customer.Phone1, body);

                phone1WasSent = await _smsSender.SendSmsAsync(message);
                if (phone1WasSent)
                {
                    SentToInfo.Phone1 = ContactHintHelper.SmsHint(customer.Phone1);
                }
            }

            if (!String.IsNullOrEmpty(customer.Phone2))
            {
                var body = _smsSender.PopulateCodeBody(customer.UserName, code);
                var message = new SmsMessage(customer.Phone2, body);

                phone2WasSent = await _smsSender.SendSmsAsync(message);
                if (phone2WasSent)
                {
                    SentToInfo.Phone2 = ContactHintHelper.SmsHint(customer.Phone2);
                }
            }

            // Throw error if all send methods failed
            if (!emailWasSent && !phone1WasSent && !phone2WasSent)
            {
                throw new InternalServerErrorException("Temporary code could not be sent, try again later");
            }
            
            return Ok(SentToInfo);
        }

        // POST api/v1/customers/login
        [AllowAnonymous]
        [HttpPost("login")]
        [ServiceFilter(typeof(ModelValidationFilter))]
        public async Task<IActionResult> LoginCustomer([FromBody] LoginCustomerDto req)
        {
            if (!await _customerTokenManager.ValidateCustomer(req))
            {
                throw new CustomerNotFoundException($"User with username: {req.UserName} could not be found");
            }

            if (!_customerTokenManager.ValidateCode(req))
            {
                throw new CustomerUnauthorizedException("The entered code is either incorrect or no longer active");
            }

            var token = await _customerTokenManager.CreateToken(updateRefreshExpiration: true);

            return Ok(token);
        }

        // POST api/v1/customers/refresh
        [AllowAnonymous]
        [HttpPost("refresh")]
        [ServiceFilter(typeof(ModelValidationFilter))]
        public async Task<IActionResult> RefreshCustomerTokens([FromBody] TokenDto req)
        {
            var token = await _customerTokenManager.RefreshToken(req);

            return Ok(token);
        }



        // PATCH api/v1/customers/[username]
        [HttpPatch("{username}")]
        [ServiceFilter(typeof(ModelValidationFilter))]
        public async Task<IActionResult> PartialUpdateCustomer(string username, [FromBody] JsonPatchDocument<PatchCustomerDto> req)
        {
            var jwtUsername = _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Name);
            if (jwtUsername == null) throw new CustomerUnauthorizedException("Unauthorized");
            if (jwtUsername.ToLower() != username.ToLower()) throw new CustomerForbiddenException("Unauthorized");

            var customer = await _db.Customer.FindOneByConditionAsync(c => c.UserName.ToLower() == username.ToLower(), trackChanges: true);
            if (customer == null) throw new CustomerNotFoundException($"Bil med registreringsnummer: { username } hittades ej.");

            var customerToPatch = _mapper.Map<PatchCustomerDto>(customer);
            req.ApplyTo(customerToPatch, ModelState);
            if (!TryValidateModel(customerToPatch))
            {
                ThrowUnproccesableEntityExceptionHelper.ThrowException(ModelState);
            }
            _mapper.Map(customerToPatch, customer);
            customer.UpdatedAtUtc = DateTime.UtcNow;
            await _db.SaveAsync();

            return NoContent();
        }

        //PATCH api/v1/customers/admin/[licensePlate]
        //Admin can edit a customers preferences
        [Authorize(Roles = "Administrator, Manager, Employee")]
        [HttpPatch("admin/{id}")]
        [ServiceFilter(typeof(ModelValidationFilter))]
        public async Task<IActionResult> AdminPartialUpdateCustomer(int id, [FromBody] JsonPatchDocument<PatchCustomerDto> req)
        {
            var customer = await _db.Customer.FindOneAsync(id);
            if (customer == null) throw new CustomerNotFoundException($"Customer with id: { id } could not be found");

            var customerToPatch = _mapper.Map<PatchCustomerDto>(customer);
            req.ApplyTo(customerToPatch, ModelState);
            if (!TryValidateModel(customerToPatch))
            {
                ThrowUnproccesableEntityExceptionHelper.ThrowException(ModelState);
            }
            _mapper.Map(customerToPatch, customer);
            customer.UpdatedAtUtc = DateTime.UtcNow;
            await _db.SaveAsync();
            
            return NoContent();
        }



        // DELETE api/v1/customers/[username]
        [HttpDelete("{username}")]
        public async Task<IActionResult> DeleteCustomerByUsername(string username)
        {
            var jwtUsername = _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Name);
            if (jwtUsername == null) throw new CustomerUnauthorizedException("Unauthorized");
            if (jwtUsername.ToLower() != username.ToLower()) throw new CustomerForbiddenException("Unauthorized");

            var customer = await _db.Customer.FindOneByConditionAsync(c => c.UserName.ToLower().Equals(username.ToLower()), trackChanges: true);
            if (customer == null) throw new CustomerNotFoundException($"User with username: {username} could not be found");

            _db.Customer.Remove(customer);
            await _db.SaveAsync();

            return NoContent();
        }

        // DELETE api/v1/customers/admin/[username]
        [Authorize(Roles = "Administrator, Manager, Employee")]
        [HttpDelete("admin/{username}")]
        public async Task<IActionResult> AdminDeleteCustomerByUsername(string username)
        {
            var customer = await _db.Customer.FindOneByConditionAsync(c => c.UserName.ToLower().Equals(username.ToLower()), trackChanges: true);
            if (customer == null) throw new CustomerNotFoundException($"User with username: {username} could not be found");

            _db.Customer.Remove(customer);
            await _db.SaveAsync();

            return NoContent();
        }

    }
}
