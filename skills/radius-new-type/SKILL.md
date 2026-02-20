---
name: radius-new-type
description: Create and install a new Radius resource type and recipes when a needed resource type does not exist in resource-types-contrib. Use when a developer needs a resource type that is not yet available, or when a platform engineer wants to extend the Radius catalog.
license: MIT
metadata:
  author: radius-skills
  version: "1.0.0"
---

# Create a New Radius Resource Type

Use this skill when a developer or platform engineer needs a resource type that does not yet exist in [resource-types-contrib](https://github.com/radius-project/resource-types-contrib). This skill walks through creating the resource type definition, writing recipes, registering the type, and optionally contributing it back.

## Workflow

1. **Confirm the type is missing.** Check registered resource types via `rad resource-type list` and the [resource-types-contrib](https://github.com/radius-project/resource-types-contrib) repo. If the type already exists, stop and use it directly.
2. **Identify the resource abstraction.** What infrastructure does the developer need? Define it as a portable, cloud-agnostic interface.
3. **Choose the namespace.** Use existing namespaces (`Radius.Data`, `Radius.Compute`, `Radius.Security`) or create a custom one (e.g., `Contoso.Messaging`).
4. **Define the resource type YAML schema** following the conventions below.
5. **Write recipes** for each target platform (Azure, AWS, Kubernetes) using the organization's approved IaC tooling from the platform constitution.
6. **Register the resource type** in the Radius environment using `rad resource-type create`.
7. **Register the recipe(s)** using `rad recipe register`.
8. **Test** with `rad run` to verify the resource type and recipes work end-to-end.
9. **Optionally contribute** the new type back to [resource-types-contrib](https://github.com/radius-project/resource-types-contrib).

## Resource Type Definition

Resource types are defined in YAML files with the following structure:

```yaml
namespace: Radius.Data
types:
  postgreSqlDatabases:
    description: |
      Developer-facing documentation including Bicep usage examples.
      This text is shown via `rad resource-type show`.
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
            # Input properties (developer-configurable)
            size:
              type: string
              enum: ['S', 'M', 'L']
              description: "(Optional) The size of the database."
            # Output properties (set by recipe, read-only)
            host:
              type: string
              description: The host name used to connect.
              readOnly: true
            port:
              type: string
              description: The port number used to connect.
              readOnly: true
          required: [environment]
```

### Schema Conventions

- **`environment`** is always required.
- **`application`** is typically optional.
- **Input properties** are developer-configurable (e.g., `size`, `tier`). Keep them minimal and cloud-agnostic.
- **Output properties** are set by the recipe and marked `readOnly: true`. These become connection environment variables.
- **Description** should include Bicep usage examples showing how to declare the resource and connect it to a container.

## Recipe Structure

Recipes go in a `recipes/` directory under the resource type, organized by platform and IaC language:

```
<resourceType>/
├── README.md
├── <resourceType>.yaml
└── recipes/
    ├── azure-<service>/
    │   ├── bicep/
    │   │   ├── azure-<service>.bicep
    │   │   └── azure-<service>.params
    │   └── terraform/
    │       ├── main.tf
    │       └── var.tf
    ├── aws-<service>/
    │   └── terraform/
    │       ├── main.tf
    │       └── var.tf
    └── kubernetes/
        ├── bicep/
        │   ├── kubernetes-<type>.bicep
        │   └── kubernetes-<type>.params
        └── terraform/
            ├── main.tf
            └── var.tf
```

### Recipe Requirements

Recipes must:
1. **Read input** from the Recipe Context object (`context.properties.*`)
2. **Set output** properties in the Recipe Result that match the resource type schema's `readOnly` properties
3. **Be idempotent** — running the recipe multiple times should produce the same result
4. **Support deletion** — resources created by the recipe must be cleanable

### Terraform Recipe Template

```hcl
variable "context" {
  type = any
  description = "The Recipe context object passed by Radius."
}

locals {
  size = try(var.context.properties.size, "S")
}

# ... deploy infrastructure ...

output "result" {
  value = {
    properties = {
      host     = "<computed>"
      port     = "<computed>"
      database = "<computed>"
      username = "<computed>"
      password = "<computed>"
    }
  }
}
```

### Bicep Recipe Template

```bicep
@description('The Recipe context object passed by Radius.')
param context object

var size = contains(context.properties, 'size') ? context.properties.size : 'S'

// ... deploy infrastructure ...

output result object = {
  properties: {
    host: '<computed>'
    port: '<computed>'
    database: '<computed>'
    username: '<computed>'
    password: '<computed>'
  }
}
```

## README Convention

Each resource type should have a README.md documenting:
- Overview of the resource type
- Table of available recipes (platform, IaC language, recipe name, stage)
- Recipe input properties (from context)
- Recipe output properties (to result)

## References

| Topic | Reference | Use for |
|-------|-----------|---------|
| Resource Type YAML Format | [references/resource-type-yaml.md](references/resource-type-yaml.md) | YAML schema definition format |
| Recipe Authoring | [references/recipe-authoring.md](references/recipe-authoring.md) | Writing Bicep and Terraform recipes |
| Contribution Guide | [references/contribution-guide.md](references/contribution-guide.md) | Contributing to resource-types-contrib |

## Guardrails

- **Keep resource type interfaces cloud-agnostic.** The schema should not expose cloud-specific properties — that's the recipe's job.
- **Minimize input properties.** Expose only what developers genuinely need to configure. Prefer sensible defaults in recipes.
- **Always include `environment` as required.** This is how Radius resolves which recipe to use.
- **Include Bicep examples** in the resource type description — this is what developers see via `rad resource-type show`.
- **Test recipes locally** with `rad run` before publishing.
- **Follow the existing namespace structure** in resource-types-contrib unless creating a genuinely new category.
