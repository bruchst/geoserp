/**
 * Build the client-side location datasets from the official Google Ads
 * geotargets CSV.
 *
 *   node scripts/build-locations.mjs ../data/geotargets.csv
 *
 * Emits two plain-text files into public/ (one `canonicalName|COUNTRY` per
 * line). Plain text rather than JSON: no quoting overhead, ~3x smaller than
 * an array-of-objects, and parsing is a single split.
 *
 *   public/locations-eu.txt     every city in the 27 EU member states
 *   public/locations-world.txt  every other city
 *
 * Source of truth for the CSV: https://developers.google.com/google-ads/api/data/geotargets
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const APP_ROOT = resolve(HERE, "..");

const EU = new Set([
  "AT", "BE", "BG", "CY", "CZ", "DE", "DK", "EE", "ES", "FI", "FR", "GR",
  "HR", "HU", "IE", "IT", "LT", "LU", "LV", "MT", "NL", "PL", "PT", "RO",
  "SE", "SI", "SK",
]);

const KEEP_TYPES = new Set(["City", "Municipality"]);

/** Minimal RFC4180-ish CSV row parser (the geotargets file quotes most fields). */
function parseRow(line) {
  const out = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      out.push(field);
      field = "";
    } else {
      field += ch;
    }
  }
  out.push(field);
  return out;
}

const csvPath = resolve(process.cwd(), process.argv[2] ?? "../data/geotargets.csv");
const raw = readFileSync(csvPath, "utf8");
const lines = raw.split(/\r?\n/);
const header = parseRow(lines[0]);

const idx = {
  canonical: header.indexOf("Canonical Name"),
  country: header.indexOf("Country Code"),
  type: header.indexOf("Target Type"),
  status: header.indexOf("Status"),
};
for (const [key, value] of Object.entries(idx)) {
  if (value < 0) throw new Error(`CSV is missing the column for "${key}"`);
}

const seen = new Set();
const euRows = [];
const worldRows = [];
let skippedInactive = 0;
let skippedType = 0;
let skippedDuplicate = 0;
let skippedPipe = 0;

for (let i = 1; i < lines.length; i += 1) {
  const line = lines[i];
  if (!line) continue;
  const row = parseRow(line);
  const canonical = row[idx.canonical];
  const country = row[idx.country];
  if (!canonical || !country) continue;
  if (row[idx.status] !== "Active") {
    skippedInactive += 1;
    continue;
  }
  if (!KEEP_TYPES.has(row[idx.type])) {
    skippedType += 1;
    continue;
  }
  if (canonical.includes("|") || canonical.includes("\n")) {
    // Would corrupt the line-based format; none exist today, but fail loud
    // rather than silently emit a broken row.
    skippedPipe += 1;
    continue;
  }
  if (seen.has(canonical)) {
    skippedDuplicate += 1;
    continue;
  }
  seen.add(canonical);
  (EU.has(country) ? euRows : worldRows).push(`${canonical}|${country}`);
}

// Shortest canonical names first: they are the well-known places ("Rome,Lazio,Italy"
// before "Rome,Rome,Lazio,Italy"), so prefix matches surface the obvious answer.
const byLength = (a, b) => a.length - b.length || a.localeCompare(b);
euRows.sort(byLength);
worldRows.sort(byLength);

const publicDir = resolve(APP_ROOT, "public");
mkdirSync(publicDir, { recursive: true });
writeFileSync(resolve(publicDir, "locations-eu.txt"), euRows.join("\n"), "utf8");
writeFileSync(resolve(publicDir, "locations-world.txt"), worldRows.join("\n"), "utf8");

const stats = {
  euRows: euRows.length,
  worldRows: worldRows.length,
  total: euRows.length + worldRows.length,
  euCountries: new Set(euRows.map((r) => r.split("|")[1])).size,
  skippedInactive,
  skippedType,
  skippedDuplicate,
  skippedPipe,
};
writeFileSync(
  resolve(APP_ROOT, "src/lib/locations-stats.json"),
  `${JSON.stringify({ ...stats, source: csvPath.split("/").pop() }, null, 2)}\n`,
  "utf8",
);

console.log(JSON.stringify(stats, null, 2));
if (stats.euCountries !== 27) {
  console.error(`EU coverage check FAILED: ${stats.euCountries}/27 member states have cities`);
  process.exit(1);
}
console.log("EU coverage check passed: 27/27 member states present");
