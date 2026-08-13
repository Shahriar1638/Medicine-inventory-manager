"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import type { Medicine, SortKey } from "@/lib/types";
import { defaultPriceOf, formatBDT } from "@/lib/format";
import { MedicineIcon, typeChipClass } from "@/components/MedicineIcon";
import { CartIcon, SearchIcon } from "@/components/icons";
import CartDrawer from "@/components/CartDrawer";
import PaymentModal from "@/components/PaymentModal";

const PAGE_SIZES = [24, 48, 96];

const SORTS: { key: SortKey; label: string }[] = [
  { key: "name", label: "Name (A–Z)" },
  { key: "name-desc", label: "Name (Z–A)" },
  { key: "price-asc", label: "Price (low → high)" },
  { key: "price-desc", label: "Price (high → low)" },
  { key: "manufacturer", label: "Manufacturer (A–Z)" },
];

function firstPricedPackageIndex(medicine: Medicine): number {
  return medicine.packages.findIndex((pkg) => pkg.price !== null);
}

function MedicineRow({
  medicine,
  onAdd,
}: {
  medicine: Medicine;
  onAdd: (packageIndex: number) => void;
}) {
  const [selected, setSelected] = useState(() => firstPricedPackageIndex(medicine));
  const selectedPackage =
    selected >= 0 && selected < medicine.packages.length ? medicine.packages[selected] : null;
  const selectable = medicine.packages.length > 0;

  return (
    <div className="med-row">
      <span className="card-media" style={{ width: 40, height: 40, borderRadius: 10 }}>
        <MedicineIcon dosageForm={medicine.dosageForm} size={19} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="truncate" style={{ fontWeight: 700, fontSize: 14 }}>
            {medicine.name}
          </span>
          <span className={typeChipClass(medicine.type)}>{medicine.type ?? "unknown"}</span>
          {medicine.dosageForm && <span className="chip">{medicine.dosageForm}</span>}
        </div>
        <div className="muted truncate" style={{ fontSize: 12.5, marginTop: 2 }}>
          {[medicine.generic, medicine.strength].filter(Boolean).join(" · ") || "—"}
          {medicine.manufacturer ? ` · ${medicine.manufacturer}` : ""}
        </div>
      </div>
      {selectable ? (
        <select
          className="select"
          value={selected}
          onChange={(event) => setSelected(Number(event.target.value))}
          aria-label={`${medicine.name} package`}
          style={{ paddingTop: 6, paddingBottom: 6, width: 200, flex: "0 0 200px" }}
        >
          {medicine.packages.map((pkg, index) => (
            <option key={index} value={index} disabled={pkg.price === null}>
              {pkg.label || `Package ${index + 1}`} — {formatBDT(pkg.price)}
            </option>
          ))}
        </select>
      ) : (
        <span
          className="faint"
          style={{ fontSize: 12, minWidth: 200, flex: "0 0 200px", display: "inline-flex", alignItems: "center" }}
        >
          Price unavailable
        </span>
      )}
      <span className="font-mono-data num" style={{ fontSize: 15, fontWeight: 700, minWidth: 90 }}>
        {formatBDT(selectedPackage?.price)}
      </span>
      <button
        className="btn btn-primary btn-sm"
        style={{ minWidth: 86 }}
        disabled={!selectedPackage || selectedPackage.price === null}
        onClick={() => onAdd(selected)}
      >
        <CartIcon width={14} height={14} />
        Add
      </button>
    </div>
  );
}

