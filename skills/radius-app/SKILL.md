---
name: radius-app
description: Author Radius application definitions using Bicep. Use when creating or modifying Radius applications, containers, connections, or resource references. Loads resource type schemas from resource-types-contrib and generates correct Bicep patterns.
license: MIT
metadata:
  author: radius-skills
  version: "1.0.0"
---

# Radius Application Authoring

Use this skill to help developers define Radius applications using Bicep, with correct resource types from [resource-types-contrib](https://github.com/radius-project/resource-types-contrib) and patterns aligned to the platform engineering constitution.

## Workflow

1. **Read the platform constitution.** Check for `Platform-Engineering-Constitution.md` in the repository root. Note approved cloud providers, compute platforms, and IaC tooling — these determine which resource types and recipes are available.
2. **Identify what the developer needs.** Ask what resources the application requires (databases, caches, message queues, secrets, etc.).
3. **Check if the needed resource types exist** in the registered resource types (use `rad resource-type list` or check [resource-types-contrib](https://github.com/radius-project/resource-types-contrib)). If a needed resource type does not exist, **invoke the `radius-new-type` skill** to walk through creating and installing it before proceeding.
4. **Load the relevant resource type schemas** from the references below to understand available properties, required fields, and connection environment variables.
5. **Generate the Bicep application definition** with correct resource declarations and connections.
6. **Validate** the generated Bicep against the constitution constraints and resource type schemas.

## Application Structure

A Radius application definition (`app.bicep`) typically includes:

```bicep
extension radius

@description('The Radius Environment ID. Injected automatically by the rad CLI.')
param environment string

// Application resource
resource app 'Radius.Core/applications@2025-08-01-preview' = {
  name: 'myapp'
  properties: {
    environment: environment
  }
}

// Container resource
resource frontend 'Radius.Compute/containers@2025-08-01-preview' = {
  name: 'frontend'
  properties: {
    environment: environment
    application: app.id
    containers: {
      frontend: {
        image: 'myregistry/frontend:latest'
        ports: {
          web: {
            containerPort: 3000
          }
        }
      }
    }
    connections: {
      database: {
        source: db.id
      }
    }
  }
}

// Portable resource (backed by a Recipe)
resource db 'Radius.Data/postgreSqlDatabases@2025-08-01-preview' = {
  name: 'database'
  properties: {
    environment: environment
    application: app.id
  }
}
```

## Key Concepts

### Resource Types

All resource types come from [resource-types-contrib](https://github.com/radius-project/resource-types-contrib). **Do not use `Applications.Core/*` or `Applications.*` resource types.** Use the `Radius.*` namespaced types instead.

**Available namespaces and resource types:**

| Namespace | Resource Types | Description |
|-----------|---------------|-------------|
| `Radius.Core` | `applications` | Application grouping resource |
| `Radius.Compute` | `containers`, `persistentVolumes`, `routes` | Compute, storage, and networking |
| `Radius.Data` | `postgreSqlDatabases`, `mySqlDatabases` | Database resources |
| `Radius.Security` | `secrets` | Secret management |

If the resource type you need is not listed above, **use the `radius-new-type` skill** to create a new resource type definition and recipes, then register it before using it in your application.

### Connections
Connections between a container and a resource automatically inject environment variables into the container. The naming convention is:

```
CONNECTION_<CONNECTION-NAME>_<PROPERTY-NAME>
```

For example, a connection named `database` to a PostgreSQL resource injects:
- `CONNECTION_DATABASE_HOST`
- `CONNECTION_DATABASE_PORT`
- `CONNECTION_DATABASE_DATABASE`
- `CONNECTION_DATABASE_USERNAME`
- `CONNECTION_DATABASE_PASSWORD`

### Recipes
Recipes are the platform engineer's implementation of how a resource type gets deployed. Developers don't need to know the recipe details — they just reference the resource type and Radius resolves the recipe based on the environment configuration.

## References

| Topic | Reference | Use for |
|-------|-----------|---------|
| Bicep Patterns | [references/bicep-patterns.md](references/bicep-patterns.md) | Common Bicep patterns for Radius apps |
| Resource Type Catalog | [references/resource-type-catalog.md](references/resource-type-catalog.md) | Available resource types and schemas |
| Connection Conventions | [references/connection-conventions.md](references/connection-conventions.md) | Environment variable naming, connection patterns |
| Radius CLI Reference | [references/rad-cli-reference.md](references/rad-cli-reference.md) | rad run, rad deploy, rad app graph |

## Guardrails

- **Never use `Applications.Core/*` or `Applications.*` resource types.** All resource types must come from [resource-types-contrib](https://github.com/radius-project/resource-types-contrib) using `Radius.*` namespaces.
- **If a resource type is missing**, do not improvise. Invoke the `radius-new-type` skill to create and install it first.
- **Always check the platform constitution** before suggesting resource types or cloud-specific patterns.
- **Never hardcode infrastructure details** in application definitions. Let recipes handle the implementation.
- **Always include the `environment` parameter** — it is required for all Radius resources.
- **Validate connection names** match what the application code expects for environment variables.
- **Use `rad run`** for local development and `rad deploy` for production deployments.
