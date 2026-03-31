using AuthGateway.Api.Options;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;

namespace AuthGateway.Api.Services;

public sealed class AuthCookieService : IAuthCookieService
{
    private readonly SessionOptions _options;

    public AuthCookieService(IOptions<SessionOptions> options)
    {
        _options = options.Value;
    }

    public void SetAuthCookie(HttpResponse response, string token)
    {
        response.Cookies.Append(_options.CookieName, token, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            IsEssential = true,
            SameSite = SameSiteMode.Lax,
            MaxAge = TimeSpan.FromMinutes(_options.ExpirationMinutes)
        });
    }

    public void ClearAuthCookie(HttpResponse response)
    {
        response.Cookies.Delete(_options.CookieName, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Lax
        });
    }

    public string? GetAuthCookie(HttpRequest request)
    {
        return request.Cookies.TryGetValue(_options.CookieName, out var value) ? value : null;
    }
}
