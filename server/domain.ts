export type RiskCategory = "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
export type WaterCategory = "ADEQUATE" | "WATCH" | "DEFICIENT" | "SEVERE DEFICIENCY";

export type FeatureKey =
  | "rainfall"
  | "river"
  | "soil"
  | "slope"
  | "glacier"
  | "historical";

export type RiskWeights = Record<FeatureKey, number>;

export const DEFAULT_WEIGHTS: RiskWeights = {
  rainfall: 0.28,
  river: 0.2,
  soil: 0.16,
  slope: 0.14,
  glacier: 0.1,
  historical: 0.12,
};

export const DEFAULT_THRESHOLDS = {
  low: 2,
  moderate: 4,
  high: 6,
  critical: 8,
  alert: 7,
};

export type Region = {
  id: string;
  name: string;
  state: string;
  basin: string;
  country: "India";
  lat: number;
  lon: number;
  population: number;
  risk: {
    rainfall: number;
    river: number;
    soil: number;
    slope: number;
    glacier: number;
    historical: number;
  };
  rainfall: { recent: number; anomaly: number; monthly: number[]; sourceStatus: "cached" | "live" };
  water: { availableMld: number; demandMld: number; groundwaterIndex: number; rainfallMm: number };
  soil: { type: string; texture: string; drainage: string; retention: string; recharge: string };
  glacierSignal: { name: string; elevationM: number; areaKm2: number; observationPeriod: string; trend: number[] };
};

export const REGIONS: Region[] = [
  {
    id: "uttarakhand",
    name: "Uttarakhand",
    state: "Uttarakhand",
    basin: "Ganga headwaters",
    country: "India",
    lat: 30.0668,
    lon: 79.0193,
    population: 11250858,
    risk: { rainfall: 8.2, river: 7.4, soil: 6.9, slope: 8.1, glacier: 5.8, historical: 7.1 },
    rainfall: { recent: 74, anomaly: 22, monthly: [18, 14, 23, 34, 52, 78, 164, 198, 116, 55, 24, 19], sourceStatus: "cached" },
    water: { availableMld: 1180, demandMld: 1420, groundwaterIndex: 42, rainfallMm: 846 },
    soil: { type: "Mountain soil reference", texture: "Sandy loam", drainage: "Rapid on slopes", retention: "Moderate", recharge: "High where fractured bedrock is exposed" },
    glacierSignal: { name: "Gangotri reference cluster", elevationM: 4320, areaKm2: 84.5, observationPeriod: "GLIMS/NSIDC catalog reference; no live measurement", trend: [92, 90, 89, 86, 84.5] },
  },
  {
    id: "himachal",
    name: "Himachal Pradesh",
    state: "Himachal Pradesh",
    basin: "Sutlej–Beas system",
    country: "India",
    lat: 31.1048,
    lon: 77.1734,
    population: 6864602,
    risk: { rainfall: 6.8, river: 6.4, soil: 7.2, slope: 8.6, glacier: 6.2, historical: 6.3 },
    rainfall: { recent: 58, anomaly: 13, monthly: [31, 27, 30, 42, 62, 87, 141, 155, 92, 48, 29, 24], sourceStatus: "cached" },
    water: { availableMld: 940, demandMld: 1010, groundwaterIndex: 55, rainfallMm: 768 },
    soil: { type: "Mountain soil reference", texture: "Loam", drainage: "Moderate to rapid", retention: "Moderate", recharge: "Moderate, terrain dependent" },
    glacierSignal: { name: "Bara Shigri reference", elevationM: 3950, areaKm2: 129.4, observationPeriod: "GLIMS/NSIDC catalog reference; no live measurement", trend: [134, 133, 131, 130, 129.4] },
  },
  {
    id: "ladakh",
    name: "Ladakh",
    state: "Ladakh",
    basin: "Upper Indus",
    country: "India",
    lat: 34.1526,
    lon: 77.5771,
    population: 274289,
    risk: { rainfall: 2.8, river: 4.8, soil: 3.7, slope: 6.8, glacier: 7.5, historical: 4.5 },
    rainfall: { recent: 9, anomaly: -18, monthly: [8, 7, 9, 12, 17, 21, 24, 23, 14, 10, 7, 6], sourceStatus: "cached" },
    water: { availableMld: 180, demandMld: 260, groundwaterIndex: 31, rainfallMm: 164 },
    soil: { type: "Cold desert soil reference", texture: "Sandy / gravelly", drainage: "Very rapid", retention: "Low", recharge: "Low outside irrigated alluvium" },
    glacierSignal: { name: "Upper Indus glacier cluster", elevationM: 5100, areaKm2: 54.2, observationPeriod: "GLIMS/NSIDC catalog reference; no live measurement", trend: [58, 57.2, 56.8, 55.1, 54.2] },
  },
  {
    id: "assam",
    name: "Assam",
    state: "Assam",
    basin: "Brahmaputra",
    country: "India",
    lat: 26.2006,
    lon: 92.9376,
    population: 31205576,
    risk: { rainfall: 8.8, river: 8.6, soil: 5.7, slope: 2.4, glacier: 1.2, historical: 8.2 },
    rainfall: { recent: 91, anomaly: 31, monthly: [16, 28, 44, 122, 220, 340, 289, 218, 146, 91, 34, 22], sourceStatus: "cached" },
    water: { availableMld: 2850, demandMld: 2760, groundwaterIndex: 64, rainfallMm: 1840 },
    soil: { type: "Alluvial soil reference", texture: "Silt loam", drainage: "Variable", retention: "High", recharge: "High in permeable floodplain zones" },
    glacierSignal: { name: "No glacier within selected region", elevationM: 0, areaKm2: 0, observationPeriod: "Not applicable", trend: [] },
  },
];

