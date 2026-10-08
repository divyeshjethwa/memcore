import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import { openDatabase } from "./db.js";
import { createMemory, restoreMemoryVersion, searchMemories, updateMemory } from "./memoryStore.js";
import { initializeSchema } from "./schema.js";

export interface McpServerOptions {
  databasePath?: string;
}

export function createMcpServer(options: McpServerOptions = {}): McpServer {
  const db = openDatabase(options.databasePath);
  initializeSchema(db);
  const server = new McpServer({
    name: "memcore",
    version: "0.1.0",
  });

  server.registerTool(
    "save_memory",
    {
      description: "Save a project-scoped memory.",
      inputSchema: {
        project: z.string(),
        content: z.string(),
        source: z.string(),
      },
    },
    ({ project, content, source }) => {
      const memory = createMemory(db, { project, content, source });

      return {
        content: [{ type: "text", text: `Saved memory ${memory.id}` }],
        structuredContent: { memory },
      };
    },
  );

  server.registerTool(
    "search_memories",
    {
      description: "Search project-scoped memories by keyword.",
      inputSchema: {
        project: z.string(),
        keyword: z.string(),
      },
    },
    ({ project, keyword }) => {
      const memories = searchMemories(db, project, keyword);

      return {
        content: [{ type: "text", text: `Found ${memories.length} memories` }],
        structuredContent: { memories },
      };
    },
  );

  server.registerTool(
    "update_memory",
    {
      description: "Update a memory by ID and preserve its prior version.",
      inputSchema: {
        id: z.number().int(),
        content: z.string(),
      },
    },
    ({ id, content }) => {
      const memory = updateMemory(db, id, content);

      return {
        content: [{ type: "text", text: `Updated memory ${memory.id}` }],
        structuredContent: { memory },
      };
    },
  );

  server.registerTool(
    "restore_memory_version",
    {
      description: "Restore a memory to a previous version without deleting history.",
      inputSchema: {
        memoryId: z.number().int(),
        versionId: z.number().int(),
      },
    },
    ({ memoryId, versionId }) => {
      const memory = restoreMemoryVersion(db, memoryId, versionId);

      return {
        content: [{ type: "text", text: `Restored memory ${memory.id}` }],
        structuredContent: { memory },
      };
    },
  );

  return server;
}

export async function startMcpServer(): Promise<void> {
  const server = createMcpServer();
  await server.connect(new StdioServerTransport());
}
