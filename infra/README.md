# Auth Gateway Infrastructure (Bicep)

Deploy with Azure CLI:

```bash
az deployment group create \
  --resource-group <resource-group> \
  --template-file infra/bicep/main.bicep \
  --parameters @infra/bicep/main.parameters.json
```

Validate template:

```bash
az deployment group validate \
  --resource-group <resource-group> \
  --template-file infra/bicep/main.bicep \
  --parameters @infra/bicep/main.parameters.json
```
