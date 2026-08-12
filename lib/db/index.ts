import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";

type Database = ReturnType<typeof drizzle<typeof schema>>;
const globalForDb = globalThis as unknown as { pool?: Pool; db?: Database };

export function getDb() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL n'est pas configurée.");
  if (!globalForDb.pool) globalForDb.pool = new Pool({ connectionString: process.env.DATABASE_URL });
  if (!globalForDb.db) globalForDb.db = drizzle(globalForDb.pool, { schema });
  return globalForDb.db;
}
