using System.Text.Json.Serialization;

namespace AuthGateway.Api.Models;

public sealed record GitHubAccessTokenResponse(
    [property: JsonPropertyName("access_token")] string AccessToken,
    [property: JsonPropertyName("scope")] string Scope,
    [property: JsonPropertyName("token_type")] string TokenType);

public sealed record GitHubUserResponse(
    [property: JsonPropertyName("login")] string Login,
    [property: JsonPropertyName("id")] long Id);
