import { describe, expect, it } from "vitest";

import { openDatabase } from "../src/db.js";
import { createMemory, listMemoryVersions, restoreMemoryVersion, updateMemory } from "../src/memoryStore.js";
import { initializeSchema } from "../src/schema.js";

describe("restoreMemoryVersion", () => {
  it("restores prior content without deleting audit history", () => {
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
      const [firstVersion] = listMemoryVersions(db, saved.id);

      const restored = restoreMemoryVersion(db, saved.id, firstVersion.id);
      const versions = listMemoryVersions(db, saved.id);

      expect(restored).toMatchObject({
        id: saved.id,
        content: "First fact",
      });
      expect(versions.map((version) => version.content)).toEqual(["First fact", "Second fact", "Third fact"]);
    } finally {
      db.close();
    }
  });
});
