import { getExam } from "@/lib/exams";
import type { ExamId, FieldDef, Measure3 } from "@/lib/exams/types";
import { asMeasure } from "@/lib/exams/types";
import { convertToUnit, extractMeasure3, extractNumbers, fold, wordsToDigits } from "./numbers";

export interface ParseResult {
  values: Record<string, unknown>;
  applied: string[];
  note: string;
}

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

function detectSide(chunk: string): "right" | "left" | null {
  const f = fold(chunk);
  if (/\b(esquerd|mie)\b/.test(f)) return "left";
  if (/\b(direit|mid)\b/.test(f)) return "right";
  return null;
}

function collectFields(examId: ExamId): FieldDef[] {
  const exam = getExam(examId);
  if (!exam) return [];
  const out: FieldDef[] = [];
  for (const s of exam.sections) {
    for (const f of s.fields || []) out.push(f);
  }
  return out;
}

function isNormalPhrase(text: string): boolean {
  const f = fold(text);
  return (
    /\bexame normal\b/.test(f) ||
    /\bnormalidade\b/.test(f) ||
    /\bsem alteracoes\b/.test(f) ||
    /\bpadrao de normalidade\b/.test(f)
  );
}

function findAliasIndex(haystackFold: string, aliases: string[]): { index: number; length: number } | null {
  let best: { index: number; length: number } | null = null;
  for (const a of aliases) {
    const k = fold(a);
    if (k.length < 3) continue;
    const i = haystackFold.indexOf(k);
    if (i < 0) continue;
    if (!best || k.length > best.length) best = { index: i, length: k.length };
  }
  return best;
}

function sliceAfterAlias(text: string, aliases: string[], nextStarts: number[]): string {
  const f = fold(text);
  const hit = findAliasIndex(f, aliases);
  if (!hit) return "";
  const from = hit.index + hit.length;
  const later = nextStarts.filter((n) => n > from).sort((a, b) => a - b);
  const to = later[0] ?? text.length;
  return text.slice(from, to);
}

function aliasStarts(text: string, allAliases: string[]): number[] {
  const f = fold(text);
  const starts: number[] = [];
  for (const a of allAliases) {
    const k = fold(a);
    if (k.length < 4) continue;
    let from = 0;
    while (from < f.length) {
      const i = f.indexOf(k, from);
      if (i < 0) break;
      starts.push(i);
      from = i + k.length;
    }
  }
  return starts;
}

function applyMeasure3(slice: string, unit?: string): Measure3 | null {
  const m = extractMeasure3(slice);
  if (!m) return null;
  const nums = extractNumbers(slice);
  const u = nums.find((n) => n.unit)?.unit || nums[0]?.unit || null;
  return {
    a: convertToUnit(m[0], u, unit),
    b: convertToUnit(m[1], u, unit),
    c: convertToUnit(m[2], u, unit),
  };
}

function applyNumber(slice: string, unit?: string): number | null {
  const nums = extractNumbers(slice);
  if (!nums.length) return null;
  const first = nums[0];
  return convertToUnit(first.value, first.unit, unit);
}

function applyFieldFromSlice(
  values: Record<string, unknown>,
  field: FieldDef,
  slice: string,
  applied: string[],
) {
  if (!slice.trim()) return;
  if (field.type === "measure3") {
    const m = applyMeasure3(slice, field.unit);
    if (!m) return;
    values[field.id] = m;
    applied.push(field.label);
    return;
  }
  if (field.type === "number") {
    const n = applyNumber(slice, field.unit);
    if (n == null) return;
    values[field.id] = n;
    applied.push(field.label);
    return;
  }
  if (field.type === "select" && field.options) {
    const f = fold(slice);
    for (const opt of field.options) {
      if (f.includes(fold(opt.label)) || f.includes(fold(opt.value))) {
        values[field.id] = opt.value;
        applied.push(field.label);
        return;
      }
    }
  }
}

