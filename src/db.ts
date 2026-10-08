import Database from "better-sqlite3";

export type MemCoreDatabase = Database.Database;

export function openDatabase(path = ":memory:"): MemCoreDatabase {
  const db = new Database(path);
  db.pragma("foreign_keys = ON");
  return db;
}
