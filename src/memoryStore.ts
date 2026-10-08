import type { MemCoreDatabase } from "./db.js";

export interface CreateMemoryInput {
  project: string;
  content: string;
  source: string;
}

export interface MemoryRecord {
  id: number;
  project: string;
  content: string;
  source: string;
  createdAt: string;
  updatedAt: string;
}

export interface MemoryVersionRecord {
  id: number;
  memoryId: number;
  content: string;
  source: string;
  createdAt: string;
}

interface MemoryRow {
  id: number;
  project: string;
  content: string;
  source: string;
  created_at: string;
  updated_at: string;
}

interface MemoryVersionRow {
  id: number;
  memory_id: number;
  content: string;
  source: string;
  created_at: string;
}

export function createMemory(db: MemCoreDatabase, input: CreateMemoryInput): MemoryRecord {
  const result = db
    .prepare("INSERT INTO memories (project, content, source) VALUES (?, ?, ?)")
    .run(input.project, input.content, input.source);

  return getMemory(db, Number(result.lastInsertRowid));
}

export function listMemoriesByProject(db: MemCoreDatabase, project: string): MemoryRecord[] {
  const rows = db
    .prepare("SELECT id, project, content, source, created_at, updated_at FROM memories WHERE project = ? ORDER BY id")
    .all(project) as MemoryRow[];

  return rows.map(mapMemoryRow);
}

export function searchMemories(db: MemCoreDatabase, project: string, keyword: string): MemoryRecord[] {
  const rows = db
    .prepare(
      "SELECT id, project, content, source, created_at, updated_at FROM memories WHERE project = ? AND content LIKE ? ORDER BY id",
    )
    .all(project, `%${keyword}%`) as MemoryRow[];

  return rows.map(mapMemoryRow);
}

export function updateMemory(db: MemCoreDatabase, id: number, content: string): MemoryRecord {
  const current = getMemory(db, id);

  db.prepare("INSERT INTO memory_versions (memory_id, content, source) VALUES (?, ?, ?)").run(
    current.id,
    current.content,
    current.source,
  );

  db.prepare("UPDATE memories SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(content, id);

  return getMemory(db, id);
}

export function restoreMemoryVersion(db: MemCoreDatabase, memoryId: number, versionId: number): MemoryRecord {
  const version = getMemoryVersion(db, memoryId, versionId);

  return updateMemory(db, memoryId, version.content);
}

export function listMemoryVersions(db: MemCoreDatabase, memoryId: number): MemoryVersionRecord[] {
  const rows = db
    .prepare("SELECT id, memory_id, content, source, created_at FROM memory_versions WHERE memory_id = ? ORDER BY id")
    .all(memoryId) as MemoryVersionRow[];

  return rows.map(mapMemoryVersionRow);
}

function getMemoryVersion(db: MemCoreDatabase, memoryId: number, versionId: number): MemoryVersionRecord {
  const row = db
    .prepare("SELECT id, memory_id, content, source, created_at FROM memory_versions WHERE memory_id = ? AND id = ?")
    .get(memoryId, versionId) as MemoryVersionRow | undefined;

  if (!row) {
    throw new Error(`Memory version not found: ${versionId}`);
  }

  return mapMemoryVersionRow(row);
}

export function getMemory(db: MemCoreDatabase, id: number): MemoryRecord {
  const row = db
    .prepare("SELECT id, project, content, source, created_at, updated_at FROM memories WHERE id = ?")
    .get(id) as MemoryRow | undefined;

  if (!row) {
    throw new Error(`Memory not found: ${id}`);
  }

  return mapMemoryRow(row);
}

function mapMemoryRow(row: MemoryRow): MemoryRecord {
  return {
    id: row.id,
    project: row.project,
    content: row.content,
    source: row.source,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapMemoryVersionRow(row: MemoryVersionRow): MemoryVersionRecord {
  return {
    id: row.id,
    memoryId: row.memory_id,
    content: row.content,
    source: row.source,
    createdAt: row.created_at,
  };
}