function applyThyroidNodule(values: Record<string, unknown>, text: string, applied: string[]) {
  const f = fold(text);
  const re = /nodul\w*/g;
  const matches = [...f.matchAll(re)];
  if (!matches.length) return;

  const list = Array.isArray(values.nodules) ? [...(values.nodules as Record<string, unknown>[])] : [];
  for (const m of matches) {
    const start = m.index ?? 0;
    const slice = text.slice(start, start + 220);
    const sf = fold(slice);
    let local = "ld-med";
    if (/\bistmo\b/.test(sf) && !/lobo/.test(sf)) local = "istmo";
    else if (sf.includes("esquerd")) {
      if (sf.includes("superior")) local = "le-sup";
      else if (sf.includes("inferior")) local = "le-inf";
      else local = "le-med";
    } else if (sf.includes("direit")) {
      if (sf.includes("superior")) local = "ld-sup";
      else if (sf.includes("inferior")) local = "ld-inf";
      else local = "ld-med";
    }
    let composicao = "solido";
    if (sf.includes("cistic") || sf.includes("cisto")) composicao = "cistico";
    else if (sf.includes("misto")) composicao = "misto";
    else if (sf.includes("espong")) composicao = "espongiforme";
    let ecoN = "hipoecoico";
    if (sf.includes("aneco")) ecoN = "anecoico";
    else if (sf.includes("hipereco")) ecoN = "hiperecoico";
    else if (sf.includes("isoeco")) ecoN = "isoecoico";
    else if (sf.includes("muito hipo")) ecoN = "muito-hipo";
    let tirads = "";
    const tr = sf.match(/t[ie]\s*-?\s*rads\s*([1-5])/);
    if (tr) tirads = tr[1];
    const size = applyMeasure3(slice, "mm");
    list.push({
      local,
      size: size || { a: null, b: null, c: null },
      composicao,
      ecoN,
      margens: sf.includes("irregular") ? "irregulares" : "regulares",
      focos: sf.includes("microcalc") ? "micro" : "nenhum",
      tirads,
      nota: "",
    });
    applied.push("Nódulo");
  }
  values.nodules = list;
}

function requireVesselMaps() {
  return {
    ARTERIES: [
      { id: "afc", label: "Femoral comum", aliases: ["femoral comum", "afc"] },
      { id: "afp", label: "Femoral profunda", aliases: ["femoral profunda"] },
      { id: "afs", label: "Femoral superficial", aliases: ["femoral superficial", "afs"] },
      { id: "pop", label: "Poplítea", aliases: ["poplitea", "poplítea"] },
      { id: "ata", label: "Tibial anterior", aliases: ["tibial anterior"] },
      { id: "atp", label: "Tibial posterior", aliases: ["tibial posterior"] },
      { id: "fib", label: "Fibular", aliases: ["fibular"] },
      { id: "ped", label: "Pediosa", aliases: ["pediosa"] },
    ],
    CAROTID_SEGS_LIST: [
      { id: "acc", label: "Carótida comum", aliases: ["carotida comum", "acc"] },
      { id: "bulbo", label: "Bulbo", aliases: ["bulbo"] },
      { id: "aci", label: "Carótida interna", aliases: ["carotida interna", "aci"] },
      { id: "ace", label: "Carótida externa", aliases: ["carotida externa", "ace"] },
      { id: "vert", label: "Vertebral", aliases: ["vertebral"] },
    ],
    ARTERIES_MMSS: [
      { id: "sub", label: "Subclávia", aliases: ["subclavia", "subclávia"] },
      { id: "axi", label: "Axilar", aliases: ["axilar"] },
      { id: "bra", label: "Braquial", aliases: ["braquial", "umeral"] },
      { id: "rad", label: "Radial", aliases: ["radial"] },
      { id: "uln", label: "Ulnar", aliases: ["ulnar", "cubital"] },
    ],
    VEINS_MMSS: [
      { id: "vsub", label: "Subclávia", aliases: ["subclavia"] },
      { id: "vaxi", label: "Axilar", aliases: ["axilar"] },
      { id: "vbra", label: "Braquial", aliases: ["braquial"] },
      { id: "vbas", label: "Basílica", aliases: ["basilica"] },
      { id: "vcef", label: "Cefálica", aliases: ["cefalica"] },
      { id: "vrad", label: "Radial", aliases: ["radial"] },
      { id: "vuln", label: "Ulnar", aliases: ["ulnar"] },
    ],
    GSV_LEVELS: [
      { id: "jsf", label: "Junção safeno-femoral", aliases: ["jsf", "juncao safeno", "crossa"] },
      { id: "coxaP", label: "Coxa proximal", aliases: ["coxa proximal"] },
      { id: "coxaM", label: "Coxa média", aliases: ["coxa media", "coxa média"] },
      { id: "joelho", label: "Joelho", aliases: ["joelho"] },
      { id: "pernaP", label: "Perna proximal", aliases: ["perna proximal"] },
      { id: "pernaM", label: "Perna média", aliases: ["perna media"] },
      { id: "maleolo", label: "Maléolo", aliases: ["maleolo", "tornozelo"] },
    ],
  };
}

