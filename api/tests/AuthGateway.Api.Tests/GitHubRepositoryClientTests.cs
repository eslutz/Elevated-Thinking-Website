using System.Net;
using AuthGateway.Api.Options;
using AuthGateway.Api.Services;
using Microsoft.Extensions.Options;

namespace AuthGateway.Api.Tests;

public sealed class GitHubRepositoryClientTests
{
    [Fact]
    public async Task IsCollaboratorAsync_ReturnsTrue_WhenGitHubReturnsNoContent()
    {
        var client = CreateClient(HttpStatusCode.NoContent);

        var result = await client.IsCollaboratorAsync("octocat", CancellationToken.None);

        Assert.True(result);
    }

    [Fact]
    public async Task IsCollaboratorAsync_ReturnsFalse_WhenGitHubReturnsNotFound()
    {
        var client = CreateClient(HttpStatusCode.NotFound);

        var result = await client.IsCollaboratorAsync("stranger", CancellationToken.None);

        Assert.False(result);
    }

    private static GitHubRepositoryClient CreateClient(HttpStatusCode statusCode)
    {
        var handler = new StubHttpMessageHandler(_ => new HttpResponseMessage(statusCode));
        var httpClient = new HttpClient(handler);

        var options = Options.Create(new RepositoryAccessOptions
        {
            Owner = "example-owner",
            Name = "example-repo"
        });

        return new GitHubRepositoryClient(httpClient, options);
    }

    private sealed class StubHttpMessageHandler : HttpMessageHandler
    {
        private readonly Func<HttpRequestMessage, HttpResponseMessage> _responder;

        public StubHttpMessageHandler(Func<HttpRequestMessage, HttpResponseMessage> responder)
        {
            _responder = responder;
        }

        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
            => Task.FromResult(_responder(request));
    }
}
