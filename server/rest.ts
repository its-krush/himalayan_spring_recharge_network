import type { Express } from "express";
import { DATA_SOURCES, FLOW_NODES, REGIONS, calculateRisk, calculateWaterPlan, nearestHospitals } from "./domain";
import { getModelConfig } from "./db";

export function registerRestApi(app: Express) {
  app.get("/api/regions", (_req, res) => res.json(REGIONS.map(({ risk, ...region }) => region)));
  app.get("/api/regions/:id", (req, res) => res.json(REGIONS.find((region) => region.id === req.params.id) ?? REGIONS[0]));
  app.get("/api/rainfall/:region", (req, res) => { const region = REGIONS.find((item) => item.id === req.params.region) ?? REGIONS[0]; res.json({ ...region.rainfall, dataType: "synthetic demo fallback" }); });
  app.get("/api/glaciers/:region", (req, res) => { const region = REGIONS.find((item) => item.id === req.params.region) ?? REGIONS[0]; res.json(region.glacierSignal); });
  app.get("/api/soil/:region", (req, res) => { const region = REGIONS.find((item) => item.id === req.params.region) ?? REGIONS[0]; res.json(region.soil); });
  app.get("/api/water/:region", (req, res) => { const region = REGIONS.find((item) => item.id === req.params.region) ?? REGIONS[0]; res.json({ ...region.water, plan: calculateWaterPlan(region), dataType: "synthetic demo fallback" }); });
  app.get("/api/flood-risk/:region", async (req, res) => { const region = REGIONS.find((item) => item.id === req.params.region) ?? REGIONS[0]; const config = await getModelConfig(); res.json({ hazardType: "flood", ...calculateRisk(region.risk, config.weights), modelVersion: config.version, officialWarning: false }); });
  app.get("/api/landslide-risk/:region", async (req, res) => { const region = REGIONS.find((item) => item.id === req.params.region) ?? REGIONS[0]; const config = await getModelConfig(); res.json({ hazardType: "landslide", ...calculateRisk({ ...region.risk, rainfall: Math.min(10, region.risk.rainfall + .5), slope: Math.min(10, region.risk.slope + .4) }, config.weights), modelVersion: config.version, officialWarning: false }); });
  app.get("/api/hospitals/nearby", (req, res) => res.json(nearestHospitals(typeof req.query.regionId === "string" ? req.query.regionId : "uttarakhand")));
  app.get("/api/alerts", async (_req, res) => { const config = await getModelConfig(); res.json(REGIONS.map((region) => ({ regionId: region.id, region: region.name, severity: calculateRisk(region.risk, config.weights), officialWarning: false }))); });
  app.get("/api/water-deficiency", (_req, res) => res.json(REGIONS.map((region) => ({ regionId: region.id, region: region.name, plan: calculateWaterPlan(region) }))));
  app.get("/api/water-network/:region", (_req, res) => res.json({ nodes: FLOW_NODES, edges: FLOW_NODES.slice(0, -1).map((node, index) => ({ source: node.id, target: FLOW_NODES[index + 1].id })) }));
  app.get("/api/data-sources", (_req, res) => res.json(DATA_SOURCES));
  app.get("/api/openapi.json", (_req, res) => res.json(openApiDocument));
}

const openApiDocument = {
  openapi: "3.0.3",
  info: { title: "Himalayan Spring Recharge Network API", version: "0.1.0", description: "Read-only environmental decision-support APIs. Environmental values are synthetic demo fallbacks unless a successful public-source retrieval is explicitly recorded. Predictions are not official warnings." },
  servers: [{ url: "/" }],
  paths: Object.fromEntries(["regions", "regions/{id}", "rainfall/{region}", "glaciers/{region}", "soil/{region}", "water/{region}", "flood-risk/{region}", "landslide-risk/{region}", "hospitals/nearby", "alerts", "water-deficiency", "water-network/{region}", "data-sources"].map((path) => [`/api/${path}`, { get: { summary: `Retrieve ${path.replaceAll("{", "").replaceAll("}", "")}`, responses: { "200": { description: "Successful response" } } } }])),
};
