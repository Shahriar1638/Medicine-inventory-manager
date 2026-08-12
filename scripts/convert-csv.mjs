import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { parse } from "csv-parse/sync";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const archiveDir = path.join(rootDir, "archive");
const outFile = path.join(rootDir, "public", "medicines.json");

function readCsv(file) {
  const text = readFileSync(path.join(archiveDir, file), "utf8");
  return parse(text, { columns: true, skip_empty_lines: true });
}

function stripHtml(html) {
  if (!html || !String(html).trim()) return null;
  return (
    String(html)
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/?(li|ul|ol|p|div|span|strong|b|i|em|h[1-6])[^>]*>/gi, "")
      .replace(/<[^>]+>/g, "")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, " ")
      .replace(/[ \t]+/g, " ")
      .replace(/\n\s*\n+/g, "\n")
      .trim() || null
  );
}

function parsePrice(raw) {
  const match = String(raw).match(/([\d,]+(?:\.\d+)?)/);
  if (!match) return null;
  const value = Number(match[1].replace(/,/g, ""));
  return Number.isFinite(value) ? value : null;
}

function parsePackages(raw) {
  if (!raw || !String(raw).trim()) return [];
  const segments = String(raw)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const packages = [];
  const seen = new Set();
  for (let segment of segments) {
    segment = segment.replace(/^\(|\)$/g, "").trim();
    const colonIndex = segment.lastIndexOf(":");
    const label = colonIndex === -1 ? segment : segment.slice(0, colonIndex).trim();
    const price = colonIndex === -1 ? null : parsePrice(segment.slice(colonIndex + 1));
    const packMatch = label.match(/^(\d+)['’]s pack$/i);
    const pack = {
      label: label || null,
      packSize: packMatch ? Number(packMatch[1]) : null,
      price,
    };

    const key = `${pack.label}|${pack.packSize}|${pack.price}`;
    if (!seen.has(key)) {
      seen.add(key);
      packages.push(pack);
    }
  }
  return packages;
}

const medicines = readCsv("medicine.csv");
const generics = readCsv("generic.csv");

const genericMap = new Map();
for (const generic of generics) {
  genericMap.set(generic["generic name"], {
    drugClass: generic["drug class"]?.trim() || null,
    indication: generic["indication"]?.trim() || null,
    storageConditions: stripHtml(generic["storage conditions description"]),
  });
}

const limitArg = Number(
  process.env.MEDICINES_LIMIT ??
    process.argv[process.argv.indexOf("--limit") + 1]
);
const limit = Number.isInteger(limitArg) && limitArg > 0 ? limitArg : null;

let result = medicines.map((row) => {
  const generic = genericMap.get(row["generic"]?.trim()) || null;
  return {
    id: Number(row["brand id"]),
    name: row["brand name"]?.trim() || null,
    type: row["type"]?.trim() || null,
    generic: row["generic"]?.trim() || null,
    strength: row["strength"]?.trim() || null,
    dosageForm: row["dosage form"]?.trim() || null,
    manufacturer: row["manufacturer"]?.trim() || null,
    drugClass: generic?.drugClass ?? null,
    indication: generic?.indication ?? null,
    storageConditions: generic?.storageConditions ?? null,
    packages: parsePackages(row["package container"]),
  };
});

if (limit) {
  // Prefer items that are actually sellable (have a price), then sample
  // evenly across the whole catalog so the demo shows variety.
  let sellable = result.filter((m) => m.packages.some((p) => p.price !== null));
  if (sellable.length > limit) {
    const step = Math.ceil(sellable.length / limit);
    result = sellable.filter((_, i) => i % step === 0).slice(0, limit);
  } else {
    result = sellable.slice(0, limit);
  }
  console.log(`Limiting output to ${result.length} medicines`);
}

mkdirSync(path.dirname(outFile), { recursive: true });
writeFileSync(outFile, JSON.stringify(result), "utf8");

const total = result.length;
const withPackage = result.filter((m) => m.packages.length > 0).length;
const missingGeneric = result.filter((m) => m.generic === null).length;
const missingStrength = result.filter((m) => m.strength === null).length;
const missingDrugClass = result.filter((m) => m.drugClass === null).length;
const missingIndication = result.filter((m) => m.indication === null).length;
const missingStorage = result.filter((m) => m.storageConditions === null).length;

console.log(`Wrote ${total} medicines -> ${outFile}`);
console.log(`With parsed packages: ${withPackage}`);
console.log(
  `Missing: generic=${missingGeneric}, strength=${missingStrength}, drugClass=${missingDrugClass}, indication=${missingIndication}, storageConditions=${missingStorage}`
);

const rawMap = new Map(medicines.map((row) => [Number(row["brand id"]), row]));
const allRawPkgEmpty = result.filter((m) => {
  const raw = rawMap.get(m.id)?.["package container"];
  return raw && String(raw).trim() && m.packages.length === 0;
}).length;
console.log(`Rows w/ non-empty raw package text but 0 parsed: ${allRawPkgEmpty}`);