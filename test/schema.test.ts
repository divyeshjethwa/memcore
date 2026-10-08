import { describe, expect, it } from "vitest";

import { openDatabase } from "../src/db.js";
import { initializeSchema } from "../src/schema.js";

describe("initializeSchema", () => {
  it("creates memory tables idempotently", () => {
    const db = openDatabase();

    try {
      initializeSchema(db);
      initializeSchema(db);

      const tables = db
        .prepare(
          "SELECT name FROM sqlite_master WHERE type = 'table' AND name IN ('memories', 'memory_versions') ORDER BY name",
        )
        .all() as Array<{ name: string }>;

      expect(tables.map((table) => table.name)).toEqual(["memories", "memory_versions"]);
    } finally {
      db.close();
    }
  });
});
