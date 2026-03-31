using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AuthGateway.Api.Models;
using AuthGateway.Api.Options;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace AuthGateway.Api.Services;

public sealed class SessionTokenService : ISessionTokenService
{
    private readonly SessionOptions _options;
    private readonly JwtSecurityTokenHandler _handler = new();
    private readonly byte[] _signingKey;

    public SessionTokenService(IOptions<SessionOptions> options)
    {
        _options = options.Value;
        _signingKey = Encoding.UTF8.GetBytes(_options.SigningKey);
    }

    public string CreateToken(string login)
    {
        var expires = DateTime.UtcNow.AddMinutes(_options.ExpirationMinutes);
        var descriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[] { new Claim(ClaimTypes.Name, login) }),
            Expires = expires,
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(_signingKey), SecurityAlgorithms.HmacSha256)
        };

        var token = _handler.CreateToken(descriptor);
        return _handler.WriteToken(token);
    }

    public bool TryValidate(string token, out SessionPrincipal? principal)
    {
        principal = null;

        try
        {
            var result = _handler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuer = false,
                ValidateAudience = false,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(_signingKey),
                ClockSkew = TimeSpan.FromMinutes(1)
            }, out var validatedToken);

            var login = result.Identity?.Name;
            if (string.IsNullOrWhiteSpace(login) || validatedToken.ValidTo == DateTime.MinValue)
            {
                return false;
            }

            principal = new SessionPrincipal(login, new DateTimeOffset(validatedToken.ValidTo, TimeSpan.Zero));
            return true;
        }
        catch
        {
            return false;
        }
    }
}
