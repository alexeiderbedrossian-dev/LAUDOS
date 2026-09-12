import { ellipsoidVolume, fmtNum, joinSentences, measureLine, sentence } from "@/lib/format";
import {
  asList,
  asMeasure,
  asNum,
  asStr,
  emptyMeasure,
  type ExamDefinition,
  type Patient,
} from "./types";

const ECO = [
  { value: "habitual", label: "Habitual" },
  { value: "aumentada", label: "Aumentada" },
  { value: "reduzida", label: "Reduzida" },
];

const TEXTURA = [
  { value: "homogenea", label: "Homogênea" },
  { value: "heterogenea", label: "Heterogênea" },
];

const CONTORNO = [
  { value: "regulares", label: "Regulares" },
  { value: "irregulares", label: "Irregulares" },
];

function vol(m: { a: number | null; b: number | null; c: number | null }) {
  return ellipsoidVolume(m.a, m.b, m.c);
}

export const TIREOIDE: ExamDefinition = {
  id: "tireoide",
  title: "Tireoide",
  printTitle: "ULTRASSONOGRAFIA DA TIREÓIDE",
  short: "Lobo a lobo, nódulos, TIRADS",
  group: "us",
  blurb: "Dimensões, volume, parênquima, nódulos e Doppler.",
  technique:
    "Exame realizado com transdutor linear de alta frequência, com varreduras multiplanares da região cervical anterior, complementado por mapeamento Doppler colorido e power Doppler.",
  dictationHints: [
    "lobo direito 4,8 por 1,6 por 1,4",
    "lobo esquerdo 4,5 por 1,5 por 1,3",
    "istmo 3 milímetros",
    "nódulo no terço médio do lobo direito de 8 por 6 por 5 milímetros, sólido, hipoecoico, TIRADS 4",
    "exame normal",
  ],
  sections: [
    {
      id: "dimensoes",
      title: "Dimensões",
      columns: 2,
      fields: [
        {
          id: "ld",
          label: "Lobo direito (C × AP × T)",
          type: "measure3",
          unit: "cm",
          aliases: ["lobo direito", "ld", "lobo a direita"],
        },
        {
          id: "le",
          label: "Lobo esquerdo (C × AP × T)",
          type: "measure3",
          unit: "cm",
          aliases: ["lobo esquerdo", "le", "lobo a esquerda"],
        },
        {
          id: "istmo",
          label: "Istmo",
          type: "number",
          unit: "cm",
          aliases: ["istmo", "istmo mede"],
        },
      ],
    },
    {
      id: "parenquima",
      title: "Parênquima",
      columns: 3,
      fields: [
        { id: "contornos", label: "Contornos", type: "select", options: CONTORNO, aliases: ["contornos"] },
        { id: "eco", label: "Ecogenicidade", type: "select", options: ECO, aliases: ["ecogenicidade", "eco"] },
        { id: "textura", label: "Ecotextura", type: "select", options: TEXTURA, aliases: ["ecotextura", "textura"] },
        {
          id: "doppler",
          label: "Doppler parenquimatoso",
          type: "select",
          options: [
            { value: "habitual", label: "Padrão habitual" },
            { value: "aumentado", label: "Fluxo aumentado" },
            { value: "diminuido", label: "Fluxo diminuído" },
          ],
          aliases: ["doppler", "fluxo", "vascularizacao"],
        },
        {
          id: "vpsD",
          label: "VPS artéria tireóidea inf. D",
          type: "number",
          unit: "cm/s",
          aliases: ["vps direita", "vps inferior direita"],
        },
        {
          id: "vpsE",
          label: "VPS artéria tireóidea inf. E",
          type: "number",
          unit: "cm/s",
          aliases: ["vps esquerda", "vps inferior esquerda"],
        },
        {
          id: "linfonodos",
          label: "Linfonodos cervicais",
          type: "select",
          options: [
            { value: "habitual", label: "Aspecto habitual / não suspeitos" },
            { value: "reativos", label: "Reativos / inespecíficos" },
            { value: "suspeitos", label: "Suspeitos" },
          ],
          aliases: ["linfonodos", "gânglios", "ganglios"],
        },
        { id: "linfonodosNota", label: "Nota dos linfonodos", type: "text", span: 3, aliases: ["nota linfonodos"] },
        {
          id: "paratireoides",
          label: "Paratireoides",
          type: "select",
          options: [
            { value: "nao_vistas", label: "Não individualizadas" },
            { value: "habitual", label: "Sem alterações" },
            { value: "alterado", label: "Alteradas — ver nota" },
          ],
          aliases: ["paratireoide", "paratireoides"],
        },
        {
          id: "vasos",
          label: "Vasos cervicais",
          type: "select",
          options: [
            { value: "habitual", label: "Trajeto e calibre preservados" },
            { value: "alterado", label: "Alterados — ver nota" },
          ],
          aliases: ["carotidas", "jugulares", "vasos cervicais"],
        },
        { id: "adjacentesNota", label: "Nota das estruturas adjacentes", type: "text", span: 3 },
      ],
    },
    {
      id: "nodulos",
      title: "Nódulos",
      kind: "nodules",
      fields: [
        {
          id: "nodules",
          label: "Nódulos",
          type: "list",
          itemLabel: "Nódulo",
          aliases: ["nodulo", "nódulo", "nodulos"],
          itemFields: [
            {
              id: "local",
              label: "Localização",
              type: "select",
              options: [
                { value: "ld-sup", label: "Lobo direito — terço superior" },
                { value: "ld-med", label: "Lobo direito — terço médio" },
                { value: "ld-inf", label: "Lobo direito — terço inferior" },
                { value: "le-sup", label: "Lobo esquerdo — terço superior" },
                { value: "le-med", label: "Lobo esquerdo — terço médio" },
                { value: "le-inf", label: "Lobo esquerdo — terço inferior" },
                { value: "istmo", label: "Istmo" },
              ],
            },
            { id: "size", label: "Medidas (mm)", type: "measure3", unit: "mm" },
            {
              id: "composicao",
              label: "Composição",
              type: "select",
              options: [
                { value: "solido", label: "Sólido" },
                { value: "cistico", label: "Cístico" },
                { value: "misto", label: "Misto" },
                { value: "espongiforme", label: "Espongiforme" },
              ],
            },
            {
              id: "ecoN",
              label: "Ecogenicidade",
              type: "select",
              options: [
                { value: "anecoico", label: "Anecoico" },
                { value: "hiperecoico", label: "Hiperecoico" },
                { value: "isoecoico", label: "Isoecoico" },
                { value: "hipoecoico", label: "Hipoecoico" },
                { value: "muito-hipo", label: "Muito hipoecoico" },
              ],
            },
            {
              id: "margens",
              label: "Margens",
              type: "select",
              options: [
                { value: "regulares", label: "Regulares / lisas" },
                { value: "irregulares", label: "Irregulares" },
                { value: "microlobuladas", label: "Microlobuladas" },
                { value: "extensao", label: "Extensão extra-tireoidiana" },
              ],
            },
            {
              id: "focos",
              label: "Focos ecogênicos",
              type: "select",
              options: [
                { value: "nenhum", label: "Nenhum / artefato em cauda de cometa" },
                { value: "macro", label: "Macrocalcificações" },
                { value: "perifericas", label: "Calcificações periféricas" },
                { value: "micro", label: "Microcalcificações" },
              ],
            },
            {
              id: "tirads",
              label: "ACR TI-RADS",
              type: "select",
              options: [
                { value: "1", label: "TR1 — benigno" },
                { value: "2", label: "TR2 — não suspeito" },
                { value: "3", label: "TR3 — discretamente suspeito" },
                { value: "4", label: "TR4 — moderadamente suspeito" },
                { value: "5", label: "TR5 — altamente suspeito" },
              ],
            },
            { id: "nota", label: "Observação", type: "text" },
          ],
        },
      ],
    },
    {
      id: "obs",
      title: "Observações",
      fields: [{ id: "notes", label: "Notas livres", type: "text", span: 3, aliases: ["observacao", "nota", "obs"] }],
    },
  ],
  defaults: () => ({
    ld: emptyMeasure(),
    le: emptyMeasure(),
    istmo: null,
    contornos: "regulares",
    eco: "habitual",
    textura: "homogenea",
    doppler: "habitual",
    vpsD: null,
    vpsE: null,
    linfonodos: "habitual",
    linfonodosNota: "",
    paratireoides: "nao_vistas",
    vasos: "habitual",
    adjacentesNota: "",
    nodules: [],
    notes: "",
  }),
  applyNormal: (values) => ({
    ...values,
    ld: { a: 4.1, b: 1.4, c: 1.5 },
    le: { a: 4.5, b: 1.5, c: 1.4 },
    istmo: 0.15,
    contornos: "regulares",
    eco: "habitual",
    textura: "homogenea",
    doppler: "habitual",
    vpsD: null,
    vpsE: null,
    linfonodos: "habitual",
    paratireoides: "nao_vistas",
    vasos: "habitual",
    nodules: [],
  }),
  disclaimer:
    "Laudo elaborado de acordo com as recomendações e critérios ultrassonográficos vigentes da Sociedade Brasileira de Endocrinologia e Metabologia (SBEM), do Colégio Brasileiro de Radiologia e Diagnóstico por Imagem (CBR) e do sistema ACR TI-RADS para avaliação e estratificação dos nódulos tireoidianos.",
  findings: (values) => {
    const ld = asMeasure(values.ld);
    const le = asMeasure(values.le);
    const vd = vol(ld);
    const ve = vol(le);
    const istmo = asNum(values.istmo);
    const total = vd != null && ve != null ? Math.round((vd + ve) * 10) / 10 : null;
    const nodules = asList(values.nodules);

    const cont = asStr(values.contornos);
    const topo =
      cont === "irregulares"
        ? "Glândula tireoide em topografia habitual (tópica), com contornos irregulares."
        : "Glândula tireoide em topografia habitual (tópica), com contornos regulares e lisos.";

    const eco = asStr(values.eco);
    const tex = asStr(values.textura);
    const ecoTxt =
      eco === "aumentada"
        ? "ecogenicidade aumentada"
        : eco === "reduzida"
          ? "ecogenicidade reduzida (hipoecogênica)"
          : "ecogenicidade preservada (isoecogênica)";
    const texTxt = tex === "heterogenea" ? "ecotextura heterogênea" : "ecotextura finamente homogênea";

    let nodText = "Ausência de nódulos sólidos, císticos ou outras lesões focais.";
    if (nodules.length) {
      nodText = nodules
        .map((n, i) => {
          const locMap: Record<string, string> = {
            "ld-sup": "no terço superior do lobo direito",
            "ld-med": "no terço médio do lobo direito",
            "ld-inf": "no terço inferior do lobo direito",
            "le-sup": "no terço superior do lobo esquerdo",
            "le-med": "no terço médio do lobo esquerdo",
            "le-inf": "no terço inferior do lobo esquerdo",
            istmo: "no istmo",
          };
          const size = asMeasure(n.size);
          const dims = [size.a, size.b, size.c].filter((x) => x != null).map((x) => fmtNum(x as number, 0));
          const comp: Record<string, string> = {
            solido: "sólido",
            cistico: "cístico",
            misto: "misto",
            espongiforme: "espongiforme",
          };
          const ecoN: Record<string, string> = {
            anecoico: "anecoico",
            hiperecoico: "hiperecoico",
            isoecoico: "isoecoico",
            hipoecoico: "hipoecoico",
            "muito-hipo": "muito hipoecoico",
          };
          const bits = [
            `Nódulo ${i + 1} ${locMap[asStr(n.local)] || "de localização indicada"}`,
            dims.length ? `medindo ${dims.join(" x ")} mm` : "",
            asStr(n.composicao) ? `composição ${comp[asStr(n.composicao)] || asStr(n.composicao)}` : "",
            asStr(n.ecoN) ? ecoN[asStr(n.ecoN)] || asStr(n.ecoN) : "",
            asStr(n.margens) ? `margens ${asStr(n.margens)}` : "",
            asStr(n.focos) && asStr(n.focos) !== "nenhum" ? `focos: ${asStr(n.focos)}` : "",
            asStr(n.tirads) ? `ACR TI-RADS ${asStr(n.tirads)}` : "",
            asStr(n.nota),
          ].filter(Boolean);
          return sentence(bits.join(", "));
        })
        .join("\n");
    }

    const paren = `O parênquima glandular exibe ${ecoTxt} e ${texTxt}. ${nodText}`;

    const dop = asStr(values.doppler);
    const vpsD = asNum(values.vpsD);
    const vpsE = asNum(values.vpsE);
    let dopText =
      dop === "aumentado"
        ? "Ao estudo com Doppler colorido, a vascularização parenquimatosa encontra-se aumentada em intensidade e distribuição, a correlacionar com processo inflamatório em atividade."
        : dop === "diminuido"
          ? "Ao estudo com Doppler colorido, a vascularização parenquimatosa apresenta-se reduzida em intensidade."
          : "Ao estudo com Doppler colorido, a vascularização parenquimatosa apresenta-se de intensidade e distribuição habituais.";
    if (vpsD != null || vpsE != null) {
      const parts = [
        vpsD != null ? `direita ${fmtNum(vpsD, 0)} cm/s` : "",
        vpsE != null ? `esquerda ${fmtNum(vpsE, 0)} cm/s` : "",
      ].filter(Boolean);
      const max = Math.max(vpsD ?? 0, vpsE ?? 0);
      dopText += `\nAs velocidades de pico sistólico (VPS) nas artérias tireóideas inferiores: ${parts.join("; ")}${max < 40 ? ", dentro dos limites da normalidade (VPS < 40 cm/s)" : ""}.`;
    } else if (dop !== "aumentado") {
      dopText +=
        "\nAs velocidades de pico sistólico (VPS) nas artérias tireóideas inferiores encontram-se dentro dos limites da normalidade (VPS < 40 cm/s), afastando sinais de processo inflamatório em atividade.";
    }

    const lobeLine = (label: string, m: { a: number | null; b: number | null; c: number | null }, v: number | null) => {
      if (m.a == null && m.b == null && m.c == null) return "";
      const dims = [m.a, m.b, m.c].filter((n) => n != null).map((n) => fmtNum(n as number, 1));
      return `${label}: ${dims.join(" x ")} cm${v != null ? ` – volume: ${fmtNum(v, 1)} cm³` : ""}`;
    };
    const istmoTxt =
      istmo != null ? `Istmo: ${fmtNum(istmo, istmo < 1 ? 2 : 1)} cm.` : "";
    const medidas = [
      "Medidas da glândula tireóide:",
      lobeLine("Lobo direito", ld, vd),
      lobeLine("Lobo esquerdo", le, ve),
      istmoTxt,
      total != null
        ? `Volume estimado: ${fmtNum(total, 1)} cm³ (VR: Mulheres: 6,0 a 18,0 cm³. Homens: 7,5 a 25,0 cm³.)`
        : "",
    ]
      .filter(Boolean)
      .join("\n");

    const para = asStr(values.paratireoides);
    const paraTxt =
      para === "alterado"
        ? sentence(
            `Regiões paratireoideanas: alteração descrita${asStr(values.adjacentesNota) ? " — " + asStr(values.adjacentesNota) : ""}`,
          )
        : "Regiões paratireoideanas sem alterações ecográficas (glândulas não individualizadas).";
    const vasos = asStr(values.vasos);
    const vasosTxt =
      vasos === "alterado"
        ? "Vasos cervicais (carótidas e jugulares) com alteração descrita."
        : "Vasos cervicais (carótidas e jugulares) com trajeto e calibre preservados.";
    const ln = asStr(values.linfonodos);
    const lnText =
      ln === "suspeitos"
        ? sentence(
            `Identificam-se linfonodos cervicais com critérios morfológicos de suspeição${asStr(values.linfonodosNota) ? ": " + asStr(values.linfonodosNota) : ""}`,
          )
        : ln === "reativos"
          ? "Observam-se linfonodos cervicais de aspecto reativo/inespecífico, sem critérios morfológicos de suspeição."
          : "Não se identificam linfonodos de dimensões aumentadas ou com critérios morfológicos de suspeição nas cadeias cervicais acessíveis ao método.";
    const adjacentes = ["Estruturas Adjacentes:", paraTxt, vasosTxt, lnText].join("\n");

    return joinSentences([topo, paren, dopText, medidas, adjacentes, asStr(values.notes)]);
  },
  conclusion: (values) => {
    const nodules = asList(values.nodules);
    const ld = asMeasure(values.ld);
    const le = asMeasure(values.le);
    const total =
      vol(ld) != null && vol(le) != null ? Math.round(((vol(ld) as number) + (vol(le) as number)) * 10) / 10 : null;
    const eco = asStr(values.eco);
    const tex = asStr(values.textura);
    const ln = asStr(values.linfonodos);
    const dop = asStr(values.doppler);
    const normal =
      !nodules.length &&
      (eco === "habitual" || !eco) &&
      tex !== "heterogenea" &&
      ln !== "suspeitos" &&
      dop !== "aumentado" &&
      (total == null || (total >= 6 && total <= 25));
    if (normal) {
      return "Exame ultrassonográfico da tireóide, complementado por Doppler, dentro dos padrões da normalidade.";
    }
    const lines: string[] = [];
    if (total != null && total > 18) lines.push("Aumento do volume tireoidiano (bócio).");
    else if (total != null && total < 6) lines.push("Tireoide de volume reduzido.");
    else lines.push("Tireoide tópica, de dimensões habituais.");
    if (eco === "reduzida" || tex === "heterogenea") {
      lines.push("Alteração da ecotextura parenquimatosa, a correlacionar com dados clínicos e laboratoriais.");
    }
    if (dop === "aumentado") {
      lines.push("Aumento da vascularização parenquimatosa ao Doppler, a correlacionar com processo inflamatório.");
    }
    if (!nodules.length) lines.push("Sem nódulos identificáveis no momento do exame.");
    else {
      const maxT = nodules.reduce((acc, n) => Math.max(acc, Number(asStr(n.tirads) || 0)), 0);
      lines.push(
        nodules.length === 1
          ? `Nódulo tireoidiano descrito no relatório, classificado como ACR TI-RADS ${maxT || "—"}.`
          : `${nodules.length} nódulos tireoidianos descritos no relatório, o de maior grau de suspeição classificado como ACR TI-RADS ${maxT || "—"}.`,
      );
    }
    if (ln === "suspeitos") lines.push("Linfonodos cervicais com critérios de suspeição — ver descrição.");
    return lines.join("\n");
  },
};

