import { FlaskIcon, PillIcon } from "@/components/icons";

export function medicineCategory(dosageForm: string | null): "tablet" | "liquid" | "other" {
  if (!dosageForm) return "other";
  const form = dosageForm.toLowerCase();
  if (/(tablet|capsule|pill|bolus|sachet|powder)/.test(form)) return "tablet";
  if (/(syrup|suspension|solution|liquid|drops|drop|injection|infusion|inhaler|inhalation|ampoule|vial|cream|ointment|gel|suppository|spray|eye|ear|nasal)/.test(form))
    return "liquid";
  return "other";
}

export function MedicineIcon({
  dosageForm,
  size = 22,
}: {
  dosageForm: string | null;
  size?: number;
}) {
  const category = medicineCategory(dosageForm);
  return category === "liquid" ? (
    <FlaskIcon width={size} height={size} />
  ) : category === "tablet" ? (
    <PillIcon width={size} height={size} />
  ) : (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 8 8 21a2.4 2.4 0 0 1-3.4 0l-1.6-1.6a2.4 2.4 0 0 1 0-3.4L16 3" />
      <path d="m6.5 14.5 3 3" />
    </svg>
  );
}

export function typeChipClass(type: string | null): string {
  if (type === "herbal") return "chip chip-herbal";
  return "chip chip-allopathic";
}