---
name: radius-environment
description: Configure Radius environments with recipes and resource types. Use when setting up Radius, registering recipes, selecting recipe packs, or configuring environments for different deployment targets.
license: MIT
metadata:
  author: radius-skills
  version: "1.0.0"
---

# Radius Environment & Recipe Setup

Use this skill to help platform engineers configure Radius environments, register recipes from [resource-types-contrib](https://github.com/radius-project/resource-types-contrib), and align environment configuration with the platform engineering constitution.

## Workflow

1. **Read the platform constitution.** Load `Platform-Engineering-Constitution.md` to determine approved cloud providers, compute platforms, IaC tooling, and regions.
2. **Check current Radius state.** Use `rad environment list` and `rad recipe list` to understand what's already configured.
3. **Recommend recipes** from `resource-types-contrib` that match the constitution (e.g., if Azure + Terraform → suggest `azure-*` terraform recipes).
4. **Guide registration** of resource types and recipes into the Radius environment.
5. **Validate** the environment configuration against the constitution.

## Environment Setup

### Initialize Radius

```bash
# Install Radius on a Kubernetes cluster
rad initialize

# Create a new environment
rad environment create myenv --namespace my-namespace

# Switch to the environment
rad environment switch myenv
```

### Register Resource Types

Resource types from `resource-types-contrib` must be registered before use:

```bash
# Register a resource type from a YAML definition
rad resource-type create Radius.Data/postgreSqlDatabases --from-file postgreSqlDatabases.yaml
```

### Register Recipes

Recipes implement how resource types get deployed. Register recipes that match your platform constitution:

```bash
# Register a Terraform recipe
rad recipe register postgresql \
  --resource-type Radius.Data/postgreSqlDatabases \
  --template-kind terraform \
  --template-path "ghcr.io/radius-project/recipes/azure-postgresql:latest" \
  --environment myenv

# Register a Bicep recipe
rad recipe register postgresql \
  --resource-type Radius.Data/postgreSqlDatabases \
  --template-kind bicep \
  --template-path "ghcr.io/radius-project/recipes/kubernetes-postgresql:latest" \
  --environment myenv
```

### Recipe Packs

Recipe packs bundle multiple recipes for a target platform:

```bash
# Register a recipe pack (e.g., local-dev, azure-production)
rad recipe-pack register local-dev --environment myenv
```

## Recipe Selection Guide

Match recipes to the platform constitution:

| Constitution Says | Recipe Platform | Recipe IaC | Example |
|-------------------|----------------|------------|---------|
| Azure + Terraform | `azure-*` | `terraform/` | `azure-cache/terraform` |
| Azure + Bicep | `azure-*` | `bicep/` | `azure-cache/bicep` |
| AWS + Terraform | `aws-*` | `terraform/` | `aws-memorydb/terraform` |
| Kubernetes (local) | `kubernetes` | `bicep/` or `terraform/` | `kubernetes-redis/bicep` |

## Environment Management

```bash
# List environments
rad environment list

# Show environment details
rad environment show myenv

# List registered recipes
rad recipe list --environment myenv

# Show recipe details
rad recipe show postgresql --resource-type Radius.Data/postgreSqlDatabases --environment myenv

# List registered resource types
rad resource-type list

# Show resource type details
rad resource-type show Radius.Data/postgreSqlDatabases
```

## References

| Topic | Reference | Use for |
|-------|-----------|---------|
| Recipe Structure | [references/recipe-structure.md](references/recipe-structure.md) | How recipes are organized in resource-types-contrib |
| Environment Config | [references/environment-config.md](references/environment-config.md) | Environment setup, namespaces, providers |
| Recipe Packs | [references/recipe-packs.md](references/recipe-packs.md) | Bundled recipe collections for platforms |
| Cloud Providers | [references/cloud-providers.md](references/cloud-providers.md) | Configuring Azure, AWS credentials for Radius |

## Guardrails

- **Always consult the platform constitution** before recommending recipes. Only suggest recipes for approved cloud providers and IaC tooling.
- **Prefer recipe packs** over individual recipe registration when setting up a new environment.
- **Match IaC language** to what the platform team uses (Terraform vs Bicep) per the constitution.
- **Test recipes in a dev environment** before registering in production.
- **Document all registered recipes** and resource types in the environment for team visibility.
- **Never register recipes** for cloud providers not approved in the constitution without flagging the deviation.
