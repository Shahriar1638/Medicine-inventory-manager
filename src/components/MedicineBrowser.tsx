"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import type { Medicine, SortKey } from "@/lib/types";
import { defaultPriceOf, formatBDT } from "@/lib/format";
import { MedicineIcon, typeChipClass } from "@/components/MedicineIcon";
import { CartIcon, EditIcon, PlusIcon, SearchIcon } from "@/components/icons";
import CartDrawer from "@/components/CartDrawer";
import PaymentModal from "@/components/PaymentModal";
import AddMedicineModal from "@/components/AddMedicineModal";
import { CloseButton } from "@/components/Header";

const PAGE_SIZES = [24, 48, 96];

type SearchField = "name" | "generic" | "manufacturer";

const SEARCH_FIELDS: { key: SearchField; label: string; placeholder: string }[] = [
  { key: "name", label: "Medicine name", placeholder: "Search medicine name…" },
  { key: "generic", label: "Generic name", placeholder: "Search generic name…" },
  { key: "manufacturer", label: "Manufacturer", placeholder: "Search manufacturer…" },
];

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

function MedicineCard({ medicine }: { medicine: Medicine }) {
  const { stockOf, adjustStock } = useStore();
  const price = defaultPriceOf(medicine);
  const packageIndex = firstPricedPackageIndex(medicine);
  const stock = packageIndex >= 0 ? stockOf(medicine.id, packageIndex) : 0;
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [draft, setDraft] = useState(0);
  const pkgLabel = packageIndex >= 0 ? medicine.packages[packageIndex].label : null;
  const preview = Math.max(0, stock + draft);

  const closeModal = () => {
    setOpen(false);
    setConfirming(false);
    setDraft(0);
  };

  const handleConfirm = () => {
    if (draft === 0) return;
    adjustStock(medicine.id, packageIndex, draft);
    void fetch("/api/medicines/stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ medicineId: medicine.id, packageIndex, delta: draft }),
    }).catch(() => {});
    closeModal();
  };

  return (
    <article className="medicine-card">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 8,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 className="truncate" style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>
            {medicine.name}
          </h3>
          {medicine.dosageForm && (
            <span className="chip" style={{ marginTop: 4 }}>
              {medicine.dosageForm}
            </span>
          )}
        </div>
        <button className="btn btn-ghost btn-sm" aria-label={`Edit ${medicine.name}`} title="Edit">
          <EditIcon width={14} height={14} />
          Edit
        </button>
      </div>

      <p className="muted truncate" style={{ fontSize: 13, margin: 0 }}>
        {medicine.manufacturer ?? "—"}
      </p>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 8,
          marginTop: "auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
          <span
            className={stock > 0 ? "faint" : ""}
            style={
              stock === 0
                ? { fontSize: 12.5, fontWeight: 600, color: "var(--warning)" }
                : { fontSize: 12.5 }
            }
          >
            {stock > 0 ? `Stock: ${stock}` : "Out of stock"}
          </span>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setOpen(true)}
            disabled={packageIndex < 0}
            title={packageIndex < 0 ? "No priced package" : "Update stock"}
          >
            Update
          </button>
        </div>
        <span className="font-mono-data" style={{ fontSize: 17, fontWeight: 700 }}>
          {formatBDT(price)}
        </span>
      </div>

      {open && (
        <div className="overlay" onClick={closeModal}>
          <div className="modal" onClick={(event) => event.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <h2 className="section-title">Update stock</h2>
              <CloseButton onClick={closeModal} />
            </div>
            <div className="modal-body">
              <div className="truncate" style={{ fontWeight: 600, fontSize: 15 }}>
                {medicine.name}
              </div>
              <div className="muted truncate" style={{ fontSize: 12.5, marginTop: 2 }}>
                {[medicine.dosageForm, pkgLabel].filter(Boolean).join(" · ") || "—"}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  marginTop: 16,
                  padding: "12px 14px",
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--r-md)",
                }}
              >
                <span className="faint" style={{ fontSize: 13 }}>
                  Current: <strong className="font-mono-data">{stock}</strong>
                </span>
                <span className="stepper">
                  <button
                    onClick={() => setDraft((d) => d - 1)}
                    disabled={preview <= 0}
                    aria-label="Decrease stock"
                  >
                    −
                  </button>
                  <input
                    className="stepper-input"
                    type="number"
                    value={draft}
                    onChange={(event) => {
                      const value = Number(event.target.value);
                      setDraft(Number.isFinite(value) ? Math.trunc(value) : 0);
                    }}
                    aria-label="Stock adjustment amount"
                  />
                  <button onClick={() => setDraft((d) => d + 1)} aria-label="Increase stock">
                    +
                  </button>
                </span>
                <span className="faint" style={{ fontSize: 13 }}>
                  New: <strong className="font-mono-data">{preview}</strong>
                </span>
              </div>

              {confirming ? (
                <p style={{ margin: "14px 0 0", fontSize: 14, lineHeight: 1.6 }}>
                  Did you actually{" "}
                  {draft > 0
                    ? `add ${Math.abs(draft)} extra product${Math.abs(draft) === 1 ? "" : "s"}`
                    : `remove or sell ${Math.abs(draft)} product${Math.abs(draft) === 1 ? "" : "s"}`}
                  ? The stock is only updated after you confirm.
                </p>
              ) : (
                draft !== 0 && (
                  <p style={{ margin: "14px 0 0", fontSize: 14, lineHeight: 1.6 }}>
                    You are about to <strong>{draft > 0 ? "increase" : "decrease"}</strong> the stock
                    by <strong>{Math.abs(draft)}</strong> unit{Math.abs(draft) === 1 ? "" : "s"}.
                  </p>
                )
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={confirming ? () => setConfirming(false) : closeModal}>
                {confirming ? "Back" : "Cancel"}
              </button>
              {confirming ? (
                <button className="btn btn-primary" onClick={handleConfirm}>
                  Confirm
                </button>
              ) : (
                <button className="btn btn-primary" disabled={draft === 0} onClick={() => setConfirming(true)}>
                  Save
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

function MedicineRow({
  medicine,
  onAdd,
}: {
  medicine: Medicine;
  onAdd: (packageIndex: number) => void;
}) {
  const { stockOf } = useStore();
  const [selected, setSelected] = useState(() => firstPricedPackageIndex(medicine));
  const selectedPackage =
    selected >= 0 && selected < medicine.packages.length ? medicine.packages[selected] : null;
  const selectable = medicine.packages.length > 0;
  const selectedStock = selected >= 0 ? stockOf(medicine.id, selected) : 0;
  const outOfStock = !selectedPackage || selectedPackage.price === null || selectedStock <= 0;

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
          {medicine.packages.map((pkg, index) => {
            const stock = stockOf(medicine.id, index);
            const disabled = pkg.price === null || stock <= 0;
            return (
              <option key={index} value={index} disabled={disabled}>
                {pkg.label || `Package ${index + 1}`} — {formatBDT(pkg.price)} ·{" "}
                {stock > 0 ? `${stock} in stock` : "out of stock"}
              </option>
            );
          })}
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
        disabled={outOfStock}
        onClick={() => onAdd(selected)}
      >
        <CartIcon width={14} height={14} />
        {!selectable || selectedPackage?.price === null
          ? "No price"
          : selectedStock <= 0
            ? "Out of stock"
            : "Add"}
      </button>
    </div>
  );
}

export default function MedicineBrowser({
  layout,
}: {
  layout: "list" | "grid";
}) {
  const { medicines, medicinesLoading, cartCount, setCartOpen, addToCart } = useStore();

  const [query, setQuery] = useState("");
  const [searchField, setSearchField] = useState<SearchField>("name");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dosageFilter, setDosageFilter] = useState("all");
  const [mfrFilter, setMfrFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(24);
  const [addOpen, setAddOpen] = useState(false);

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
    const fieldText = (medicine: Medicine): string => {
      switch (searchField) {
        case "generic":
          return medicine.generic ?? "";
        case "manufacturer":
          return medicine.manufacturer ?? "";
        default:
          return medicine.name ?? "";
      }
    };
    let list = medicines.filter((medicine) => {
      if (typeFilter !== "all" && medicine.type !== typeFilter) return false;
      if (dosageFilter !== "all" && medicine.dosageForm !== dosageFilter) return false;
      if (mfrFilter !== "all" && medicine.manufacturer !== mfrFilter) return false;
      if (classFilter !== "all" && medicine.drugClass !== classFilter) return false;
      if (q && !fieldText(medicine).toLowerCase().includes(q)) return false;
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
  }, [medicines, query, searchField, typeFilter, dosageFilter, mfrFilter, classFilter, sortKey]);

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
        <div className="filter-bar card" style={{ padding: 14, marginBottom: 20 }}>
          {layout === "grid" ? (
            <div className="filter-row filter-row--wide">
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
            </div>
          ) : (
            <>
              <select
                className="select"
                value={searchField}
                onChange={(event) => {
                  setSearchField(event.target.value as SearchField);
                  resetPage();
                }}
                aria-label="Search field"
              >
                {SEARCH_FIELDS.map((field) => (
                  <option key={field.key} value={field.key}>
                    {field.label}
                  </option>
                ))}
              </select>
              <div className="search-bar">
                <span className="search-icon">
                  <SearchIcon width={16} height={16} />
                </span>
                <input
                  className="input"
                  placeholder={
                    SEARCH_FIELDS.find((field) => field.key === searchField)?.placeholder ??
                    "Search…"
                  }
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    resetPage();
                  }}
                />
              </div>
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
              <div className="spacer" />
              <button className="btn btn-secondary" onClick={() => setCartOpen(true)}>
                <CartIcon width={16} height={16} />
                Cart
                {cartCount > 0 && <span className="badge-count">{cartCount}</span>}
              </button>
            </>
          )}
          {layout === "grid" && (
            <div className="filter-row filter-row--wide">
              <select
                className="select"
                style={{ width: 220, flex: "0 0 220px" }}
                value={searchField}
                onChange={(event) => {
                  setSearchField(event.target.value as SearchField);
                  resetPage();
                }}
                aria-label="Search field"
              >
                {SEARCH_FIELDS.map((field) => (
                  <option key={field.key} value={field.key}>
                    {field.label}
                  </option>
                ))}
              </select>
              <div className="search-bar">
                <span className="search-icon">
                  <SearchIcon width={16} height={16} />
                </span>
                <input
                  className="input"
                  placeholder={
                    SEARCH_FIELDS.find((field) => field.key === searchField)?.placeholder ??
                    "Search…"
                  }
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    resetPage();
                  }}
                />
              </div>
              <select
                className="select"
                style={{ width: 240, flex: "0 0 240px" }}
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
              <button
                className="btn btn-primary"
                onClick={() => setAddOpen(true)}
                disabled={medicinesLoading}
                title={medicinesLoading ? "Catalog is still loading…" : undefined}
              >
                <PlusIcon width={16} height={16} />
                Add Medicine
              </button>
            </div>
          )}
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
                setSearchField("name");
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
        ) : layout === "grid" ? (
          <div
            className="cards-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
              gap: 16,
            }}
          >
            {pageItems.map((medicine) => (
              <MedicineCard key={medicine.id} medicine={medicine} />
            ))}
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
      <AddMedicineModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}