function applyVascular(examId: ExamId, values: Record<string, unknown>, chunk: string, applied: string[]) {
  const f = fold(chunk);
  const side = detectSide(chunk) || "right";
  const sideKey =
    examId === "venosa-mmii" || examId === "venoso-mmss"
      ? side === "right"
        ? "rightDeep"
        : "leftDeep"
      : side;

  if (examId === "arterial-mmii" || examId === "carotidas" || examId === "arterial-mmss") {
    const { ARTERIES, CAROTID_SEGS_LIST, ARTERIES_MMSS } = requireVesselMaps();
    const segs = examId === "carotidas" ? CAROTID_SEGS_LIST : examId === "arterial-mmss" ? ARTERIES_MMSS : ARTERIES;
    for (const seg of segs) {
      if (!seg.aliases.some((a) => f.includes(fold(a))) && !f.includes(fold(seg.label))) continue;
      const block = { ...((values[side] as Record<string, unknown>) || {}) };
      const cur = { ...((block[seg.id] as Record<string, unknown>) || {}) };
      const nums = extractNumbers(chunk);
      if (nums.length) cur.psv = nums[0].value;
      if (/\bedv\b/.test(f) && nums.length > 1) cur.edv = nums[1].value;
      if (f.includes("trifas")) cur.wave = "trifasica";
      else if (f.includes("bifas")) cur.wave = "bifasica";
      else if (f.includes("monofas")) cur.wave = "monofasica";
      else if (f.includes("oclus") || f.includes("ausente")) {
        cur.wave = "ausente";
        cur.stenosis = "oclusa";
      }
      if (f.includes("maior que 70") || f.includes(">70") || f.includes("maior de 70")) cur.stenosis = ">70";
      else if (f.includes("50") && f.includes("70")) cur.stenosis = "50-70";
      else if (f.includes("sem estenose")) cur.stenosis = "0";
      block[seg.id] = cur;
      values[side] = block;
      applied.push(`${seg.label} ${side === "right" ? "D" : "E"}`);
    }
  }

  if (examId === "mapeamento-venoso") {
    const { GSV_LEVELS } = requireVesselMaps();
    const block = { ...((values[side] as Record<string, unknown>) || {}) };
    for (const lv of GSV_LEVELS) {
      if (!lv.aliases.some((a) => f.includes(fold(a))) && !f.includes(fold(lv.label))) continue;
      const cur = { ...((block[lv.id] as Record<string, unknown>) || {}) };
      const nums = extractNumbers(chunk);
      if (nums.length) cur.diam = convertToUnit(nums[0].value, nums[0].unit, "mm");
      if (f.includes("incompet") || f.includes("refluxo")) cur.incompetente = true;
      if (f.includes("refluxo") && nums.length > 1) cur.refluxo = nums[nums.length - 1].value;
      block[lv.id] = cur;
      values[side] = block;
      applied.push(`${lv.label} ${side === "right" ? "D" : "E"}`);
    }
    if (/\bperfurante\b/.test(f) || /\bcockett\b/.test(f) || /\bboyd\b/.test(f)) {
      const nums = extractNumbers(chunk);
      const list = Array.isArray(values.perforators) ? [...(values.perforators as Record<string, unknown>[])] : [];
      list.push({
        nome: f.includes("cockett") ? "Cockett" : f.includes("boyd") ? "Boyd" : f.includes("dodd") ? "Dodd" : "Perfurante",
        lado: side === "right" ? "direita" : "esquerda",
        dist: nums.find((n) => n.unit === "cm")?.value ?? nums[0]?.value ?? null,
        diam: nums.find((n) => n.unit === "mm")?.value ?? (nums.length > 1 ? nums[1].value : null),
        refluxo: f.includes("refluxo"),
      });
      values.perforators = list;
      applied.push("Perfurante");
    }
  }

  if (examId === "venosa-mmii" || examId === "venoso-mmss") {
    if (f.includes("tvp") || f.includes("nao compressivel") || f.includes("não compressivel")) {
      const deep = { ...((values[sideKey] as Record<string, unknown>) || {}) };
      const { VEINS_MMSS } = requireVesselMaps();
      const target =
        examId === "venoso-mmss"
          ? VEINS_MMSS.find((v) => v.aliases.some((a) => f.includes(fold(a))) || f.includes(fold(v.label)))?.id || "vaxi"
          : f.includes("poplit")
            ? "vpop"
            : f.includes("femoral comum")
              ? "vfc"
              : "vf";
      deep[target] = { status: "tvp", refluxo: null, diam: null };
      values[sideKey] = deep;
      applied.push("TVP");
    }
  }
}

