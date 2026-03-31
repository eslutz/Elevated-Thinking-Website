using AuthGateway.Api.Models;

namespace AuthGateway.Api.Services;

public interface ISessionTokenService
{
    string CreateToken(string login);
    bool TryValidate(string token, out SessionPrincipal? principal);
}
