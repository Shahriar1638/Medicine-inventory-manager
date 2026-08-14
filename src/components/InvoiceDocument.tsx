"use client";

import type { Invoice } from "@/lib/types";
import { formatBDT, formatDateTime } from "@/lib/format";

export default function InvoiceDocument({ invoice }: { invoice: Invoice }) {
  return (
    <div className="invoice-sheet">
      <div className="invoice-head">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.01em" }}>
            MEDIX PHARMACY
          </h1>
          <p className="muted" style={{ fontSize: 13, marginTop: 4 }}>
            12 Hospital Road, Dhaka 1205
            <br />
            Phone: +880 1712-345678
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <h2
            style={{
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: "0.05em",
              color: "var(--text-faint)",
            }}
          >
            INVOICE
          </h2>
          <p className="font-mono-data" style={{ fontSize: 18, fontWeight: 700, marginTop: 2 }}>
            {invoice.id}
          </p>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
          marginTop: 16,
        }}
      >
        <div className="invoice-meta">
          <span className="faint">Invoice date</span>
          <span className="font-mono-data">{formatDateTime(invoice.createdAt)}</span>
          <span className="faint">Payment method</span>
          <span>{invoice.paymentMethod}</span>
          <span className="faint">Line items</span>
          <span className="font-mono-data">{invoice.items.length}</span>
          <span className="faint">Prepared by</span>
          <span>Demo Operator</span>
        </div>
        <div className="invoice-meta">
          <span className="faint">Customer</span>
          <span>{invoice.customer?.name || "—"}</span>
          <span className="faint">Phone</span>
          <span className="font-mono-data">{invoice.customer?.phone || "—"}</span>
          <span className="faint">Address</span>
          <span>{invoice.customer?.address || "—"}</span>
        </div>
      </div>

      <table className="invoice-table">
        <thead>
          <tr>
            <th style={{ width: 32 }}>#</th>
            <th>Item</th>
            <th style={{ width: 80 }} className="num">Qty</th>
            <th style={{ width: 110 }} className="num">Unit price</th>
            <th style={{ width: 130 }} className="num">Total</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, index) => (
            <tr key={index}>
              <td className="font-mono-data faint">{index + 1}</td>
              <td>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{item.name}</div>
                <div className="faint" style={{ fontSize: 12, marginTop: 1 }}>
                  {[item.generic, item.strength].filter(Boolean).join(" · ") || "—"}
                </div>
                <div className="faint" style={{ fontSize: 12 }}>
                  {[item.dosageForm, item.packageLabel].filter(Boolean).join(" · ") || "—"}
                </div>
              </td>
              <td className="num">{item.qty}</td>
              <td className="num">{formatBDT(item.unitPrice)}</td>
              <td className="num" style={{ fontWeight: 600 }}>
                {formatBDT(item.lineTotal)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="invoice-totals">
        <span className="muted">Subtotal</span>
        <span className="num">{formatBDT(invoice.subtotal)}</span>
        {invoice.discount > 0 && (
          <>
            <span className="muted">Discount</span>
            <span className="num">−{formatBDT(invoice.discount)}</span>
          </>
        )}
        <span className="grand">Total Payable</span>
        <span className="num grand">{formatBDT(invoice.total)}</span>
      </div>

      <p className="faint" style={{ fontSize: 12, marginTop: 24, textAlign: "center" }}>
        Thank you for your purchase. Please retain this invoice for reference.
      </p>
    </div>
  );
}