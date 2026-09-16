import {
  boolean,
  doublePrecision,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["user", "admin", "DBA", "DISASTER_MANAGER", "WATER_MANAGER", "HOSPITAL_MANAGER"]);
export const regionDataTypeEnum = pgEnum("region_data_type", ["public", "synthetic", "mixed"]);
export const sourceDataTypeEnum = pgEnum("source_data_type", ["public source", "synthetic"]);
export const hazardTypeEnum = pgEnum("hazard_type", ["flood", "flash_flood", "landslide", "water_deficiency"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: userRoleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
  lastSignedIn: timestamp("lastSignedIn", { withTimezone: true }).defaultNow().notNull(),
});

export const regions = pgTable("regions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  country: varchar("country", { length: 80 }).notNull(),
  state: varchar("state", { length: 120 }).notNull(),
  basin: varchar("basin", { length: 160 }).notNull(),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  population: integer("population").notNull(),
  dataType: regionDataTypeEnum("dataType").notNull().default("mixed"),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
});

export const dataSources = pgTable("data_sources", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 180 }).notNull(),
  organization: varchar("organization", { length: 180 }).notNull(),
  url: text("url").notNull(),
  coverage: text("coverage").notNull(),
  variables: text("variables").notNull(),
  frequency: varchar("frequency", { length: 160 }),
  lastRetrievedAt: timestamp("lastRetrievedAt", { withTimezone: true }),
  status: varchar("status", { length: 80 }).notNull(),
  dataType: sourceDataTypeEnum("dataType").notNull(),
});

export const modelConfigs = pgTable("model_configs", {
  id: serial("id").primaryKey(),
  version: varchar("version", { length: 80 }).notNull(),
  weights: jsonb("weights").notNull(),
  thresholds: jsonb("thresholds").notNull(),
  tankerConfig: jsonb("tankerConfig").notNull(),
  active: boolean("active").notNull().default(false),
  createdBy: integer("createdBy"),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
});

export const predictions = pgTable("predictions", {
  id: serial("id").primaryKey(),
  regionId: varchar("regionId", { length: 64 }).notNull(),
  hazardType: hazardTypeEnum("hazardType").notNull(),
  riskScore: doublePrecision("riskScore").notNull(),
  riskCategory: varchar("riskCategory", { length: 40 }).notNull(),
  contributions: jsonb("contributions").notNull(),
  modelVersion: varchar("modelVersion", { length: 80 }).notNull(),
  weightVersion: varchar("weightVersion", { length: 80 }).notNull(),
  inputDataTimestamp: varchar("inputDataTimestamp", { length: 120 }).notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
});

export const hospitals = pgTable("hospitals", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 180 }).notNull(),
  city: varchar("city", { length: 120 }).notNull(),
  state: varchar("state", { length: 120 }).notNull(),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  totalBeds: integer("totalBeds").notNull(),
  availableBeds: integer("availableBeds").notNull(),
  icuBeds: integer("icuBeds").notNull(),
  emergencyBeds: integer("emergencyBeds").notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  phone: varchar("phone", { length: 40 }),
  syntheticCapacity: boolean("syntheticCapacity").notNull().default(true),
});

export const waterResources = pgTable("water_resources", {
  id: varchar("id", { length: 64 }).primaryKey(),
  regionId: varchar("regionId", { length: 64 }).notNull(),
  availableMld: doublePrecision("availableMld").notNull(),
  demandMld: doublePrecision("demandMld").notNull(),
  groundwaterIndex: doublePrecision("groundwaterIndex").notNull(),
  rainfallMm: doublePrecision("rainfallMm").notNull(),
  dataType: regionDataTypeEnum("dataType").notNull().default("mixed"),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
});

export const disasterEvents = pgTable("disaster_events", {
  id: serial("id").primaryKey(),
  regionId: varchar("regionId", { length: 64 }).notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  hazardType: varchar("hazardType", { length: 80 }).notNull(),
  severity: doublePrecision("severity").notNull(),
  status: varchar("status", { length: 40 }).notNull(),
  synthetic: boolean("synthetic").notNull().default(true),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
});

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("userId"),
  action: varchar("action", { length: 120 }).notNull(),
  entity: varchar("entity", { length: 120 }).notNull(),
  entityId: varchar("entityId", { length: 120 }),
  previousValue: jsonb("previousValue"),
  newValue: jsonb("newValue"),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
