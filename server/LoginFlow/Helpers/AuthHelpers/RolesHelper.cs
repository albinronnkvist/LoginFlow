using LoginFlow.Exceptions.Unauthorized;
using System.Security.Claims;

namespace LoginFlow.Helpers.AuthHelpers
{
    public static class RolesHelper
    {
        public static void ValidateRoles(IEnumerable<string> roles, IEnumerable<Claim> roleClaims)
        {
            if(roleClaims.Any())
            {
                if (roles.Any(role => role.ToLower() == "administrator"))
                {
                    if (!roleClaims.Any(r => r.Value.ToString().ToLower() == "administrator"))
                    {
                        throw new UserUnauthorizedException("You are not authorized to create a new administrator, try again with another role");
                    }
                }

                if (roles.Any(role => role.ToLower() == "manager"))
                {
                    if (!roleClaims.Any(r => r.Value.ToString().ToLower() == "administrator"
                    || r.Value.ToString().ToLower() == "manager"))
                    {
                        throw new UserUnauthorizedException("You are not authorized to create a new manager, try again with another role");
                    }
                }
            }
            else
            {
                throw new UserUnauthorizedException("Unauthorized");
            }
        }
    }
}
