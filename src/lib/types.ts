export interface Package {
  label: string | null;
  packSize: number | null;
  price: number | null;
}

export interface Medicine {
  id: number;
  name: string | null;
  type: string | null;
  generic: string | null;
  strength: string | null;
  dosageForm: string | null;
  manufacturer: string | null;
  drugClass: string | null;
  indication: string | null;
  storageConditions: string | null;
  packages: Package[];
}

export interface CartItem {
  key: string;
  medicineId: number;
  name: string;
  generic: string | null;
  strength: string | null;
  dosageForm: string | null;
  packageLabel: string | null;
  packSize: number | null;
  unitPrice: number | null;
  qty: number;
}

export interface InvoiceItem {
  medicineId: number;
  name: string;
  generic: string | null;
  strength: string | null;
  dosageForm: string | null;
  packageLabel: string | null;
  packSize: number | null;
  unitPrice: number;
  qty: number;
  lineTotal: number;
}

export interface CustomerInfo {
  name: string;
  address: string;
  phone: string;
}

export interface Invoice {
  id: string;
  createdAt: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: string;
  customer?: CustomerInfo;
}

export type SortKey =
  | "name"
  | "name-desc"
  | "price-asc"
  | "price-desc"
  | "manufacturer";