import { NextRequest, NextResponse } from "next/server";
import { connectDb, isDbConfigured } from "@/lib/db";
import { seedStock } from "@/lib/stock";

export async function POST(request: NextRequest) {
  if (!isDbConfigured()) {
    return NextResponse.json(
      { error: "Database not configured", saved: false },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const medicineId = Number(body.medicineId);
    const packageIndex = Number(body.packageIndex);
    const delta = Number(body.delta ?? 0);

    if (!Number.isInteger(medicineId) || !Number.isInteger(packageIndex) || packageIndex < 0) {
      return NextResponse.json(
        { error: "Invalid medicineId or packageIndex", saved: false },
        { status: 400 }
      );
    }

    const conn = await connectDb();
    const db = conn.connection.db;
    if (!db) throw new Error("Database connection not ready");

    const stockPath = `packages.${packageIndex}.stock`;
    await db
      .collection("medicines")
      .updateOne({ id: medicineId, [stockPath]: null }, { $set: { [stockPath]: seedStock(medicineId, packageIndex) } });
    await db.collection("medicines").updateOne({ id: medicineId }, { $inc: { [stockPath]: delta } });
    await db.collection("medicines").updateOne({ id: medicineId }, { $max: { [stockPath]: 0 } });

    return NextResponse.json({ saved: true }, { status: 200 });
  } catch (error) {
    console.error("[medix] POST /api/medicines/stock failed", error);
    return NextResponse.json(
      { error: "Failed to update stock", saved: false },
      { status: 500 }
    );
  }
}