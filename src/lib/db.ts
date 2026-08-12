import mongoose from "mongoose";
import InvoiceModel from "@/lib/models/Invoice";

const MONGODB_URI = process.env.MONGODB_URI;

if (process.env.NODE_ENV !== "production") {
  if (!MONGODB_URI) {
    console.warn(
      "[medix] MONGODB_URI is not set — invoices will fall back to localStorage only."
    );
  }
}

const globalForMongoose = globalThis as unknown as {
  conn?: mongoose.Mongoose | null;
  promise?: Promise<mongoose.Mongoose> | null;
};

function connect(): Promise<mongoose.Mongoose> {
  if (!MONGODB_URI) {
    return Promise.reject(new Error("MONGODB_URI is not set"));
  }
  globalForMongoose.promise ??= mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
  });
  return globalForMongoose.promise;
}

export async function connectDb(): Promise<mongoose.Mongoose> {
  if (globalForMongoose.conn) return globalForMongoose.conn;
  const promise = connect();
  globalForMongoose.conn = await promise;
  // index build so the unique `id` constraint exists in production too.
  try {
    await InvoiceModel.ensureIndexes();
  } catch (error) {
    console.warn("[medix] failed to ensure indexes", error);
  }
  return globalForMongoose.conn;
}

export function isDbConfigured(): boolean {
  return Boolean(MONGODB_URI);
}