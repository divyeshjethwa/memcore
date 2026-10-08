import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { openDatabase } from "../src/db.js";
import { createMemory, getMemory, listMemoryVersions } from "../src/memoryStore.js";
import { createMcpServer } from "../src/mcpServer.js";
import { initializeSchema } from "../src/schema.js";

describe("update_memory MCP tool", () => {
  it("updates memory content and records version history", async () => {
    const dir = mkdtempSync(join(tmpdir(), "memcore-"));
    const dbPath = join(dir, "memcore.sqlite");

    try {
      const db = openDatabase(dbPath);
      initializeSchema(db);
      const saved = createMemory(db, { project: "alpha", content: "Original fact", source: "test" });
      db.close();

      const server = createMcpServer({ databasePath: dbPath });
      const tool = (server as unknown as { _registeredTools: Record<string, { handler: (args: unknown) => Promise<unknown> }> })
        ._registeredTools.update_memory;

      await tool.handler({ id: saved.id, content: "Updated fact" });

      const verifyDb = openDatabase(dbPath);
      const memory = getMemory(verifyDb, saved.id);
      const versions = listMemoryVersions(verifyDb, saved.id);
      verifyDb.close();

      expect(memory.content).toBe("Updated fact");
      expect(versions.map((version) => version.content)).toEqual(["Original fact"]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
