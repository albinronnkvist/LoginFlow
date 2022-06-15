using LoginFlow.Extensions;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Formatters;
using Microsoft.Extensions.Options;
using Serilog;

// Workaround to not replacte system.text.json for all JSON content.
NewtonsoftJsonPatchInputFormatter GetJsonPatchInputFormatter() =>
    new ServiceCollection().AddLogging().AddMvc().AddNewtonsoftJson()
        .Services.BuildServiceProvider()
            .GetRequiredService<IOptions<MvcOptions>>().Value.InputFormatters
                .OfType<NewtonsoftJsonPatchInputFormatter>().First();

var builder = WebApplication.CreateBuilder(args);


// SERVICES
// Add services to the container.
var logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .CreateLogger();
builder.Logging.ClearProviders();
builder.Logging.AddSerilog(logger);

builder.Services.CorsConfiguration(builder.Configuration);
builder.Services.ModelValidationFilterConfiguration();
builder.Services.RepositoryContextConfiguration(builder.Configuration);
builder.Services.UnitOfWorkConfiguration();
builder.Services.IisConfiguration();
builder.Services.VersionConfiguration();
builder.Services.AddAutoMapper(typeof(Program));
builder.Services.AddAuthentication();
builder.Services.IdentityConfiguration();
builder.Services.ResetTokenConfiguration();
builder.Services.JwtConfiguration(builder.Configuration);
builder.Services.TokenConfiguration();
builder.Services.CustomerTokenConfiguration();
builder.Services.EmailConfiguration(builder.Configuration);
builder.Services.EmailSenderConfiguration();
builder.Services.SmsConfiguration(builder.Configuration);
builder.Services.SmsSenderConfiguration();
builder.Services.SmsHttpClientConfiguration(builder.Configuration);

// Suppress default errors from [ApiController]
builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.SuppressModelStateInvalidFilter = true;
});

builder.Services.AddControllers(config =>
{
    config.InputFormatters.Insert(0, GetJsonPatchInputFormatter());
});

// Swagger
builder.Services.SwaggerConfiguration();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();




// HTTP REQUEST PIPELINE
var app = builder.Build();

// Custom error handler
app.ErrorHandlerConfiguration();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(s =>
    {
        s.SwaggerEndpoint("/swagger/v1/swagger.json", "ASP.NET Core 6 login flow");
    });
}
else
{
    app.UseHsts();
}

app.UseHttpsRedirection();

app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.All
});

app.UseCors("CorsPolicy");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
