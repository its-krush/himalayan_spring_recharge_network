import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { getModelConfig, recordAudit, saveModelConfig } from "./db";
import { DATA_SOURCES, DEFAULT_THRESHOLDS, DEFAULT_WEIGHTS, FLOW_NODES, HOSPITALS, REGIONS, SCENARIOS, calculateRisk, calculateSeverity, calculateWaterPlan, nearestHospitals } from "./domain";
import { fetchNasaPower } from "./ingestion";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const roleProcedure = (roles: string[]) => protectedProcedure.use(({ ctx, next }) => {
  if (!ctx.user || (!roles.includes(ctx.user.role) && ctx.user.role !== "admin")) throw new TRPCError({ code: "FORBIDDEN", message: "Your role cannot perform this action." });
  return next();
});
const adminProcedure = roleProcedure(["DBA"]);

export const appRouter = router({
  system: router({ health: publicProcedure.query(() => ({ ok: true, mode: process.env.ENABLE_LIVE_INGESTION === "true" ? "live-capable" : "demo" })) }),
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => { const cookieOptions = getSessionCookieOptions(ctx.req); ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 }); return { success: true } as const; }),
  }),
  regions: router({
    list: publicProcedure.query(() => REGIONS.map(({ risk, ...region }) => region)),
    detail: publicProcedure.input(z.object({ id: z.string() })).query(({ input }) => REGIONS.find((region) => region.id === input.id) ?? REGIONS[0]),
  }),
  risk: router({
    overview: publicProcedure.input(z.object({ regionId: z.string() })).query(async ({ input }) => { const region = REGIONS.find((item) => item.id === input.regionId) ?? REGIONS[0]; const config = await getModelConfig(); return { region, severity: calculateSeverity(region, config.weights), flood: calculateRisk(region.risk, config.weights), landslide: calculateRisk({ ...region.risk, rainfall: Math.min(10, region.risk.rainfall + 0.5), slope: Math.min(10, region.risk.slope + 0.4) }, config.weights), model: config }; }),
    scenarios: publicProcedure.query(() => SCENARIOS),
  }),
  rainfall: router({ byRegion: publicProcedure.input(z.object({ regionId: z.string() })).query(({ input }) => { const region = REGIONS.find((item) => item.id === input.regionId) ?? REGIONS[0]; return { ...region.rainfall, note: "Demo indicators are synthetic unless a successful public-source retrieval is shown.", source: "NASA POWER adapter / static fallback" }; }) }),
  glaciers: router({ byRegion: publicProcedure.input(z.object({ regionId: z.string() })).query(({ input }) => { const region = REGIONS.find((item) => item.id === input.regionId) ?? REGIONS[0]; return region.glacierSignal; }) }),
  soil: router({ byRegion: publicProcedure.input(z.object({ regionId: z.string() })).query(({ input }) => { const region = REGIONS.find((item) => item.id === input.regionId) ?? REGIONS[0]; return { ...region.soil, note: "Reference classification; verify with local survey data before operational use." }; }) }),
  water: router({
    byRegion: publicProcedure.input(z.object({ regionId: z.string() })).query(({ input }) => { const region = REGIONS.find((item) => item.id === input.regionId) ?? REGIONS[0]; return { regionId: region.id, region: region.name, ...region.water, plan: calculateWaterPlan(region), dataType: "mixed / demo scenario" }; }),
    all: publicProcedure.query(() => REGIONS.map((region) => ({ regionId: region.id, region: region.name, state: region.state, ...region.water, plan: calculateWaterPlan(region) }))),
    estimate: roleProcedure(["WATER_MANAGER"]).input(z.object({ regionId: z.string(), tankerCapacityLitres: z.number().positive().max(100000), costPerTrip: z.number().nonnegative(), maxTripsPerDay: z.number().int().positive().max(20), fuelSurcharge: z.number().min(0).max(2) })).mutation(({ input }) => { const region = REGIONS.find((item) => item.id === input.regionId) ?? REGIONS[0]; return calculateWaterPlan(region, input.tankerCapacityLitres, input.costPerTrip, input.maxTripsPerDay, input.fuelSurcharge); }),
  }),
  hospitals: router({
    list: publicProcedure.query(() => HOSPITALS),
    nearby: publicProcedure.input(z.object({ regionId: z.string() })).query(({ input }) => nearestHospitals(input.regionId)),
    updateCapacity: roleProcedure(["HOSPITAL_MANAGER"]).input(z.object({ id: z.string(), availableBeds: z.number().int().min(0), icuBeds: z.number().int().min(0), emergencyBeds: z.number().int().min(0) })).mutation(async ({ input, ctx }) => { const hospital = HOSPITALS.find((item) => item.id === input.id); if (!hospital) throw new TRPCError({ code: "NOT_FOUND", message: "Hospital not found" }); const previous = { availableBeds: hospital.availableBeds, icuBeds: hospital.icuBeds, emergencyBeds: hospital.emergencyBeds }; Object.assign(hospital, input); await recordAudit({ userId: ctx.user.id, action: "UPDATE_CAPACITY", entity: "hospital", entityId: input.id, previousValue: previous, newValue: input }); return hospital; }),
  }),
  network: router({ flow: publicProcedure.query(() => ({ nodes: FLOW_NODES, edges: FLOW_NODES.slice(0, -1).map((node, index) => ({ source: node.id, target: FLOW_NODES[index + 1].id })) })) }),
  alerts: router({ list: publicProcedure.input(z.object({ regionId: z.string().optional() }).optional()).query(async ({ input }) => { const regionIds = input?.regionId ? [input.regionId] : REGIONS.map((region) => region.id); const config = await getModelConfig(); return REGIONS.filter((region) => regionIds.includes(region.id)).map((region) => ({ regionId: region.id, region: region.name, severity: calculateSeverity(region, config.weights), title: region.id === "ladakh" ? "Water deficiency indicator" : "Elevated hazard indicator", primaryFactors: Object.entries(region.risk).sort(([, a], [, b]) => b - a).slice(0, 3).map(([key]) => key), officialWarning: false, synthetic: true })); }) }),
  sources: router({ list: publicProcedure.query(() => DATA_SOURCES), manifest: publicProcedure.query(() => ({ mode: process.env.ENABLE_LIVE_INGESTION === "true" ? "live-capable" : "demo", sources: DATA_SOURCES })), refreshNasa: protectedProcedure.input(z.object({ regionId: z.string() })).mutation(({ input }) => fetchNasaPower(input.regionId)) }),
  admin: router({
    config: publicProcedure.query(() => getModelConfig()),
    saveConfig: adminProcedure.input(z.object({ version: z.string().min(1).max(80), weights: z.object({ rainfall: z.number().min(0), river: z.number().min(0), soil: z.number().min(0), slope: z.number().min(0), glacier: z.number().min(0), historical: z.number().min(0) }), thresholds: z.object({ low: z.number(), moderate: z.number(), high: z.number(), critical: z.number(), alert: z.number() }), tankerConfig: z.object({ tankerCapacityLitres: z.number().positive(), costPerTrip: z.number().nonnegative(), maxTripsPerDay: z.number().int().positive(), fuelSurcharge: z.number().min(0).max(2) }) })).mutation(async ({ input, ctx }) => { const saved = await saveModelConfig(input, ctx.user.id); await recordAudit({ userId: ctx.user.id, action: "UPDATE_MODEL_CONFIG", entity: "model_config", newValue: input }); return saved; }),
    audit: adminProcedure.query(() => ({ note: "Audit log is database-backed when DATABASE_URL is configured; demo mode keeps no audit history between restarts." })),
  }),
  demo: router({ current: publicProcedure.query(() => ({ enabled: true, warning: "DEMONSTRATION DATA: scenario indicators and hospital capacities are synthetic and are not official warnings or live operational data.", scenarios: SCENARIOS, defaultWeights: DEFAULT_WEIGHTS, defaultThresholds: DEFAULT_THRESHOLDS })) }),
});

export type AppRouter = typeof appRouter;
