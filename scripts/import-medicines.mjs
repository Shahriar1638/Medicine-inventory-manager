import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv(file) {
  try {
    const text = readFileSync(file, "utf8");
    for (const line of text.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.+)\s*$/);
      if (match) process.env[match[1]] = match[2].trim();
    }
  } catch {
    // file missing — rely on real environment
  }
}

loadEnv(path.join(rootDir, ".env.local"));
loadEnv(path.join(rootDir, ".env"));

const uri = process.env.MONGODB_URI;
if (!uri || uri.includes("your-mongodb")) {
  console.error(
    "MONGODB_URI is not set. Add it to .env.local (see .env.example), or run:\n  npm run convert:data  ->  npm run import:medicines"
  );
  process.exit(1);
}

const file = path.join(rootDir, "public", "medicines.json");
const medicines = JSON.parse(readFileSync(file, "utf8"));
if (!Array.isArray(medicines) || medicines.length === 0) {
  console.error(`No medicines found in ${file} — run "npm run convert:data" first.`);
  process.exit(1);
}

// Same seeding as src/lib/stock.ts — keep in sync so the Mongo catalog and the
// client-side stock model agree.
function seedStock(medicineId, packageIndex) {
  const n = Math.abs(Math.sin(medicineId * 7 + packageIndex * 13) * 100000);
  return 12 + Math.floor(n % 240);
}

const seeded = medicines.map((medicine) => ({
  ...medicine,
  packages: (medicine.packages ?? []).map((pkg, i) => ({
    ...pkg,
    stock: seedStock(medicine.id, i),
  })),
}));

console.log(`Connecting to ${uri.replace(/\/\/[^@]+@/, "//***@")} ...`);

try {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  const db = mongoose.connection.db;

  // Fresh import: replace whatever is in the collection.
  await db.collection("medicines").drop().catch(() => {});

  const CHUNK = 500;
  let inserted = 0;
  for (let i = 0; i < seeded.length; i += CHUNK) {
    const chunk = seeded.slice(i, i + CHUNK);
    await db.collection("medicines").insertMany(chunk, { ordered: false });
    inserted += chunk.length;
  }

  await db.collection("medicines").createIndex({ id: 1 }, { unique: true });

  console.log(`Imported ${inserted} medicines into "medicines" collection (index on id created).`);
} catch (error) {
  console.error("Import failed:", error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
