using System.ComponentModel.DataAnnotations;

namespace AuthGateway.Api.Options;

public sealed class PreviewRoutingOptions
{
    public const string SectionName = "PreviewRouting";

    [Required]
    [Url]
    public string RootUrl { get; init; } = string.Empty;

    [Required]
    [Url]
    public string MainPreviewUrl { get; init; } = string.Empty;

    [Required]
    [Url]
    public string PrPreviewBaseUrl { get; init; } = string.Empty;
}
