# Auth Gateway API

Azure Functions (isolated worker, .NET 10) authentication gateway for preview pages.

## Behavior

1. User requests one of the protected routes:
   - `/api/view/root`
   - `/api/view/main`
   - `/api/view/pr/{prNumber}`
2. If no valid session cookie exists, API redirects to `/api/auth/login`.
3. GitHub OAuth callback exchanges the auth code and resolves the GitHub login.
4. API validates collaborator status for the configured repository.
5. If collaborator, API issues an HTTP-only session cookie and redirects back.

## Local setup

1. Copy `src/AuthGateway.Api/local.settings.json.example` to `src/AuthGateway.Api/local.settings.json`.
2. Fill OAuth + repo settings.
3. Run the app with Azure Functions Core Tools:

```bash
func start --csharp --dotnet-isolated-debug
```

## Tests

```bash
dotnet test AuthGateway.sln
```
