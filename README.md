# Medix — Medicine Management & POS

A pharmacy point-of-sale and medicine inventory management app built with **Next.js 16 (App Router)** and **MongoDB (Atlas)**. Browse a real medicine catalog, add items to a cart, take payments with customer details, and track invoices & revenue — all in a clean dual-theme UI.

## Features

### Pages

| Route | Page | What it does |
|---|---|---|
| `/` | **Medicine Lists** | Dense list view of the catalog. Searchable by medicine name, generic name, or manufacturer (choose the field from a dropdown), filtered by dosage form, with per-package price dropdowns and an **Add to cart** button per row. |
| `/inventory` | **Medicine Inventory** | Same catalog as a grid of cards. Full filters (type, dosage form, manufacturer, drug class), search + sort, and an **Add Medicine** button to add a new medicine via a form modal. Cards show manufacturer, live stock, price, and an Edit button. |
| `/invoices` | **Invoice & Revenue** | Revenue dashboard: total, today, this week, last 30 days, and month-to-date totals. Search (invoice/product/customer name/phone), date-range filter, payment-method filter, and sorting. Click any row for a full printable invoice. |

### POS flow

- **Cart drawer** — slide-out panel with quantity steppers, line totals, clear, and subtotal.
- **Payment modal** — optional customer details (name / phone / address), payment method (**Cash / Card / Mobile Banking**), live invoice preview, then a success receipt with a print button.
- **Toasts** — bottom-left notifications when items are added to the cart or a medicine is added.
- **Invoice document** — a printable A4-style receipt (`window.print()` prints only the invoice sheet).
- **Dynamic per-package stock** — every package type has a stable stock count (seeded deterministically per medicine/package since the raw dataset has no stock data). Each package dropdown shows how many units are left and disables out-of-stock options. Completing a sale decreases stock by the quantity sold: instantly in the UI (localStorage-tracked sold amounts) and best-effort in the Mongo `medicines` collection via the invoice API.

### Data & persistence

- Catalog: `public/medicines.json` (~585 medicines, 11 fields each incl. packages with `{label, packSize, price}`), fetched at runtime.
- **User-added medicines** are stored in localStorage and merged on top of the static catalog; a best-effort `POST /api/medicines` also saves them to Mongo.
- **Invoices** are server-authoritative: `GET /api/invoices` loads from MongoDB (Mongoose), with a graceful localStorage fallback when `MONGODB_URI` is unset or unreachable. Invoices created offline in localStorage are auto-migrated to the DB when it comes back online.
- Sequential invoice numbers (`INV-000001…`); the server re-allocates a free number if the client-generated one already exists.
- Everything (theme, cart, invoices, extra medicines) survives page reloads via localStorage.

### UI / UX

- Light + dark themes (CSS variables), persisted, with a pre-hydration script so there's no flash of the wrong theme.
- Sticky navbar with **Medicine Lists / Medicine Inventory / Invoice & Revenue** links and an active-page indicator; collapses to a hamburger menu on small screens.
- Responsive layouts, pagination (24 / 48 / 96 per page), empty & loading states.
- Currency formatting in Bangladeshi Taka (৳).

## Getting Started

```bash
npm install
npm run dev        # dev server on http://localhost:3001
```

> Port is pinned to **3001** in `package.json` (`next dev -p 3001`) so it doesn't clash with other projects on 3000.

## Data tooling

The catalog is generated from the raw Kaggle CSV (`archive/*.csv`):

```bash
npm run convert:data          # full catalog → public/medicines.json
node scripts/convert-csv.mjs --limit 100   # sample N rows
```

Push the generated catalog into MongoDB (drops + bulk-inserts the `medicines` collection):

```bash
npm run import:medicines
```

## Database setup (optional but recommended)

Invoices work without a database (localStorage fallback), but for shared/realtime persistence:

1. Set `MONGODB_URI` in `.env.local` (copy from `.env.example` — the file is git-ignored).
2. The app connects lazily on first API call and builds indexes automatically.

For a local instance instead of Atlas: `docker compose up -d` runs a `mongo:8` container.

## Deploying to Vercel

1. Push the repo to GitHub and import it in Vercel.
2. Add `MONGODB_URI` as an environment variable (either the `mongodb+srv://` string or the direct-seed URI works on Linux).
3. Make sure the Atlas cluster's network access allows Vercel (e.g. `0.0.0.0/0` for a demo, or use the Atlas–Vercel integration).
4. `mongoose` is already excluded from the bundle via `serverExternalPackages` in `next.config.ts`.

## Project structure

```
src/
  app/
    page.tsx                 # /  — Medicine Lists (list layout)
    inventory/page.tsx       # /inventory — grid layout
    invoices/page.tsx        # /invoices — revenue dashboard
    api/invoices/route.ts    # GET/POST invoice persistence
    api/medicines/route.ts   # POST new medicine (best-effort)
  components/
    MedicineBrowser.tsx      # shared browser (list or grid layout) + filters
    AddMedicineModal.tsx     # add-medicine form
    CartDrawer.tsx           # shopping cart drawer
    PaymentModal.tsx         # customer + payment + receipt
    InvoiceDocument.tsx      # printable invoice sheet
    Header.tsx               # navbar, theme toggle, mobile menu
    Toaster.tsx              # bottom-left notifications
  lib/
    store.tsx                # React context + localStorage sync (useSyncExternalStore)
    stock.ts                 # per-package stock seeding + effective stock math
    db.ts                    # Mongoose connection singleton
    models/Invoice.ts        # Invoice schema (items + customer)
    types.ts / format.ts     # shared types + ৳/date/id helpers
scripts/
  convert-csv.mjs            # Kaggle CSV → public/medicines.json
  import-medicines.mjs       # JSON → Mongo `medicines` collection
public/medicines.json        # runtime catalog (~585 medicines)
```