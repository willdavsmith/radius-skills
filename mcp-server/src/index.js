#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { execRad } from "./rad.js";

const server = new McpServer({
  name: "radius",
  version: "1.0.0",
});

// --- Environment tools ---

server.tool(
  "rad_environment_list",
  "List all Radius environments",
  {},
  async () => {
    const result = await execRad(["environment", "list", "-o", "json"]);
    return { content: [{ type: "text", text: result }] };
  }
);

server.tool(
  "rad_environment_show",
  "Show details of a specific Radius environment",
  {
    name: z.string().describe("The environment name"),
  },
  async ({ name }) => {
    const result = await execRad(["environment", "show", name, "-o", "json"]);
    return { content: [{ type: "text", text: result }] };
  }
);

// --- Recipe tools ---

server.tool(
  "rad_recipe_list",
  "List recipes registered in a Radius environment",
  {
    environment: z.string().describe("The environment name"),
  },
  async ({ environment }) => {
    const result = await execRad([
      "recipe",
      "list",
      "-e",
      environment,
      "-o",
      "json",
    ]);
    return { content: [{ type: "text", text: result }] };
  }
);

server.tool(
  "rad_recipe_show",
  "Show details of a specific recipe",
  {
    name: z.string().describe("The recipe name"),
    resourceType: z
      .string()
      .describe(
        "The resource type (e.g., Radius.Data/postgreSqlDatabases)"
      ),
    environment: z.string().describe("The environment name"),
  },
  async ({ name, resourceType, environment }) => {
    const result = await execRad([
      "recipe",
      "show",
      name,
      "--resource-type",
      resourceType,
      "-e",
      environment,
      "-o",
      "json",
    ]);
    return { content: [{ type: "text", text: result }] };
  }
);

// --- Resource type tools ---

server.tool(
  "rad_resource_type_list",
  "List all registered Radius resource types",
  {},
  async () => {
    const result = await execRad(["resource-type", "list", "-o", "json"]);
    return { content: [{ type: "text", text: result }] };
  }
);

server.tool(
  "rad_resource_type_show",
  "Show details and schema of a Radius resource type",
  {
    resourceType: z
      .string()
      .describe(
        "The fully qualified resource type (e.g., Radius.Data/postgreSqlDatabases)"
      ),
  },
  async ({ resourceType }) => {
    const result = await execRad([
      "resource-type",
      "show",
      resourceType,
      "-o",
      "json",
    ]);
    return { content: [{ type: "text", text: result }] };
  }
);

// --- Application tools ---

server.tool(
  "rad_app_list",
  "List deployed Radius applications",
  {},
  async () => {
    const result = await execRad(["application", "list", "-o", "json"]);
    return { content: [{ type: "text", text: result }] };
  }
);

server.tool(
  "rad_app_graph",
  "Show the resource graph of a Radius application",
  {
    name: z.string().describe("The application name"),
  },
  async ({ name }) => {
    const result = await execRad(["app", "graph", name]);
    return { content: [{ type: "text", text: result }] };
  }
);

// --- Resource tools ---

server.tool(
  "rad_resource_list",
  "List deployed resources of a given type",
  {
    resourceType: z
      .string()
      .describe(
        "The resource type to list (e.g., Applications.Core/containers)"
      ),
  },
  async ({ resourceType }) => {
    const result = await execRad([
      "resource",
      "list",
      resourceType,
      "-o",
      "json",
    ]);
    return { content: [{ type: "text", text: result }] };
  }
);

server.tool(
  "rad_resource_show",
  "Show details of a specific deployed resource",
  {
    resourceType: z
      .string()
      .describe(
        "The resource type (e.g., Applications.Core/containers)"
      ),
    name: z.string().describe("The resource name"),
  },
  async ({ resourceType, name }) => {
    const result = await execRad([
      "resource",
      "show",
      resourceType,
      name,
      "-o",
      "json",
    ]);
    return { content: [{ type: "text", text: result }] };
  }
);

// Start the server
const transport = new StdioServerTransport();
await server.connect(transport);
