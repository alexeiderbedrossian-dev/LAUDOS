import { fmtNum, joinSentences, sentence } from "@/lib/format";
import { asNum, asStr, type ExamDefinition } from "./types";

export const ARTERIES = [
  { id: "afc", label: "Femoral comum", aliases: ["femoral comum", "afc"] },
  { id: "afp", label: "Femoral profunda", aliases: ["femoral profunda", "afp"] },
  { id: "afs", label: "Femoral superficial", aliases: ["femoral superficial", "afs"] },
  { id: "pop", label: "Poplítea", aliases: ["poplitea", "poplítea"] },
  { id: "ata", label: "Tibial anterior", aliases: ["tibial anterior", "ata"] },
  { id: "atp", label: "Tibial posterior", aliases: ["tibial posterior", "atp"] },
  { id: "fib", label: "Fibular", aliases: ["fibular", "peroneira"] },
  { id: "ped", label: "Pediosa", aliases: ["pediosa", "dorsal do pe"] },
] as const;

export const VEINS_DEEP = [
  { id: "vfc", label: "Femoral comum", aliases: ["femoral comum", "vfc"] },
  { id: "vf", label: "Femoral superficial", aliases: ["veia femoral", "femoral", "femoral superficial"] },
  { id: "vpop", label: "Poplítea", aliases: ["poplitea", "poplítea"] },
  { id: "vtib", label: "Tibiais posteriores", aliases: ["tibiais", "tibial", "tibiais posteriores"] },
  { id: "vfib", label: "Fibulares", aliases: ["fibular", "fibulares", "peroneira"] },
  { id: "vsur", label: "Surais", aliases: ["sural", "surais"] },
  { id: "vgast", label: "Gastrocnêmias", aliases: ["gastrocnemias", "gastrocnêmias", "gastrocnemio"] },
] as const;

export const ARTERIES_MMSS = [
  { id: "sub", label: "Subclávia", aliases: ["subclavia", "subclávia"] },
  { id: "axi", label: "Axilar", aliases: ["axilar"] },
  { id: "bra", label: "Braquial", aliases: ["braquial", "umeral"] },
  { id: "rad", label: "Radial", aliases: ["radial"] },
  { id: "uln", label: "Ulnar", aliases: ["ulnar", "cubital"] },
] as const;

export const VEINS_MMSS = [
  { id: "vsub", label: "Subclávia", aliases: ["subclavia", "subclávia"] },
  { id: "vaxi", label: "Axilar", aliases: ["axilar"] },
  { id: "vbra", label: "Braquial", aliases: ["braquial"] },
  { id: "vbas", label: "Basílica", aliases: ["basilica", "basílica"] },
  { id: "vcef", label: "Cefálica", aliases: ["cefalica", "cefálica"] },
  { id: "vrad", label: "Radial", aliases: ["radial"] },
  { id: "vuln", label: "Ulnar", aliases: ["ulnar"] },
] as const;

export const WAVES = [
  { value: "trifasica", label: "Trifásica" },
  { value: "bifasica", label: "Bifásica" },
  { value: "monofasica", label: "Monofásica" },
  { value: "ausente", label: "Ausente / oclusa" },
];

export const STENOSIS = [
  { value: "0", label: "Sem estenose" },
  { value: "<50", label: "< 50%" },
  { value: "50-70", label: "50–70%" },
  { value: ">70", label: "> 70%" },
  { value: "oclusa", label: "Oclusa" },
];

export const VEIN_STATUS = [
  { value: "livre", label: "Livre, compressível" },
  { value: "refluxo", label: "Refluxo" },
  { value: "tvp", label: "TVP (não compressível)" },
  { value: "parcial", label: "Trombose parcial / residual" },
];

export const GSV_LEVELS = [
  { id: "jsf", label: "Junção safeno-femoral", aliases: ["jsf", "juncao safeno femoral", "crossa"] },
  { id: "coxaP", label: "Coxa proximal", aliases: ["coxa proximal", "safena na coxa proximal"] },
  { id: "coxaM", label: "Coxa média", aliases: ["coxa media", "coxa média"] },
  { id: "joelho", label: "Joelho", aliases: ["joelho", "safena no joelho"] },
  { id: "pernaP", label: "Perna proximal", aliases: ["perna proximal"] },
  { id: "pernaM", label: "Perna média", aliases: ["perna media"] },
  { id: "maleolo", label: "Maléolo", aliases: ["maleolo", "maléolo", "tornozelo"] },
] as const;

