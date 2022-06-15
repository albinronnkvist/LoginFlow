/*
 *  All extensions / configuration is added here to keep Program.cs clean and minimal.
 */

using LoginFlow.Exceptions;
using LoginFlow.Models;
using LoginFlow.Repositories;
using LoginFlow.Helpers.AuthHelpers;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Net;
using System.Text;
using LoginFlow.Helpers.MailingHelpers.EmailHelpers;
using LoginFlow.Helpers.MailingHelpers.SmsHelpers;
using LoginFlow.Filters;

namespace LoginFlow.Extensions
{
    public static class ServiceExtensions
    {
        // CORS
        public static void CorsConfiguration(this IServiceCollection services, IConfiguration configuration) =>
        services.AddCors(options =>
        {
            options.AddPolicy("CorsPolicy", builder =>
            builder.WithOrigins(configuration.GetSection("Client:BaseURL").Value) // allow req from specific client only
            .AllowAnyMethod() // allow any HTTP-method
            .AllowAnyHeader() // allow any headers
            .AllowCredentials());
        });

        public static void IisConfiguration(this IServiceCollection services) =>
        services.Configure<IISOptions>(options =>
        {
        });

        // Unit Of Work
        public static void UnitOfWorkConfiguration(this IServiceCollection services) =>
            services.AddScoped<IUnitOfWork, UnitOfWork>();

        // Managers for Jwt and Refresh tokens
        public static void TokenConfiguration(this IServiceCollection services) =>
            services.AddScoped<TokenManager>();
        public static void CustomerTokenConfiguration(this IServiceCollection services) =>
            services.AddScoped<CustomerTokenManager>();

