import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { calculateRisk, calculateWaterPlan, distanceKm, REGIONS, nearestHospitals } from "./domain";
import type { TrpcContext } from "./_core/context";

function context(role: "DBA" | "WATER_MANAGER" | "HOSPITAL_MANAGER" | "DISASTER_MANAGER" = "DISASTER_MANAGER"): TrpcContext {
  return {
    user: { id: 7, openId: "test", name: "Test", email: "test@example.com", loginMethod: "test", role, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("weighted risk engine", () => {
  it("normalizes weights and preserves a 0-10 score range", () => {
    const result = calculateRisk({ rainfall: 10, river: 10, soil: 10, slope: 10, glacier: 10, historical: 10 }, { rainfall: 2, river: 1, soil: 1, slope: 1, glacier: 1, historical: 1 });
    expect(result.score).toBe(10);
    expect(result.category).toBe("CRITICAL");
    expect(Object.values(result.normalizedWeights).reduce((a, b) => a + b, 0)).toBeCloseTo(1);
  });

  it("exposes feature contributions for explainability", () => {
    const result = calculateRisk(REGIONS[0].risk);
    expect(result.contributions.rainfall).toBeGreaterThan(result.contributions.glacier);
    expect(result.contributions).toHaveProperty("historical");
  });
});

describe("water planning engine", () => {
  it("calculates deficit, tankers, and estimated cost deterministically", () => {
    const result = calculateWaterPlan(REGIONS[0], 12000, 4200, 2, 0.12);
    expect(result.deficitMld).toBe(240);
    expect(result.tankersRequired).toBe(20000);
    expect(result.estimatedCost).toBe(188160000);
    expect(result.estimate).toBe(true);
  });

  it("returns zero tankers for adequate supply", () => {
    const result = calculateWaterPlan(REGIONS[3]);
    expect(result.deficitMld).toBe(0);
    expect(result.tankersRequired).toBe(0);
    expect(result.category).toBe("ADEQUATE");
  });
});

describe("geographic recommendations", () => {
  it("returns a non-zero distance and sorts nearby hospitals", () => {
    const result = nearestHospitals("uttarakhand");
    expect(result.length).toBeGreaterThan(1);
    expect(result[0].distanceKm).toBeLessThanOrEqual(result[1].distanceKm);
    expect(distanceKm(REGIONS[0], result[0])).toBe(result[0].distanceKm);
  });
});

describe("authorization", () => {
  it("blocks tanker estimates for a disaster manager", async () => {
    const caller = appRouter.createCaller(context("DISASTER_MANAGER"));
    await expect(caller.water.estimate({ regionId: "ladakh", tankerCapacityLitres: 12000, costPerTrip: 4200, maxTripsPerDay: 2, fuelSurcharge: 0.12 })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("allows DBA model configuration changes", async () => {
    const caller = appRouter.createCaller(context("DBA"));
    const config = await caller.admin.config();
    const saved = await caller.admin.saveConfig(config);
    expect(saved.version).toBe(config.version);
  });

  it("rejects invalid tanker input at the API boundary", async () => {
    const caller = appRouter.createCaller(context("WATER_MANAGER"));
    await expect(caller.water.estimate({ regionId: "ladakh", tankerCapacityLitres: 0, costPerTrip: 4200, maxTripsPerDay: 2, fuelSurcharge: 0.12 })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
