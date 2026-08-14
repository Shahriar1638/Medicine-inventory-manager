import { NextRequest, NextResponse } from "next/server";
import { connectDb, isDbConfigured } from "@/lib/db";

export async function POST(request: NextRequest) {
  if (!isDbConfigured()) {
    return NextResponse.json(
      { error: "Database not configured", saved: false },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();

    const name = String(body.name ?? "").trim();
    const packages: Record<string, unknown>[] = Array.isArray(body.packages)
      ? (body.packages as Record<string, unknown>[])
      : [];
    const hasPrice = packages.some(
      (pkg) => pkg?.price != null && Number(pkg.price) > 0
    );

    if (!name || packages.length === 0 || !hasPrice) {
      return NextResponse.json(
        { error: "A medicine needs a name and at least one priced package", saved: false },
        { status: 400 }
      );
    }

    const conn = await connectDb();
    const db = conn.connection.db;
    if (!db) throw new Error("Database connection not ready");
    await db.collection("medicines").insertOne({
      ...body,
      name,
      packages: packages.map((pkg) => ({
        label: pkg?.label ?? null,
        packSize: pkg?.packSize != null ? Number(pkg.packSize) : null,
        price: pkg?.price != null ? Number(pkg.price) : null,
      })),
    });

    return NextResponse.json(
      { saved: true, medicine: { ...body, name } },
      { status: 201 }
    );
  } catch (error) {
    console.error("[medix] POST /api/medicines failed", error);
    return NextResponse.json(
      { error: "Failed to save medicine", saved: false },
      { status: 500 }
    );
  }
}