function emptyVesselArterial() {
  return { psv: null as number | null, edv: null as number | null, wave: "trifasica", stenosis: "0" };
}
function emptyVein() {
  return { status: "livre", refluxo: null as number | null, diam: null as number | null };
}
function emptyLevel() {
  return { diam: null as number | null, refluxo: null as number | null, incompetente: false };
}

function sideBlock<T>(factory: () => T, keys: readonly { id: string }[]): Record<string, T> {
  const o: Record<string, T> = {};
  for (const k of keys) o[k.id] = factory();
  return o;
}

export const ARTERIAL: ExamDefinition = {
  id: "arterial-mmii",
  title: "Arterial de MMII",
  printTitle: "ECODOPPLER COLORIDO ARTERIAL DE MEMBROS INFERIORES",
  short: "PSV, onda, estenose",
  group: "vascular",
  blurb: "Eixo aorto-ilíaco-femoro-poplíteo-distal, com velocidades e morfologia de onda.",
  technique:
    "Ecodoppler colorido e espectral das artérias dos membros inferiores, com avaliação anatômica e hemodinâmica.",
  dictationHints: [
    "femoral comum direita PSV 90, trifásica",
    "femoral superficial esquerda monofásica, estenose maior que 70",
    "poplítea direita oclusa",
    "exame normal",
  ],
  sections: [{ id: "table", title: "Eixos arteriais", kind: "vessel-table" }],
  defaults: () => ({
    right: sideBlock(emptyVesselArterial, ARTERIES),
    left: sideBlock(emptyVesselArterial, ARTERIES),
    itbD: null,
    itbE: null,
    notes: "",
  }),
  applyNormal: (v) => {
    const fill = () => sideBlock(() => ({ psv: null, edv: null, wave: "trifasica", stenosis: "0" }), ARTERIES);
    return { ...v, right: fill(), left: fill(), itbD: null, itbE: null };
  },
  findings: (values) => {
    const titles: Record<string, string> = {
      afc: "Artéria Femoral Comum",
      afp: "Artéria Femoral Profunda",
      afs: "Artéria Femoral Superficial",
      pop: "Artéria Poplítea",
      ata: "Artéria Tibial Anterior",
      atp: "Artéria Tibial Posterior",
      fib: "Artéria Fibular",
      ped: "Artéria Pediosa",
    };
    const reportIds = ["afc", "afp", "afs", "pop", "ata", "atp", "fib"];
    const artLine = (id: string, x: Record<string, unknown>) => {
      const title = titles[id] || id;
      const psv = asNum(x.psv);
      const edv = asNum(x.edv);
      const wave = asStr(x.wave) || "trifasica";
      const st = asStr(x.stenosis) || "0";
      const vel =
        psv != null
          ? ` PSV ${fmtNum(psv, 0)} cm/s${edv != null ? ", EDV " + fmtNum(edv, 0) + " cm/s" : ""}.`
          : "";
      if (st === "oclusa" || wave === "ausente") {
        return `${title}: Ocluída, sem fluxo detectável.${vel}`;
      }
      const stTxt: Record<string, string> = {
        "<50": "estenose < 50%",
        "50-70": "estenose de 50–70%",
        ">70": "estenose > 70%",
      };
      if (st !== "0") {
        const fluxo =
          wave === "monofasica"
            ? "Fluxo monofásico, com turbilhonamento e aumento focal de velocidades."
            : wave === "bifasica"
              ? "Fluxo bifásico, com turbilhonamento."
              : "Fluxo com turbilhonamento e aumento focal de velocidades.";
        return `${title}: Pérvia, com redução do calibre (${stTxt[st] || st}). ${fluxo}${vel}`;
      }
      if (wave === "monofasica" || wave === "bifasica") {
        return `${title}: Pérvia, com diâmetros preservados. Fluxo ${wave === "monofasica" ? "monofásico" : "bifásico"}, sem oclusão.${vel}`;
      }
      return `${title}: Pérvia, com diâmetros preservados e paredes regulares. Fluxo laminar sem turbilhonamento ou aumento focal de velocidades.${vel}`;
    };
    const side = (titulo: string, block: unknown) => {
      const b = (block || {}) as Record<string, Record<string, unknown>>;
      const lines = reportIds.map((id) => artLine(id, b[id] || {}));
      const ped = b.ped || {};
      const pedAbn =
        asNum(ped.psv) != null ||
        (asStr(ped.wave) && asStr(ped.wave) !== "trifasica") ||
        (asStr(ped.stenosis) && asStr(ped.stenosis) !== "0");
      if (pedAbn) lines.push(artLine("ped", ped));
      return [titulo, "", ...lines].join("\n");
    };
    const itbD = asNum(values.itbD);
    const itbE = asNum(values.itbE);
    const itb =
      itbD != null || itbE != null
        ? `Índice tornozelo-braço: ${itbD != null ? "direito " + fmtNum(itbD, 2) : ""}${itbD != null && itbE != null ? "; " : ""}${itbE != null ? "esquerdo " + fmtNum(itbE, 2) : ""}.`
        : "";
    return joinSentences([
      "Avaliação anatômica e hemodinâmica das artérias femoral comum, femoral profunda, femoral superficial, poplítea, tibial anterior, tibial posterior e fibular bilateralmente.",
      side("MEMBRO INFERIOR DIREITO:", values.right),
      side("MEMBRO INFERIOR ESQUERDO:", values.left),
      itb,
      asStr(values.notes),
    ]);
  },
  conclusion: (values) => {
    const scan = (block: unknown) => {
      const b = (block || {}) as Record<string, Record<string, unknown>>;
      let worst = "0";
      const order = ["0", "<50", "50-70", ">70", "oclusa"];
      for (const a of ARTERIES) {
        const st = asStr(b[a.id]?.stenosis);
        const wave = asStr(b[a.id]?.wave);
        if (wave === "ausente") return "oclusa";
        if (order.indexOf(st) > order.indexOf(worst)) worst = st;
      }
      return worst;
    };
    const wr = scan(values.right);
    const wl = scan(values.left);
    if ((wr === "0" || !wr) && (wl === "0" || !wl)) {
      return "Ecodoppler arterial de membros inferiores sem alterações.";
    }
    const label: Record<string, string> = {
      "0": "sem alterações hemodinamicamente significativas",
      "<50": "ateromatose com estenose < 50%",
      "50-70": "estenose moderada (50–70%)",
      ">70": "estenose significativa (> 70%)",
      oclusa: "oclusão arterial",
    };
    return [`Membro inferior direito: ${label[wr]}.`, `Membro inferior esquerdo: ${label[wl]}.`].join("\n");
  },
};