export const HOSPITALS = [
  { id: "h1", name: "District Hospital Uttarkashi", city: "Uttarkashi", state: "Uttarakhand", lat: 30.7268, lon: 78.4354, totalBeds: 220, availableBeds: 64, icuBeds: 12, emergencyBeds: 18, status: "Operational", phone: "+91 1374 222 114", syntheticCapacity: true },
  { id: "h2", name: "AIIMS Rishikesh", city: "Rishikesh", state: "Uttarakhand", lat: 30.085, lon: 78.2676, totalBeds: 960, availableBeds: 176, icuBeds: 52, emergencyBeds: 40, status: "Operational", phone: "+91 135 246 2900", syntheticCapacity: true },
  { id: "h3", name: "Indira Gandhi Medical College", city: "Shimla", state: "Himachal Pradesh", lat: 31.1047, lon: 77.1666, totalBeds: 700, availableBeds: 82, icuBeds: 24, emergencyBeds: 28, status: "Operational", phone: "+91 177 280 3351", syntheticCapacity: true },
  { id: "h4", name: "Silchar Medical College", city: "Silchar", state: "Assam", lat: 24.8333, lon: 92.7789, totalBeds: 500, availableBeds: 55, icuBeds: 16, emergencyBeds: 24, status: "Operational", phone: "+91 3842 229 110", syntheticCapacity: true },
];

export const DATA_SOURCES = [
  { id: "nasa-power", name: "NASA POWER", organization: "NASA Langley Research Center", url: "https://power.larc.nasa.gov/", coverage: "Global point-based climate and meteorology", variables: "Precipitation, temperature, solar and wind indicators", frequency: "Daily / hourly depending on product", lastRetrieved: "Not retrieved in demo mode", status: "Fallback available", dataType: "public source" },
  { id: "glims", name: "GLIMS Glacier Database", organization: "NSIDC / GLIMS consortium", url: "https://www.glims.org/", coverage: "Global glacier outlines and catalog metadata", variables: "Glacier outline, name, observation metadata", frequency: "Periodic scientific updates", lastRetrieved: "Catalog reference only", status: "Reference metadata", dataType: "public source" },
  { id: "hydrosheds", name: "HydroSHEDS", organization: "WWF / USGS / partner institutions", url: "https://www.hydrosheds.org/", coverage: "Global hydrology and river network layers", variables: "Drainage, river network, basin topology", frequency: "Static releases", lastRetrieved: "Static source configured", status: "Static layer", dataType: "public source" },
  { id: "osm", name: "OpenStreetMap", organization: "OpenStreetMap contributors", url: "https://www.openstreetmap.org/", coverage: "Community-mapped geographic features", variables: "Hospitals, roads, settlements and water features", frequency: "Continuous community updates", lastRetrieved: "Not queried in demo mode", status: "Fallback available", dataType: "public source" },
  { id: "demo", name: "Demo scenario indicators", organization: "Application seed data", url: "https://github.com/its-krush/himalayan_spring_recharge_network", coverage: "Four demonstration regions", variables: "Synthetic rainfall, river, soil, slope, glacier and demand indicators", frequency: "Static until scenario change", lastRetrieved: "Seeded at build time", status: "DEMONSTRATION DATA", dataType: "synthetic" },
];

