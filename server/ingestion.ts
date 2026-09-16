import { DATA_SOURCES, REGIONS } from "./domain";

export type IngestionResult = {
  sourceId: string;
  status: "live" | "cached" | "unavailable";
  retrievedAt: string;
  data: unknown;
  message: string;
};

/**
 * Optional NASA POWER adapter. Demo mode never treats the seeded indicators as live observations.
 * Enable with ENABLE_LIVE_INGESTION=true; failures return cached metadata instead of fabricated values.
 */
export async function fetchNasaPower(regionId: string, signal?: AbortSignal): Promise<IngestionResult> {
  const region = REGIONS.find((item) => item.id === regionId) ?? REGIONS[0];
  const source = DATA_SOURCES.find((item) => item.id === "nasa-power")!;
  const end = new Date();
  const start = new Date(end.getTime() - 30 * 86400000);
  const fmt = (date: Date) => date.toISOString().slice(0, 10).replaceAll("-", "");
  const url = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=PRECTOTCORR,T2M&community=AG&longitude=${region.lon}&latitude=${region.lat}&start=${fmt(start)}&end=${fmt(end)}&format=JSON`;
  if (process.env.ENABLE_LIVE_INGESTION !== "true") {
    return { sourceId: source.id, status: "cached", retrievedAt: new Date().toISOString(), data: null, message: "Live ingestion disabled; demo mode is using the static fallback." };
  }
  try {
    const response = await fetch(url, { signal });
    if (!response.ok) throw new Error(`NASA POWER returned HTTP ${response.status}`);
    const data = await response.json();
    return { sourceId: source.id, status: "live", retrievedAt: new Date().toISOString(), data, message: "NASA POWER response retrieved successfully." };
  } catch (error) {
    return { sourceId: source.id, status: "unavailable", retrievedAt: new Date().toISOString(), data: null, message: `Live source unavailable; no synthetic substitution was made. ${String(error)}` };
  }
}

export function ingestionManifest() {
  return DATA_SOURCES.map((source) => ({ ...source, fallbackPolicy: source.dataType === "synthetic" ? "Explicit demo scenario" : "Use last successful cache; never fabricate" }));
}
