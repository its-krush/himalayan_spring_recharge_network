import { boolean, double, int, json, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "DBA", "DISASTER_MANAGER", "WATER_MANAGER", "HOSPITAL_MANAGER"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const regions = mysqlTable("regions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  country: varchar("country", { length: 80 }).notNull(),
  state: varchar("state", { length: 120 }).notNull(),
  basin: varchar("basin", { length: 160 }).notNull(),
  latitude: double("latitude").notNull(),
  longitude: double("longitude").notNull(),
  population: int("population").notNull(),
  dataType: mysqlEnum("dataType", ["public", "synthetic", "mixed"]).notNull().default("mixed"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const dataSources = mysqlTable("data_sources", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 180 }).notNull(),
  organization: varchar("organization", { length: 180 }).notNull(),
  url: text("url").notNull(),
  coverage: text("coverage").notNull(),
  variables: text("variables").notNull(),
  frequency: varchar("frequency", { length: 160 }),
  lastRetrievedAt: timestamp("lastRetrievedAt"),
  status: varchar("status", { length: 80 }).notNull(),
  dataType: mysqlEnum("dataType", ["public source", "synthetic"]).notNull(),
});

export const modelConfigs = mysqlTable("model_configs", {
  id: int("id").autoincrement().primaryKey(),
  version: varchar("version", { length: 80 }).notNull(),
  weights: json("weights").notNull(),
  thresholds: json("thresholds").notNull(),
  tankerConfig: json("tankerConfig").notNull(),
  active: boolean("active").notNull().default(false),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const predictions = mysqlTable("predictions", {
  id: int("id").autoincrement().primaryKey(),
  regionId: varchar("regionId", { length: 64 }).notNull(),
  hazardType: mysqlEnum("hazardType", ["flood", "flash_flood", "landslide", "water_deficiency"]).notNull(),
  riskScore: double("riskScore").notNull(),
  riskCategory: varchar("riskCategory", { length: 40 }).notNull(),
  contributions: json("contributions").notNull(),
  modelVersion: varchar("modelVersion", { length: 80 }).notNull(),
  weightVersion: varchar("weightVersion", { length: 80 }).notNull(),
  inputDataTimestamp: varchar("inputDataTimestamp", { length: 120 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const hospitals = mysqlTable("hospitals", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 180 }).notNull(),
  city: varchar("city", { length: 120 }).notNull(),
  state: varchar("state", { length: 120 }).notNull(),
  latitude: double("latitude").notNull(),
  longitude: double("longitude").notNull(),
  totalBeds: int("totalBeds").notNull(),
  availableBeds: int("availableBeds").notNull(),
  icuBeds: int("icuBeds").notNull(),
  emergencyBeds: int("emergencyBeds").notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  phone: varchar("phone", { length: 40 }),
  syntheticCapacity: boolean("syntheticCapacity").notNull().default(true),
});

export const waterResources = mysqlTable("water_resources", {
  id: varchar("id", { length: 64 }).primaryKey(),
  regionId: varchar("regionId", { length: 64 }).notNull(),
  availableMld: double("availableMld").notNull(),
  demandMld: double("demandMld").notNull(),
  groundwaterIndex: double("groundwaterIndex").notNull(),
  rainfallMm: double("rainfallMm").notNull(),
  dataType: mysqlEnum("dataType", ["public", "synthetic", "mixed"]).notNull().default("mixed"),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const disasterEvents = mysqlTable("disaster_events", {
  id: int("id").autoincrement().primaryKey(),
  regionId: varchar("regionId", { length: 64 }).notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  hazardType: varchar("hazardType", { length: 80 }).notNull(),
  severity: double("severity").notNull(),
  status: varchar("status", { length: 40 }).notNull(),
  synthetic: boolean("synthetic").notNull().default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const auditLogs = mysqlTable("audit_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  action: varchar("action", { length: 120 }).notNull(),
  entity: varchar("entity", { length: 120 }).notNull(),
  entityId: varchar("entityId", { length: 120 }),
  previousValue: json("previousValue"),
  newValue: json("newValue"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
