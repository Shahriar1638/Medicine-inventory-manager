import { NextRequest, NextResponse } from "next/server";
import { connectDb, isDbConfigured } from "@/lib/db";
import InvoiceModel from "@/lib/models/Invoice";
import { nextInvoiceId } from "@/lib/format";

function unavailableResponse(): NextResponse {
  return NextResponse.json(
    { error: "Database not configured", invoices: [] },
    { status: 503 }
  );
}

export async function GET(request: NextRequest) {
  if (!isDbConfigured()) return unavailableResponse();

  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(Number(searchParams.get("limit") ?? 500), 1000);

    await connectDb();
    const docs = await InvoiceModel.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({
      invoices: docs.map((doc) => ({
        ...doc,
        createdAt:
          doc.createdAt instanceof Date ? doc.createdAt.toISOString() : doc.createdAt,
      })),
    });
  } catch (error) {
    console.error("[medix] GET /api/invoices failed", error);
    return NextResponse.json(
      { error: "Failed to load invoices", invoices: [] },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!isDbConfigured()) {
    return NextResponse.json(
      { error: "Database not configured", saved: false },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();

    const items = Array.isArray(body.items) ? body.items : [];
    const subtotal = Number(body.subtotal ?? 0);
    const discount = Number(body.discount ?? 0);
    const total = Number(body.total ?? 0);

    if (items.length === 0) {
      return NextResponse.json(
        { error: "An invoice must contain at least one item", saved: false },
        { status: 400 }
      );
    }

    await connectDb();
    const existing = await InvoiceModel.findOne({ id: body.id }).lean();
    // If the client-generated invoice number already exists (e.g. it was
    // created against localStorage previously), allocate the next free one.
    const id = existing ? await nextInvoiceId(await InvoiceModel.distinct("id")) : body.id;

    const doc = await InvoiceModel.create({
      ...body,
      id,
      createdAt: new Date(body.createdAt ?? Date.now()),
      items: items.map((item: Record<string, unknown>) => ({
        medicineId: Number(item.medicineId),
        name: String(item.name ?? "Unknown item"),
        generic: item.generic ?? null,
        strength: item.strength ?? null,
        dosageForm: item.dosageForm ?? null,
        packageLabel: item.packageLabel ?? null,
        packSize: item.packSize ?? null,
        unitPrice: Number(item.unitPrice ?? 0),
        qty: Number(item.qty ?? 1),
        lineTotal: Number(item.lineTotal ?? 0),
      })),
      subtotal,
      discount,
      total,
      paymentMethod: String(body.paymentMethod ?? "Cash"),
    });

    return NextResponse.json(
      {
        saved: true,
        invoice: {
          ...doc.toObject(),
          createdAt: doc.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[medix] POST /api/invoices failed", error);
    return NextResponse.json(
      { error: "Failed to save invoice", saved: false },
      { status: 500 }
    );
  }
}