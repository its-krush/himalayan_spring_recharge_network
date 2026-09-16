import { mkdir, writeFile } from "node:fs/promises";
import { ingestionManifest } from "../server/ingestion";

const output = {
  generatedAt: new Date().toISOString(),
  mode: process.env.ENABLE_LIVE_INGESTION === "true" ? "live-capable" : "demo-fallback",
  policy: "Public-source values are only persisted after successful retrieval; unavailable sources remain unavailable.",
  sources: ingestionManifest(),
};

await mkdir("data", { recursive: true });
await writeFile("data/ingestion-manifest.json", JSON.stringify(output, null, 2));
console.log(`Wrote ingestion manifest for ${output.sources.length} sources.`);
