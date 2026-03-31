using System.ComponentModel.DataAnnotations;

namespace AuthGateway.Api.Options;

public sealed class SessionOptions
{
    public const string SectionName = "Session";

    [Required]
    public string SigningKey { get; init; } = string.Empty;

    [Range(5, 1440)]
    public int ExpirationMinutes { get; init; } = 120;

    public string CookieName { get; init; } = "preview_auth";
}
