import { describe, expect, it } from "vitest";

import { openDatabase } from "../src/db.js";
import { createMemory, listMemoryVersions, updateMemory } from "../src/memoryStore.js";
import { initializeSchema } from "../src/schema.js";

describe("memory version history", () => {
  it("preserves prior content when a memory is updated", () => {
    const db = openDatabase();

    try {
      initializeSchema(db);
      const saved = createMemory(db, {
        project: "alpha",
        content: "Original fact",
        source: "test",
      });

      updateMemory(db, saved.id, "Updated fact");

      const versions = listMemoryVersions(db, saved.id);
      expect(versions).toHaveLength(1);
      expect(versions[0]).toMatchObject({
        memoryId: saved.id,
        content: "Original fact",
        source: "test",
      });
    } finally {
      db.close();
    }
  });

  it("lists multiple prior versions oldest to newest", () => {
    const db = openDatabase();

    try {
      initializeSchema(db);
      const saved = createMemory(db, {
        project: "alpha",
        content: "First fact",
        source: "test",
      });

      updateMemory(db, saved.id, "Second fact");
      updateMemory(db, saved.id, "Third fact");

      const versions = listMemoryVersions(db, saved.id);
      expect(versions.map((version) => version.content)).toEqual(["First fact", "Second fact"]);
    } finally {
      db.close();
    }
  });
});