export const CERVICAL: ExamDefinition = {
  id: "cervical",
  title: "Região cervical",
  printTitle: "ULTRASSONOGRAFIA CERVICAL",
  short: "Salivares, cadeias, massas",
  group: "us",
  blurb: "Glândulas salivares, linfonodos e partes moles do pescoço.",
  technique: "Realizado estudo com transdutor linear multifrequencial na modalidade bidimensional.",
  dictationHints: [
    "parótidas e submandibulares normais",
    "linfonodo no nível 2 à direita de 12 por 6 milímetros, hilo preservado",
    "exame normal",
  ],
  sections: [
    {
      id: "salivares",
      title: "Glândulas salivares",
      columns: 2,
      fields: [
        {
          id: "parotidas",
          label: "Parótidas",
          type: "select",
          options: [
            { value: "habitual", label: "Dimensões e ecotextura habituais" },
            { value: "sialose", label: "Aumento / sialose" },
            { value: "sialoadenite", label: "Sialoadenite" },
            { value: "nodulo", label: "Nódulo / massa" },
          ],
          aliases: ["parotida", "parótidas"],
        },
        {
          id: "submandibulares",
          label: "Submandibulares",
          type: "select",
          options: [
            { value: "habitual", label: "Dimensões e ecotextura habituais" },
            { value: "sialoadenite", label: "Sialoadenite" },
            { value: "nodulo", label: "Nódulo / massa" },
          ],
          aliases: ["submandibular", "submandibulares"],
        },
        { id: "salivaresNota", label: "Nota das salivares", type: "text", span: 2 },
      ],
    },
    {
      id: "linfonodos",
      title: "Cadeias linfonodais",
      columns: 2,
      fields: [
        {
          id: "cadeias",
          label: "Linfonodos",
          type: "select",
          options: [
            { value: "habitual", label: "Sem linfonodos suspeitos" },
            { value: "reativos", label: "Linfonodomegalias reativas" },
            { value: "suspeitos", label: "Linfonodos suspeitos" },
          ],
          aliases: ["linfonodos", "cadeias"],
        },
        { id: "maiorEixo", label: "Maior eixo do maior linfonodo", type: "number", unit: "mm", aliases: ["maior linfonodo", "eixo"] },
        { id: "nivel", label: "Nível / lado", type: "text", aliases: ["nivel", "nível"] },
        { id: "linfonodosNota", label: "Descrição", type: "text", span: 2 },
      ],
    },
    {
      id: "tireoideResumo",
      title: "Tireoide (visão cervical)",
      columns: 2,
      fields: [
        {
          id: "tireoide",
          label: "Tireoide",
          type: "select",
          options: [
            { value: "habitual", label: "Sem alterações evidentes neste estudo" },
            { value: "bocio", label: "Bócio / aumento" },
            { value: "nodulos", label: "Nódulos — ver nota" },
            { value: "nao", label: "Não incluída no estudo" },
          ],
        },
        { id: "tireoideNota", label: "Nota da tireoide", type: "text" },
      ],
    },
    {
      id: "partes",
      title: "Partes moles e vasos",
      columns: 2,
      fields: [
        {
          id: "pele",
          label: "Pele e subcutâneo",
          type: "select",
          options: [
            { value: "habitual", label: "Espessura e ecotextura usuais" },
            { value: "alterado", label: "Alterado — ver nota" },
          ],
          aliases: ["pele", "subcutaneo", "tecido celular"],
        },
        {
          id: "vasos",
          label: "Grandes vasos cervicais",
          type: "select",
          options: [
            { value: "habitual", label: "Pérvios, calibre normal" },
            { value: "alterado", label: "Alterados — ver nota" },
          ],
          aliases: ["vasos cervicais", "carotidas", "jugulares"],
        },
        { id: "massas", label: "Massas / cistos / fístulas", type: "text", span: 2, aliases: ["massa", "cisto", "fistula"] },
        { id: "notes", label: "Observações", type: "text", span: 2 },
      ],
    },
  ],
  defaults: () => ({
    parotidas: "habitual",
    submandibulares: "habitual",
    salivaresNota: "",
    cadeias: "habitual",
    maiorEixo: null,
    nivel: "",
    linfonodosNota: "",
    tireoide: "nao",
    tireoideNota: "",
    pele: "habitual",
    vasos: "habitual",
    massas: "",
    notes: "",
  }),
  applyNormal: (v) => ({
    ...v,
    parotidas: "habitual",
    submandibulares: "habitual",
    cadeias: "habitual",
    tireoide: "nao",
    pele: "habitual",
    vasos: "habitual",
    massas: "",
  }),
  findings: (values) => {
    const pele =
      asStr(values.pele) === "alterado"
        ? "Pele e tecido celular subcutâneo com alteração da espessura ou da ecotextura — ver descrição."
        : "Pele e tecido celular subcutâneo com espessura e ecotextura usuais.";

    const c = asStr(values.cadeias);
    const eixo = asNum(values.maiorEixo);
    let ln = "Não foram identificadas anormalidades morfológicas em linfonodos cervicais.";
    if (c === "reativos") {
      ln = sentence(
        `Observam-se linfonodos de aspecto reativo/inespecífico${asStr(values.nivel) ? " em " + asStr(values.nivel) : ""}${eixo ? ", o maior medindo " + fmtNum(eixo, 0) + " mm no maior eixo" : ""}${asStr(values.linfonodosNota) ? ". " + asStr(values.linfonodosNota) : ""}`,
      );
    } else if (c === "suspeitos") {
      ln = sentence(
        `Identificam-se linfonodos com anormalidades morfológicas${asStr(values.nivel) ? " em " + asStr(values.nivel) : ""}${eixo ? ", o maior medindo " + fmtNum(eixo, 0) + " mm" : ""}${asStr(values.linfonodosNota) ? ". " + asStr(values.linfonodosNota) : ""}`,
      );
    }

    const vasos =
      asStr(values.vasos) === "alterado"
        ? "Grandes vasos cervicais com alteração descrita."
        : "Grandes vasos cervicais pérvios e com calibres normais.";

    const p = asStr(values.parotidas);
    const s = asStr(values.submandibulares);
    const par =
      p === "habitual" && s === "habitual"
        ? ""
        : sentence(
            `Glândulas salivares: parótidas ${p}; submandibulares ${s}${asStr(values.salivaresNota) ? ". " + asStr(values.salivaresNota) : ""}`,
          );

    const t = asStr(values.tireoide);
    const tire =
      t === "nao" || t === "habitual" || !t
        ? ""
        : sentence(`Tireoide: ${t}${asStr(values.tireoideNota) ? " — " + asStr(values.tireoideNota) : ""}`);

    const massas = asStr(values.massas) ? sentence(asStr(values.massas)) : "";

    return joinSentences([pele, ln, vasos, par, tire, massas, asStr(values.notes)]);
  },
  conclusion: (values) => {
    const p = asStr(values.parotidas);
    const s = asStr(values.submandibulares);
    const c = asStr(values.cadeias);
    const t = asStr(values.tireoide);
    const normal =
      (p === "habitual" || !p) &&
      (s === "habitual" || !s) &&
      (c === "habitual" || !c) &&
      (t === "nao" || t === "habitual" || !t) &&
      asStr(values.pele) !== "alterado" &&
      asStr(values.vasos) !== "alterado" &&
      !asStr(values.massas);
    if (normal) return "Estudo ultrassonográfico dentro dos limites da normalidade.";
    const lines: string[] = [];
    if (p !== "habitual" || s !== "habitual") lines.push("Alteração nas glândulas salivares — ver relatório.");
    if (c === "reativos") lines.push("Linfonodomegalias de aspecto reativo/inespecífico.");
    else if (c === "suspeitos") lines.push("Linfonodos cervicais com anormalidades morfológicas — correlação clínica.");
    if (asStr(values.massas)) lines.push("Lesão de partes moles cervicais — ver descrição.");
    if (t && t !== "nao" && t !== "habitual") lines.push("Alteração tireoidiana no recorte deste estudo — ver relatório.");
    if (!lines.length) return "Estudo ultrassonográfico dentro dos limites da normalidade.";
    return lines.join("\n");
  },
};

