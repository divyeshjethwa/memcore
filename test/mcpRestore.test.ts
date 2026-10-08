import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { openDatabase } from "../src/db.js";
import { createMemory, getMemory, listMemoryVersions, updateMemory } from "../src/memoryStore.js";
import { createMcpServer } from "../src/mcpServer.js";
import { initializeSchema } from "../src/schema.js";

describe("restore_memory_version MCP tool", () => {
  it("restores earlier content and preserves audit history", async () => {
    const dir = mkdtempSync(join(tmpdir(), "memcore-"));
    const dbPath = join(dir, "memcore.sqlite");

    try {
      const db = openDatabase(dbPath);
      initializeSchema(db);
      const saved = createMemory(db, { project: "alpha", content: "First fact", source: "test" });
      updateMemory(db, saved.id, "Second fact");
      updateMemory(db, saved.id, "Third fact");
      const [firstVersion] = listMemoryVersions(db, saved.id);
      db.close();

      const server = createMcpServer({ databasePath: dbPath });
      const tool = (server as unknown as { _registeredTools: Record<string, { handler: (args: unknown) => Promise<unknown> }> })
        ._registeredTools.restore_memory_version;

      await tool.handler({ memoryId: saved.id, versionId: firstVersion.id });

      const verifyDb = openDatabase(dbPath);
      const memory = getMemory(verifyDb, saved.id);
      const versions = listMemoryVersions(verifyDb, saved.id);
      verifyDb.close();

      expect(memory.content).toBe("First fact");
      expect(versions.map((version) => version.content)).toEqual(["First fact", "Second fact", "Third fact"]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
