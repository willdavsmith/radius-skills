---
name: radius-app
description: Author Radius application definitions using Bicep. Use when creating or modifying Radius applications, containers, connections, or resource references. Loads resource type schemas and generates correct Bicep patterns.
license: MIT
metadata:
  author: radius-skills
  version: "1.0.0"
---

# Radius Application Authoring

Use this skill to help developers define Radius applications using Bicep, with correct resource types, connections, and patterns aligned to the platform engineering constitution.

## Workflow

1. **Read the platform constitution.** Check for `Platform-Engineering-Constitution.md` in the repository root. Note approved cloud providers, compute platforms, and IaC tooling — these determine which resource types and recipes are available.
2. **Identify what the developer needs.** Ask what resources the application requires (databases, caches, message queues, secrets, etc.).
3. **Load the relevant resource type schemas** from the references below to understand available properties, required fields, and connection environment variables.
4. **Generate the Bicep application definition** with correct resource declarations and connections.
5. **Validate** the generated Bicep against the constitution constraints and resource type schemas.

## Application Structure

A Radius application definition (`app.bicep`) typically includes:

```bicep
extension radius

@description('The Radius Environment ID. Injected automatically by the rad CLI.')
param environment string

@description('The Radius Application ID. Injected automatically by the rad CLI.')
param application string

// Application resource (optional, can be implicit)
resource app 'Applications.Core/applications@2023-10-01-preview' = {
  name: 'myapp'
  properties: {
    environment: environment
  }
}

// Container resource
resource frontend 'Applications.Core/containers@2023-10-01-preview' = {
  name: 'frontend'
  properties: {
    application: app.id
    container: {
      image: 'myregistry/frontend:latest'
      ports: {
        web: {
          containerPort: 3000
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

### Resource Types
Resource types define the schema for portable resources. They are namespaced (e.g., `Radius.Data/postgreSqlDatabases`) and versioned with API versions (e.g., `2025-08-01-preview`). Available resource types can be browsed at [resource-types-contrib](https://github.com/radius-project/resource-types-contrib).

**Available namespaces:**

| Namespace | Resource Types | Description |
|-----------|---------------|-------------|
| `Applications.Core` | `containers`, `applications`, `environments`, `gateways`, `volumes` | Core Radius resources |
| `Radius.Compute` | `containers`, `persistentVolumes`, `routes` | Compute resources |
| `Radius.Data` | `postgreSqlDatabases`, `mySqlDatabases` | Database resources |
| `Radius.Security` | `secrets` | Security resources |

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

- **Always check the platform constitution** before suggesting resource types or cloud-specific patterns.
- **Use portable resource types** (e.g., `Radius.Data/postgreSqlDatabases`) instead of cloud-specific resources unless the developer explicitly needs a specific cloud service.
- **Never hardcode infrastructure details** in application definitions. Let recipes handle the implementation.
- **Always include the `environment` parameter** — it is required for all Radius resources.
- **Validate connection names** match what the application code expects for environment variables.
- **Use `rad run`** for local development and `rad deploy` for production deployments.
