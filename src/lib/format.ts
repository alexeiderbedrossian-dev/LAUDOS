export function fmtNum(n: number | null | undefined, digits = 1): string {
  if (n == null || Number.isNaN(n)) return "";
  return n.toLocaleString("pt-BR", {
    minimumFractionDigits: Number.isInteger(n) && digits === 0 ? 0 : digits,
    maximumFractionDigits: digits,
  });
}

export function fmtNumOrDash(n: number | null | undefined, digits = 1): string {
  const s = fmtNum(n, digits);
  return s || "—";
}

export function parseLocaleNumber(raw: string): number | null {
  const t = raw.trim().replace(/\s/g, "").replace(",", ".");
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

export function ellipsoidVolume(
  a: number | null | undefined,
  b: number | null | undefined,
  c: number | null | undefined,
  factor = 0.52,
): number | null {
  if (a == null || b == null || c == null) return null;
  if (a <= 0 || b <= 0 || c <= 0) return null;
  return Math.round(a * b * c * factor * 10) / 10;
}

export function ageFromBirth(birthDate: string, onDate?: string): number | null {
  if (!birthDate) return null;
  const birth = new Date(birthDate + "T12:00:00");
  const on = onDate ? new Date(onDate + "T12:00:00") : new Date();
  if (Number.isNaN(birth.getTime()) || Number.isNaN(on.getTime())) return null;
  let age = on.getFullYear() - birth.getFullYear();
  const m = on.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && on.getDate() < birth.getDate())) age -= 1;
  return age >= 0 && age < 130 ? age : null;
}

export function formatDateBR(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso.length <= 10 ? iso + "T12:00:00" : iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("pt-BR");
}

const MONTHS = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

export function formatLongDateBR(iso: string): string {
  const d = new Date(iso.length <= 10 ? iso + "T12:00:00" : iso);
  if (Number.isNaN(d.getTime())) return formatDateBR(iso);
  return `${d.getDate()} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}`;
}

export function todayISO(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function joinSentences(parts: Array<string | null | undefined | false>): string {
  return parts
    .map((p) => (typeof p === "string" ? p.trim() : ""))
    .filter(Boolean)
    .join("\n\n");
}

export function sentence(s: string): string {
  const t = s.trim();
  if (!t) return "";
  return /[.!?…]$/.test(t) ? t : t + ".";
}

export function measureLine(
  label: string,
  a: number | null | undefined,
  b: number | null | undefined,
  c: number | null | undefined,
  unit = "cm",
  volume?: number | null,
  volumeUnit = "cm³",
): string {
  if (a == null && b == null && c == null) return "";
  const dims = [a, b, c]
    .filter((n) => n != null)
    .map((n) => fmtNum(n as number, 1))
    .join(" x ");
  const vol =
    volume != null ? ` (volume = ${fmtNum(volume, 1)} ${volumeUnit})` : "";
  return `${label} mede ${dims} ${unit}${vol}.`;
}
