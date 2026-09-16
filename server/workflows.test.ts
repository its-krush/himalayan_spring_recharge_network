import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function context(role: "DBA" | "WATER_MANAGER" | "HOSPITAL_MANAGER" | "DISASTER_MANAGER"): TrpcContext {
  return { user: { id: 12, openId: `workflow-${role}`, name: role, email: `${role}@example.com`, loginMethod: "test", role, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: { clearCookie: () => undefined } as TrpcContext["res"] };
}

describe("critical decision-support workflows", () => {
  it("A: disaster manager selects a region, views risk, and finds nearby hospitals", async () => {
    const caller = appRouter.createCaller(context("DISASTER_MANAGER"));
    const regions = await caller.regions.list();
    const risk = await caller.risk.overview({ regionId: regions[0].id });
    const hospitals = await caller.hospitals.nearby({ regionId: regions[0].id });
    expect(regions.length).toBeGreaterThanOrEqual(4);
    expect(risk.severity.score).toBeGreaterThanOrEqual(0);
    expect(risk.severity.score).toBeLessThanOrEqual(10);
    expect(hospitals[0]).toHaveProperty("distanceKm");
  });

  it("B: water manager selects deficiency scenario and calculates tankers", async () => {
    const caller = appRouter.createCaller(context("WATER_MANAGER"));
    const water = await caller.water.byRegion({ regionId: "ladakh" });
    const estimate = await caller.water.estimate({ regionId: "ladakh", tankerCapacityLitres: 12000, costPerTrip: 4200, maxTripsPerDay: 2, fuelSurcharge: 0.12 });
    expect(water.plan.category).toBe("SEVERE DEFICIENCY");
    expect(estimate.tankersRequired).toBeGreaterThan(0);
    expect(estimate.estimatedCost).toBeGreaterThan(0);
  });

  it("C: hospital manager can update simulated capacity and the response is explicit", async () => {
    const caller = appRouter.createCaller(context("HOSPITAL_MANAGER"));
    const result = await caller.hospitals.updateCapacity({ id: "h1", availableBeds: 70, icuBeds: 14, emergencyBeds: 20 });
    expect(result.availableBeds).toBe(70);
    expect(result.syntheticCapacity).toBe(true);
  });

  it("D: DBA changes weight configuration and the next risk read reflects it", async () => {
    const caller = appRouter.createCaller(context("DBA"));
    const current = await caller.admin.config();
    const next = await caller.admin.saveConfig({ ...current, version: "weighted-risk-test", weights: { ...current.weights, rainfall: 0.5 } });
    const risk = await caller.risk.overview({ regionId: "uttarakhand" });
    expect(next.version).toBe("weighted-risk-test");
    expect(risk.model.version).toBe("weighted-risk-test");
    expect(risk.severity.normalizedWeights.rainfall).toBeGreaterThan(0.4);
  });
});
