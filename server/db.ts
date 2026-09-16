import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { InsertUser, User, auditLogs, modelConfigs, users } from "../drizzle/schema";
import { ENV } from "./_core/env";
import { DEFAULT_THRESHOLDS, DEFAULT_WEIGHTS } from "./domain";

let _db: ReturnType<typeof drizzle> | null = null;
let memoryConfig = { version: "weighted-risk-v1", weights: DEFAULT_WEIGHTS, thresholds: DEFAULT_THRESHOLDS, tankerConfig: { tankerCapacityLitres: 12000, costPerTrip: 4200, maxTripsPerDay: 2, fuelSurcharge: 0.12 } };

export async function getDb() {
  if (!_db && ENV.databaseUrl) {
    try {
      const pool = new Pool({
        connectionString: ENV.databaseUrl,
        max: 5,
        ssl: ENV.isProduction ? { rejectUnauthorized: false } : undefined,
      });
      _db = drizzle(pool);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId, name: user.name ?? null, email: user.email ?? null, loginMethod: user.loginMethod ?? null, lastSignedIn: user.lastSignedIn ?? new Date() };
  const updateSet: Record<string, unknown> = { name: values.name, email: values.email, loginMethod: values.loginMethod, lastSignedIn: values.lastSignedIn, updatedAt: new Date() };
  if (user.role) { values.role = user.role; updateSet.role = user.role; }
  else if (user.openId === ENV.ownerOpenId) { values.role = "DBA"; updateSet.role = "DBA"; }
  await db.insert(users).values(values).onConflictDoUpdate({ target: users.openId, set: updateSet });
}

export async function getUserByOpenId(openId: string): Promise<User | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getModelConfig() {
  const db = await getDb();
  if (!db) return memoryConfig;
  const rows = await db.select().from(modelConfigs).where(eq(modelConfigs.active, true)).orderBy(desc(modelConfigs.createdAt)).limit(1);
  if (!rows[0]) return memoryConfig;
  return { version: rows[0].version, weights: rows[0].weights as typeof DEFAULT_WEIGHTS, thresholds: rows[0].thresholds as typeof DEFAULT_THRESHOLDS, tankerConfig: rows[0].tankerConfig as typeof memoryConfig.tankerConfig };
}

export async function saveModelConfig(config: typeof memoryConfig, userId?: number) {
  memoryConfig = config;
  const db = await getDb();
  if (!db) return config;
  await db.update(modelConfigs).set({ active: false }).where(eq(modelConfigs.active, true));
  await db.insert(modelConfigs).values({ version: config.version, weights: config.weights, thresholds: config.thresholds, tankerConfig: config.tankerConfig, active: true, createdBy: userId ?? null });
  return config;
}

export async function recordAudit(input: { userId?: number; action: string; entity: string; entityId?: string; previousValue?: unknown; newValue?: unknown }) {
  const db = await getDb();
  if (!db) return;
  await db.insert(auditLogs).values({ userId: input.userId ?? null, action: input.action, entity: input.entity, entityId: input.entityId ?? null, previousValue: input.previousValue, newValue: input.newValue });
}
