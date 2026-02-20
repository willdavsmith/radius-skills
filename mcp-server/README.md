# Radius MCP Server

An MCP (Model Context Protocol) server that wraps the [Radius CLI](https://docs.radapp.io/reference/cli/rad/) to give AI coding assistants live introspection into Radius environments, recipes, resource types, and applications.

## Prerequisites

- [Radius CLI](https://docs.radapp.io/quick-start/) (`rad`) installed and on your PATH
- A Radius installation (`rad initialize`) with at least one environment configured
- Node.js 18+

## Installation

```bash
cd mcp-server
npm install
```

## Usage

### VS Code / Copilot

Add to your `.vscode/mcp.json` or user MCP settings:

```json
{
  "servers": {
    "radius": {
      "command": "node",
      "args": ["<path-to>/radius-skills/mcp-server/src/index.js"]
    }
  }
}
```

### Cursor

Add to your Cursor MCP configuration:

```json
{
  "mcpServers": {
    "radius": {
      "command": "node",
      "args": ["<path-to>/radius-skills/mcp-server/src/index.js"]
    }
  }
}
```

## Available Tools

| Tool | Description |
|------|-------------|
| `rad_environment_list` | List all Radius environments |
| `rad_environment_show` | Show details of a specific environment |
| `rad_recipe_list` | List recipes registered in an environment |
| `rad_recipe_show` | Show details of a specific recipe |
| `rad_resource_type_list` | List all registered resource types |
| `rad_resource_type_show` | Show resource type details and schema |
| `rad_app_list` | List deployed Radius applications |
| `rad_app_graph` | Show the resource graph of an application |
| `rad_resource_list` | List deployed resources of a given type |
| `rad_resource_show` | Show details of a specific deployed resource |
