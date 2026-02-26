# Recipe Packs

Recipe packs are pre-bundled collections of recipes for common deployment targets. They simplify environment setup by registering multiple recipes at once.

## Using Recipe Packs

```bash
# Register all recipes from a pack
rad recipe-pack register <pack-name> --environment <env>

# List available packs
rad recipe-pack list
```

## Available Packs

| Pack | Target | Recipes Included | Use Case |
|------|--------|-----------------|----------|
| `local-dev` | Kubernetes | PostgreSQL, Redis, MongoDB (all as k8s pods) | Local development |
| `azure-production` | Azure | Azure Database for PostgreSQL, Azure Cache for Redis, etc. | Azure production |
| `aws-production` | AWS | RDS, ElastiCache, etc. | AWS production |

## Custom Recipe Packs

You can create custom recipe packs for your organization:

```yaml
# recipe-pack.yaml
name: myorg-dev
description: Local development recipes
recipes:
  - name: postgresql
    resourceType: Radius.Data/postgreSqlDatabases
    templateKind: bicep
    templatePath: "ghcr.io/myorg/recipes/kubernetes-postgresql:v1.0.0"
  - name: redis
    resourceType: Radius.Data/redisCaches
    templateKind: bicep
    templatePath: "ghcr.io/myorg/recipes/kubernetes-redis:v1.0.0"
```

## Strategy

1. **Development:** Use `local-dev` or custom `kubernetes-*` packs — no cloud costs
2. **Staging:** Use cloud-specific packs matching production — validate real infrastructure
3. **Production:** Use cloud-specific packs with pinned recipe versions — no `latest` tags