export function parseLocal(
  examId: ExamId,
  transcript: string,
  current: Record<string, unknown>,
): ParseResult {
  const exam = getExam(examId);
  const values = clone(current);
  const applied: string[] = [];
  const text = wordsToDigits(transcript);

  if (exam && isNormalPhrase(transcript)) {
    const next = exam.applyNormal(values, {
      name: "",
      birthDate: "",
      sex: "",
      examDate: "",
      requester: "",
      indication: "",
      record: "",
    });
    return { values: next, applied: ["Padrão de normalidade"], note: "Aplicado o modelo de exame normal." };
  }

  const fields = collectFields(examId).filter((f) => f.type !== "list" && f.type !== "text");
  const allAliases = [
    ...fields.flatMap((f) => [f.label, ...(f.aliases || [])]),
    "nódulo",
    "nodulo",
    "nodulos",
    "perfurante",
    "tirads",
  ];
  const starts = aliasStarts(text, allAliases);

  for (const field of fields) {
    const aliases = [field.label, ...(field.aliases || [])];
    const slice = sliceAfterAlias(text, aliases, starts);
    if (slice) applyFieldFromSlice(values, field, slice, applied);
  }

  if (examId === "tireoide") applyThyroidNodule(values, text, applied);

  const chunks = text
    .split(/[.;\n]/)
    .map((c) => c.trim())
    .filter((c) => c.length > 3);
  for (const chunk of chunks.length ? chunks : [text]) {
    applyVascular(examId, values, chunk, applied);
  }

  return {
    values,
    applied: [...new Set(applied)],
    note: applied.length
      ? `Preenchido: ${[...new Set(applied)].join(", ")}.`
      : "Não reconheci medidas neste trecho — tente nomear a estrutura e os três eixos, por exemplo: «lobo direito 4,8 por 1,6 por 1,4».",
  };
}

export function mergeValues(
  base: Record<string, unknown>,
  patch: Record<string, unknown>,
): Record<string, unknown> {
  const out = clone(base);
  for (const [k, v] of Object.entries(patch)) {
    if (v && typeof v === "object" && !Array.isArray(v) && "a" in (v as object)) {
      out[k] = { ...asMeasure(out[k]), ...(v as object) };
    } else if (v && typeof v === "object" && !Array.isArray(v)) {
      const prev = (out[k] && typeof out[k] === "object" && !Array.isArray(out[k]) ? out[k] : {}) as Record<
        string,
        unknown
      >;
      out[k] = mergeValues(prev, v as Record<string, unknown>);
    } else {
      out[k] = v;
    }
  }
  return out;
}
