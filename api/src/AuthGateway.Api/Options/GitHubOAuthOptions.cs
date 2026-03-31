using System.ComponentModel.DataAnnotations;

namespace AuthGateway.Api.Options;

public sealed class GitHubOAuthOptions
{
    public const string SectionName = "GitHubOAuth";

    [Required]
    public string ClientId { get; init; } = string.Empty;

    [Required]
    public string ClientSecret { get; init; } = string.Empty;

    [Required]
    [Url]
    public string CallbackUrl { get; init; } = string.Empty;
}
