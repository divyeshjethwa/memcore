import { describe, expect, it } from "vitest";

import { openDatabase } from "../src/db.js";
import { createMemory, searchMemories } from "../src/memoryStore.js";
import { initializeSchema } from "../src/schema.js";

describe("searchMemories", () => {
  it("returns keyword matches within the requested project", () => {
    const db = openDatabase();

    try {
      initializeSchema(db);
      createMemory(db, {
        project: "alpha",
        content: "Use SQLite for local persistence",
        source: "test",
      });
      createMemory(db, {
        project: "alpha",
        content: "Expose memory through MCP tools",
        source: "test",
      });
      createMemory(db, {
        project: "beta",
        content: "Use SQLite for unrelated beta notes",
        source: "test",
      });

      const matches = searchMemories(db, "alpha", "SQLite");

      expect(matches).toHaveLength(1);
      expect(matches[0]).toMatchObject({
        project: "alpha",
        content: "Use SQLite for local persistence",
      });
    } finally {
      db.close();
    }
  });
});
