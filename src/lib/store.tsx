"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { CartItem, Invoice, Medicine } from "@/lib/types";

const CART_KEY = "medshop.cart";
const INVOICES_KEY = "medshop.invoices";
const THEME_KEY = "medshop.theme";
const EXTRA_MEDICINES_KEY = "medshop.medicines.extra";
const MEDICINES_URL = "/medicines.json";

type Theme = "light" | "dark";

export interface Toast {
  id: number;
  title?: string;
  name: string;
  price?: number;
}

interface StoreValue {
  theme: Theme;
  toggleTheme: () => void;
  medicines: Medicine[];
  medicinesLoading: boolean;
  cart: CartItem[];
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  paymentOpen: boolean;
  setPaymentOpen: (open: boolean) => void;
  addToCart: (medicine: Medicine, packageIndex: number) => void;
  addMedicine: (medicine: Medicine) => void;
  toasts: Toast[];
  dismissToast: (id: number) => void;
  updateQty: (key: string, delta: number) => void;
  removeFromCart: (key: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  invoices: Invoice[];
  saveInvoice: (invoice: Invoice) => Promise<void>;
  seedInvoices: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

const storageListeners = new Set<() => void>();

function subscribeStorage(callback: () => void): () => void {
  storageListeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    storageListeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function writeStored<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage unavailable
  }
  for (const listener of storageListeners) listener();
}

function storedSnapshot<T>(key: string, fallback: T): () => T {
  let cache: { raw: string | null; value: T } | null = null;
  return () => {
    let raw: string | null = null;
    try {
      raw = window.localStorage.getItem(key);
    } catch {
      raw = null;
    }
    if (!raw) return fallback;
    if (cache && cache.raw === raw) return cache.value;
    let value: T;
    try {
      value = JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
    cache = { raw, value };
    return value;
  };
}

function dedupeById(invoices: Invoice[]): Invoice[] {
  const seen = new Set<string>();
  const result: Invoice[] = [];
  for (const invoice of invoices) {
    if (seen.has(invoice.id)) continue;
    seen.add(invoice.id);
    result.push(invoice);
  }
  return result;
}

let medicinesPromise: Promise<Medicine[]> | null = null;

function fetchMedicines(): Promise<Medicine[]> {
  medicinesPromise ??= fetch(MEDICINES_URL)
    .then((res) => {
      if (!res.ok) throw new Error(`Failed to load medicines: ${res.status}`);
      return res.json() as Promise<Medicine[]>;
    });
  return medicinesPromise;
}

// Hydration-safe external store. getServerSnapshot returns the fallback, so the
// server-rendered HTML matches the client's hydrating render. After hydration,
// React re-reads the real localStorage snapshot (theme / cart / invoices).
function useStored<T>(key: string, fallback: T): T {
  return useSyncExternalStore(
    subscribeStorage,
    storedSnapshot<T>(key, fallback),
    () => fallback
  );
}

export function AppProviders({ children }: { children: ReactNode }) {
  const theme = useStored<Theme>(THEME_KEY, "light");
  const cart = useStored<CartItem[]>(CART_KEY, []);
  const invoices = useStored<Invoice[]>(INVOICES_KEY, []);
  const [cartOpen, setCartOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [medicinesLoading, setMedicinesLoading] = useState(true);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    let cancelled = false;
    fetchMedicines()
      .then((data) => {
        if (!cancelled) {
          // Merge user-added medicines (localStorage) on top of the static
          // catalog, dropping any that collide with a static id.
          const staticIds = new Set(data.map((medicine) => medicine.id));
          const extra = loadFromStorage<Medicine[]>(EXTRA_MEDICINES_KEY, []).filter(
            (medicine) => !staticIds.has(medicine.id)
          );
          setMedicines([...extra, ...data]);
          setMedicinesLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setMedicinesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleTheme = useCallback(() => {
    writeStored<Theme>(THEME_KEY, theme === "dark" ? "light" : "dark");
  }, [theme]);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToCart = useCallback(
    (medicine: Medicine, packageIndex: number) => {
      const pkg = medicine.packages[packageIndex];
      if (!pkg || pkg.price === null) return;
      const price = pkg.price;
      const current = loadFromStorage<CartItem[]>(CART_KEY, []);
      const key = `${medicine.id}:${packageIndex}`;
      const existing = current.find((item) => item.key === key);
      const next = existing
        ? current.map((item) =>
            item.key === key ? { ...item, qty: item.qty + 1 } : item
          )
        : [
            ...current,
            {
              key,
              medicineId: medicine.id,
              name: medicine.name ?? `Medicine #${medicine.id}`,
              generic: medicine.generic,
              strength: medicine.strength,
              dosageForm: medicine.dosageForm,
              packageLabel: pkg.label,
              packSize: pkg.packSize,
              unitPrice: pkg.price,
              qty: 1,
            } as CartItem,
          ];
      writeStored(CART_KEY, next);

      const id = Date.now() + Math.random();
      setToasts((prev) => [
        ...prev.slice(-3),
        { id, name: medicine.name ?? `Medicine #${medicine.id}`, price },
      ]);
      window.setTimeout(() => dismissToast(id), 3000);
    },
    [dismissToast]
  );

  const addMedicine = useCallback(
    (medicine: Medicine) => {
      const current = loadFromStorage<Medicine[]>(EXTRA_MEDICINES_KEY, []);
      writeStored(EXTRA_MEDICINES_KEY, [...current, medicine]);
      setMedicines((prev) => [medicine, ...prev]);

      const id = Date.now() + Math.random();
      setToasts((prev) => [
        ...prev.slice(-3),
        {
          id,
          title: "Medicine added",
          name: medicine.name ?? `Medicine #${medicine.id}`,
        },
      ]);
      window.setTimeout(() => dismissToast(id), 3000);
    },
    [dismissToast]
  );

  const updateQty = useCallback((key: string, delta: number) => {
    const current = loadFromStorage<CartItem[]>(CART_KEY, []);
    const next = current
      .map((item) => (item.key === key ? { ...item, qty: Math.max(0, item.qty + delta) } : item))
      .filter((item) => item.qty > 0);
    writeStored(CART_KEY, next);
  }, []);

  const removeFromCart = useCallback((key: string) => {
    const current = loadFromStorage<CartItem[]>(CART_KEY, []);
    writeStored(CART_KEY, current.filter((item) => item.key !== key));
  }, []);

  const clearCart = useCallback(() => {
    writeStored<CartItem[]>(CART_KEY, []);
  }, []);

  const saveInvoice = useCallback(async (invoice: Invoice) => {
    let saved = invoice;
    try {
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoice),
      });
      if (response.ok) {
        const payload = (await response.json()) as { invoice: Invoice };
        saved = payload.invoice;
      }
    } catch {
      // DB unavailable — invoice stays in localStorage only.
    }
    const current = loadFromStorage<Invoice[]>(INVOICES_KEY, []);
    writeStored(INVOICES_KEY, dedupeById([saved, ...current]));
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const localBefore = loadFromStorage<Invoice[]>(INVOICES_KEY, []);
        const response = await fetch("/api/invoices", { cache: "no-store" });
        const payload = (await response.json()) as { invoices?: Invoice[] };
        if (!response.ok || !Array.isArray(payload.invoices)) return;
        if (cancelled) return;
        writeStored(INVOICES_KEY, payload.invoices);

        // Migrate invoices that only exist in localStorage over to the DB.
        const serverIds = new Set(payload.invoices.map((invoice) => invoice.id));
        const localOnly = localBefore.filter((invoice) => !serverIds.has(invoice.id));
        for (const local of localOnly) {
          await fetch("/api/invoices", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(local),
          }).catch(() => {});
        }
      } catch {
        // DB unavailable — localStorage remains the source of truth.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const seedInvoices = useCallback(() => {
    if (medicines.length === 0) return;
    const pick = (i: number) => medicines[i % medicines.length];
    const rand = (min: number, max: number) =>
      Math.floor(Math.random() * (max - min + 1)) + min;
    const methods = ["Cash", "Card", "Mobile Banking"];
    const now = new Date();
    const seed: Invoice[] = [];

    for (let i = 0; i < 40; i++) {
      const createdAt = new Date(now);
      createdAt.setDate(now.getDate() - rand(0, 31));
      createdAt.setHours(rand(9, 21), rand(0, 59), rand(0, 59), 0);
      if (createdAt > now) createdAt.setTime(now.getTime());

      const itemCount = rand(1, 5);
      const items = [];
      for (let j = 0; j < itemCount; j++) {
        const medicine = pick(seed.length + j * 7 + i * 3);
        const priced =
          medicine.packages.find((p) => p.price !== null) ?? medicine.packages[0];
        if (!priced || priced.price === null) continue;
        const qty = rand(1, 5);
        items.push({
          medicineId: medicine.id,
          name: medicine.name ?? `Medicine #${medicine.id}`,
          generic: medicine.generic,
          strength: medicine.strength,
          dosageForm: medicine.dosageForm,
          packageLabel: priced.label,
          packSize: priced.packSize,
          unitPrice: priced.price,
          qty,
          lineTotal: Math.round(priced.price * qty * 100) / 100,
        });
      }
      if (items.length === 0) continue;
      const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
      const discount = subtotal > 5000 ? Math.round(subtotal * 0.03 * 100) / 100 : 0;
      const invoice: Invoice = {
        id: `SEED-${String(seed.length + 1).padStart(6, "0")}`,
        createdAt: createdAt.toISOString(),
        items,
        subtotal,
        discount,
        total: Math.round((subtotal - discount) * 100) / 100,
        paymentMethod: methods[i % methods.length],
      };
      seed.push(invoice);
    }

    const current = loadFromStorage<Invoice[]>(INVOICES_KEY, []);
    writeStored(INVOICES_KEY, dedupeById([...seed, ...current]));

    // Best-effort push to the DB; UI is not blocked on it.
    for (const invoice of seed) {
      void fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoice),
      }).catch(() => {});
    }
  }, [medicines]);

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.qty, 0), [cart]);
  const cartSubtotal = useMemo(
    () =>
      cart.reduce(
        (sum, item) => sum + (item.unitPrice ?? 0) * item.qty,
        0
      ),
    [cart]
  );

  const value = useMemo<StoreValue>(
    () => ({
      theme,
      toggleTheme,
      medicines,
      medicinesLoading,
      cart,
      cartOpen,
      setCartOpen,
      paymentOpen,
      setPaymentOpen,
      addToCart,
      addMedicine,
      toasts,
      dismissToast,
      updateQty,
      removeFromCart,
      clearCart,
      cartCount,
      cartSubtotal,
      invoices,
      saveInvoice,
      seedInvoices,
    }),
[
      theme,
      toggleTheme,
      medicines,
      medicinesLoading,
      cart,
      cartOpen,
      paymentOpen,
      addToCart,
      addMedicine,
      toasts,
      dismissToast,
      updateQty,
      removeFromCart,
      clearCart,
      cartCount,
      cartSubtotal,
      invoices,
      saveInvoice,
      seedInvoices,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within AppProviders");
  return ctx;
}