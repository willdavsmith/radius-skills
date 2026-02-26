# Environment Configuration

## Workspaces

A workspace connects the `rad` CLI to a Kubernetes cluster and Radius installation:

```bash
# Create a workspace
rad workspace create kubernetes <name> --group <resource-group> --environment <environment>

# Show current workspace
rad workspace show

# List workspaces
rad workspace list

# Switch workspace
rad workspace switch <name>
```

## Environments

Environments are Radius's abstraction for deployment targets. Each environment has:
- A **namespace** in Kubernetes where resources are deployed
- **Recipes** registered for each resource type
- Optional **cloud provider** credentials (Azure, AWS)

```bash
# Create an environment
rad environment create <name> --namespace <k8s-namespace>

# List environments
rad environment list

# Show environment details
rad environment show <name>

# Switch active environment
rad environment switch <name>
```

## Resource Groups

Resource groups organize Radius resources:

```bash
# Create a resource group
rad group create <name>

# List resource groups
rad group list

# Switch active group
rad group switch <name>
```

## Namespace Mapping

Radius deploys application resources into Kubernetes namespaces using the pattern:

```
<namespace>-<application-name>
```

For example, if the environment namespace is `default` and the app is `myapp`, pods deploy to `default-myapp`.

## Provider Configuration

### Azure

```bash
rad environment update <env> --azure-subscription-id <sub-id> --azure-resource-group <rg>
```

### AWS

```bash
rad environment update <env> --aws-region <region> --aws-account-id <account-id>
```

## Inspecting the Environment

```bash
# What resource types are available?
rad resource-type list

# What recipes are registered?
rad recipe list --environment <env>

# What's deployed?
rad app list
rad resource list containers --application <app>

# Visualize the app graph
rad app graph --application <app>
```
