import { model, models, Schema } from "mongoose";

const InvoiceItemSchema = new Schema(
  {
    medicineId: { type: Number, required: true },
    packageIndex: { type: Number, default: null },
    name: { type: String, required: true },
    generic: { type: String, default: null },
    strength: { type: String, default: null },
    dosageForm: { type: String, default: null },
    packageLabel: { type: String, default: null },
    packSize: { type: Number, default: null },
    unitPrice: { type: Number, required: true, min: 0 },
    qty: { type: Number, required: true, min: 1 },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const CustomerSchema = new Schema(
  {
    name: { type: String, default: "" },
    address: { type: String, default: "" },
    phone: { type: String, default: "" },
  },
  { _id: false }
);

// id is our human-readable invoice number, e.g. "INV-000001".
// _id is Mongo's automatically generated ObjectId.
const InvoiceSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    createdAt: { type: Date, required: true, index: true },
    discount: { type: Number, required: true, min: 0, default: 0 },
    paymentMethod: { type: String, required: true, default: "Cash" },
    subtotal: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    items: { type: [InvoiceItemSchema], default: [] },
    customer: { type: CustomerSchema, default: null },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_doc, ret) => {
        const plain = ret as unknown as Record<string, unknown>;
        plain.createdAt =
          plain.createdAt instanceof Date
            ? plain.createdAt.toISOString()
            : plain.createdAt;
        delete plain._id;
        delete plain.__v;
        return plain;
      },
      virtuals: true,
    },
  }
);

const InvoiceModel =
  (models.Invoice as typeof import("mongoose").Model<unknown>) ??
  model("Invoice", InvoiceSchema);

export default InvoiceModel;