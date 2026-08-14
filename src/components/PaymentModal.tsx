"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import type { Invoice } from "@/lib/types";
import { formatBDT, nextInvoiceId } from "@/lib/format";
import InvoiceDocument from "@/components/InvoiceDocument";
import { CheckIcon, PrinterIcon } from "@/components/icons";
import { CloseButton } from "@/components/Header";

const PAYMENT_METHODS = ["Cash", "Card", "Mobile Banking"];

export default function PaymentModal() {
  const { cart, paymentOpen, setPaymentOpen, invoices, saveInvoice, clearCart } =
    useStore();
  const [method, setMethod] = useState(PAYMENT_METHODS[0]);
  const [completed, setCompleted] = useState<Invoice | null>(null);
  const [customer, setCustomer] = useState({ name: "", address: "", phone: "" });

  const draft = useMemo<Invoice | null>(() => {
    if (cart.length === 0) return null;
    const items = cart.map((item) => ({
      medicineId: item.medicineId,
      name: item.name,
      generic: item.generic,
      strength: item.strength,
      dosageForm: item.dosageForm,
      packageLabel: item.packageLabel,
      packSize: item.packSize,
      unitPrice: item.unitPrice ?? 0,
      qty: item.qty,
      lineTotal: Math.round((item.unitPrice ?? 0) * item.qty * 100) / 100,
    }));
    const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
    const rounded = Math.round(subtotal * 100) / 100;
    const customerInfo = {
      name: customer.name.trim(),
      address: customer.address.trim(),
      phone: customer.phone.trim(),
    };
    return {
      id: nextInvoiceId(invoices),
      createdAt: new Date().toISOString(),
      items,
      subtotal: rounded,
      discount: 0,
      total: rounded,
      paymentMethod: method,
      customer:
        customerInfo.name || customerInfo.address || customerInfo.phone
          ? customerInfo
          : undefined,
    };
  }, [cart, invoices, method, customer]);

  if (!paymentOpen) return null;

  const handlePay = async () => {
    if (!draft) return;
    await saveInvoice(draft);
    clearCart();
    setCompleted(draft);
  };

  const handleClose = () => {
    setPaymentOpen(false);
    setCompleted(null);
    setMethod(PAYMENT_METHODS[0]);
    setCustomer({ name: "", address: "", phone: "" });
  };

  return (
    <div className="overlay" onClick={handleClose}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h2 className="section-title">
            {completed ? "Payment Complete" : "Proceed to Payment"}
          </h2>
          <CloseButton onClick={handleClose} />
        </div>

        <div className="modal-body">
          {completed ? (
            <div className="empty-state" style={{ padding: "16px 0 24px" }}>
              <span
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 9999,
                  background: "var(--success-soft)",
                  color: "var(--success)",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <CheckIcon width={28} height={28} />
              </span>
              <p className="font-mono-data" style={{ fontSize: 20, fontWeight: 700 }}>
                {completed.id}
              </p>
              <p className="muted">
                Paid via {completed.paymentMethod} · {formatBDT(completed.total)}
              </p>
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button className="btn btn-secondary" onClick={() => window.print()}>
                  <PrinterIcon width={16} height={16} />
                  Print receipt
                </button>
                <Link href="/invoices" className="btn btn-primary" onClick={handleClose}>
                  View invoices
                </Link>
                <button className="btn btn-ghost" onClick={handleClose}>
                  Done
                </button>
              </div>
            </div>
          ) : draft ? (
            <div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: 10,
                  marginBottom: 20,
                  padding: 14,
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--r-md)",
                }}
              >
                <div style={{ gridColumn: "1 / -1" }}>
                  <span
                    className="faint"
                    style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}
                  >
                    Customer details
                  </span>
                </div>
                <input
                  className="input"
                  placeholder="Customer name"
                  value={customer.name}
                  onChange={(event) => setCustomer({ ...customer, name: event.target.value })}
                />
                <input
                  className="input"
                  placeholder="Phone number"
                  value={customer.phone}
                  onChange={(event) => setCustomer({ ...customer, phone: event.target.value })}
                />
                <input
                  className="input"
                  placeholder="Address"
                  value={customer.address}
                  onChange={(event) => setCustomer({ ...customer, address: event.target.value })}
                />
              </div>
              <InvoiceDocument invoice={draft} />
            </div>
          ) : (
            <p className="muted">Your cart is empty.</p>
          )}
        </div>

        {!completed && draft && (
          <div className="modal-footer">
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginRight: "auto",
              }}
            >
              <span className="muted" style={{ fontSize: 14 }}>
                Pay via
              </span>
              <select
                className="select"
                value={method}
                onChange={(event) => setMethod(event.target.value)}
                style={{ paddingTop: 7, paddingBottom: 7 }}
              >
                {PAYMENT_METHODS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <button className="btn btn-primary btn-lg" onClick={handlePay}>
              Confirm & Pay {formatBDT(draft.total)}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}