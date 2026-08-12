export function formatBDT(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "—";
  }
  return `\u09F3${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  return `${date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })} ${date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })}`;
}

export function defaultPriceOf(medicine: { packages: { price: number | null }[] }): number | null {
  if (medicine.packages.length === 0) return null;
  for (const pkg of medicine.packages) {
    if (pkg.price !== null) return pkg.price;
  }
  return null;
}

export function nextInvoiceId(ids: (string | { id: string })[]): string {
  let max = 0;
  for (const entry of ids) {
    const id = typeof entry === "string" ? entry : entry.id;
    const match = id.match(/^INV-(\d+)$/);
    if (match) max = Math.max(max, Number(match[1]));
  }
  return `INV-${String(max + 1).padStart(6, "0")}`;
}