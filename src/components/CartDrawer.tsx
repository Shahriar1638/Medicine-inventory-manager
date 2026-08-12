"use client";

import { useStore } from "@/lib/store";
import { formatBDT } from "@/lib/format";
import {
  CartIcon,
  MinusIcon,
  PlusIcon,
  TrashIcon,
} from "@/components/icons";
import { CloseButton } from "@/components/Header";

export default function CartDrawer() {
  const { cart, cartOpen, setCartOpen, setPaymentOpen, updateQty, removeFromCart, cartSubtotal, cartCount, clearCart } =
    useStore();

  if (!cartOpen) return null;

  return (
    <>
      <div className="drawer-overlay" onClick={() => setCartOpen(false)} />
      <aside className="drawer" role="dialog" aria-label="Shopping cart">
        <div className="drawer-header">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <CartIcon />
            <h2 className="section-title" style={{ fontSize: 16 }}>
              Cart
            </h2>
            {cartCount > 0 && <span className="badge-count">{cartCount}</span>}
          </div>
          <CloseButton onClick={() => setCartOpen(false)} />
        </div>

        <div className="drawer-body">
          {cart.length === 0 ? (
            <div className="empty-state" style={{ padding: "48px 16px" }}>
              <CartIcon width={36} height={36} />
              <p className="muted" style={{ fontSize: 14 }}>
                Your cart is empty.
                <br />
                Add medicines from the counter.
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div className="cart-item" key={item.key}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }} className="truncate">
                    {item.name}
                  </div>
                  <div className="faint" style={{ fontSize: 12 }}>
                    {[item.strength, item.packageLabel].filter(Boolean).join(" · ") || "—"}
                  </div>
                  <div className="font-mono-data" style={{ fontSize: 13, marginTop: 4 }}>
                    {formatBDT(item.unitPrice)}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                  <div className="stepper">
                    <button onClick={() => updateQty(item.key, -1)} aria-label="Decrease quantity">
                      <MinusIcon width={14} height={14} />
                    </button>
                    <span>{item.qty}</span>
                    <button onClick={() => updateQty(item.key, 1)} aria-label="Increase quantity">
                      <PlusIcon width={14} height={14} />
                    </button>
                  </div>
                  <div className="font-mono-data num" style={{ fontSize: 13, fontWeight: 600 }}>
                    {formatBDT((item.unitPrice ?? 0) * item.qty)}
                  </div>
                  <button
                    className="btn btn-danger-ghost btn-sm"
                    onClick={() => removeFromCart(item.key)}
                  >
                    <TrashIcon width={13} height={13} />
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="drawer-footer">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span className="muted" style={{ fontSize: 14 }}>
              Subtotal
            </span>
            <span className="font-mono-data" style={{ fontSize: 20, fontWeight: 700 }}>
              {formatBDT(cartSubtotal)}
            </span>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={clearCart}
              disabled={cart.length === 0}
            >
              Clear
            </button>
            <button
              className="btn btn-primary btn-block btn-lg"
              disabled={cart.length === 0}
              onClick={() => {
                setCartOpen(false);
                setPaymentOpen(true);
              }}
            >
              Proceed to Payment
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}