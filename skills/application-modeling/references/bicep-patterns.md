# Bicep Patterns for Radius Applications

## Multi-Container Application

A typical multi-container app with a frontend, backend, and data resources:

```bicep
extension radius
extension radiusCompute
extension radiusData

param environment string
param application string

// Data resources (recipe-backed)
resource postgres 'Radius.Data/postgreSqlDatabases@2025-08-01-preview' = {
  name: 'postgres'
  properties: {
    environment: environment
    application: application
    size: 'S'
  }
}

resource redis 'Radius.Data/redisCaches@2025-08-01-preview' = {
  name: 'redis'
  properties: {
    environment: environment
    application: application
    size: 'S'
  }
}

// Backend container with connections to both data resources
resource backend 'Radius.Compute/containers@2025-08-01-preview' = {
  name: 'backend'
  properties: {
    environment: environment
    application: application
    containers: {
      backend: {
        image: 'myregistry/backend:latest'
        ports: {
          http: { containerPort: 8080 }
        }
        readinessProbe: {
          kind: 'httpGet'
          path: '/readyz'
          containerPort: 8080
        }
        livenessProbe: {
          kind: 'httpGet'
          path: '/healthz'
          containerPort: 8080
        }
      }
    }
    connections: {
      postgres: { source: postgres.id }
      redis: { source: redis.id }
    }
  }
}

// Frontend container with connection to backend
resource frontend 'Radius.Compute/containers@2025-08-01-preview' = {
  name: 'frontend'
  properties: {
    environment: environment
    application: application
    containers: {
      frontend: {
        image: 'myregistry/frontend:latest'
        ports: {
          http: { containerPort: 3000 }
        }
      }
    }
    connections: {
      backend: { source: backend.id }
    }
  }
}
```

## Parameterized Image References

For portability across environments:

```bicep
@description('Container registry host (e.g., ghcr.io/myorg, localhost:5001)')
param registryHost string = 'ghcr.io/myorg'

@description('Image tag')
param imageTag string = 'latest'

resource backend 'Radius.Compute/containers@2025-08-01-preview' = {
  name: 'backend'
  properties: {
    environment: environment
    application: application
    containers: {
      backend: {
        image: '${registryHost}/myapp-backend:${imageTag}'
        // ...
      }
    }
  }
}
```

## Applications.Core vs Radius.Compute Containers

### Applications.Core/containers (singular `container`)

```bicep
resource app 'Applications.Core/containers@2023-10-01-preview' = {
  name: 'myapp'
  properties: {
    application: application
    container: {
      image: 'myregistry/myapp:latest'
      ports: {
        web: { containerPort: 3000 }
      }
      env: {
        CUSTOM_VAR: 'value'
      }
    }
    connections: {
      db: { source: database.id }
    }
  }
}
```

### Radius.Compute/containers (plural `containers` map)

```bicep
resource app 'Radius.Compute/containers@2025-08-01-preview' = {
  name: 'myapp'
  properties: {
    environment: environment
    application: application
    containers: {
      myapp: {
        image: 'myregistry/myapp:latest'
        ports: {
          web: { containerPort: 3000 }
        }
        env: {
          CUSTOM_VAR: 'value'
        }
      }
    }
    connections: {
      db: { source: database.id }
    }
  }
}
```

## Gateway / Route

### Applications.Core/gateways

```bicep
resource gateway 'Applications.Core/gateways@2023-10-01-preview' = {
  name: 'gateway'
  properties: {
    application: application
    routes: [
      {
        path: '/'
        destination: 'http://frontend:3000'
      }
      {
        path: '/api'
        destination: 'http://backend:8080'
      }
    ]
  }
}
```

### Radius.Compute/routes (requires Gateway API controller)

```bicep
resource route 'Radius.Compute/routes@2025-08-01-preview' = {
  name: 'route'
  properties: {
    environment: environment
    application: application
    hostname: 'myapp.example.com'
    gatewayName: 'my-gateway'
    rules: [
      {
        path: '/'
        containerName: 'frontend'
        port: 3000
      }
    ]
  }
}
```

> **Note:** `Radius.Compute/routes` requires a Kubernetes Gateway API controller and Gateway resource. For local dev, use `rad run` which port-forwards automatically.