export const VENOSA: ExamDefinition = {
  id: "venosa-mmii",
  title: "Venoso de MMII",
  printTitle: "DUPLEX SCAN VENOSO DOS MEMBROS INFERIORES",
  short: "TVP, refluxo, compressão",
  group: "vascular",
  blurb: "Sistema profundo e superficial: compressibilidade, fluxo e refluxo.",
  technique:
    "Estudo duplex scan venoso dos membros inferiores com transdutor linear, compressão sistemática e Doppler colorido e espectral.",
  dictationHints: [
    "sistema profundo livre bilateral",
    "femoral comum esquerda não compressível, TVP",
    "refluxo na safena magna direita de 2 segundos",
    "exame normal",
  ],
  sections: [
    { id: "table", title: "Eixos venosos", kind: "vessel-table" },
    {
      id: "ecto",
      title: "Ectoscopia",
      fields: [
        {
          id: "ectoscopia",
          label: "Telangiectasias / varizes",
          type: "select",
          options: [
            { value: "esparsas", label: "Telangiectasias e varizes subdérmicas esparsas" },
            { value: "ausentes", label: "Sem telangiectasias ou varizes" },
            { value: "varizes", label: "Varizes evidentes" },
          ],
          aliases: ["telangiectasia", "varizes", "ectoscopia"],
        },
        { id: "notes", label: "Observações", type: "text", span: 2 },
      ],
    },
  ],
  defaults: () => ({
    rightDeep: sideBlock(emptyVein, VEINS_DEEP),
    leftDeep: sideBlock(emptyVein, VEINS_DEEP),
    vsmD: emptyVein(),
    vsmE: emptyVein(),
    vspD: emptyVein(),
    vspE: emptyVein(),
    ectoscopia: "esparsas",
    notes: "",
  }),
  applyNormal: (v) => ({
    ...v,
    rightDeep: sideBlock(() => ({ status: "livre", refluxo: 0, diam: null }), VEINS_DEEP),
    leftDeep: sideBlock(() => ({ status: "livre", refluxo: 0, diam: null }), VEINS_DEEP),
    vsmD: { status: "livre", refluxo: 0, diam: null },
    vsmE: { status: "livre", refluxo: 0, diam: null },
    vspD: { status: "livre", refluxo: 0, diam: null },
    vspE: { status: "livre", refluxo: 0, diam: null },
    ectoscopia: "esparsas",
  }),
  findings: (values) => {
    const tvpLike = (st: string) => st === "tvp" || st === "parcial";
    const ecto = asStr(values.ectoscopia);
    const ectoLine =
      ecto === "ausentes"
        ? ""
        : ecto === "varizes"
          ? "Varizes evidentes à ectoscopia."
          : "Telangiectasias e varizes subdérmicas esparsas, conforme ectoscopia.";

    const limb = (titulo: string, deep: unknown, vsm: unknown, vsp: unknown) => {
      const axialIds = ["vfc", "vf", "vpop", "vtib", "vfib"] as const;
      const calfIds = ["vsur", "vgast"] as const;
      const b = (deep || {}) as Record<string, Record<string, unknown>>;
      const name: Record<string, string> = {
        vfc: "femoral comum",
        vf: "femoral superficial",
        vpop: "poplítea",
        vtib: "tibiais posteriores",
        vfib: "fibulares",
        vsur: "surais",
        vgast: "gastrocnêmias",
      };
      const listTvp = (ids: readonly string[]) =>
        ids.filter((id) => tvpLike(asStr(b[id]?.status))).map((id) => name[id]);
      const axialTvp = listTvp(axialIds);
      const calfTvp = listTvp(calfIds);
      const axial =
        axialTvp.length === 0
          ? "As veias femorais comum e superficial, poplítea, tibiais posteriores e fibulares são compressíveis em toda a sua extensão, não tendo sido observadas imagens sugestivas de trombose venosa recente ou antiga."
          : sentence(
              `As veias ${axialTvp.join(", ")} não são compressíveis, com imagens sugestivas de trombose venosa. As demais veias do eixo femoro-poplíteo-distal são compressíveis em toda a sua extensão`,
            );
      const calf =
        calfTvp.length === 0
          ? "As veias surais e gastrocnêmias são compressíveis em toda a sua extensão, não tendo sido observadas imagens sugestivas de trombose venosa recente ou antiga."
          : sentence(
              `As veias ${calfTvp.join(" e ")} não são compressíveis, com imagens sugestivas de trombose. As demais veias da panturrilha são compressíveis`,
            );
      const anyTvp = axialTvp.length + calfTvp.length > 0;
      const fluxo = anyTvp
        ? "O fluxo no sistema venoso profundo encontra-se alterado no território acometido."
        : "O fluxo em todo sistema venoso profundo é espontâneo, fásico com a respiração e responde adequadamente às manobras de compressão, indicando patência.";

      const svsm = (vsm || {}) as Record<string, unknown>;
      const svsp = (vsp || {}) as Record<string, unknown>;
      const sTvp = tvpLike(asStr(svsm.status)) || tvpLike(asStr(svsp.status));
      const sRefl = asStr(svsm.status) === "refluxo" || asStr(svsp.status) === "refluxo";
      let superficial =
        "As veias safenas magna e parva são compressíveis em toda a sua extensão, indicando patência.";
      if (sTvp) {
        const bits = [];
        if (tvpLike(asStr(svsm.status))) bits.push("safena magna não compressível, com sinais de trombose");
        if (tvpLike(asStr(svsp.status))) bits.push("safena parva não compressível, com sinais de trombose");
        superficial = sentence("Sistema venoso superficial: " + bits.join("; "));
      } else if (sRefl) {
        const bits = [];
        if (asStr(svsm.status) === "refluxo")
          bits.push(
            `safena magna com refluxo${asNum(svsm.refluxo) != null ? " de " + fmtNum(asNum(svsm.refluxo), 1) + " s" : ""}`,
          );
        if (asStr(svsp.status) === "refluxo")
          bits.push(
            `safena parva com refluxo${asNum(svsp.refluxo) != null ? " de " + fmtNum(asNum(svsp.refluxo), 1) + " s" : ""}`,
          );
        superficial = sentence("Sistema venoso superficial: " + bits.join("; ") + ". Compressíveis em toda a extensão");
      }

      return [
        titulo,
        "",
        "SISTEMA VENOSO PROFUNDO",
        axial,
        calf,
        fluxo,
        "",
        "SISTEMA VENOSO SUPERFICIAL",
        superficial,
        ectoLine,
      ]
        .filter((l) => l !== undefined)
        .join("\n");
    };

    return joinSentences([
      limb("MEMBRO INFERIOR DIREITO", values.rightDeep, values.vsmD, values.vspD),
      limb("MEMBRO INFERIOR ESQUERDO", values.leftDeep, values.vsmE, values.vspE),
      asStr(values.notes),
    ]);
  },
  conclusion: (values) => {
    const hasTvp = (block: unknown) => {
      const b = (block || {}) as Record<string, Record<string, unknown>>;
      return Object.values(b).some((x) => asStr(x?.status) === "tvp" || asStr(x?.status) === "parcial");
    };
    const supTvp = [values.vsmD, values.vsmE, values.vspD, values.vspE].some((v) => {
      const st = asStr((v as Record<string, unknown> | undefined)?.status);
      return st === "tvp" || st === "parcial";
    });
    const reflux = [values.vsmD, values.vsmE, values.vspD, values.vspE].some(
      (v) => asStr((v as Record<string, unknown> | undefined)?.status) === "refluxo",
    );
    const lines: string[] = [];
    if (hasTvp(values.rightDeep) || hasTvp(values.leftDeep) || supTvp) {
      lines.push("Sinais de trombose venosa — ver território acometido no relatório.");
    } else {
      lines.push("Não há sinais de trombose venosa profunda ou superficial nos membros inferiores.");
    }
    if (reflux) lines.push("Refluxo no sistema venoso superficial — ver descrição.");
    const ecto = asStr(values.ectoscopia);
    if (ecto === "varizes") lines.push("Varizes evidentes à ectoscopia.");
    else if (ecto !== "ausentes") lines.push("Telangiectasias e varizes subdérmicas esparsas, conforme ectoscopia.");
    return lines.join("\n");
  },
};

