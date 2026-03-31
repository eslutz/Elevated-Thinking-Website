using AuthGateway.Api.Options;
using AuthGateway.Api.Services;
using Microsoft.Extensions.Options;

namespace AuthGateway.Api.Tests;

public sealed class SessionTokenServiceTests
{
    private readonly SessionOptions _options = new()
    {
        SigningKey = "ThisIsALongSigningKeyForTestsOnly12345",
        ExpirationMinutes = 30,
        CookieName = "preview_auth"
    };

    [Fact]
    public void CreateToken_AndValidate_RoundTripsLogin()
    {
        var service = new SessionTokenService(Options.Create(_options));

        var token = service.CreateToken("octocat");

        var isValid = service.TryValidate(token, out var principal);

        Assert.True(isValid);
        Assert.NotNull(principal);
        Assert.Equal("octocat", principal!.Login);
        Assert.True(principal.ExpiresAt > DateTimeOffset.UtcNow.AddMinutes(20));
    }

    [Fact]
    public void Validate_ReturnsFalse_ForTamperedToken()
    {
        var service = new SessionTokenService(Options.Create(_options));
        var token = service.CreateToken("octocat");

        var tampered = token + "tamper";

        var isValid = service.TryValidate(tampered, out var principal);

        Assert.False(isValid);
        Assert.Null(principal);
    }
}
