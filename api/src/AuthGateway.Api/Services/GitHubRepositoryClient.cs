using System.Net;
using System.Net.Http.Headers;
using AuthGateway.Api.Options;
using Microsoft.Extensions.Options;

namespace AuthGateway.Api.Services;

public sealed class GitHubRepositoryClient : IGitHubRepositoryClient
{
    private readonly HttpClient _httpClient;
    private readonly RepositoryAccessOptions _options;

    public GitHubRepositoryClient(HttpClient httpClient, IOptions<RepositoryAccessOptions> options)
    {
        _httpClient = httpClient;
        _options = options.Value;
        _httpClient.DefaultRequestHeaders.UserAgent.Add(new ProductInfoHeaderValue("auth-gateway", "1.0"));
        _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/vnd.github+json"));
    }

    public async Task<bool> IsCollaboratorAsync(string login, CancellationToken cancellationToken)
    {
        var endpoint = $"https://api.github.com/repos/{_options.Owner}/{_options.Name}/collaborators/{Uri.EscapeDataString(login)}";
        using var request = new HttpRequestMessage(HttpMethod.Get, endpoint);
        using var response = await _httpClient.SendAsync(request, cancellationToken);

        return response.StatusCode == HttpStatusCode.NoContent || response.StatusCode == HttpStatusCode.OK;
    }
}
