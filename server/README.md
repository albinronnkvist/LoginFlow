# Login System | Server

Login system example for ASP.NET Core 6 Web API (with roles).

Examples of usage in front-end frameworks will be added later.

## Features
 - Login / register
 - Forgot password
 - Role authorization
 - Login without account (temporary code - Email/SMS)
 - Edit and delete users

## Technologies used

Main: 
 - ASP.NET Core 6 Web Api
 - Identity
 - EF Core with custom repository pattern
 - SQL Server
 - JWT
 - Refresh token

 Other:
 - Serilog
 - Swagger
 - AutoMapper
 - Mailkit
 - Telavox SMS API

 Extras:
 - Versioning
 - CORS
 - Global error handling
 - Model validation filter

-------
----
----

# Get Started
## Configuration

### 1. Environment variables
Add the following environment variables with _Secrets Manager(secrets.json)_:

````
{
  "Client": {
    "BaseURL": "http://localhost:3000"
  },
  "AuthenticationSecrets": {
    "JwtKey": "insert_value",
    "ValidIssuer": "insert_value",
    "ValidAudience": "https://localhost:5001"
  },
  "ConnectionStrings": {
    "DefaultConnection": "insert_database_connection_string"
  },
  "EmailConfiguration": {
    "From": "insert_your_email_address",
    "SmtpServer": "insert_your_email_smtp_server",
    "Port": insert_your_email_port,
    "Username": "insert_your_email_address",
    "Password": "insert_your_email_password"
  },
  "SmsConfiguration": {
    "AccessToken": "Bearer insert_your_TelavoxSMSApi_token"
  }
}
````

### 2. Seed users and update database
Configure seeding under _Repositories -> Configuration_ to add custom users and customers automatically during first migration. 

Run the command: _Update-Database_ in the Package Manager Console to migrate everything to the database. 

### 3. Test with Swagger
Start the program and navigate to: https://localhost:5001/swagger/index.html in a browser to test with Swagger UI.