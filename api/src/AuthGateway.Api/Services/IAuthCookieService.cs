using Microsoft.AspNetCore.Http;

namespace AuthGateway.Api.Services;

public interface IAuthCookieService
{
    void SetAuthCookie(HttpResponse response, string token);
    void ClearAuthCookie(HttpResponse response);
    string? GetAuthCookie(HttpRequest request);
}