        // Database connection
        public static void RepositoryContextConfiguration(this IServiceCollection services,
            IConfiguration configuration) =>
                services.AddDbContext<RepositoryContext>(opts =>
                    opts.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

        // Model validation filter
        public static void ModelValidationFilterConfiguration(this IServiceCollection services) =>
            services.AddScoped<ModelValidationFilter>();

        // Custom error handler
        public static void ErrorHandlerConfiguration(this WebApplication app)
        {
            app.UseExceptionHandler(appError =>
            {
                appError.Run(async context =>
                {
                    context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                    context.Response.ContentType = "application/json";
                    var contextFeature = context.Features.Get<IExceptionHandlerFeature>();
                    if (contextFeature != null)
                    {
                        context.Response.StatusCode = contextFeature.Error switch
                        {
                            BadRequestException => StatusCodes.Status400BadRequest,
                            UnauthorizedException => StatusCodes.Status401Unauthorized,
                            ForbiddenException => StatusCodes.Status403Forbidden,
                            NotFoundException => StatusCodes.Status404NotFound,
                            ConflictException => StatusCodes.Status409Conflict,
                            UnprocessableEntityException => StatusCodes.Status422UnprocessableEntity,
                            InternalServerErrorException => StatusCodes.Status500InternalServerError,
                            _ => StatusCodes.Status500InternalServerError // default to 500
                        };

                        // tdLogger.LogError(contextFeature.Error.Message, contextFeature.Error.StackTrace);
                        // if 404: log info instead?
                        if (contextFeature.Error is UnprocessableEntityException exception)
                        {
                            var errors = exception.Data.Keys.Cast<string>().Single();

                            await context.Response.WriteAsync(new ErrorHandler()
                            {
                                StatusCode = context.Response.StatusCode,
                                Message = exception.Data[errors].ToString()
                            }.ToString());

                            // tdLogger.LogWarning(contextFeature.Error.Message, contextFeature.Error.StackTrace);
                        }
                        else
                        {
                            if(contextFeature.Error is InternalServerErrorException internalServerErrorException)
                            {
                                // tdLogger.LogError(contextFeature.Error.Message, contextFeature.Error.StackTrace);
                            }
                            else if(contextFeature.Error is UnauthorizedAccessException || contextFeature.Error is ForbiddenException)
                            {
                                // tdLogger.LogWarning(contextFeature.Error.Message, contextFeature.Error.StackTrace);
                            }
                            else
                            {
                                // tdLogger.LogInfo(contextFeature.Error.Message, contextFeature.Error.StackTrace);
                            }

                            await context.Response.WriteAsync(new ErrorHandler()
                            {
                                StatusCode = context.Response.StatusCode,
                                Message = contextFeature.Error.Message,
                            }.ToString());
                        }
                    }
                });
            });
        }

        // Custom versioning
        public static void VersionConfiguration(this IServiceCollection services)
        {
            services.AddApiVersioning(opt =>
            {
                opt.ReportApiVersions = true;
                opt.AssumeDefaultVersionWhenUnspecified = true;
                opt.DefaultApiVersion = new ApiVersion(1, 0);
            });
        }

        // Swagger config
        public static void SwaggerConfiguration(this IServiceCollection services)
        {
            services.AddSwaggerGen(s =>
            {
                s.SwaggerDoc("v1", new OpenApiInfo
                {
                    Title = "ASP.NET Core 6 login flow",
                    Version = "v1",
                    Description = "A complete API with login functionality with Identity, JWT and refresh tokens (including roles, 2fa and password reset).",
                    Contact = new OpenApiContact
                    {
                        Name = "Albin Rönnkvist",
                        Email = "albinronnkvist@gmail.com",
                        Url = new Uri("https://albinronnkvist.me")
                    }
                });

                s.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Description = "Standard Authorization header using the Bearer scheme. Example: \"bearer {token}\"",
                    In = ParameterLocation.Header,
                    Name = "Authorization",
                    Type = SecuritySchemeType.ApiKey,
                    Scheme = "Bearer"
                });

                s.AddSecurityRequirement(new OpenApiSecurityRequirement()
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            },
                            Name = "Bearer",
                        },
                        new List<string>()
                    }
                });
            });
        }

        // Identity config
        public static void IdentityConfiguration(this IServiceCollection services)
        {
            var builder = services.AddIdentity<User, IdentityRole>(o =>
            {
                o.Password.RequireDigit = true;
                o.Password.RequireLowercase = false;
                o.Password.RequireUppercase = false;
                o.Password.RequireNonAlphanumeric = false;
                o.Password.RequiredLength = 10;
                o.User.RequireUniqueEmail = true;
            })
            .AddEntityFrameworkStores<RepositoryContext>()
            .AddDefaultTokenProviders();
        }

        public static void ResetTokenConfiguration(this IServiceCollection services)
        {
            services.Configure<DataProtectionTokenProviderOptions>(opt =>
                opt.TokenLifespan = TimeSpan.FromHours(2));
        }

        // Enable Jwt auth
        public static void JwtConfiguration(this IServiceCollection services, IConfiguration configuration)
        {
            var secretKey = Encoding.UTF8.GetBytes(configuration.GetSection("AuthenticationSecrets:JwtKey").Value);
            var issuer = configuration.GetSection("AuthenticationSecrets:ValidIssuer").Value;
            var audience = configuration.GetSection("AuthenticationSecrets:ValidAudience").Value;

            services.AddAuthentication(opt =>
            {
                opt.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                opt.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = issuer,
                    ValidAudience = audience,
                    IssuerSigningKey = new SymmetricSecurityKey(secretKey)
                };
            });
        }

        // Configure Email
        public static void EmailConfiguration(this IServiceCollection services, IConfiguration configuration)
        {
            var emailConfiguration = configuration
                .GetSection("EmailConfiguration")
                .Get<EmailConfigurationFromSecrets>();
            services.AddSingleton(emailConfiguration);
        }

        public static void EmailSenderConfiguration(this IServiceCollection services) =>
            services.AddScoped<IEmailSender, EmailSender>();

        // Configure SMS
        public static void SmsConfiguration(this IServiceCollection services, IConfiguration configuration)
        {
            var smsConfiguration = configuration
                .GetSection("SmsConfiguration")
                .Get<SmsConfigurationFromSecrets>();
            services.AddSingleton(smsConfiguration);
        }

        public static void SmsSenderConfiguration(this IServiceCollection services) =>
            services.AddScoped<ISmsSender, SmsSender>();

        public static void SmsHttpClientConfiguration(this IServiceCollection services, IConfiguration configuration) =>
            services.AddHttpClient("Telavox", httpClient =>
            {
                httpClient.BaseAddress = new Uri("https://api.telavox.se/sms/");

                httpClient.DefaultRequestHeaders.Add("Authorization", configuration
                    .GetSection("SmsConfiguration")
                    .Get<SmsConfigurationFromSecrets>().AccessToken);

                httpClient.DefaultRequestHeaders.Add("Accept", "application/json");
            });
    }
}