export const MAPEAMENTO: ExamDefinition = {
  id: "mapeamento-venoso",
  title: "Mapeamento venoso",
  printTitle: "MAPEAMENTO VENOSO DOS MEMBROS INFERIORES",
  short: "Safenas, perfurantes, diâmetros",
  group: "vascular",
  blurb: "Planejamento cirúrgico: JSF, VSM, VSP, perfurantes e refluxo.",
  technique:
    "Mapeamento venoso com Doppler, em ortostase, dos sistemas superficial e perfurante, com medidas de diâmetro e tempo de refluxo nos pontos de interesse cirúrgico.",
  dictationHints: [
    "JSF direita incompetente, 8 milímetros, refluxo de 2 segundos",
    "safena magna na coxa média 5 milímetros",
    "perfurante de Cockett a 12 centímetros do maléolo, 4 milímetros, com refluxo",
    "exame normal",
  ],
  sections: [{ id: "map", title: "Mapeamento", kind: "mapping" }],
  defaults: () => ({
    right: sideBlock(emptyLevel, GSV_LEVELS),
    left: sideBlock(emptyLevel, GSV_LEVELS),
    vspD: emptyLevel(),
    vspE: emptyLevel(),
    jspD: emptyLevel(),
    jspE: emptyLevel(),
    perforators: [] as Record<string, unknown>[],
    profundo: "livre",
    notes: "",
  }),
  applyNormal: (v) => ({
    ...v,
    right: sideBlock(() => ({ diam: 3.5, refluxo: 0, incompetente: false }), GSV_LEVELS),
    left: sideBlock(() => ({ diam: 3.5, refluxo: 0, incompetente: false }), GSV_LEVELS),
    vspD: { diam: 2.5, refluxo: 0, incompetente: false },
    vspE: { diam: 2.5, refluxo: 0, incompetente: false },
    jspD: { diam: 3, refluxo: 0, incompetente: false },
    jspE: { diam: 3, refluxo: 0, incompetente: false },
    perforators: [],
    profundo: "livre",
  }),
  findings: (values) => {
    const levels = (lado: string, block: unknown) => {
      const b = (block || {}) as Record<string, Record<string, unknown>>;
      const parts = GSV_LEVELS.map((lv) => {
        const x = b[lv.id] || {};
        const d = asNum(x.diam);
        const r = asNum(x.refluxo);
        const inc = x.incompetente === true || (r != null && r >= 0.5);
        if (d == null && !inc) return "";
        return `${lv.label}: ${d != null ? fmtNum(d, 1) + " mm" : ""}${inc ? ", incompetente" : ", competente"}${r != null && r > 0 ? ", refluxo " + fmtNum(r, 1) + " s" : ""}`;
      }).filter(Boolean);
      if (!parts.length) return `Veia safena magna ${lado}: calibre habitual e competente em todo o trajeto.`;
      return `Veia safena magna ${lado}: ${parts.join("; ")}.`;
    };
    const parva = (lado: string, jsp: unknown, vsp: unknown) => {
      const j = (jsp || {}) as Record<string, unknown>;
      const v = (vsp || {}) as Record<string, unknown>;
      const jd = asNum(j.diam);
      const vd = asNum(v.diam);
      const inc = j.incompetente === true || v.incompetente === true;
      if (jd == null && vd == null && !inc) return `Safena parva ${lado}: competente.`;
      return sentence(
        `Safena parva ${lado}${jd ? ", JSP " + fmtNum(jd, 1) + " mm" : ""}${vd ? ", trajeto " + fmtNum(vd, 1) + " mm" : ""}${inc ? ", incompetente" : ", competente"}`,
      );
    };
    const perfs = Array.isArray(values.perforators) ? (values.perforators as Record<string, unknown>[]) : [];
    const perfTxt = perfs.length
      ? "Perfurantes: " +
        perfs
          .map((p) => {
            const d = asNum(p.diam);
            const dist = asNum(p.dist);
            return `${asStr(p.nome) || "perfurante"} ${asStr(p.lado) || ""} ${dist != null ? "a " + fmtNum(dist, 0) + " cm do maléolo" : ""} ${d != null ? "(" + fmtNum(d, 1) + " mm)" : ""}${p.refluxo ? ", com refluxo" : ""}`;
          })
          .join("; ") +
        "."
      : "Não se identificam perfurantes incompetentes de relevo cirúrgico neste exame.";
    const prof =
      asStr(values.profundo) === "livre"
        ? "Sistema venoso profundo pérvio e competente."
        : sentence("Sistema profundo: " + asStr(values.profundo));
    return joinSentences([
      levels("direita", values.right),
      levels("esquerda", values.left),
      parva("direita", values.jspD, values.vspD),
      parva("esquerda", values.jspE, values.vspE),
      perfTxt,
      prof,
      asStr(values.notes),
    ]);
  },
  conclusion: (values) => {
    const inc = (block: unknown) => {
      const b = (block || {}) as Record<string, Record<string, unknown>>;
      return GSV_LEVELS.some((lv) => b[lv.id]?.incompetente === true || (asNum(b[lv.id]?.refluxo) ?? 0) >= 0.5);
    };
    const lines: string[] = [];
    lines.push(inc(values.right) ? "Insuficiência da VSM à direita — ver diâmetros e refluxo." : "VSM direita competente.");
    lines.push(inc(values.left) ? "Insuficiência da VSM à esquerda — ver diâmetros e refluxo." : "VSM esquerda competente.");
    const perfs = Array.isArray(values.perforators) ? values.perforators.length : 0;
    lines.push(perfs ? `${perfs} perfurante(s) de interesse mapeada(s).` : "Sem perfurantes incompetentes relevantes.");
    lines.push("Sistema profundo sem sinais de TVP neste exame.");
    return lines.map((l) => "• " + l).join("\n");
  },
};

