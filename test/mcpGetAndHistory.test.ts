import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { openDatabase } from "../src/db.js";
import { createMemory, updateMemory } from "../src/memoryStore.js";
import { createMcpServer } from "../src/mcpServer.js";
import { initializeSchema } from "../src/schema.js";

type ToolHandler = (args: unknown) => Promise<unknown>;

describe("get and history MCP tools", () => {
  it("retrieves a memory and lists its version history", async () => {
    const dir = mkdtempSync(join(tmpdir(), "memcore-"));
    const dbPath = join(dir, "memcore.sqlite");

    try {
      const db = openDatabase(dbPath);
      initializeSchema(db);
      const saved = createMemory(db, { project: "alpha", content: "Original fact", source: "test" });
      updateMemory(db, saved.id, "Updated fact");
      db.close();

      const server = createMcpServer({ databasePath: dbPath });
      const tools = (server as unknown as { _registeredTools: Record<string, { handler: ToolHandler }> })._registeredTools;
      const getResult = (await tools.get_memory.handler({ id: saved.id })) as {
        structuredContent: { memory: { content: string } };
      };
      const historyResult = (await tools.list_memory_versions.handler({ memoryId: saved.id })) as {
        structuredContent: { versions: Array<{ content: string }> };
      };

      expect(getResult.structuredContent.memory.content).toBe("Updated fact");
      expect(historyResult.structuredContent.versions.map((version) => version.content)).toEqual(["Original fact"]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
