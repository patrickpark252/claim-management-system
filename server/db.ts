import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from "@shared/schema";
import { mkdirSync } from 'fs';
import path from 'path';

const databaseUrl = process.env.DATABASE_URL || 'file:./data/claim.db';
const dbPath = databaseUrl.replace('file:', '');

// Ensure data directory exists
const dataDir = path.dirname(dbPath);
try {
  mkdirSync(dataDir, { recursive: true });
} catch (error) {
  // Directory already exists - continue
}

export const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, { schema });