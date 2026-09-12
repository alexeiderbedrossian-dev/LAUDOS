const SMALL: Record<string, number> = {
  zero: 0,
  um: 1,
  uma: 1,
  dois: 2,
  duas: 2,
  tres: 3,
  três: 3,
  quatro: 4,
  cinco: 5,
  seis: 6,
  sete: 7,
  oito: 8,
  nove: 9,
  dez: 10,
  onze: 11,
  doze: 12,
  treze: 13,
  catorze: 14,
  quatorze: 14,
  quinze: 15,
  dezesseis: 16,
  dezesseis_: 16,
  dezessete: 17,
  dezoito: 18,
  dezenove: 19,
  vinte: 20,
  trinta: 30,
  quarenta: 40,
  cinquenta: 50,
  sessenta: 60,
  setenta: 70,
  oitenta: 80,
  noventa: 90,
  cem: 100,
  cento: 100,
  mil: 1000,
};

export function fold(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();
}

function wordValue(w: string): number | null {
  const k = fold(w);
  if (k in SMALL) return SMALL[k];
  return null;
}

/** Convert spoken Portuguese number phrases to digits inside a string. */
export function wordsToDigits(input: string): string {
  const tokens = input.split(/(\s+)/);
  const out: string[] = [];
  let acc: number | null = null;
  let pendingE = false;

  const flush = () => {
    if (acc != null) {
      out.push(String(acc));
      acc = null;
    }
    pendingE = false;
  };

  for (const tok of tokens) {
    if (/^\s+$/.test(tok)) {
      if (acc == null) out.push(tok);
      continue;
    }
    const raw = tok.replace(/[.,;:]+$/g, "");
    const f = fold(raw);

    if (f === "e" && acc != null) {
      pendingE = true;
      continue;
    }
    if (f === "virgula" || f === "vírgula" || f === "ponto") {
      if (acc != null) {
        out.push(String(acc) + ",");
        acc = null;
        pendingE = false;
      } else {
        out.push(",");
      }
      continue;
    }

    const n = wordValue(raw);
    if (n != null) {
      if (acc == null) acc = n;
      else if (pendingE || (acc >= 20 && n < 10) || (acc >= 100 && n < 100)) {
        acc += n;
        pendingE = false;
      } else if (n === 1000 && acc > 0) {
        acc *= 1000;
      } else {
        flush();
        acc = n;
      }
      continue;
    }

    flush();
    out.push(tok);
  }
  flush();
  return out.join("");
}

export interface ParsedNumber {
  value: number;
  unit: "mm" | "cm" | "m" | "ml" | "cms" | null;
  index: number;
  length: number;
}

const UNIT_RE = "(mm|milimetros?|milímetros?|cm|centimetros?|centímetros?|mL|ml|cms|cm/s|centimetros por segundo)";

export function extractNumbers(text: string): ParsedNumber[] {
  const src = wordsToDigits(text);
  const re = new RegExp(
    String.raw`(\d+(?:[.,]\d+)?)\s*(${UNIT_RE})?`,
    "gi",
  );
  const found: ParsedNumber[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    const raw = m[1].replace(",", ".");
    const value = Number(raw);
    if (!Number.isFinite(value)) continue;
    const u = (m[2] || "").toLowerCase();
    let unit: ParsedNumber["unit"] = null;
    if (u.startsWith("mm") || u.startsWith("mil")) unit = "mm";
    else if (u.startsWith("cm/s") || u.includes("segundo") || u === "cms") unit = "cms";
    else if (u.startsWith("cm") || u.startsWith("cent")) unit = "cm";
    else if (u === "ml" || u === "ml") unit = "ml";
    found.push({ value, unit, index: m.index, length: m[0].length });
  }
  return found;
}

export function convertToUnit(value: number, from: ParsedNumber["unit"], to?: string): number {
  if (!from || !to) return value;
  const t = to.toLowerCase();
  if (from === "mm" && (t === "cm" || t.startsWith("cm"))) return value / 10;
  if (from === "cm" && t === "mm") return value * 10;
  return value;
}

export function extractMeasure3(text: string): [number, number, number] | null {
  const nums = extractNumbers(text);
  if (nums.length < 3) return null;
  // Prefer a cluster of 3 close together
  for (let i = 0; i <= nums.length - 3; i++) {
    const a = nums[i];
    const b = nums[i + 1];
    const c = nums[i + 2];
    if (b.index - (a.index + a.length) < 24 && c.index - (b.index + b.length) < 24) {
      const unit = c.unit || b.unit || a.unit;
      return [
        convertToUnit(a.value, a.unit || unit),
        convertToUnit(b.value, b.unit || unit),
        convertToUnit(c.value, c.unit || unit),
      ];
    }
  }
  return [nums[0].value, nums[1].value, nums[2].value];
}
