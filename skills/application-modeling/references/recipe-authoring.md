# Recipe Authoring Guide

## Overview

Recipes are IaC templates (Bicep or Terraform) that Radius executes to provision infrastructure when a developer declares a portable resource. The recipe receives a context object with resource metadata and must output connection properties.

## Recipe Context Object

Radius passes a `context` parameter to every recipe:

```json
{
  "resource": {
    "id": "/planes/radius/local/resourceGroups/default/providers/Radius.Data/postgreSqlDatabases/mydb",
    "name": "mydb",
    "type": "Radius.Data/postgreSqlDatabases",
    "properties": {
      "environment": "...",
      "application": "...",
      "size": "S"
    }
  },
  "environment": {
    "id": "/planes/radius/local/resourceGroups/default/providers/Applications.Core/environments/default"
  },
  "application": {
    "id": "/planes/radius/local/resourceGroups/default/providers/Applications.Core/applications/myapp"
  },
  "runtime": {
    "kubernetes": {
      "namespace": "default-myapp",
      "environmentNamespace": "default"
    }
  }
}
```

### Accessing Properties

| Path | Description |
|------|-------------|
| `context.resource.name` | Resource name from app.bicep |
| `context.resource.type` | Full resource type |
| `context.resource.properties.*` | Developer-set input properties |
| `context.runtime.kubernetes.namespace` | Target Kubernetes namespace |
| `context.runtime.kubernetes.environmentNamespace` | Environment namespace |

## Bicep Recipe

```bicep
import kubernetes as k8s {
  kubeConfig: ''
  namespace: context.runtime.kubernetes.namespace
}

@description('The Recipe context object passed by Radius.')
param context object

// Safe property access with defaults
var size = contains(context.resource.properties, 'size') ? context.resource.properties.size : 'S'
var name = context.resource.name
var namespace = context.runtime.kubernetes.namespace
var uniqueName = '${name}-${uniqueString(context.resource.id)}'

var sizeMap = {
  S: { cpu: '250m', memory: '256Mi', storage: '1Gi' }
  M: { cpu: '500m', memory: '512Mi', storage: '5Gi' }
  L: { cpu: '1',    memory: '1Gi',   storage: '10Gi' }
}

// Deploy a Kubernetes Deployment + Service
resource deployment 'apps/Deployment@v1' = {
  metadata: {
    name: uniqueName
    namespace: namespace
  }
  spec: {
    selector: { matchLabels: { app: uniqueName } }
    template: {
      metadata: { labels: { app: uniqueName } }
      spec: {
        containers: [
          {
            name: 'postgres'
            image: 'postgres:16-alpine'
            ports: [{ containerPort: 5432 }]
            env: [
              { name: 'POSTGRES_DB', value: name }
              { name: 'POSTGRES_USER', value: 'admin' }
              { name: 'POSTGRES_PASSWORD', value: 'password123' }
            ]
            resources: {
              requests: { cpu: sizeMap[size].cpu, memory: sizeMap[size].memory }
              limits:   { cpu: sizeMap[size].cpu, memory: sizeMap[size].memory }
            }
          }
        ]
      }
    }
  }
}

resource service 'core/Service@v1' = {
  metadata: {
    name: '${uniqueName}-svc'
    namespace: namespace
  }
  spec: {
    selector: { app: uniqueName }
    ports: [{ port: 5432, targetPort: 5432 }]
  }
}

// Recipe output — must match resource type readOnly properties
output result object = {
  properties: {
    host: '${uniqueName}-svc.${namespace}.svc.cluster.local'
    port: '5432'
    database: name
    username: 'admin'
    password: 'password123'
  }
}
```

## Terraform Recipe

```hcl
variable "context" {
  type        = any
  description = "The Recipe context object passed by Radius."
}

locals {
  size      = try(var.context.resource.properties.size, "S")
  name      = var.context.resource.name
  namespace = var.context.runtime.kubernetes.namespace
  unique    = "${local.name}-${substr(sha256(var.context.resource.id), 0, 10)}"
  
  size_map = {
    S = { cpu = "250m", memory = "256Mi" }
    M = { cpu = "500m", memory = "512Mi" }
    L = { cpu = "1",    memory = "1Gi" }
  }
}

resource "kubernetes_deployment" "db" {
  metadata {
    name      = local.unique
    namespace = local.namespace
  }
  spec {
    selector {
      match_labels = { app = local.unique }
    }
    template {
      metadata {
        labels = { app = local.unique }
      }
      spec {
        container {
          name  = "postgres"
          image = "postgres:16-alpine"
          port { container_port = 5432 }
          env { name = "POSTGRES_DB";       value = local.name }
          env { name = "POSTGRES_USER";     value = "admin" }
          env { name = "POSTGRES_PASSWORD"; value = "password123" }
          resources {
            requests = local.size_map[local.size]
            limits   = local.size_map[local.size]
          }
        }
      }
    }
  }
}

resource "kubernetes_service" "db" {
  metadata {
    name      = "${local.unique}-svc"
    namespace = local.namespace
  }
  spec {
    selector = { app = local.unique }
    port { port = 5432; target_port = 5432 }
  }
}

output "result" {
  value = {
    properties = {
      host     = "${local.unique}-svc.${local.namespace}.svc.cluster.local"
      port     = "5432"
      database = local.name
      username = "admin"
      password = "password123"
    }
  }
}
```

## Common Mistakes

1. **Accessing properties without default:** `context.resource.properties.size` fails if `size` isn't set. Always use `contains()` (Bicep) or `try()` (Terraform).
2. **Wrong context path:** Use `context.resource.properties.*` not `context.properties.*`.
3. **Missing output properties:** Every `readOnly` property in the resource type schema should be in `result.properties`.
4. **Non-unique resource names:** Use `uniqueString(context.resource.id)` to avoid naming collisions across apps.
5. **Hardcoded namespaces:** Always use `context.runtime.kubernetes.namespace`.
