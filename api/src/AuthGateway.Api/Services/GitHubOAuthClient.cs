using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using AuthGateway.Api.Models;
using AuthGateway.Api.Options;
using Microsoft.Extensions.Options;

namespace AuthGateway.Api.Services;

public sealed class GitHubOAuthClient : IGitHubOAuthClient
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);
    private readonly HttpClient _httpClient;
    private readonly GitHubOAuthOptions _options;

    public GitHubOAuthClient(HttpClient httpClient, IOptions<GitHubOAuthOptions> options)
    {
        _httpClient = httpClient;
        _options = options.Value;
        _httpClient.DefaultRequestHeaders.UserAgent.Add(new ProductInfoHeaderValue("auth-gateway", "1.0"));
        _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
    }

    public async Task<string?> ExchangeCodeForAccessTokenAsync(string code, CancellationToken cancellationToken)
    {
        var form = new Dictionary<string, string>
        {
            ["client_id"] = _options.ClientId,
            ["client_secret"] = _options.ClientSecret,
            ["code"] = code,
            ["redirect_uri"] = _options.CallbackUrl
        };

        using var request = new HttpRequestMessage(HttpMethod.Post, "https://github.com/login/oauth/access_token")
        {
            Content = new FormUrlEncodedContent(form)
        };

        using var response = await _httpClient.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            return null;
        }

        await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
        var tokenResponse = await JsonSerializer.DeserializeAsync<GitHubAccessTokenResponse>(stream, JsonOptions, cancellationToken);
        return tokenResponse?.AccessToken;
    }

    public async Task<string?> GetUserLoginAsync(string accessToken, CancellationToken cancellationToken)
    {
        using var request = new HttpRequestMessage(HttpMethod.Get, "https://api.github.com/user");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

        using var response = await _httpClient.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            return null;
        }

        await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
        var user = await JsonSerializer.DeserializeAsync<GitHubUserResponse>(stream, JsonOptions, cancellationToken);
        return user?.Login;
    }
}
