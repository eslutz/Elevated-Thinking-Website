namespace AuthGateway.Api.Services;

public interface IGitHubRepositoryClient
{
    Task<bool> IsCollaboratorAsync(string login, CancellationToken cancellationToken);
}
