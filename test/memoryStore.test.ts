import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { openDatabase } from "../src/db.js";
import { createMemory, getMemory, listMemoriesByProject } from "../src/memoryStore.js";
import { initializeSchema } from "../src/schema.js";

describe("memory store", () => {
  it("stores and lists memories by project namespace", () => {
    const db = openDatabase();

    try {
      initializeSchema(db);

      createMemory(db, {
        project: "alpha",
        content: "Alpha project fact",
        source: "test",
      });
      createMemory(db, {
        project: "beta",
        content: "Beta project fact",
        source: "test",
      });

      const alphaMemories = listMemoriesByProject(db, "alpha");

      expect(alphaMemories).toHaveLength(1);
      expect(alphaMemories[0]).toMatchObject({
        project: "alpha",
        content: "Alpha project fact",
        source: "test",
      });
    } finally {
      db.close();
    }
  });

  it("saves a memory with source and timestamps", () => {
    const db = openDatabase();

    try {
      initializeSchema(db);

      const memory = createMemory(db, {
        project: "alpha",
        content: "Remember this fact",
        source: "manual-note",
      });

      expect(memory).toMatchObject({
        project: "alpha",
        content: "Remember this fact",
        source: "manual-note",
      });
      expect(memory.id).toBeGreaterThan(0);
      expect(memory.createdAt).toEqual(expect.any(String));
      expect(memory.updatedAt).toEqual(expect.any(String));
    } finally {
      db.close();
    }
  });

  it("retrieves a saved memory by ID after reopening the database", () => {
    const dir = mkdtempSync(join(tmpdir(), "memcore-"));
    const dbPath = join(dir, "memcore.sqlite");

    try {
      const firstConnection = openDatabase(dbPath);
      initializeSchema(firstConnection);
      const saved = createMemory(firstConnection, {
        project: "alpha",
        content: "Persistent project fact",
        source: "manual-note",
      });
      firstConnection.close();

      const secondConnection = openDatabase(dbPath);
      const retrieved = getMemory(secondConnection, saved.id);
      secondConnection.close();

      expect(retrieved).toMatchObject({
        id: saved.id,
        project: "alpha",
        content: "Persistent project fact",
        source: "manual-note",
      });
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