const CAROTID_SEGS = [
  { id: "acc", label: "Carótida comum", aliases: ["carotida comum", "acc"] },
  { id: "bulbo", label: "Bulbo", aliases: ["bulbo"] },
  { id: "aci", label: "Carótida interna", aliases: ["carotida interna", "aci", "interna"] },
  { id: "ace", label: "Carótida externa", aliases: ["carotida externa", "ace", "externa"] },
  { id: "vert", label: "Vertebral", aliases: ["vertebral"] },
] as const;

export const CAROTID_SEGS_LIST = CAROTID_SEGS;

export const CAROTIDAS: ExamDefinition = {
  id: "carotidas",
  title: "Doppler de carótidas",
  printTitle: "ULTRASSONOGRAFIA DOPPLER DE CARÓTIDAS E VERTEBRAIS",
  short: "PSV, placa, estenose",
  group: "vascular",
  blurb: "Carótidas extra-cranianas e vertebrais, com velocidades e placas.",
  technique:
    "Estudo Doppler colorido e espectral das artérias carótidas extra-cranianas e vertebrais, com registro de PSV/EDV e caracterização de placas.",
  dictationHints: [
    "carótida interna direita PSV 80, sem estenose",
    "placa no bulbo esquerdo, estenose 50 a 70, PSV 180",
    "vertebrais com fluxo anterógrado",
    "exame normal",
  ],
  sections: [{ id: "table", title: "Eixos", kind: "vessel-table" }],
  defaults: () => ({
    right: sideBlock(emptyVesselArterial, CAROTID_SEGS),
    left: sideBlock(emptyVesselArterial, CAROTID_SEGS),
    placaD: "",
    placaE: "",
    notes: "",
  }),
  applyNormal: (v) => ({
    ...v,
    right: sideBlock(() => ({ psv: 70, edv: 20, wave: "trifasica", stenosis: "0" }), CAROTID_SEGS),
    left: sideBlock(() => ({ psv: 70, edv: 20, wave: "trifasica", stenosis: "0" }), CAROTID_SEGS),
    placaD: "",
    placaE: "",
  }),
  findings: (values) => {
    const side = (label: string, block: unknown, placa: string) => {
      const b = (block || {}) as Record<string, Record<string, unknown>>;
      const bits = CAROTID_SEGS.map((s) => {
        const x = b[s.id] || {};
        const psv = asNum(x.psv);
        const st = asStr(x.stenosis);
        if (!psv && (st === "0" || !st)) return "";
        return `${s.label}: PSV ${psv != null ? fmtNum(psv, 0) + " cm/s" : "—"}${st && st !== "0" ? ", estenose " + st : ""}`;
      }).filter(Boolean);
      const placaTxt = placa ? ` Placa: ${placa}.` : " Sem placas hemodinamicamente significativas.";
      if (!bits.length) {
        return `${label}: carótidas pérvias, com velocidades habituais, sem estenose hemodinamicamente significativa.${placaTxt} Artéria vertebral com fluxo anterógrado.`;
      }
      return `${label}: ${bits.join("; ")}.${placaTxt}`;
    };
    return joinSentences([
      side("Lado direito", values.right, asStr(values.placaD)),
      side("Lado esquerdo", values.left, asStr(values.placaE)),
      asStr(values.notes),
    ]);
  },
  conclusion: (values) => {
    const worst = (block: unknown) => {
      const b = (block || {}) as Record<string, Record<string, unknown>>;
      const order = ["0", "<50", "50-70", ">70", "oclusa"];
      let w = "0";
      for (const s of CAROTID_SEGS) {
        const st = asStr(b[s.id]?.stenosis);
        if (order.indexOf(st) > order.indexOf(w)) w = st;
      }
      return w;
    };
    const map: Record<string, string> = {
      "0": "sem estenose hemodinamicamente significativa",
      "<50": "ateromatose com estenose < 50% (NASCET)",
      "50-70": "estenose de 50–70% (NASCET)",
      ">70": "estenose > 70% (NASCET)",
      oclusa: "oclusão",
    };
    return [
      `• Carótida direita: ${map[worst(values.right)]}.`,
      `• Carótida esquerda: ${map[worst(values.left)]}.`,
      "• Vertebrais com fluxo anterógrado, sem roubo evidente neste exame.",
    ].join("\n");
  },
};

