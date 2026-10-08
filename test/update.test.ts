import { describe, expect, it } from "vitest";

import { openDatabase } from "../src/db.js";
import { createMemory, updateMemory } from "../src/memoryStore.js";
import { initializeSchema } from "../src/schema.js";

describe("updateMemory", () => {
  it("changes current content without changing the memory ID", () => {
    const db = openDatabase();

    try {
      initializeSchema(db);
      const saved = createMemory(db, {
        project: "alpha",
        content: "Original fact",
        source: "test",
      });

      const updated = updateMemory(db, saved.id, "Updated fact");

      expect(updated).toMatchObject({
        id: saved.id,
        project: "alpha",
        content: "Updated fact",
        source: "test",
      });
    } finally {
      db.close();
    }
  });
});
