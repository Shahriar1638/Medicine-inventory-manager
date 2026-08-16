// Demo stock model: the real catalog has no stock data, so every package gets
// a stable pseudo-random initial count derived from (medicineId, packageIndex).
// It never changes between renders or reloads; purchases reduce it over time.

export function seedStock(medicineId: number, packageIndex: number): number {
  const n = Math.abs(Math.sin(medicineId * 7 + packageIndex * 13) * 100000);
  return 12 + Math.floor(n % 240);
}

export function stockKey(medicineId: number, packageIndex: number): string {
  return `${medicineId}:${packageIndex}`;
}

export function effectiveStock(
  medicineId: number,
  packageIndex: number,
  sold: Record<string, number>,
  adjust: Record<string, number>
): number {
  const soldQty = sold[stockKey(medicineId, packageIndex)] ?? 0;
  const adjustQty = adjust[stockKey(medicineId, packageIndex)] ?? 0;
  return Math.max(0, seedStock(medicineId, packageIndex) - soldQty + adjustQty);
}