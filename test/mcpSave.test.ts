import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { openDatabase } from "../src/db.js";
import { listMemoriesByProject } from "../src/memoryStore.js";
import { createMcpServer } from "../src/mcpServer.js";

describe("save_memory MCP tool", () => {
  it("stores a memory successfully", async () => {
    const dir = mkdtempSync(join(tmpdir(), "memcore-"));
    const dbPath = join(dir, "memcore.sqlite");

    try {
      const server = createMcpServer({ databasePath: dbPath });
      const tool = (server as unknown as { _registeredTools: Record<string, { handler: (args: unknown) => Promise<unknown> }> })
        ._registeredTools.save_memory;

      await tool.handler({
        project: "alpha",
        content: "MCP saved fact",
        source: "mcp-test",
      });

      const db = openDatabase(dbPath);
      const memories = listMemoriesByProject(db, "alpha");
      db.close();

      expect(memories).toHaveLength(1);
      expect(memories[0]).toMatchObject({
        project: "alpha",
        content: "MCP saved fact",
        source: "mcp-test",
      });
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