export const ARTERIAL_MMSS: ExamDefinition = {
  id: "arterial-mmss",
  title: "Arterial de MMSS",
  printTitle: "ULTRASSONOGRAFIA DOPPLER ARTERIAL DOS MEMBROS SUPERIORES",
  short: "PSV, onda, estenose",
  group: "vascular",
  blurb: "Eixo subclávio-axilar-braquial-radial-ulnar, com velocidades e onda.",
  technique:
    "Estudo Doppler colorido e espectral das artérias dos membros superiores, com registro de PSV, EDV e morfologia de onda nos eixos subclávio, axilar, braquial, radial e ulnar.",
  dictationHints: [
    "subclávia direita PSV 90, trifásica",
    "radial esquerda monofásica",
    "exame normal",
  ],
  sections: [{ id: "table", title: "Eixos arteriais", kind: "vessel-table" }],
  defaults: () => ({
    right: sideBlock(emptyVesselArterial, ARTERIES_MMSS),
    left: sideBlock(emptyVesselArterial, ARTERIES_MMSS),
    notes: "",
  }),
  applyNormal: (v) => {
    const fill = () =>
      sideBlock(() => ({ psv: 70, edv: 12, wave: "trifasica", stenosis: "0" }), ARTERIES_MMSS);
    return { ...v, right: fill(), left: fill() };
  },
  findings: (values) => {
    const describe = (sideLabel: string, block: unknown) => {
      const b = (block || {}) as Record<string, Record<string, unknown>>;
      const bits: string[] = [];
      for (const a of ARTERIES_MMSS) {
        const x = b[a.id] || {};
        const psv = asNum(x.psv);
        const wave = asStr(x.wave);
        const st = asStr(x.stenosis);
        if (!psv && wave === "trifasica" && (st === "0" || !st)) continue;
        const waveTxt: Record<string, string> = {
          trifasica: "onda trifásica",
          bifasica: "onda bifásica",
          monofasica: "onda monofásica",
          ausente: "sem fluxo detectável",
        };
        const stTxt: Record<string, string> = {
          "0": "sem estenose hemodinamicamente significativa",
          "<50": "estenose < 50%",
          "50-70": "estenose de 50–70%",
          ">70": "estenose > 70%",
          oclusa: "oclusão",
        };
        bits.push(
          `${a.label}: ${psv != null ? "PSV " + fmtNum(psv, 0) + " cm/s, " : ""}${waveTxt[wave] || wave}${st && st !== "0" ? ", " + stTxt[st] : ""}`,
        );
      }
      if (!bits.length) {
        return `${sideLabel}: eixos subclávio, axilar, braquial, radial e ulnar pérvios, com ondas trifásicas e velocidades habituais, sem estenoses hemodinamicamente significativas.`;
      }
      return `${sideLabel}: ${bits.join("; ")}.`;
    };
    return joinSentences([
      describe("Membro superior direito", values.right),
      describe("Membro superior esquerdo", values.left),
      asStr(values.notes),
    ]);
  },
  conclusion: (values) => {
    const scan = (block: unknown) => {
      const b = (block || {}) as Record<string, Record<string, unknown>>;
      let worst = "0";
      const order = ["0", "<50", "50-70", ">70", "oclusa"];
      for (const a of ARTERIES_MMSS) {
        const st = asStr(b[a.id]?.stenosis);
        if (order.indexOf(st) > order.indexOf(worst)) worst = st;
      }
      return worst;
    };
    const label: Record<string, string> = {
      "0": "sem estenose hemodinamicamente significativa",
      "<50": "ateromatose com estenose < 50%",
      "50-70": "estenose moderada (50–70%)",
      ">70": "estenose significativa (> 70%)",
      oclusa: "oclusão arterial",
    };
    return [
      `• MSD: ${label[scan(values.right)] || "ver achados"}.`,
      `• MSE: ${label[scan(values.left)] || "ver achados"}.`,
    ].join("\n");
  },
};

