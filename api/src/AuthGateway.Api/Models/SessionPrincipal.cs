namespace AuthGateway.Api.Models;

public sealed record SessionPrincipal(string Login, DateTimeOffset ExpiresAt);
