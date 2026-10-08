import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { openDatabase } from "../src/db.js";

describe("openDatabase", () => {
  it("opens a local SQLite database and runs a simple query", () => {
    const dir = mkdtempSync(join(tmpdir(), "memcore-"));
    const dbPath = join(dir, "memcore.sqlite");

    try {
      const db = openDatabase(dbPath);
      const result = db.prepare("select 1 + 1 as value").get() as { value: number };
      db.close();

      expect(result.value).toBe(2);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
