using System.ComponentModel.DataAnnotations;

namespace AuthGateway.Api.Options;

public sealed class RepositoryAccessOptions
{
    public const string SectionName = "RepositoryAccess";

    [Required]
    public string Owner { get; init; } = string.Empty;

    [Required]
    public string Name { get; init; } = string.Empty;
}
