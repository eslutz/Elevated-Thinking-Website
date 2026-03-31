@description('Azure region for all resources.')
param location string = resourceGroup().location

@description('Base name for deployed resources. Must be globally unique for storage and function app resource names.')
param namePrefix string

@description('GitHub owner (org or user) that hosts the protected repository.')
param repoOwner string

@description('GitHub repository name that requires collaborator access.')
param repoName string

@description('GitHub OAuth app client ID.')
@secure()
param githubClientId string

@description('GitHub OAuth app client secret.')
@secure()
param githubClientSecret string

@description('OAuth callback URL for the auth API. Example: https://your-api.azurewebsites.net/api/auth/callback')
param githubCallbackUrl string

@description('JWT signing key used by the API to sign auth session cookies.')
@secure()
param sessionSigningKey string

@description('Public root URL that requires authentication.')
param protectedRootUrl string

@description('Public main preview URL that requires authentication.')
param protectedMainPreviewUrl string

@description('Public PR preview base URL (without /pr-<number>).')
param protectedPrPreviewBaseUrl string

var storageAccountName = toLower(replace('${namePrefix}sa', '-', ''))
var functionAppName = toLower(replace('${namePrefix}-func', '_', '-'))
var appInsightsName = '${namePrefix}-appi'
var appServicePlanName = '${namePrefix}-plan'

resource storage 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: storageAccountName
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    minimumTlsVersion: 'TLS1_2'
    supportsHttpsTrafficOnly: true
    allowBlobPublicAccess: false
  }
}

resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: appInsightsName
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
  }
}

resource plan 'Microsoft.Web/serverfarms@2023-01-01' = {
  name: appServicePlanName
  location: location
  sku: {
    name: 'Y1'
    tier: 'Dynamic'
  }
  kind: 'functionapp'
  properties: {
    reserved: true
  }
}

resource functionApp 'Microsoft.Web/sites@2023-01-01' = {
  name: functionAppName
  location: location
  kind: 'functionapp,linux'
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    serverFarmId: plan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'DOTNET-ISOLATED|10.0'
      ftpsState: 'Disabled'
      minTlsVersion: '1.2'
      appSettings: [
        {
          name: 'FUNCTIONS_WORKER_RUNTIME'
          value: 'dotnet-isolated'
        }
        {
          name: 'FUNCTIONS_EXTENSION_VERSION'
          value: '~4'
        }
        {
          name: 'AzureWebJobsStorage'
          value: 'DefaultEndpointsProtocol=https;AccountName=${storage.name};EndpointSuffix=${environment().suffixes.storage};AccountKey=${storage.listKeys().keys[0].value}'
        }
        {
          name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
          value: appInsights.properties.ConnectionString
        }
        {
          name: 'GitHubOAuth__ClientId'
          value: githubClientId
        }
        {
          name: 'GitHubOAuth__ClientSecret'
          value: githubClientSecret
        }
        {
          name: 'GitHubOAuth__CallbackUrl'
          value: githubCallbackUrl
        }
        {
          name: 'RepositoryAccess__Owner'
          value: repoOwner
        }
        {
          name: 'RepositoryAccess__Name'
          value: repoName
        }
        {
          name: 'Session__SigningKey'
          value: sessionSigningKey
        }
        {
          name: 'Session__ExpirationMinutes'
          value: '120'
        }
        {
          name: 'Session__CookieName'
          value: 'preview_auth'
        }
        {
          name: 'PreviewRouting__RootUrl'
          value: protectedRootUrl
        }
        {
          name: 'PreviewRouting__MainPreviewUrl'
          value: protectedMainPreviewUrl
        }
        {
          name: 'PreviewRouting__PrPreviewBaseUrl'
          value: protectedPrPreviewBaseUrl
        }
      ]
    }
  }
}

output functionAppName string = functionApp.name
output functionAppDefaultHostname string = functionApp.properties.defaultHostName
output functionAppPrincipalId string = functionApp.identity.principalId