const FIGADO_ECO = [
  { value: "habitual", label: "Habitual" },
  { value: "esteatose1", label: "Esteatose grau I" },
  { value: "esteatose2", label: "Esteatose grau II" },
  { value: "esteatose3", label: "Esteatose grau III" },
  { value: "hepatopatia", label: "Hepatopatia crônica / grosseira" },
];

export const ABDOMEN: ExamDefinition = {
  id: "abdomen",
  title: "Abdômen total",
  printTitle: "ULTRASSONOGRAFIA DO ABDOMEN TOTAL",
  short: "Fígado, vias, rins, baço",
  group: "us",
  blurb: "Fígado, vesícula, pâncreas, baço, rins, aorta e bexiga.",
  technique:
    "Realizado estudo com transdutor convexo multifrequencial na modalidade bidimensional, em jejum.",
  dictationHints: [
    "fígado homogêneo, lobo direito 15 centímetros",
    "vesícula sem cálculos, paredes 2 milímetros",
    "colédoco 4 milímetros",
    "rim direito 10,2, rim esquerdo 10,8, sem hidronefrose",
    "baço 9,5",
    "exame normal",
  ],
  sections: [
    {
      id: "figado",
      title: "Fígado",
      columns: 3,
      fields: [
        { id: "figadoLD", label: "Lobo direito (craniocaudal)", type: "number", unit: "cm", aliases: ["figado", "fígado", "lobo direito do figado"] },
        { id: "figadoEco", label: "Ecogenicidade", type: "select", options: FIGADO_ECO, aliases: ["esteatose", "ecogenicidade hepatic"] },
        { id: "figadoContorno", label: "Contornos", type: "select", options: CONTORNO },
        { id: "figadoLesoes", label: "Lesões focais", type: "text", span: 3, aliases: ["lesao hepatic", "nódulo hepatic", "cisto hepatic"] },
      ],
    },
    {
      id: "vias",
      title: "Vesícula e vias biliares",
      columns: 3,
      fields: [
        {
          id: "vesicula",
          label: "Vesícula",
          type: "select",
          options: [
            { value: "habitual", label: "Alitiásica, paredes finas" },
            { value: "calculos", label: "Litíase" },
            { value: "lama", label: "Lama biliar" },
            { value: "colecistite", label: "Sinais de colecistite" },
            { value: "ausente", label: "Ausente (colecistectomia)" },
          ],
          aliases: ["vesicula", "vesícula", "calculo biliar"],
        },
        { id: "vesiculaParede", label: "Parede", type: "number", unit: "mm", aliases: ["parede da vesicula"] },
        { id: "coledoco", label: "Colédoco", type: "number", unit: "mm", aliases: ["coledoco", "colédoco", "via biliar"] },
        { id: "vesiculaNota", label: "Nota da vesícula / cálculos", type: "text", span: 3 },
      ],
    },
    {
      id: "pancreas",
      title: "Pâncreas e baço",
      columns: 3,
      fields: [
        {
          id: "pancreas",
          label: "Pâncreas",
          type: "select",
          options: [
            { value: "habitual", label: "Visualizado, habitual" },
            { value: "parcial", label: "Parcialmente visível (gases)" },
            { value: "nao", label: "Não visível" },
            { value: "alterado", label: "Alterado — ver nota" },
          ],
          aliases: ["pancreas", "pâncreas"],
        },
        { id: "baco", label: "Baço (eixo maior)", type: "number", unit: "cm", aliases: ["baco", "baço", "soco"] },
        { id: "pancreasNota", label: "Nota pâncreas", type: "text" },
      ],
    },
    {
      id: "rins",
      title: "Rins",
      columns: 2,
      fields: [
        { id: "rimD", label: "Rim direito (comprimento)", type: "number", unit: "cm", aliases: ["rim direito"] },
        { id: "rimE", label: "Rim esquerdo (comprimento)", type: "number", unit: "cm", aliases: ["rim esquerdo"] },
        {
          id: "hidroD",
          label: "Pielo direito",
          type: "select",
          options: [
            { value: "livre", label: "Sem dilatação" },
            { value: "discreta", label: "Discreta dilatação" },
            { value: "moderada", label: "Moderada" },
            { value: "acentuada", label: "Acentuada" },
          ],
          aliases: ["hidronefrose direita"],
        },
        {
          id: "hidroE",
          label: "Pielo esquerdo",
          type: "select",
          options: [
            { value: "livre", label: "Sem dilatação" },
            { value: "discreta", label: "Discreta dilatação" },
            { value: "moderada", label: "Moderada" },
            { value: "acentuada", label: "Acentuada" },
          ],
          aliases: ["hidronefrose esquerda"],
        },
        { id: "rinsNota", label: "Cálculos, cistos, nódulos", type: "text", span: 2, aliases: ["calculo renal", "cisto renal"] },
      ],
    },
    {
      id: "outros",
      title: "Vasos, bexiga e cavidade",
      columns: 3,
      fields: [
        { id: "aorta", label: "Aorta abdominal", type: "number", unit: "cm", aliases: ["aorta"] },
        {
          id: "bexiga",
          label: "Bexiga",
          type: "select",
          options: [
            { value: "habitual", label: "Paredes finas, conteúdo anecoico" },
            { value: "parede", label: "Paredes espessadas" },
            { value: "vazia", label: "Mal repleta" },
            { value: "alterada", label: "Alterada — ver nota" },
          ],
          aliases: ["bexiga"],
        },
        {
          id: "ascite",
          label: "Líquido livre",
          type: "select",
          options: [
            { value: "ausente", label: "Ausente" },
            { value: "discreto", label: "Discreto" },
            { value: "moderado", label: "Moderado" },
            { value: "acentuado", label: "Acentuado" },
          ],
          aliases: ["ascite", "liquido livre"],
        },
        { id: "notes", label: "Observações", type: "text", span: 3 },
      ],
    },
  ],
  defaults: () => ({
    figadoLD: null,
    figadoEco: "habitual",
    figadoContorno: "regulares",
    figadoLesoes: "",
    vesicula: "habitual",
    vesiculaParede: null,
    coledoco: null,
    vesiculaNota: "",
    pancreas: "habitual",
    baco: null,
    pancreasNota: "",
    rimD: null,
    rimE: null,
    hidroD: "livre",
    hidroE: "livre",
    rinsNota: "",
    aorta: null,
    bexiga: "habitual",
    ascite: "ausente",
    notes: "",
  }),
  applyNormal: (v) => ({
    ...v,
    figadoEco: "habitual",
    figadoContorno: "regulares",
    vesicula: "habitual",
    pancreas: "habitual",
    hidroD: "livre",
    hidroE: "livre",
    bexiga: "habitual",
    ascite: "ausente",
    figadoLesoes: "",
    rinsNota: "",
  }),
  findings: (values) => {
    const ld = asNum(values.figadoLD);
    const eco = asStr(values.figadoEco);
    const lesoes = asStr(values.figadoLesoes);
    const cont = asStr(values.figadoContorno);
    let figado: string;
    if (eco === "habitual" || !eco) {
      figado = `FÍGADO: dimensões, contornos e ecotextura normais. Não se evidenciam lesões parenquimatosas focais.${ld != null ? " Lobo direito com eixo craniocaudal de " + fmtNum(ld, 1) + " cm." : ""}${lesoes ? " " + lesoes : ""}`;
    } else {
      const ecoTxt: Record<string, string> = {
        esteatose1: "aumento discreto da ecogenicidade, compatível com esteatose grau I",
        esteatose2: "aumento moderado da ecogenicidade com atenuação acústica posterior, compatível com esteatose grau II",
        esteatose3: "aumento acentuado da ecogenicidade com pobre definição diafragmática, compatível com esteatose grau III",
        hepatopatia: "ecotextura grosseira, a correlacionar com hepatopatia crônica",
      };
      figado = sentence(
        `FÍGADO: contornos ${cont || "regulares"}${ld != null ? ", lobo direito com " + fmtNum(ld, 1) + " cm no eixo craniocaudal" : ""}, ${ecoTxt[eco] || eco}${lesoes ? ". " + lesoes : ". Não se evidenciam lesões parenquimatosas focais"}`,
      );
    }

    const ves = asStr(values.vesicula);
    const parede = asNum(values.vesiculaParede);
    const notaV = asStr(values.vesiculaNota);
    let vesicula: string;
    if (ves === "ausente") vesicula = "VESÍCULA BILIAR: ausente (antecedente de colecistectomia).";
    else if (ves === "calculos")
      vesicula = sentence(
        `VESÍCULA BILIAR: imagens hiperecogênicas com sombra acústica posterior, compatíveis com cálculos${notaV ? " (" + notaV + ")" : ""}${parede != null ? ", paredes medindo " + fmtNum(parede, 1) + " mm" : ""}`,
      );
    else if (ves === "lama")
      vesicula = "VESÍCULA BILIAR: conteúdo ecogênico móvel, sem sombra, compatível com lama biliar.";
    else if (ves === "colecistite")
      vesicula = sentence(
        `VESÍCULA BILIAR: sinais ultrassonográficos de colecistite${parede != null ? " (paredes de " + fmtNum(parede, 1) + " mm)" : ""}${notaV ? ". " + notaV : ""}`,
      );
    else
      vesicula = `VESÍCULA BILIAR: Com repleção adequada, de paredes finas e regulares. Lúmen anecoico, sem evidência de cálculos (litíase) ou formações polipoides.${parede != null ? " Paredes com " + fmtNum(parede, 1) + " mm." : ""}`;

    const cho = asNum(values.coledoco);
    const vias =
      cho != null && cho > 7
        ? `VIAS BILIARES: colédoco com ${fmtNum(cho, 1)} mm, dilatada.`
        : `VIAS BILIARES: ausência de dilatação intra ou extra-hepática.${cho != null ? " Colédoco com " + fmtNum(cho, 1) + " mm." : ""}`;

    const pan = asStr(values.pancreas);
    const panNota = asStr(values.pancreasNota);
    const pancreas =
      pan === "parcial"
        ? "PÂNCREAS: parcialmente visível por interposição gasosa; nos segmentos avaliados, morfologia e ecotextura preservadas. Duto pancreático principal não dilatado."
        : pan === "nao"
          ? "PÂNCREAS: não visível neste exame por interposição gasosa."
          : pan === "alterado"
            ? sentence("PÂNCREAS: alterado" + (panNota ? " — " + panNota : ""))
            : "PÂNCREAS: Morfologia, dimensões e ecotextura preservadas, nos segmentos avaliados. Duto pancreático principal não dilatado.";

    const rimLinha = (lado: string, len: number | null, hidro: string) => {
      const med = len != null ? ` Eixo longitudinal de ${fmtNum(len, 1)} cm.` : "";
      const nota = asStr(values.rinsNota);
      if ((hidro && hidro !== "livre") || nota) {
        return sentence(
          `RIM ${lado}: tópico, de contornos regulares, com diferenciação cortico-medular preservada. Parênquima de espessura e ecogenicidade avaliados. Sistema pielocalicinal ${hidro && hidro !== "livre" ? "com dilatação " + hidro : "não dilatado"}.${med}${nota && lado === "DIREITO" ? " " + nota : ""}`,
        );
      }
      return `RIM ${lado}: Tópico, de contornos regulares, com diferenciação cortico-medular preservada. Parênquima de espessura e ecogenicidade normais. Sistema pielocalicinal não dilatado. Ausência de imagens ecogênicas sugestivas de cálculos.${med}`;
    };

    const bacoN = asNum(values.baco);
    const baco = `BAÇO: dimensões, contornos e ecotextura normais.${bacoN != null ? " Eixo maior de " + fmtNum(bacoN, 1) + " cm." : ""}`;

    const ao = asNum(values.aorta);
    const retro = `RETROPERITÔNEO: Aorta e VCI com calibres normais. Não se observam linfonodomegalias.${ao != null ? " Aorta com calibre máximo de " + fmtNum(ao, 1) + " cm." : ""}`;

    const ascite = asStr(values.ascite);
    const cavidade =
      ascite === "ausente" || !ascite
        ? "CAVIDADE PERITONEAL: Ausência de líquido livre nos recessos avaliados."
        : sentence(`CAVIDADE PERITONEAL: líquido livre intraperitoneal ${ascite}`);

    const bex = asStr(values.bexiga);
    const bexiga =
      bex === "habitual" || !bex
        ? "BEXIGA: com repleção adequada, de paredes finas e regulares. Conteúdo anecoico, sem ecos móveis ou imagens parietais."
        : bex === "vazia"
          ? "BEXIGA: mal repleta neste exame, limitando a avaliação parietal."
          : bex === "parede"
            ? "BEXIGA: paredes espessadas."
            : sentence("BEXIGA: alterada");

    return joinSentences([
      figado,
      vesicula,
      vias,
      pancreas,
      rimLinha("DIREITO", asNum(values.rimD), asStr(values.hidroD)),
      rimLinha("ESQUERDO", asNum(values.rimE), asStr(values.hidroE)),
      baco,
      retro,
      cavidade,
      bexiga,
      asStr(values.notes),
    ]);
  },
  conclusion: (values) => {
    const eco = asStr(values.figadoEco);
    const ves = asStr(values.vesicula);
    const hd = asStr(values.hidroD);
    const he = asStr(values.hidroE);
    const ascite = asStr(values.ascite);
    const pan = asStr(values.pancreas);
    const bex = asStr(values.bexiga);
    const normal =
      (eco === "habitual" || !eco) &&
      !asStr(values.figadoLesoes) &&
      (ves === "habitual" || !ves) &&
      (hd === "livre" || !hd) &&
      (he === "livre" || !he) &&
      !asStr(values.rinsNota) &&
      (ascite === "ausente" || !ascite) &&
      (pan === "habitual" || pan === "parcial" || !pan) &&
      (bex === "habitual" || !bex);
    if (normal) return "Ultrassonografia do abdomen total dentro dos padrões da normalidade.";
    const lines: string[] = [];
    if (eco.startsWith("esteatose")) lines.push(`Esteatose hepática (${eco.replace("esteatose", "grau ")}).`);
    else if (eco === "hepatopatia") lines.push("Alteração da ecotextura hepática — correlação clínica.");
    if (asStr(values.figadoLesoes)) lines.push("Lesão focal hepática — ver relatório.");
    if (ves === "calculos") lines.push("Colelitíase.");
    else if (ves === "colecistite") lines.push("Sinais de colecistite.");
    else if (ves === "lama") lines.push("Lama biliar.");
    else if (ves === "ausente") lines.push("Colecistectomia.");
    if (hd !== "livre" || he !== "livre") lines.push("Dilatação pielocalicinal — ver relatório.");
    if (asStr(values.rinsNota)) lines.push("Alteração renal — ver relatório.");
    if (ascite && ascite !== "ausente") lines.push("Líquido livre intraperitoneal.");
    if (pan === "alterado") lines.push("Alteração pancreática — ver relatório.");
    if (bex && bex !== "habitual") lines.push("Alteração vesical — ver relatório.");
    return lines.length ? lines.join("\n") : "Ultrassonografia do abdomen total dentro dos padrões da normalidade.";
  },
};

