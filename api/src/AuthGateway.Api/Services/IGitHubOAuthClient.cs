namespace AuthGateway.Api.Services;

public interface IGitHubOAuthClient
{
    Task<string?> ExchangeCodeForAccessTokenAsync(string code, CancellationToken cancellationToken);
    Task<string?> GetUserLoginAsync(string accessToken, CancellationToken cancellationToken);
}
