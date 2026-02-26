# Resource Type YAML Format

## Structure

Resource type definitions are YAML files with the following structure:

```yaml
namespace: <Namespace>
types:
  <typeName>:
    description: |
      Multi-line description shown by `rad resource-type show`.
      Include Bicep usage examples here.
    apiVersions:
      '<api-version>':
        schema:
          type: object
          properties:
            <property-definitions>
          required: [<required-properties>]
```

## Full Example

```yaml
namespace: Radius.Data
types:
  postgreSqlDatabases:
    description: |
      A portable PostgreSQL database resource.
      
      ## Bicep Usage
      
      ```bicep
      extension radiusData
      
      resource db 'Radius.Data/postgreSqlDatabases@2025-08-01-preview' = {
        name: 'mydb'
        properties: {
          environment: environment
          application: application
          size: 'S'
        }
      }
      ```
      
      ## Connection Environment Variables
      
      When connected to a Radius.Compute/containers resource:
      - `CONNECTION_<NAME>_PROPERTIES` — JSON with host, port, database, username, password
      
    apiVersions:
      '2025-08-01-preview':
        schema:
          type: object
          properties:
            environment:
              type: string
              description: "(Required) The Radius Environment ID."
            application:
              type: string
              description: "(Optional) The Radius Application ID."
            size:
              type: string
              enum: ['S', 'M', 'L']
              description: "(Optional) The size of the database instance."
            host:
              type: string
              description: The hostname of the database server.
              readOnly: true
            port:
              type: string
              description: The port number.
              readOnly: true
            database:
              type: string
              description: The database name.
              readOnly: true
            username:
              type: string
              description: The admin username.
              readOnly: true
            password:
              type: string
              description: The admin password.
              readOnly: true
          required: [environment]
```

## Property Types

### Input Properties

Developer-facing, set in `app.bicep`:

| Attribute | Description |
|-----------|-------------|
| `type` | `string`, `integer`, `boolean`, `object`, `array` |
| `enum` | Allowed values (e.g., `['S', 'M', 'L']`) |
| `description` | Human-readable description |
| `default` | Default value (optional) |

### Output Properties

Recipe-produced, available as connection env vars:

| Attribute | Description |
|-----------|-------------|
| `type` | Usually `string` |
| `description` | What this output represents |
| `readOnly: true` | **Required** — marks it as recipe output |

## Multiple Types Per File

```yaml
namespace: Radius.Data
types:
  postgreSqlDatabases:
    description: PostgreSQL database
    apiVersions:
      '2025-08-01-preview':
        schema: ...
  redisCaches:
    description: Redis cache
    apiVersions:
      '2025-08-01-preview':
        schema: ...
```

## Registration

```bash
# Register the resource type
rad resource-type create Radius.Data/postgreSqlDatabases --from-file manifest.yaml

# Generate Bicep extension for IDE validation
rad bicep publish-extension --from-file manifest.yaml --target radius-data.tgz
```