export const VENOSO_MMSS: ExamDefinition = {
  id: "venoso-mmss",
  title: "Venoso de MMSS",
  printTitle: "ULTRASSONOGRAFIA DOPPLER VENOSA DOS MEMBROS SUPERIORES",
  short: "TVP, compressão, fluxo",
  group: "vascular",
  blurb: "Subclávia, axilar, braquial, basílica, cefálica, radial e ulnar.",
  technique:
    "Estudo Doppler venoso dos membros superiores com compressão sistemática, avaliação de fluxo e pesquisa de trombose nos sistemas profundo e superficial.",
  dictationHints: [
    "sistema venoso livre bilateral",
    "axilar esquerda não compressível, TVP",
    "exame normal",
  ],
  sections: [{ id: "table", title: "Eixos venosos", kind: "vessel-table" }],
  defaults: () => ({
    rightDeep: sideBlock(emptyVein, VEINS_MMSS),
    leftDeep: sideBlock(emptyVein, VEINS_MMSS),
    notes: "",
  }),
  applyNormal: (v) => ({
    ...v,
    rightDeep: sideBlock(() => ({ status: "livre", refluxo: 0, diam: null }), VEINS_MMSS),
    leftDeep: sideBlock(() => ({ status: "livre", refluxo: 0, diam: null }), VEINS_MMSS),
  }),
  findings: (values) => {
    const deep = (label: string, block: unknown) => {
      const b = (block || {}) as Record<string, Record<string, unknown>>;
      const abnormal: string[] = [];
      for (const vein of VEINS_MMSS) {
        const st = asStr(b[vein.id]?.status);
        if (st && st !== "livre") {
          const map: Record<string, string> = {
            refluxo: "com refluxo",
            tvp: "não compressível, compatível com trombose",
            parcial: "com trombose parcial/residual",
          };
          abnormal.push(`${vein.label} ${map[st] || st}`);
        }
      }
      if (!abnormal.length) {
        return `${label}: veias subclávia, axilar, braquial, basílica, cefálica, radial e ulnar pérvias, compressíveis, com fluxo fásico, sem sinais de trombose.`;
      }
      return `${label}: ${abnormal.join("; ")}.`;
    };
    return joinSentences([
      deep("Membro superior direito", values.rightDeep),
      deep("Membro superior esquerdo", values.leftDeep),
      asStr(values.notes),
    ]);
  },
  conclusion: (values) => {
    const hasTvp = (block: unknown) => {
      const b = (block || {}) as Record<string, Record<string, unknown>>;
      return Object.values(b).some((x) => asStr(x?.status) === "tvp" || asStr(x?.status) === "parcial");
    };
    if (hasTvp(values.rightDeep) || hasTvp(values.leftDeep)) {
      return "• Sinais ultrassonográficos de trombose venosa de membro superior — ver território acometido.";
    }
    return "• Sistema venoso dos membros superiores livre, sem sinais de trombose neste exame.";
  },
};
