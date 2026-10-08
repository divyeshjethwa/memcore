import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { openDatabase } from "../src/db.js";
import { createMemory } from "../src/memoryStore.js";
import { createMcpServer } from "../src/mcpServer.js";
import { initializeSchema } from "../src/schema.js";

describe("search_memories MCP tool", () => {
  it("returns keyword matches", async () => {
    const dir = mkdtempSync(join(tmpdir(), "memcore-"));
    const dbPath = join(dir, "memcore.sqlite");

    try {
      const db = openDatabase(dbPath);
      initializeSchema(db);
      createMemory(db, { project: "alpha", content: "SQLite local persistence", source: "test" });
      createMemory(db, { project: "alpha", content: "MCP server tools", source: "test" });
      db.close();

      const server = createMcpServer({ databasePath: dbPath });
      const tool = (server as unknown as { _registeredTools: Record<string, { handler: (args: unknown) => Promise<unknown> }> })
        ._registeredTools.search_memories;

      const result = (await tool.handler({ project: "alpha", keyword: "SQLite" })) as {
        structuredContent: { memories: Array<{ content: string }> };
      };

      expect(result.structuredContent.memories).toHaveLength(1);
      expect(result.structuredContent.memories[0].content).toBe("SQLite local persistence");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
