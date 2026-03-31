using AuthGateway.Api.Options;
using AuthGateway.Api.Services;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var builder = FunctionsApplication.CreateBuilder(args);

builder.ConfigureFunctionsWebApplication();

builder.Services
    .AddOptions<GitHubOAuthOptions>()
    .BindConfiguration(GitHubOAuthOptions.SectionName)
    .ValidateDataAnnotations()
    .ValidateOnStart();

builder.Services
    .AddOptions<RepositoryAccessOptions>()
    .BindConfiguration(RepositoryAccessOptions.SectionName)
    .ValidateDataAnnotations()
    .ValidateOnStart();

builder.Services
    .AddOptions<SessionOptions>()
    .BindConfiguration(SessionOptions.SectionName)
    .ValidateDataAnnotations()
    .ValidateOnStart();

builder.Services
    .AddOptions<PreviewRoutingOptions>()
    .BindConfiguration(PreviewRoutingOptions.SectionName)
    .ValidateDataAnnotations()
    .ValidateOnStart();

builder.Services.AddHttpClient<IGitHubOAuthClient, GitHubOAuthClient>();
builder.Services.AddHttpClient<IGitHubRepositoryClient, GitHubRepositoryClient>();
builder.Services.AddSingleton<ISessionTokenService, SessionTokenService>();
builder.Services.AddSingleton<IAuthCookieService, AuthCookieService>();

builder.Build().Run();
