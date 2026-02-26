# Radius Resource Type Catalog

## Namespaces

### Applications.Core (Built-in)

These are built into Radius and available without registration.

| Type | API Version | Description | Recipe-based? |
|------|------------|-------------|---------------|
| `Applications.Core/applications` | `2023-10-01-preview` | Application grouping | No |
| `Applications.Core/containers` | `2023-10-01-preview` | Container workloads | **No** (directly managed) |
| `Applications.Core/gateways` | `2023-10-01-preview` | HTTP ingress gateways | No |
| `Applications.Core/volumes` | `2023-10-01-preview` | Persistent volumes | Yes |
| `Applications.Core/environments` | `2023-10-01-preview` | Environments | No |

### Applications.Datastores (Built-in)

| Type | API Version | Description |
|------|------------|-------------|
| `Applications.Datastores/redisCaches` | `2023-10-01-preview` | Redis caches |
| `Applications.Datastores/sqlDatabases` | `2023-10-01-preview` | SQL databases |
| `Applications.Datastores/mongoDatabases` | `2023-10-01-preview` | MongoDB databases |

### Radius.Compute (resource-types-contrib)

Must be registered. **All are recipe-based.**

| Type | API Version | Description |
|------|------------|-------------|
| `Radius.Compute/containers` | `2025-08-01-preview` | Container workloads (recipe-based) |
| `Radius.Compute/persistentVolumes` | `2025-08-01-preview` | Persistent volumes |
| `Radius.Compute/routes` | `2025-08-01-preview` | HTTP routing (requires Gateway API) |

### Radius.Data (resource-types-contrib)

Must be registered. All are recipe-based.

| Type | API Version | Description |
|------|------------|-------------|
| `Radius.Data/postgreSqlDatabases` | `2025-08-01-preview` | PostgreSQL databases |
| `Radius.Data/mySqlDatabases` | `2025-08-01-preview` | MySQL databases |
| `Radius.Data/redisCaches` | `2025-08-01-preview` | Redis caches |

### Radius.Security (resource-types-contrib)

| Type | API Version | Description |
|------|------------|-------------|
| `Radius.Security/secrets` | `2025-08-01-preview` | Secret stores |

## Common Properties

All resource types share these properties:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `environment` | string | Yes | Radius Environment ID |
| `application` | string | No | Radius Application ID |

## Radius.Data/postgreSqlDatabases Schema

### Input Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `size` | `'S' \| 'M' \| 'L'` | Depends on recipe | Database size |

### Output Properties (readOnly, set by recipe)

| Property | Type | Description |
|----------|------|-------------|
| `host` | string | Database hostname |
| `port` | string | Database port |
| `database` | string | Database name |
| `username` | string | Admin username |
| `password` | string | Admin password |

## Radius.Data/redisCaches Schema

### Input Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `size` | `'S' \| 'M' \| 'L'` | Depends on recipe | Cache size |

### Output Properties (readOnly, set by recipe)

| Property | Type | Description |
|----------|------|-------------|
| `host` | string | Redis hostname |
| `port` | string | Redis port |
| `password` | string | Redis password (if auth enabled) |

## Radius.Compute/containers Schema

### Input Properties

| Property | Type | Description |
|----------|------|-------------|
| `containers` | map of container objects | Container definitions (keyed by name) |
| `connections` | map of connection objects | Connections to other resources |

Each container object:

| Property | Type | Description |
|----------|------|-------------|
| `image` | string | Container image reference |
| `ports` | map of port objects | Port mappings |
| `env` | map of strings | Environment variables |
| `readinessProbe` | probe object | Readiness probe configuration |
| `livenessProbe` | probe object | Liveness probe configuration |

## Checking Registered Types

```bash
# List all registered resource types
rad resource-type list

# Show details for a specific type
rad resource-type show Radius.Data/postgreSqlDatabases

# List recipes for a type
rad recipe list --environment default
```