export const FLOW_NODES = [
  { id: "g1", label: "Gangotri reference", type: "Glacier", region: "Uttarakhand", availability: "Reference source", risk: "Watch", x: 11, y: 13 },
  { id: "s1", label: "Bhagirathi headstream", type: "Stream", region: "Uttarakhand", availability: "Not measured in demo", risk: "Watch", x: 30, y: 29 },
  { id: "r1", label: "Bhagirathi", type: "River", region: "Uttarakhand", availability: "Not measured in demo", risk: "High", x: 50, y: 45 },
  { id: "res1", label: "Tehri system", type: "Reservoir", region: "Uttarakhand", availability: "Not measured in demo", risk: "Moderate", x: 68, y: 60 },
  { id: "d1", label: "Downstream demand", type: "Demand region", region: "Uttarakhand", availability: "1,180 MLD available", risk: "Deficient", x: 88, y: 78 },
];

export const SCENARIOS = [
  { id: "flash-flood", label: "Flash flood", description: "Heavy rainfall + high runoff + vulnerable terrain", regionId: "uttarakhand" },
  { id: "landslide", label: "Landslide", description: "Cumulative rainfall + steep terrain + susceptible soil", regionId: "himachal" },
  { id: "water-deficiency", label: "Water deficiency", description: "Low supply + high demand + groundwater stress", regionId: "ladakh" },
];

export function normalizeWeightMap(weights: RiskWeights): RiskWeights {
  const total = Object.values(weights).reduce((sum, value) => sum + Math.max(0, value), 0) || 1;
  return Object.fromEntries(Object.entries(weights).map(([key, value]) => [key, Math.max(0, value) / total])) as RiskWeights;
}

export function categoryForScore(score: number): RiskCategory {
  if (score >= 8) return "CRITICAL";
  if (score >= 6) return "HIGH";
  if (score >= 4) return "MODERATE";
  return "LOW";
}

export function waterCategory(deficitMld: number, demandMld: number): WaterCategory {
  const ratio = demandMld > 0 ? deficitMld / demandMld : 0;
  if (ratio <= 0) return "ADEQUATE";
  if (ratio <= 0.1) return "WATCH";
  if (ratio <= 0.3) return "DEFICIENT";
  return "SEVERE DEFICIENCY";
}

export function calculateRisk(features: Record<FeatureKey, number>, weights: RiskWeights = DEFAULT_WEIGHTS) {
  const normalized = normalizeWeightMap(weights);
  const contributions = Object.fromEntries(Object.entries(features).map(([key, value]) => [key, (Math.max(0, Math.min(10, value)) * (normalized[key as FeatureKey] ?? 0))])) as Record<FeatureKey, number>;
  const score = Object.values(contributions).reduce((sum, value) => sum + value, 0);
  return { score: Number(score.toFixed(2)), category: categoryForScore(score), normalizedWeights: normalized, contributions };
}

export function calculateSeverity(region: Region, weights: RiskWeights = DEFAULT_WEIGHTS) {
  const result = calculateRisk(region.risk, weights);
  return { ...result, thresholdCrossed: result.score >= DEFAULT_THRESHOLDS.alert ? "alert" : "none", modelVersion: "weighted-risk-v1", dataTimestamp: "Demo scenario seed" };
}

export function calculateWaterPlan(region: Region, tankerCapacityLitres = 12000, costPerTrip = 4200, maxTripsPerDay = 2, fuelSurcharge = 0.12) {
  const deficitMld = Math.max(0, region.water.demandMld - region.water.availableMld);
  const deficitLitres = deficitMld * 1_000_000;
  const tankersRequired = deficitLitres === 0 ? 0 : Math.ceil(deficitLitres / tankerCapacityLitres);
  const trips = Math.min(maxTripsPerDay, Math.max(1, Math.ceil(tankersRequired / 10)));
  const estimatedCost = Math.round(tankersRequired * costPerTrip * trips * (1 + fuelSurcharge));
  return { deficitMld, tankersRequired, tripsPerDay: trips, estimatedCost, category: waterCategory(deficitMld, region.water.demandMld), unit: "MLD", estimate: true };
}

export function distanceKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLon = (b.lon - a.lon) * rad;
  const lat1 = a.lat * rad;
  const lat2 = b.lat * rad;
  const x = Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return Number((6371 * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))).toFixed(1));
}

export function nearestHospitals(regionId: string) {
  const region = REGIONS.find((item) => item.id === regionId) ?? REGIONS[0];
  return HOSPITALS.map((hospital) => ({ ...hospital, distanceKm: distanceKm(region, hospital) })).sort((a, b) => a.distanceKm - b.distanceKm);
}
