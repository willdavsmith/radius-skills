# Cloud Provider Configuration

## Azure

### Configure Azure credentials for Radius

```bash
# Set Azure provider on the environment
rad environment update <env-name> \
  --azure-subscription-id <subscription-id> \
  --azure-resource-group <resource-group>

# Radius uses the Azure credentials configured on the Kubernetes cluster
# For AKS, this is typically workload identity or managed identity
# For local dev, use az login + kubeconfig
```

### Azure recipes

Azure recipes create real Azure resources (Azure Cache for Redis, Azure Database for PostgreSQL, etc.). They require:
- Azure subscription with appropriate permissions
- Resource group in an approved region
- Credentials configured on the Radius environment

```bash
rad recipe register postgresql \
  --resource-type Radius.Data/postgreSqlDatabases \
  --template-kind terraform \
  --template-path "ghcr.io/radius-project/recipes/azure-postgresql:latest" \
  --environment production
```

## AWS

### Configure AWS credentials for Radius

```bash
rad environment update <env-name> \
  --aws-region <region> \
  --aws-account-id <account-id>
```

### AWS recipes

AWS recipes create real AWS resources (ElastiCache, RDS, etc.):

```bash
rad recipe register postgresql \
  --resource-type Radius.Data/postgreSqlDatabases \
  --template-kind terraform \
  --template-path "ghcr.io/radius-project/recipes/aws-rds:latest" \
  --environment production
```

## Kubernetes (Local Dev)

No cloud credentials needed. Kubernetes recipes deploy resources as pods within the cluster:

```bash
rad recipe register postgresql \
  --resource-type Radius.Data/postgreSqlDatabases \
  --template-kind bicep \
  --template-path "ghcr.io/radius-project/recipes/kubernetes-postgresql:latest" \
  --environment dev
```

## Multi-Environment Strategy

| Environment | Provider | Recipes | Use case |
|-------------|----------|---------|----------|
| `local-dev` | Kubernetes | `kubernetes-*` | Developer laptop |
| `staging` | Azure | `azure-*` | Pre-production testing |
| `production` | Azure | `azure-*` | Production workloads |

Developers write the same `app.bicep` — the environment determines which recipes (and thus which cloud resources) get created.
