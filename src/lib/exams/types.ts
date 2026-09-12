export const EXAM_IDS = [
  "tireoide",
  "cervical",
  "abdomen",
  "abdomen-superior",
  "abdomen-prostata",
  "masculino",
  "feminino",
  "eco",
  "partes-moles",
  "articulacoes",
  "arterial-mmii",
  "arterial-mmss",
  "venosa-mmii",
  "venoso-mmss",
  "mapeamento-venoso",
  "carotidas",
] as const;

export type ExamId = (typeof EXAM_IDS)[number];

export type ExamGroup = "us" | "vascular";

export interface Measure3 {
  a: number | null;
  b: number | null;
  c: number | null;
}

export interface SelectOption {
  value: string;
  label: string;
}

export type FieldType = "text" | "number" | "select" | "measure3" | "bool" | "list";

export interface FieldDef {
  id: string;
  label: string;
  type: FieldType;
  unit?: string;
  step?: number;
  digits?: number;
  span?: 1 | 2 | 3;
  options?: SelectOption[];
  aliases?: string[];
  placeholder?: string;
  hint?: string;
  itemLabel?: string;
  itemFields?: FieldDef[];
}

export interface SectionDef {
  id: string;
  title: string;
  hint?: string;
  columns?: 1 | 2 | 3;
  kind?: "fields" | "vessel-table" | "mapping" | "nodules";
  fields?: FieldDef[];
}

export interface Patient {
  name: string;
  birthDate: string;
  sex: "F" | "M" | "";
  examDate: string;
  requester: string;
  indication: string;
  record: string;
}

export interface ClinicSettings {
  clinicName: string;
  address: string;
  phone: string;
  city: string;
  doctorName: string;
  crm: string;
  rqe: string;
  specialty: string;
  doctorSpecialty: string;
}

export interface Report {
  id: string;
  examId: ExamId;
  patient: Patient;
  values: Record<string, unknown>;
  findingsOverride: string | null;
  conclusionOverride: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ExamDefinition {
  id: ExamId;
  title: string;
  printTitle: string;
  short: string;
  group: ExamGroup;
  blurb: string;
  technique: string;
  dictationHints: string[];
  sections: SectionDef[];
  disclaimer?: string;
  defaults: () => Record<string, unknown>;
  applyNormal: (values: Record<string, unknown>, patient: Patient) => Record<string, unknown>;
  findings: (values: Record<string, unknown>, patient: Patient) => string;
  conclusion: (values: Record<string, unknown>, patient: Patient) => string;
}

export function emptyMeasure(): Measure3 {
  return { a: null, b: null, c: null };
}

export function asMeasure(v: unknown): Measure3 {
  if (v && typeof v === "object") {
    const o = v as Record<string, unknown>;
    return {
      a: typeof o.a === "number" ? o.a : null,
      b: typeof o.b === "number" ? o.b : null,
      c: typeof o.c === "number" ? o.c : null,
    };
  }
  return emptyMeasure();
}

export function asNum(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

export function asStr(v: unknown): string {
  return typeof v === "string" ? v : "";
}

export function asBool(v: unknown): boolean {
  return v === true;
}

export function asList<T extends Record<string, unknown>>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

export function emptyPatient(): Patient {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return {
    name: "",
    birthDate: "",
    sex: "",
    examDate: `${d.getFullYear()}-${m}-${day}`,
    requester: "",
    indication: "",
    record: "",
  };
}

export const DEFAULT_CLINIC: ClinicSettings = {
  clinicName: "Centro Médico Mercês",
  address: "Rua Jacarezinho, 258 · CEP 80710-150 · Bairro Mercês, Curitiba/PR",
  phone: "(41) 3029-2030",
  city: "Curitiba",
  doctorName: "Ralff Mallmann",
  crm: "CRM-PR 25980",
  rqe: "",
  specialty: "setor de exames de imagem",
  doctorSpecialty: "Radiologia · Ultrassonografia",
};

export function hydrateClinic(saved?: Partial<ClinicSettings> | null): ClinicSettings {
  const merged: ClinicSettings = { ...DEFAULT_CLINIC, ...saved };
  (Object.keys(DEFAULT_CLINIC) as (keyof ClinicSettings)[]).forEach((key) => {
    if (!merged[key]) merged[key] = DEFAULT_CLINIC[key];
  });
  if (merged.city === "São Paulo") merged.city = DEFAULT_CLINIC.city;
  if (merged.clinicName === "Clínica de Ultrassonografia") merged.clinicName = DEFAULT_CLINIC.clinicName;
  if (merged.specialty === "Radiologia e Diagnóstico por Imagem") {
    merged.specialty = DEFAULT_CLINIC.specialty;
  }
  return merged;
}