export const MASCULINO: ExamDefinition = {
  id: "masculino",
  title: "Masculino — próstata e bolsa",
  printTitle: "ULTRASSONOGRAFIA DA PRÓSTATA E BOLSA ESCROTAL",
  short: "Próstata, vesículas, testículos",
  group: "us",
  blurb: "Próstata transabdominal, vesículas, bexiga e bolsa escrotal.",
  technique:
    "Estudo da próstata por via transabdominal com bexiga repleta e da bolsa escrotal com transdutor linear, complementado por Doppler colorido.",
  dictationHints: [
    "próstata 4,5 por 4,0 por 3,8",
    "resíduo pós-miccional 40 ml",
    "testículo direito 4,2 por 2,5 por 2,3, esquerdo 4,0 por 2,4 por 2,2",
    "varicocele à esquerda grau 2",
    "exame normal",
  ],
  sections: [
    {
      id: "prostata",
      title: "Próstata e vesículas",
      columns: 2,
      fields: [
        { id: "prostata", label: "Próstata (C × L × AP)", type: "measure3", unit: "cm", aliases: ["prostata", "próstata"] },
        {
          id: "prostataEco",
          label: "Ecotextura",
          type: "select",
          options: [
            { value: "habitual", label: "Habitual" },
            { value: "heterogenea", label: "Heterogênea" },
            { value: "nódulo", label: "Nódulo / área suspeita" },
          ],
        },
        { id: "prostataNota", label: "Nota da próstata", type: "text", span: 2 },
        {
          id: "vesiculas",
          label: "Vesículas seminais",
          type: "select",
          options: [
            { value: "habitual", label: "Simétricas, habituais" },
            { value: "dilatadas", label: "Dilatadas" },
            { value: "nao", label: "Não visíveis" },
          ],
        },
      ],
    },
    {
      id: "bexigaM",
      title: "Bexiga",
      columns: 3,
      fields: [
        { id: "volPre", label: "Volume pré-miccional", type: "number", unit: "mL", aliases: ["volume pre", "bexiga cheia"] },
        { id: "volPos", label: "Resíduo pós-miccional", type: "number", unit: "mL", aliases: ["residuo", "resíduo", "pos miccional"] },
        {
          id: "bexigaParede",
          label: "Paredes",
          type: "select",
          options: [
            { value: "finas", label: "Finas" },
            { value: "trabeculada", label: "Trabeculada / espessada" },
          ],
        },
      ],
    },
    {
      id: "bolsa",
      title: "Bolsa escrotal",
      columns: 2,
      fields: [
        { id: "testD", label: "Testículo direito (C × L × AP)", type: "measure3", unit: "cm", aliases: ["testiculo direito", "testículo direito"] },
        { id: "testE", label: "Testículo esquerdo (C × L × AP)", type: "measure3", unit: "cm", aliases: ["testiculo esquerdo", "testículo esquerdo"] },
        {
          id: "hidrocele",
          label: "Hidrocele",
          type: "select",
          options: [
            { value: "ausente", label: "Ausente" },
            { value: "direita", label: "À direita" },
            { value: "esquerda", label: "À esquerda" },
            { value: "bilateral", label: "Bilateral" },
          ],
          aliases: ["hidrocele"],
        },
        {
          id: "varicocele",
          label: "Varicocele",
          type: "select",
          options: [
            { value: "ausente", label: "Ausente" },
            { value: "e1", label: "Esquerda grau I" },
            { value: "e2", label: "Esquerda grau II" },
            { value: "e3", label: "Esquerda grau III" },
            { value: "d", label: "À direita" },
            { value: "bilateral", label: "Bilateral" },
          ],
          aliases: ["varicocele"],
        },
        {
          id: "epididimo",
          label: "Epidídimos",
          type: "select",
          options: [
            { value: "habitual", label: "Habituais" },
            { value: "alterado", label: "Alterados — ver nota" },
          ],
        },
        { id: "bolsaNota", label: "Nota da bolsa / Doppler", type: "text" },
      ],
    },
    { id: "obs", title: "Observações", fields: [{ id: "notes", label: "Notas", type: "text", span: 3 }] },
  ],
  defaults: () => ({
    prostata: emptyMeasure(),
    prostataEco: "habitual",
    prostataNota: "",
    vesiculas: "habitual",
    volPre: null,
    volPos: null,
    bexigaParede: "finas",
    testD: emptyMeasure(),
    testE: emptyMeasure(),
    hidrocele: "ausente",
    varicocele: "ausente",
    epididimo: "habitual",
    bolsaNota: "",
    notes: "",
  }),
  applyNormal: (v) => ({
    ...v,
    prostata: { a: 4.2, b: 3.8, c: 3.2 },
    prostataEco: "habitual",
    vesiculas: "habitual",
    volPos: 10,
    bexigaParede: "finas",
    testD: { a: 4.2, b: 2.5, c: 2.2 },
    testE: { a: 4.1, b: 2.4, c: 2.2 },
    hidrocele: "ausente",
    varicocele: "ausente",
    epididimo: "habitual",
  }),
  findings: (values) => {
    const p = asMeasure(values.prostata);
    const pv = vol(p);
    const prostata = p.a
      ? sentence(
          `Próstata mede ${fmtNum(p.a)} x ${fmtNum(p.b)} x ${fmtNum(p.c)} cm (volume estimado de ${fmtNum(pv, 1)} cm³), de contornos ${pv && pv > 40 ? "aumentados, compatíveis com aumento do volume prostático" : "habituais"}, ecotextura ${asStr(values.prostataEco) === "habitual" ? "habitual" : asStr(values.prostataEco)}${asStr(values.prostataNota) ? ". " + asStr(values.prostataNota) : ""}`,
        )
      : sentence(`Próstata de ecotextura ${asStr(values.prostataEco) || "habitual"}`);
    const ves =
      asStr(values.vesiculas) === "habitual"
        ? "Vesículas seminais simétricas, de aspecto habitual."
        : sentence("Vesículas seminais: " + asStr(values.vesiculas));
    const pre = asNum(values.volPre);
    const pos = asNum(values.volPos);
    const bexiga = sentence(
      `Bexiga de paredes ${asStr(values.bexigaParede) || "finas"}${pre != null ? ", volume pré-miccional de " + fmtNum(pre, 0) + " mL" : ""}${pos != null ? ", resíduo pós-miccional de " + fmtNum(pos, 0) + " mL" : ""}`,
    );
    const td = asMeasure(values.testD);
    const te = asMeasure(values.testE);
    const testes = [
      measureLine("O testículo direito", td.a, td.b, td.c, "cm", vol(td)),
      measureLine("O testículo esquerdo", te.a, te.b, te.c, "cm", vol(te)),
    ]
      .filter(Boolean)
      .join(" ");
    const testesEco = " Ambos de ecotextura habitual, com fluxo arterial preservado ao Doppler.";
    const hidro =
      asStr(values.hidrocele) === "ausente"
        ? " Não há hidrocele significativa."
        : ` Hidrocele ${asStr(values.hidrocele)}.`;
    const variMap: Record<string, string> = {
      ausente: "Não há sinais de varicocele.",
      e1: "Varicocele à esquerda, grau I.",
      e2: "Varicocele à esquerda, grau II.",
      e3: "Varicocele à esquerda, grau III.",
      d: "Varicocele à direita.",
      bilateral: "Varicocele bilateral.",
    };
    const epi =
      asStr(values.epididimo) === "habitual"
        ? "Epidídimos de aspecto habitual."
        : sentence("Epidídimos: " + asStr(values.epididimo));
    return joinSentences([
      prostata,
      ves,
      bexiga,
      (testes || "Testículos tópicos.") + testesEco + hidro,
      variMap[asStr(values.varicocele)] || "",
      epi,
      asStr(values.bolsaNota),
      asStr(values.notes),
    ]);
  },
  conclusion: (values) => {
    const p = asMeasure(values.prostata);
    const pv = vol(p);
    const lines: string[] = [];
    if (pv != null && pv > 40) lines.push(`Aumento do volume prostático (cerca de ${fmtNum(pv, 0)} cm³).`);
    else lines.push("Próstata de volume habitual.");
    const pos = asNum(values.volPos);
    if (pos != null && pos > 50) lines.push(`Resíduo pós-miccional elevado (${fmtNum(pos, 0)} mL).`);
    else lines.push("Esvaziamento vesical satisfatório.");
    if (asStr(values.varicocele) === "ausente") lines.push("Bolsa escrotal sem varicocele ou hidrocele significativas.");
    else lines.push(asStr(values.varicocele).startsWith("e") ? "Varicocele à esquerda." : "Varicocele — ver achados.");
    lines.push("Testículos de ecotextura e fluxo preservados.");
    return lines.map((l) => "• " + l).join("\n");
  },
};

