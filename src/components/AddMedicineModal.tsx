"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { useStore } from "@/lib/store";
import type { Medicine } from "@/lib/types";
import { PlusIcon } from "@/components/icons";
import { CloseButton } from "@/components/Header";

function Field({
  label,
  required,
  full,
  children,
}: {
  label: string;
  required?: boolean;
  full?: boolean;
  children: ReactNode;
}) {
  return (
    <label
      style={{
        display: "block",
        gridColumn: full ? "1 / -1" : undefined,
        minWidth: 0,
      }}
    >
      <span
        className="faint"
        style={{
          fontSize: 11,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {label}
        {required && (
          <span style={{ color: "var(--warning)", marginLeft: 2 }} title="Required">
            *
          </span>
        )}
      </span>
      {children}
    </label>
  );
}

export default function AddMedicineModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { medicines, addMedicine } = useStore();

  const [name, setName] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [generic, setGeneric] = useState("");
  const [strength, setStrength] = useState("");
  const [dosageForm, setDosageForm] = useState("");
  const [drugClass, setDrugClass] = useState("");
  const [type, setType] = useState("allopathic");
  const [indication, setIndication] = useState("");
  const [storageConditions, setStorageConditions] = useState("");
  const [price, setPrice] = useState("");

  if (!open) return null;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const priceNumber = Number(price);
    if (!Number.isFinite(priceNumber) || priceNumber <= 0) {
      setPrice("");
      return;
    }
    const id = medicines.reduce((max, medicine) => Math.max(max, medicine.id), 0) + 1;
    const medicine: Medicine = {
      id,
      name: name.trim() || null,
      type,
      generic: generic.trim() || null,
      strength: strength.trim() || null,
      dosageForm: dosageForm.trim() || null,
      manufacturer: manufacturer.trim() || null,
      drugClass: drugClass.trim() || null,
      indication: indication.trim() || null,
      storageConditions: storageConditions.trim() || null,
      packages: [{ label: null, packSize: null, price: priceNumber }],
    };

    addMedicine(medicine);
    // Best-effort push to the medicines collection; the UI is already updated.
    void fetch("/api/medicines", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(medicine),
    }).catch(() => {});
    onClose();
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(event) => event.stopPropagation()} style={{ maxWidth: 620 }}>
        <div className="modal-header">
          <h2 className="section-title">Add New Medicine</h2>
          <CloseButton onClick={onClose} />
        </div>

        <form onSubmit={handleSubmit}>
          <div
            className="modal-body"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 14,
            }}
          >
            <Field label="Medicine name" required full>
              <input
                className="input"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Napa Extra"
                required
                autoFocus
              />
            </Field>
            <Field label="Manufacturer" required>
              <input
                className="input"
                value={manufacturer}
                onChange={(event) => setManufacturer(event.target.value)}
                placeholder="e.g. Beximco"
                required
              />
            </Field>
            <Field label="Price (৳)" required>
              <input
                className="input"
                type="number"
                min="0.01"
                step="0.01"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                placeholder="e.g. 6.00"
                required
              />
            </Field>
            <Field label="Dosage form">
              <input
                className="input"
                value={dosageForm}
                onChange={(event) => setDosageForm(event.target.value)}
                placeholder="e.g. Tablet"
              />
            </Field>
            <Field label="Type">
              <select
                className="select"
                value={type}
                onChange={(event) => setType(event.target.value)}
              >
                <option value="allopathic">Allopathic</option>
                <option value="herbal">Herbal</option>
              </select>
            </Field>
            <Field label="Generic name">
              <input
                className="input"
                value={generic}
                onChange={(event) => setGeneric(event.target.value)}
                placeholder="e.g. Paracetamol"
              />
            </Field>
            <Field label="Strength">
              <input
                className="input"
                value={strength}
                onChange={(event) => setStrength(event.target.value)}
                placeholder="e.g. 500 mg"
              />
            </Field>
            <Field label="Drug class">
              <input
                className="input"
                value={drugClass}
                onChange={(event) => setDrugClass(event.target.value)}
                placeholder="e.g. NSAID"
              />
            </Field>
            <Field label="Indication" full>
              <input
                className="input"
                value={indication}
                onChange={(event) => setIndication(event.target.value)}
                placeholder="e.g. Fever, headache"
              />
            </Field>
            <Field label="Storage conditions" full>
              <input
                className="input"
                value={storageConditions}
                onChange={(event) => setStorageConditions(event.target.value)}
                placeholder="e.g. Store below 30°C"
              />
            </Field>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <PlusIcon width={16} height={16} />
              Add Medicine
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
