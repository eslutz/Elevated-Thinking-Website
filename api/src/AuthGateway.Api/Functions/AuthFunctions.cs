using System.Net;
using System.Text;
using AuthGateway.Api.Options;
using AuthGateway.Api.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Options;

namespace AuthGateway.Api.Functions;

public sealed class AuthFunctions
{
    private readonly IGitHubOAuthClient _gitHubOAuthClient;
    private readonly IGitHubRepositoryClient _gitHubRepositoryClient;
    private readonly ISessionTokenService _sessionTokenService;
    private readonly IAuthCookieService _authCookieService;
    private readonly GitHubOAuthOptions _gitHubOAuthOptions;
    private readonly PreviewRoutingOptions _previewRoutingOptions;

    public AuthFunctions(
        IGitHubOAuthClient gitHubOAuthClient,
        IGitHubRepositoryClient gitHubRepositoryClient,
        ISessionTokenService sessionTokenService,
        IAuthCookieService authCookieService,
        IOptions<GitHubOAuthOptions> gitHubOAuthOptions,
        IOptions<PreviewRoutingOptions> previewRoutingOptions)
    {
        _gitHubOAuthClient = gitHubOAuthClient;
        _gitHubRepositoryClient = gitHubRepositoryClient;
        _sessionTokenService = sessionTokenService;
        _authCookieService = authCookieService;
        _gitHubOAuthOptions = gitHubOAuthOptions.Value;
        _previewRoutingOptions = previewRoutingOptions.Value;
    }

    [Function("AuthLogin")]
    public IActionResult Login(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "auth/login")] HttpRequest request)
    {
        var returnUrl = NormalizeReturnUrl(request.Query["returnUrl"]);
        var state = Convert.ToBase64String(Encoding.UTF8.GetBytes(returnUrl));
        var authUrl = $"https://github.com/login/oauth/authorize?client_id={Uri.EscapeDataString(_gitHubOAuthOptions.ClientId)}&redirect_uri={Uri.EscapeDataString(_gitHubOAuthOptions.CallbackUrl)}&scope=read:user&state={Uri.EscapeDataString(state)}";

        return new RedirectResult(authUrl);
    }

    [Function("AuthCallback")]
    public async Task<IActionResult> Callback(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "auth/callback")] HttpRequest request,
        CancellationToken cancellationToken)
    {
        var code = request.Query["code"].ToString();
        var state = request.Query["state"].ToString();

        if (string.IsNullOrWhiteSpace(code))
        {
            return new BadRequestObjectResult("Missing OAuth code.");
        }

        var accessToken = await _gitHubOAuthClient.ExchangeCodeForAccessTokenAsync(code, cancellationToken);
        if (string.IsNullOrWhiteSpace(accessToken))
        {
            return new UnauthorizedObjectResult("GitHub OAuth token exchange failed.");
        }

        var login = await _gitHubOAuthClient.GetUserLoginAsync(accessToken, cancellationToken);
        if (string.IsNullOrWhiteSpace(login))
        {
            return new UnauthorizedObjectResult("GitHub user lookup failed.");
        }

        var isCollaborator = await _gitHubRepositoryClient.IsCollaboratorAsync(login, cancellationToken);
        if (!isCollaborator)
        {
            return new ObjectResult("User is not a collaborator for this repository.")
            {
                StatusCode = StatusCodes.Status403Forbidden
            };
        }

        var token = _sessionTokenService.CreateToken(login);
        _authCookieService.SetAuthCookie(request.HttpContext.Response, token);

        var returnUrl = DecodeReturnUrl(state);
        return new RedirectResult(returnUrl);
    }

    [Function("AuthLogout")]
    public IActionResult Logout([HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "auth/logout")] HttpRequest request)
    {
        _authCookieService.ClearAuthCookie(request.HttpContext.Response);
        return new OkObjectResult(new { message = "Logged out." });
    }

    [Function("AuthMe")]
    public IActionResult Me([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "auth/me")] HttpRequest request)
    {
        if (!TryGetAuthenticatedUser(request, out var login, out _))
        {
            return new UnauthorizedResult();
        }

        return new OkObjectResult(new { login });
    }

    [Function("ProtectedRoot")]
    public IActionResult ProtectedRoot([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "view/root")] HttpRequest request)
        => BuildProtectedRedirect(request, _previewRoutingOptions.RootUrl);

    [Function("ProtectedMainPreview")]
    public IActionResult ProtectedMainPreview([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "view/main")] HttpRequest request)
        => BuildProtectedRedirect(request, _previewRoutingOptions.MainPreviewUrl);

    [Function("ProtectedPrPreview")]
    public IActionResult ProtectedPrPreview([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "view/pr/{prNumber:int}")] HttpRequest request, int prNumber)
    {
        var destination = $"{_previewRoutingOptions.PrPreviewBaseUrl.TrimEnd('/')}/pr-{prNumber}/";
        return BuildProtectedRedirect(request, destination);
    }

    private IActionResult BuildProtectedRedirect(HttpRequest request, string destination)
    {
        if (!TryGetAuthenticatedUser(request, out _, out _))
        {
            var returnUrl = request.Path.HasValue ? request.Path.Value! : "/";
            return new RedirectResult($"/api/auth/login?returnUrl={Uri.EscapeDataString(returnUrl)}");
        }

        return new RedirectResult(destination);
    }

    private bool TryGetAuthenticatedUser(HttpRequest request, out string? login, out DateTimeOffset? expiresAt)
    {
        login = null;
        expiresAt = null;

        var cookieValue = _authCookieService.GetAuthCookie(request);
        if (string.IsNullOrWhiteSpace(cookieValue) || !_sessionTokenService.TryValidate(cookieValue, out var principal) || principal is null)
        {
            return false;
        }

        login = principal.Login;
        expiresAt = principal.ExpiresAt;
        return true;
    }

    private static string NormalizeReturnUrl(string? candidate)
    {
        if (string.IsNullOrWhiteSpace(candidate))
        {
            return "/api/view/root";
        }

        if (candidate.StartsWith('/') && !candidate.StartsWith("//"))
        {
            return candidate;
        }

        return "/api/view/root";
    }

    private static string DecodeReturnUrl(string? state)
    {
        if (string.IsNullOrWhiteSpace(state))
        {
            return "/api/view/root";
        }

        try
        {
            var decoded = Encoding.UTF8.GetString(Convert.FromBase64String(state));
            return NormalizeReturnUrl(decoded);
        }
        catch
        {
            return "/api/view/root";
        }
    }
}