export const FEMININO: ExamDefinition = {
  id: "feminino",
  title: "Feminino — pelve",
  printTitle: "ULTRASSONOGRAFIA PÉLVICA",
  short: "Útero, endométrio, ovários",
  group: "us",
  blurb: "Útero, endométrio e ovários, via abdominal ou transvaginal.",
  technique:
    "Estudo da pelve feminina por via transabdominal com bexiga repleta e/ou via transvaginal, conforme indicação e aceitação da paciente.",
  dictationHints: [
    "útero 7,8 por 4,5 por 4,0, AVF",
    "endométrio 6 milímetros",
    "ovário direito 3,2 por 2,1 por 2,0, esquerdo 3,0 por 2,0 por 1,8",
    "cisto ovariano direito de 28 milímetros, simples",
    "exame normal",
  ],
  sections: [
    {
      id: "via",
      title: "Via e útero",
      columns: 2,
      fields: [
        {
          id: "via",
          label: "Via",
          type: "select",
          options: [
            { value: "tv", label: "Transvaginal" },
            { value: "ta", label: "Transabdominal" },
            { value: "ambas", label: "Ambas" },
          ],
        },
        {
          id: "posicao",
          label: "Posição do útero",
          type: "select",
          options: [
            { value: "avf", label: "Anversoflexão" },
            { value: "rvf", label: "Retroversoflexão" },
            { value: "medio", label: "Médio" },
          ],
          aliases: ["avf", "rvf", "anversoflexao"],
        },
        { id: "utero", label: "Útero (C × L × AP)", type: "measure3", unit: "cm", aliases: ["utero", "útero"] },
        { id: "endometrio", label: "Endométrio", type: "number", unit: "mm", aliases: ["endometrio", "endométrio"] },
        {
          id: "miometrio",
          label: "Miómetrio",
          type: "select",
          options: [
            { value: "habitual", label: "Habitual" },
            { value: "mioma", label: "Mioma(s)" },
            { value: "adenomiose", label: "Sinais de adenomiose" },
          ],
          aliases: ["mioma", "adenomiose"],
        },
        { id: "uteroNota", label: "Nota do útero / miomas", type: "text" },
      ],
    },
    {
      id: "ovarios",
      title: "Ovários e anexos",
      columns: 2,
      fields: [
        { id: "ovD", label: "Ovário direito (C × L × AP)", type: "measure3", unit: "cm", aliases: ["ovario direito", "ovário direito"] },
        { id: "ovE", label: "Ovário esquerdo (C × L × AP)", type: "measure3", unit: "cm", aliases: ["ovario esquerdo", "ovário esquerdo"] },
        { id: "cistoD", label: "Cisto / lesão à direita", type: "text", aliases: ["cisto direito"] },
        { id: "cistoE", label: "Cisto / lesão à esquerda", type: "text", aliases: ["cisto esquerdo"] },
        {
          id: "liquido",
          label: "Líquido em fundo de saco",
          type: "select",
          options: [
            { value: "ausente", label: "Ausente / fisiológico mínimo" },
            { value: "discreto", label: "Discreto" },
            { value: "moderado", label: "Moderado" },
          ],
          aliases: ["fundo de saco", "liquido pélvico"],
        },
      ],
    },
    { id: "obs", title: "Observações", fields: [{ id: "notes", label: "Notas (ciclo, DIU, Doppler)", type: "text", span: 3 }] },
  ],
  defaults: () => ({
    via: "tv",
    posicao: "avf",
    utero: emptyMeasure(),
    endometrio: null,
    miometrio: "habitual",
    uteroNota: "",
    ovD: emptyMeasure(),
    ovE: emptyMeasure(),
    cistoD: "",
    cistoE: "",
    liquido: "ausente",
    notes: "",
  }),
  applyNormal: (v) => ({
    ...v,
    via: "tv",
    posicao: "avf",
    utero: { a: 7.5, b: 4.5, c: 3.8 },
    endometrio: 6,
    miometrio: "habitual",
    ovD: { a: 3.2, b: 2.2, c: 2.0 },
    ovE: { a: 3.0, b: 2.1, c: 1.9 },
    cistoD: "",
    cistoE: "",
    liquido: "ausente",
  }),
  findings: (values) => {
    const viaMap: Record<string, string> = {
      tv: "via transvaginal",
      ta: "via transabdominal",
      ambas: "vias transabdominal e transvaginal",
    };
    const posMap: Record<string, string> = {
      avf: "em anversoflexão",
      rvf: "em retroversoflexão",
      medio: "em posição mediana",
    };
    const u = asMeasure(values.utero);
    const uv = vol(u);
    const endo = asNum(values.endometrio);
    const utero = sentence(
      `Útero ${posMap[asStr(values.posicao)] || ""}${u.a ? ", medindo " + fmtNum(u.a) + " x " + fmtNum(u.b) + " x " + fmtNum(u.c) + " cm" : ""}${uv ? " (volume " + fmtNum(uv, 1) + " cm³)" : ""}. Miómetrio ${asStr(values.miometrio) === "habitual" ? "homogêneo, sem miomas evidentes" : asStr(values.miometrio)}${asStr(values.uteroNota) ? ". " + asStr(values.uteroNota) : ""}. Endométrio ${endo != null ? "com espessura de " + fmtNum(endo, 1) + " mm" : "de aspecto habitual"}, regular`,
    );
    const od = asMeasure(values.ovD);
    const oe = asMeasure(values.ovE);
    const ov = [
      measureLine("O ovário direito", od.a, od.b, od.c, "cm", vol(od)),
      measureLine("O ovário esquerdo", oe.a, oe.b, oe.c, "cm", vol(oe)),
    ]
      .filter(Boolean)
      .join(" ");
    const cistos = [asStr(values.cistoD) && "À direita: " + asStr(values.cistoD), asStr(values.cistoE) && "À esquerda: " + asStr(values.cistoE)]
      .filter(Boolean)
      .join(" ");
    const anexos = cistos
      ? sentence(ov + " " + cistos)
      : sentence((ov || "Ovários tópicos.") + " Sem cistos ou massas anexiais suspeitas neste exame");
    const liq =
      asStr(values.liquido) === "ausente"
        ? "Fundo de saco livre, sem líquido significativo."
        : sentence("Líquido em fundo de saco " + asStr(values.liquido));
    const intro = `Estudo realizado por ${viaMap[asStr(values.via)] || "via transvaginal"}.`;
    return joinSentences([intro, utero, anexos, liq, asStr(values.notes)]);
  },
  conclusion: (values) => {
    const lines: string[] = [];
    const endo = asNum(values.endometrio);
    lines.push("Útero de dimensões e ecoestrutura " + (asStr(values.miometrio) === "habitual" ? "habituais." : "com as alterações descritas."));
    if (endo != null) lines.push(`Endométrio com ${fmtNum(endo, 1)} mm — correlacionar com a fase do ciclo.`);
    if (!asStr(values.cistoD) && !asStr(values.cistoE)) lines.push("Ovários sem lesões caracterizáveis.");
    else lines.push("Achado anexial — ver descrição (provável cisto funcional, a controlar conforme clínica).");
    lines.push("Sem líquido livre significativo em fundo de saco.");
    return lines.map((l) => "• " + l).join("\n");
  },
};