export default function POSPage() {
  const { medicines, medicinesLoading, cartCount, setCartOpen, addToCart } = useStore();

  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dosageFilter, setDosageFilter] = useState("all");
  const [mfrFilter, setMfrFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(24);

  const resetPage = () => setPage(1);

  const { dosageForms, manufacturers, drugClasses } = useMemo(() => {
    const dosageForms = new Set<string>();
    const manufacturers = new Set<string>();
    const drugClasses = new Set<string>();
    for (const medicine of medicines) {
      if (medicine.dosageForm) dosageForms.add(medicine.dosageForm);
      if (medicine.manufacturer) manufacturers.add(medicine.manufacturer);
      if (medicine.drugClass) drugClasses.add(medicine.drugClass);
    }
    const sort = (set: Set<string>) => [...set].sort((a, b) => a.localeCompare(b));
    return {
      dosageForms: sort(dosageForms),
      manufacturers: sort(manufacturers),
      drugClasses: sort(drugClasses),
    };
  }, [medicines]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = medicines.filter((medicine) => {
      if (typeFilter !== "all" && medicine.type !== typeFilter) return false;
      if (dosageFilter !== "all" && medicine.dosageForm !== dosageFilter) return false;
      if (mfrFilter !== "all" && medicine.manufacturer !== mfrFilter) return false;
      if (classFilter !== "all" && medicine.drugClass !== classFilter) return false;
      if (q) {
        const haystack = [
          medicine.name,
          medicine.generic,
          medicine.strength,
          medicine.manufacturer,
          medicine.drugClass,
          medicine.indication,
          medicine.dosageForm,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    switch (sortKey) {
      case "name":
        list = [...list].sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
        break;
      case "name-desc":
        list = [...list].sort((a, b) => (b.name ?? "").localeCompare(a.name ?? ""));
        break;
      case "price-asc":
        list = [...list].sort(
          (a, b) => (defaultPriceOf(a) ?? Infinity) - (defaultPriceOf(b) ?? Infinity)
        );
        break;
      case "price-desc":
        list = [...list].sort(
          (a, b) => (defaultPriceOf(b) ?? -1) - (defaultPriceOf(a) ?? -1)
        );
        break;
      case "manufacturer":
        list = [...list].sort((a, b) =>
          (a.manufacturer ?? "").localeCompare(b.manufacturer ?? "")
        );
        break;
    }
    return list;
  }, [medicines, query, typeFilter, dosageFilter, mfrFilter, classFilter, sortKey]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const pageButtons = useMemo(() => {
    const buttons: (number | "...")[] = [];
    for (let i = 1; i <= totalPages; i++) {
      if (totalPages <= 7 || i === 1 || i === totalPages || Math.abs(i - safePage) <= 1) {
        buttons.push(i);
      } else if (buttons[buttons.length - 1] !== "...") {
        buttons.push("...");
      }
    }
    return buttons;
  }, [totalPages, safePage]);

  return (
    <div className="app-shell">
      <div className="main">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
            marginBottom: 20,
          }}
        >
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", margin: 0 }}>
              Medicine Counter
            </h1>
            <p className="muted" style={{ fontSize: 13, margin: "2px 0 0" }}>
              {medicinesLoading
                ? "Loading catalog…"
                : `${filtered.length.toLocaleString()} of ${medicines.length.toLocaleString()} medicines`}
            </p>
          </div>
          <div className="spacer" />
          <div className="search-bar">
            <span className="search-icon">
              <SearchIcon width={16} height={16} />
            </span>
            <input
              className="input"
              placeholder="Search by name, generic, strength, manufacturer, indication…"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                resetPage();
              }}
            />
          </div>
          <button className="btn btn-secondary" onClick={() => setCartOpen(true)}>
            <CartIcon width={16} height={16} />
            Cart
            {cartCount > 0 && <span className="badge-count">{cartCount}</span>}
          </button>
        </div>

        <div className="filter-bar card" style={{ padding: 14, marginBottom: 20 }}>
          <select
            className="select"
            value={typeFilter}
            onChange={(event) => {
              setTypeFilter(event.target.value);
              resetPage();
            }}
            aria-label="Filter by type"
          >
            <option value="all">All types</option>
            <option value="allopathic">Allopathic</option>
            <option value="herbal">Herbal</option>
          </select>
          <select
            className="select"
            value={dosageFilter}
            onChange={(event) => {
              setDosageFilter(event.target.value);
              resetPage();
            }}
            aria-label="Filter by dosage form"
          >
            <option value="all">All dosage forms ({dosageForms.length})</option>
            {dosageForms.map((form) => (
              <option key={form} value={form}>
                {form}
              </option>
            ))}
          </select>
          <select
            className="select"
            value={mfrFilter}
            onChange={(event) => {
              setMfrFilter(event.target.value);
              resetPage();
            }}
            aria-label="Filter by manufacturer"
          >
            <option value="all">All manufacturers ({manufacturers.length})</option>
            {manufacturers.map((mfr) => (
              <option key={mfr} value={mfr}>
                {mfr}
              </option>
            ))}
          </select>
          <select
            className="select"
            value={classFilter}
            onChange={(event) => {
              setClassFilter(event.target.value);
              resetPage();
            }}
            aria-label="Filter by drug class"
          >
            <option value="all">All drug classes ({drugClasses.length})</option>
            {drugClasses.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>
          <div className="spacer" />
          <select
            className="select"
            value={sortKey}
            onChange={(event) => {
              setSortKey(event.target.value as SortKey);
              resetPage();
            }}
            aria-label="Sort medicines"
          >
            {SORTS.map((sort) => (
              <option key={sort.key} value={sort.key}>
                {sort.label}
              </option>
            ))}
          </select>
        </div>

        {medicinesLoading ? (
          <div className="loading-state">Loading catalog data…</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <SearchIcon width={36} height={36} />
            <p className="muted">
              No medicines match your filters.
              <br />
              Try a different search term or clear some filters.
            </p>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setQuery("");
                setTypeFilter("all");
                setDosageFilter("all");
                setMfrFilter("all");
                setClassFilter("all");
                resetPage();
              }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div>
            {pageItems.map((medicine) => (
              <MedicineRow
                key={medicine.id}
                medicine={medicine}
                onAdd={(index) => addToCart(medicine, index)}
              />
            ))}
          </div>
        )}

        {!medicinesLoading && filtered.length > 0 && (
          <div
            className="toolbar"
            style={{ marginTop: 24, justifyContent: "center", flexWrap: "wrap" }}
          >
            <span className="faint" style={{ fontSize: 13 }}>
              Showing {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, filtered.length)}{" "}
              of {filtered.length.toLocaleString()}
            </span>
            <div className="pagination">
              <button
                className="page-btn"
                disabled={safePage <= 1}
                onClick={() => setPage(safePage - 1)}
              >
                ‹
              </button>
              {pageButtons.map((button, index) =>
                button === "..." ? (
                  <span key={`dots-${index}`} className="faint" style={{ padding: "0 4px" }}>
                    …
                  </span>
                ) : (
                  <button
                    key={button}
                    className={`page-btn ${button === safePage ? "active" : ""}`}
                    onClick={() => setPage(button)}
                  >
                    {button}
                  </button>
                )
              )}
              <button
                className="page-btn"
                disabled={safePage >= totalPages}
                onClick={() => setPage(safePage + 1)}
              >
                ›
              </button>
            </div>
            <select
              className="select"
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                resetPage();
              }}
              aria-label="Items per page"
            >
              {PAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size} / page
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <CartDrawer />
      <PaymentModal />
    </div>
  );
}