import { ellipsoidVolume, fmtNum, joinSentences, measureLine, sentence } from "@/lib/format";
import { asMeasure, asNum, asStr, emptyMeasure, type ExamDefinition } from "./types";

const CONTORNO = [
  { value: "regulares", label: "Regulares" },
  { value: "irregulares", label: "Irregulares" },
];

const FIGADO_ECO = [
  { value: "habitual", label: "Habitual" },
  { value: "esteatose1", label: "Esteatose grau I" },
  { value: "esteatose2", label: "Esteatose grau II" },
  { value: "esteatose3", label: "Esteatose grau III" },
  { value: "hepatopatia", label: "Hepatopatia crônica / grosseira" },
];

const VALVULA = [
  { value: "habitual", label: "Habitual" },
  { value: "espessada", label: "Espessada, sem disfunção significativa" },
  { value: "refluxo", label: "Regurgitação" },
  { value: "estenose", label: "Estenose" },
  { value: "protese", label: "Prótese" },
];

function valvaTxt(nome: string, v: string, nota: string) {
  const map: Record<string, string> = {
    habitual: `${nome} de aspecto habitual, sem estenose ou regurgitação significativas neste estudo`,
    espessada: `${nome} com folhetos espessados, sem disfunção hemodinamicamente significativa evidente`,
    refluxo: `${nome} com regurgitação${nota ? " (" + nota + ")" : ""}`,
    estenose: `${nome} com estenose${nota ? " (" + nota + ")" : ""}`,
    protese: `${nome}: prótese${nota ? " — " + nota : ""}`,
  };
  return map[v] || `${nome}: ${v}`;
}

export const ECOCARDIO: ExamDefinition = {
  id: "eco",
  title: "Ecocardiograma",
  printTitle: "ECOCARDIOGRAMA TRANSTORÁCICO",
  short: "Câmaras, FE, valvas",
  group: "us",
  blurb: "Câmaras, paredes, fração de ejeção, valvas e pericárdio.",
  technique:
    "Ecocardiograma transtorácico bidimensional, com Doppler colorido e espectral, nas janelas paraesternal, apical, subcostal e supraesternal, quando disponíveis.",
  dictationHints: [
    "átrio esquerdo 36, aorta 32",
    "septo 9, parede posterior 9",
    "DDVE 48, DSVE 30, fração de ejeção 65",
    "exame normal",
  ],
  sections: [
    {
      id: "camaras",
      title: "Câmaras e paredes",
      columns: 3,
      fields: [
        { id: "ae", label: "Átrio esquerdo", type: "number", unit: "mm", aliases: ["atrio esquerdo", "átrio esquerdo", "ae"] },
        { id: "ao", label: "Raiz da aorta", type: "number", unit: "mm", aliases: ["aorta", "raiz da aorta", "ao"] },
        { id: "vd", label: "Ventrículo direito", type: "number", unit: "mm", aliases: ["ventriculo direito", "ventrículo direito", "vd"] },
        { id: "siv", label: "Septo interventricular", type: "number", unit: "mm", aliases: ["septo", "siv", "septo interventricular"] },
        { id: "ddve", label: "DDVE (diástole)", type: "number", unit: "mm", aliases: ["ddve", "diastol", "cavidade do ve"] },
        { id: "dsve", label: "DSVE (sístole)", type: "number", unit: "mm", aliases: ["dsve", "sistol"] },
        { id: "pp", label: "Parede posterior", type: "number", unit: "mm", aliases: ["parede posterior", "pp"] },
        { id: "fe", label: "Fração de ejeção", type: "number", unit: "%", aliases: ["fracao de ejecao", "fração de ejeção", "fe", "ejection"] },
      ],
    },
    {
      id: "valvas",
      title: "Valvas e pericárdio",
      columns: 2,
      fields: [
        { id: "mitral", label: "Mitral", type: "select", options: VALVULA, aliases: ["mitral"] },
        { id: "aortica", label: "Aórtica", type: "select", options: VALVULA, aliases: ["aortica", "aórtica", "valva aortica"] },
        { id: "tricuspide", label: "Tricúspide", type: "select", options: VALVULA, aliases: ["tricuspide", "tricúspide"] },
        { id: "pulmonar", label: "Pulmonar", type: "select", options: VALVULA, aliases: ["pulmonar"] },
        {
          id: "pericardio",
          label: "Pericárdio",
          type: "select",
          options: [
            { value: "livre", label: "Sem derrame" },
            { value: "discreto", label: "Derrame discreto" },
            { value: "moderado", label: "Derrame moderado" },
            { value: "acentuado", label: "Derrame acentuado" },
          ],
          aliases: ["pericardio", "derrame pericardico"],
        },
        { id: "valvasNota", label: "Nota valvar / Doppler", type: "text", span: 2, aliases: ["nota valvar"] },
        { id: "notes", label: "Observações", type: "text", span: 2 },
      ],
    },
  ],
  defaults: () => ({
    ae: null,
    ao: null,
    vd: null,
    siv: null,
    ddve: null,
    dsve: null,
    pp: null,
    fe: null,
    mitral: "habitual",
    aortica: "habitual",
    tricuspide: "habitual",
    pulmonar: "habitual",
    pericardio: "livre",
    valvasNota: "",
    notes: "",
  }),
  applyNormal: (v) => ({
    ...v,
    ae: 35,
    ao: 32,
    vd: 26,
    siv: 9,
    ddve: 48,
    dsve: 30,
    pp: 9,
    fe: 65,
    mitral: "habitual",
    aortica: "habitual",
    tricuspide: "habitual",
    pulmonar: "habitual",
    pericardio: "livre",
    valvasNota: "",
  }),
  findings: (values) => {
    const mm = (n: number | null, d = 0) => (n != null ? fmtNum(n, d) + " mm" : "");
    const camaras = joinSentences([
      asNum(values.ae) != null ? `Átrio esquerdo mede ${mm(asNum(values.ae))}.` : "",
      asNum(values.ao) != null ? `Raiz da aorta mede ${mm(asNum(values.ao))}.` : "",
      asNum(values.vd) != null ? `Ventrículo direito mede ${mm(asNum(values.vd))} na via de entrada.` : "",
      asNum(values.siv) != null || asNum(values.pp) != null
        ? `Paredes do VE: septo interventricular ${mm(asNum(values.siv)) || "de espessura habitual"} e parede posterior ${mm(asNum(values.pp)) || "de espessura habitual"}.`
        : "Paredes do ventrículo esquerdo de espessura habitual, sem hipertrofia evidente.",
      asNum(values.ddve) != null || asNum(values.dsve) != null
        ? `Cavidade do VE: ${asNum(values.ddve) != null ? "DDVE " + mm(asNum(values.ddve)) : ""}${asNum(values.ddve) && asNum(values.dsve) ? "; " : ""}${asNum(values.dsve) != null ? "DSVE " + mm(asNum(values.dsve)) : ""}.`
        : "Cavidade do ventrículo esquerdo de dimensões habituais.",
      asNum(values.fe) != null
        ? `Fração de ejeção estimada em ${fmtNum(asNum(values.fe), 0)}% (Teichholz / estimativa visual).`
        : "Função sistólica global do VE aparentemente preservada.",
    ]);
    const nota = asStr(values.valvasNota);
    const valvas = joinSentences([
      sentence(valvaTxt("Valva mitral", asStr(values.mitral), nota)),
      sentence(valvaTxt("Valva aórtica", asStr(values.aortica), "")),
      sentence(valvaTxt("Valva tricúspide", asStr(values.tricuspide), "")),
      sentence(valvaTxt("Valva pulmonar", asStr(values.pulmonar), "")),
    ]);
    const peri = asStr(values.pericardio);
    const periTxt =
      peri === "livre" || !peri
        ? "Pericárdio sem derrame."
        : sentence(`Derrame pericárdico ${peri}`);
    return joinSentences([camaras, valvas, periTxt, asStr(values.notes)]);
  },
  conclusion: (values) => {
    const lines: string[] = [];
    const fe = asNum(values.fe);
    if (fe == null || fe >= 55) lines.push("Função sistólica do VE preservada.");
    else if (fe >= 40) lines.push(`Disfunção sistólica leve a moderada (FE ${fmtNum(fe, 0)}%).`);
    else lines.push(`Disfunção sistólica importante (FE ${fmtNum(fe, 0)}%).`);
    const siv = asNum(values.siv);
    const pp = asNum(values.pp);
    if ((siv != null && siv >= 12) || (pp != null && pp >= 12)) lines.push("Hipertrofia ventricular esquerda.");
    else lines.push("Câmaras e paredes de dimensões habituais neste estudo.");
    const valvas = ["mitral", "aortica", "tricuspide", "pulmonar"].every((k) => asStr(values[k]) === "habitual");
    lines.push(valvas ? "Valvas sem disfunção significativa." : "Alteração valvar — ver achados.");
    lines.push(asStr(values.pericardio) === "livre" ? "Sem derrame pericárdico." : "Derrame pericárdico — ver descrição.");
    return lines.map((l) => "• " + l).join("\n");
  },
};

export const PARTES_MOLES: ExamDefinition = {
  id: "partes-moles",
  title: "Partes moles",
  printTitle: "ULTRASSONOGRAFIA DE PARTES MOLES",
  short: "Nódulo, cisto, coleção",
  group: "us",
  blurb: "Lesão de partes moles: local, medidas, natureza e Doppler.",
  technique:
    "Estudo com transdutor linear de alta frequência da região indicada, em modo B, com medidas nos três eixos e Doppler colorido da lesão, quando presente.",
  dictationHints: [
    "região deltoide direita, 2,2 por 1,4 por 1,0, lipoma",
    "sem lesão identificável",
    "exame normal",
  ],
  sections: [
    {
      id: "lesao",
      title: "Região e lesão",
      columns: 2,
      fields: [
        { id: "local", label: "Região / local", type: "text", span: 2, aliases: ["regiao", "local", "topografia"] },
        {
          id: "lado",
          label: "Lado",
          type: "select",
          options: [
            { value: "direita", label: "Direita" },
            { value: "esquerda", label: "Esquerda" },
            { value: "mediana", label: "Mediana / cruzada" },
          ],
          aliases: ["lado"],
        },
        {
          id: "natureza",
          label: "Natureza",
          type: "select",
          options: [
            { value: "ausente", label: "Sem lesão identificável" },
            { value: "lipoma", label: "Lipoma / gordurosa" },
            { value: "cisto", label: "Cisto" },
            { value: "colecao", label: "Coleção" },
            { value: "solido", label: "Nódulo sólido" },
            { value: "inflamatorio", label: "Processo inflamatório" },
            { value: "hernia", label: "Hérnia" },
            { value: "outro", label: "Outro — ver nota" },
          ],
          aliases: ["lipoma", "cisto", "colecao", "nodulo", "hernia"],
        },
        { id: "medidas", label: "Medidas (C × AP × T)", type: "measure3", unit: "cm", aliases: ["mede", "medidas", "dimensoes"] },
        { id: "pele", label: "Distância da pele", type: "number", unit: "mm", aliases: ["distancia da pele", "pele"] },
        {
          id: "doppler",
          label: "Doppler",
          type: "select",
          options: [
            { value: "avascular", label: "Avascular" },
            { value: "periferico", label: "Fluxo periférico" },
            { value: "interno", label: "Fluxo interno" },
          ],
          aliases: ["doppler", "fluxo"],
        },
        { id: "descricao", label: "Descrição", type: "text", span: 2, aliases: ["descricao"] },
        { id: "notes", label: "Observações", type: "text", span: 2 },
      ],
    },
  ],
  defaults: () => ({
    local: "",
    lado: "direita",
    natureza: "ausente",
    medidas: emptyMeasure(),
    pele: null,
    doppler: "avascular",
    descricao: "",
    notes: "",
  }),
  applyNormal: (v) => ({
    ...v,
    natureza: "ausente",
    medidas: emptyMeasure(),
    descricao: "",
    doppler: "avascular",
  }),
  findings: (values) => {
    const local = [asStr(values.local), asStr(values.lado)].filter(Boolean).join(", ");
    const nat = asStr(values.natureza);
    const m = asMeasure(values.medidas);
    const linha = measureLine("A lesão", m.a, m.b, m.c, "cm");
    const pele = asNum(values.pele);
    if (nat === "ausente" || !nat) {
      return joinSentences([
        sentence(
          `Estudo das partes moles${local ? " em " + local : ""}. Tecido subcutâneo e planos musculares de espessura e ecotextura habituais, sem coleções, nódulos ou hérnias identificáveis neste exame`,
        ),
        asStr(values.notes),
      ]);
    }
    const nome: Record<string, string> = {
      lipoma: "lesão de aspecto lipomatoso",
      cisto: "imagem cística",
      colecao: "coleção",
      solido: "nódulo sólido",
      inflamatorio: "área de aspecto inflamatório",
      hernia: "hérnia",
      outro: "lesão",
    };
    return joinSentences([
      sentence(
        `Em ${local || "a topografia indicada"} identifica-se ${nome[nat] || "lesão"}${linha ? " — " + linha.replace(/^A lesão mede /, "medindo ").replace(/\.$/, "") : ""}${pele != null ? ", a " + fmtNum(pele, 0) + " mm da pele" : ""}. Doppler: ${asStr(values.doppler) || "não caracterizado"}${asStr(values.descricao) ? ". " + asStr(values.descricao) : ""}`,
      ),
      asStr(values.notes),
    ]);
  },
  conclusion: (values) => {
    const nat = asStr(values.natureza);
    if (nat === "ausente" || !nat) return "• Partes moles sem lesões identificáveis neste exame.";
    const map: Record<string, string> = {
      lipoma: "Lesão de partes moles de aspecto lipomatoso.",
      cisto: "Lesão cística de partes moles.",
      colecao: "Coleção de partes moles.",
      solido: "Nódulo sólido de partes moles — correlação clínica.",
      inflamatorio: "Processo inflamatório de partes moles.",
      hernia: "Hérnia na topografia estudada.",
      outro: "Lesão de partes moles — ver achados.",
    };
    return "• " + (map[nat] || "Ver achados.");
  },
};

export const ABDOMEN_SUPERIOR: ExamDefinition = {
  id: "abdomen-superior",
  title: "Abdômen superior",
  printTitle: "ULTRASSONOGRAFIA DE ABDÔMEN SUPERIOR",
  short: "Fígado, vesícula, pâncreas, baço",
  group: "us",
  blurb: "Fígado, vias biliares, vesícula, pâncreas e baço.",
  technique:
    "Estudo do abdômen superior com transdutor convexo, em jejum, avaliando fígado, vias biliares, vesícula, pâncreas e baço.",
  dictationHints: [
    "fígado homogêneo, lobo direito 15 centímetros",
    "vesícula sem cálculos, paredes 2 milímetros",
    "colédoco 4 milímetros",
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
        { id: "figadoLesoes", label: "Lesões focais", type: "text", span: 3, aliases: ["lesao hepatic", "nódulo hepatic"] },
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
        { id: "baco", label: "Baço (eixo maior)", type: "number", unit: "cm", aliases: ["baco", "baço"] },
        { id: "pancreasNota", label: "Nota pâncreas", type: "text" },
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
    notes: "",
  }),
  applyNormal: (v) => ({
    ...v,
    figadoLD: 14.5,
    figadoEco: "habitual",
    figadoContorno: "regulares",
    vesicula: "habitual",
    vesiculaParede: 2,
    coledoco: 4,
    pancreas: "habitual",
    baco: 10,
    figadoLesoes: "",
  }),
  findings: (values) => {
    const ld = asNum(values.figadoLD);
    const eco = asStr(values.figadoEco);
    const ecoTxt: Record<string, string> = {
      habitual: "ecogenicidade habitual, compatível com parênquima preservado",
      esteatose1: "aumento discreto da ecogenicidade, compatível com esteatose grau I",
      esteatose2: "aumento moderado da ecogenicidade com atenuação acústica posterior, compatível com esteatose grau II",
      esteatose3: "aumento acentuado da ecogenicidade com pobre definição diafragmática, compatível com esteatose grau III",
      hepatopatia: "ecotextura grosseira, a correlacionar com hepatopatia crônica",
    };
    const figado = sentence(
      `Fígado de contornos ${asStr(values.figadoContorno) || "regulares"}${ld ? ", lobo direito medindo " + fmtNum(ld, 1) + " cm no eixo craniocaudal" : ""}, ${ecoTxt[eco] || "ecotextura habitual"}${asStr(values.figadoLesoes) ? ". " + asStr(values.figadoLesoes) : ". Não se identificam lesões focais"}`,
    );
    const ves = asStr(values.vesicula);
    const parede = asNum(values.vesiculaParede);
    const cho = asNum(values.coledoco);
    let vesicula = "";
    if (ves === "ausente") vesicula = "Vesícula biliar ausente (antecedente de colecistectomia).";
    else if (ves === "calculos")
      vesicula = sentence(
        `Vesícula biliar com imagens hiperecogênicas com sombra acústica posterior, compatíveis com cálculos${asStr(values.vesiculaNota) ? " (" + asStr(values.vesiculaNota) + ")" : ""}${parede ? ", paredes medindo " + fmtNum(parede, 1) + " mm" : ""}`,
      );
    else if (ves === "lama") vesicula = sentence("Vesícula biliar com conteúdo ecogênico móvel, sem sombra, compatível com lama biliar");
    else if (ves === "colecistite")
      vesicula = sentence(
        `Sinais ultrassonográficos de colecistite${parede ? " (paredes de " + fmtNum(parede, 1) + " mm)" : ""}`,
      );
    else
      vesicula = sentence(
        `Vesícula biliar alitiásica, de paredes finas${parede ? " (" + fmtNum(parede, 1) + " mm)" : ""}`,
      );
    const vias =
      cho != null
        ? ` Colédoco mede ${fmtNum(cho, 1)} mm, sem dilatação das vias intra-hepáticas.`
        : " Vias biliares intra e extra-hepáticas de calibre habitual.";
    const pan = asStr(values.pancreas);
    const panTxt: Record<string, string> = {
      habitual: "Pâncreas de dimensões e ecotextura habituais, na extensão visível.",
      parcial: "Pâncreas parcialmente visível em virtude de interposição gasosa, na porção identificada sem lesões focais.",
      nao: "Pâncreas não visível neste exame por interposição gasosa.",
      alterado: sentence("Pâncreas alterado" + (asStr(values.pancreasNota) ? ": " + asStr(values.pancreasNota) : "")),
    };
    const baco = asNum(values.baco);
    const bacoTxt = baco != null ? `Baço com eixo maior de ${fmtNum(baco, 1)} cm, de ecotextura habitual.` : "Baço de aspecto habitual.";
    return joinSentences([figado, vesicula + vias, panTxt[pan], bacoTxt, asStr(values.notes)]);
  },
  conclusion: (values) => {
    const lines: string[] = [];
    const eco = asStr(values.figadoEco);
    if (eco === "habitual") lines.push("Fígado sem sinais de esteatose ou lesões focais.");
    else if (eco.startsWith("esteatose")) lines.push(`Esteatose hepática (${eco.replace("esteatose", "grau ")}).`);
    else lines.push("Alteração da ecotextura hepática — correlação clínica.");
    const ves = asStr(values.vesicula);
    if (ves === "habitual") lines.push("Vesícula alitiásica; vias biliares de calibre habitual.");
    else if (ves === "calculos") lines.push("Colelitíase.");
    else if (ves === "ausente") lines.push("Colecistectomia. Vias biliares sem dilatação.");
    else lines.push("Alteração vesicular — ver achados.");
    lines.push("Pâncreas e baço sem particularidades no visível.");
    return lines.map((l) => "• " + l).join("\n");
  },
};

const JUNTAS = [
  { value: "ombro", label: "Ombro" },
  { value: "cotovelo", label: "Cotovelo" },
  { value: "punho", label: "Punho" },
  { value: "mao", label: "Mão / dedos" },
  { value: "quadril", label: "Quadril" },
  { value: "joelho", label: "Joelho" },
  { value: "tornozelo", label: "Tornozelo" },
  { value: "pe", label: "Pé" },
  { value: "outra", label: "Outra" },
];

export const ARTICULACOES: ExamDefinition = {
  id: "articulacoes",
  title: "Articulações",
  printTitle: "ULTRASSONOGRAFIA ARTICULAR",
  short: "Derrame, tendões, sinóvia",
  group: "us",
  blurb: "Derrame, membrana sinovial, tendões e partes moles periarticulares.",
  technique:
    "Estudo articular com transdutor linear de alta frequência, comparativo quando indicado, avaliando recessos, tendões, ligamentos e partes moles periarticulares.",
  dictationHints: [
    "joelho direito, derrame discreto de 8 milímetros",
    "ombro esquerdo, tendão supraespinhal íntegro",
    "exame normal",
  ],
  sections: [
    {
      id: "junta",
      title: "Articulação",
      columns: 2,
      fields: [
        { id: "articulacao", label: "Articulação", type: "select", options: JUNTAS, aliases: ["ombro", "joelho", "quadril", "tornozelo", "punho", "cotovelo"] },
        {
          id: "lado",
          label: "Lado",
          type: "select",
          options: [
            { value: "direita", label: "Direita" },
            { value: "esquerda", label: "Esquerda" },
            { value: "bilateral", label: "Bilateral" },
          ],
          aliases: ["lado"],
        },
        {
          id: "derrame",
          label: "Derrame",
          type: "select",
          options: [
            { value: "ausente", label: "Ausente" },
            { value: "discreto", label: "Discreto" },
            { value: "moderado", label: "Moderado" },
            { value: "acentuado", label: "Acentuado" },
          ],
          aliases: ["derrame", "liquido articular"],
        },
        { id: "derrameMm", label: "Espessura do derrame", type: "number", unit: "mm", aliases: ["espessura do derrame"] },
        {
          id: "sinovial",
          label: "Membrana sinovial",
          type: "select",
          options: [
            { value: "habitual", label: "Habitual" },
            { value: "espessada", label: "Espessada" },
            { value: "hiperemia", label: "Espessada com hiperemia" },
          ],
          aliases: ["sinovial", "sinovia"],
        },
        {
          id: "tendao",
          label: "Tendões",
          type: "select",
          options: [
            { value: "integros", label: "Íntegros" },
            { value: "tendinopatia", label: "Tendinopatia" },
            { value: "ruptura_parcial", label: "Ruptura parcial" },
            { value: "ruptura", label: "Ruptura" },
          ],
          aliases: ["tendao", "tendões", "supraespinhal"],
        },
        { id: "tendaoNota", label: "Qual tendão / nota", type: "text", span: 2, aliases: ["nota tendao"] },
        { id: "notes", label: "Observações", type: "text", span: 2 },
      ],
    },
  ],
  defaults: () => ({
    articulacao: "joelho",
    lado: "direita",
    derrame: "ausente",
    derrameMm: null,
    sinovial: "habitual",
    tendao: "integros",
    tendaoNota: "",
    notes: "",
  }),
  applyNormal: (v) => ({
    ...v,
    derrame: "ausente",
    sinovial: "habitual",
    tendao: "integros",
    tendaoNota: "",
  }),
  findings: (values) => {
    const art = JUNTAS.find((j) => j.value === asStr(values.articulacao))?.label || "Articulação";
    const lado = asStr(values.lado);
    const der = asStr(values.derrame);
    const mm = asNum(values.derrameMm);
    const derTxt =
      der === "ausente" || !der
        ? "sem derrame articular significativo"
        : `derrame articular ${der}${mm != null ? " (até " + fmtNum(mm, 0) + " mm)" : ""}`;
    const sin = asStr(values.sinovial);
    const sinTxt: Record<string, string> = {
      habitual: "membrana sinovial de espessura habitual",
      espessada: "espessamento sinovial",
      hiperemia: "espessamento sinovial com hiperemia ao Doppler",
    };
    const ten = asStr(values.tendao);
    const tenTxt: Record<string, string> = {
      integros: "tendões de espessura e ecotextura habituais, sem ruptura identificável",
      tendinopatia: "sinais de tendinopatia" + (asStr(values.tendaoNota) ? " (" + asStr(values.tendaoNota) + ")" : ""),
      ruptura_parcial: "sinais de ruptura parcial" + (asStr(values.tendaoNota) ? " (" + asStr(values.tendaoNota) + ")" : ""),
      ruptura: "sinais de ruptura" + (asStr(values.tendaoNota) ? " (" + asStr(values.tendaoNota) + ")" : ""),
    };
    return joinSentences([
      sentence(
        `${art} ${lado}: ${derTxt}; ${sinTxt[sin] || sin}; ${tenTxt[ten] || ten}. Superfícies ósseas visíveis sem irregularidades grosseiras neste recorte`,
      ),
      asStr(values.notes),
    ]);
  },
  conclusion: (values) => {
    const lines: string[] = [];
    const der = asStr(values.derrame);
    lines.push(der === "ausente" || !der ? "Sem derrame articular significativo." : `Derrame articular ${der}.`);
    const ten = asStr(values.tendao);
    if (ten === "integros") lines.push("Tendões íntegros neste estudo.");
    else if (ten === "tendinopatia") lines.push("Tendinopatia — ver descrição.");
    else lines.push("Alteração tendínea — ver achados.");
    if (asStr(values.sinovial) === "habitual") lines.push("Sinóvia habitual.");
    else lines.push("Sinovite / espessamento sinovial.");
    return lines.map((l) => "• " + l).join("\n");
  },
};

export const ABDOMEN_PROSTATA: ExamDefinition = {
  id: "abdomen-prostata",
  title: "Abdômen e próstata",
  printTitle: "ULTRASSONOGRAFIA DO ABDOME TOTAL E PRÓSTATA",
  short: "Abdômen, próstata, resíduo",
  group: "us",
  blurb: "Abdômen total com próstata transabdominal, vesículas e resíduo pós-miccional.",
  technique:
    "Realizado estudo com transdutor convexo multifrequencial na modalidade bidimensional, em jejum, com avaliação da próstata por via abdominal e volumes vesicais pré e pós-miccionais.",
  dictationHints: [
    "fígado esteatose grau 2",
    "próstata 4,0 por 3,5 por 3,4",
    "pré-miccional 270, pós-miccional 7,5",
    "exame normal",
  ],
  sections: [
    {
      id: "figado",
      title: "Fígado e vias",
      columns: 3,
      fields: [
        { id: "figadoLD", label: "Lobo direito (craniocaudal)", type: "number", unit: "cm", aliases: ["figado", "fígado"] },
        { id: "figadoEco", label: "Ecogenicidade", type: "select", options: FIGADO_ECO, aliases: ["esteatose"] },
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
          aliases: ["vesicula", "vesícula"],
        },
        { id: "figadoLesoes", label: "Lesões focais / nota fígado", type: "text", span: 3 },
      ],
    },
    {
      id: "abdome",
      title: "Pâncreas, baço, rins e vasos",
      columns: 3,
      fields: [
        {
          id: "pancreas",
          label: "Pâncreas",
          type: "select",
          options: [
            { value: "habitual", label: "Configuração anatômica" },
            { value: "parcial", label: "Parcialmente visível" },
            { value: "nao", label: "Não visível" },
            { value: "alterado", label: "Alterado" },
          ],
          aliases: ["pancreas", "pâncreas"],
        },
        { id: "baco", label: "Baço (eixo maior)", type: "number", unit: "cm", aliases: ["baco", "baço"] },
        { id: "aorta", label: "Aorta", type: "number", unit: "cm", aliases: ["aorta"] },
        { id: "rimD", label: "Rim direito", type: "number", unit: "cm", aliases: ["rim direito"] },
        { id: "rimE", label: "Rim esquerdo", type: "number", unit: "cm", aliases: ["rim esquerdo"] },
        { id: "rinsNota", label: "Nota dos rins", type: "text" },
      ],
    },
    {
      id: "prostata",
      title: "Próstata e bexiga",
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
            { value: "nódulo", label: "Nódulo — ver nota" },
          ],
        },
        {
          id: "vesiculas",
          label: "Vesículas seminais",
          type: "select",
          options: [
            { value: "habitual", label: "Simétricas" },
            { value: "dilatadas", label: "Dilatadas" },
            { value: "assimetricas", label: "Assimétricas" },
          ],
          aliases: ["vesiculas seminais"],
        },
        { id: "volPre", label: "Volume pré-miccional", type: "number", unit: "ml", aliases: ["pre-miccional", "pré-miccional", "volume vesical"] },
        { id: "volPos", label: "Volume pós-miccional", type: "number", unit: "ml", aliases: ["pos-miccional", "pós-miccional", "residuo"] },
        { id: "prostataNota", label: "Nota da próstata", type: "text", span: 2 },
        { id: "notes", label: "Observações", type: "text", span: 2 },
      ],
    },
  ],
  defaults: () => ({
    figadoLD: null,
    figadoEco: "habitual",
    vesicula: "habitual",
    figadoLesoes: "",
    pancreas: "habitual",
    baco: null,
    aorta: null,
    rimD: null,
    rimE: null,
    rinsNota: "",
    prostata: emptyMeasure(),
    prostataEco: "habitual",
    vesiculas: "habitual",
    volPre: null,
    volPos: null,
    prostataNota: "",
    notes: "",
  }),
  applyNormal: (v) => ({
    ...v,
    figadoEco: "habitual",
    vesicula: "habitual",
    pancreas: "habitual",
    prostata: { a: 4.0, b: 3.5, c: 3.4 },
    prostataEco: "habitual",
    vesiculas: "habitual",
    volPre: 270.3,
    volPos: 7.5,
    figadoLesoes: "",
    rinsNota: "",
  }),
  findings: (values) => {
    const ld = asNum(values.figadoLD);
    const eco = asStr(values.figadoEco);
    const med = ld != null ? ` Lobo direito com ${fmtNum(ld, 1)} cm no eixo craniocaudal.` : "";
    const vaso =
      "Não há alterações nos trajetos vasculares. Ausência de dilatação de vias biliares intra-hepáticas. Veia porta de calibre normal.";
    const base = "Fígado com bordos lisos e regulares, morfologia e dimensões normais.";
    let figado = `${base} ${vaso}${med}`;
    if (eco === "esteatose1") {
      figado = `${base} Aumento discreto da ecogenicidade hepática. ${vaso}${med}`;
    } else if (eco === "esteatose2") {
      figado = `${base} Aumento difuso da ecogenicidade hepática com atenuação do feixe acústico posterior, que pode dificultar a visibilização de lesões focais. ${vaso}${med}`;
    } else if (eco === "esteatose3") {
      figado = `${base} Aumento acentuado da ecogenicidade hepática com importante atenuação do feixe acústico posterior, que pode dificultar a visibilização de lesões focais. ${vaso}${med}`;
    } else if (eco === "hepatopatia") {
      figado = `Fígado com ecotextura grosseira, a correlacionar com hepatopatia crônica. ${vaso}${med}`;
    }
    if (asStr(values.figadoLesoes)) figado += " " + asStr(values.figadoLesoes);

    const vias = "Não há dilatação das vias biliares intra ou extra-hepáticas.";

    const ves = asStr(values.vesicula);
    const vesicula =
      ves === "ausente"
        ? "Vesícula biliar ausente (antecedente de colecistectomia)."
        : ves === "calculos"
          ? "Vesícula biliar com cálculos no seu interior."
          : ves === "lama"
            ? "Vesícula biliar com lama biliar."
            : ves === "colecistite"
              ? "Vesícula biliar com sinais de colecistite."
              : "Vesícula biliar normodistendida sem cálculos no seu interior, com parede de espessura normal.";

    const pan = asStr(values.pancreas);
    const pancreas =
      pan === "parcial"
        ? "Pâncreas parcialmente visível por interposição gasosa; nos segmentos avaliados, configuração anatômica."
        : pan === "nao"
          ? "Pâncreas não visível neste exame por interposição gasosa."
          : pan === "alterado"
            ? "Pâncreas com alteração da configuração anatômica."
            : "Pâncreas com configuração anatômica.";

    const bacoN = asNum(values.baco);
    const baco = `Baço com volume, contornos e ecogenicidade normais.${bacoN != null ? " Eixo maior de " + fmtNum(bacoN, 1) + " cm." : ""}`;

    const rd = asNum(values.rimD);
    const re = asNum(values.rimE);
    const rinsMed =
      rd != null || re != null
        ? ` ${[rd != null ? "direito " + fmtNum(rd, 1) + " cm" : "", re != null ? "esquerdo " + fmtNum(re, 1) + " cm" : ""].filter(Boolean).join("; ")}.`
        : "";
    const rins = asStr(values.rinsNota)
      ? sentence(`Rins com dimensões avaliadas, contornos lisos${rinsMed} ${asStr(values.rinsNota)}`)
      : `Rins com dimensões normais, contornos lisos, apresentando espessura do parênquima e diferenciação cortico-medular preservadas. Não há dilatação do sistema coletor ou sinais de litíase.${rinsMed}`;

    const retro = "Ausência de adenomegalias retroperitoneais.";
    const ao = asNum(values.aorta);
    const aorta = `Aorta e veia cava com calibre normal.${ao != null ? " Aorta com " + fmtNum(ao, 1) + " cm." : ""}`;
    const bexiga =
      "Bexiga normodistendida, de contornos lisos e sem falhas de enchimento.\nOstios-ureterais permeáveis.";

    const m = asMeasure(values.prostata);
    const pv = ellipsoidVolume(m.a, m.b, m.c);
    const peso = pv != null ? Math.round(pv * 1.05 * 10) / 10 : null;
    const dims = m.a != null ? `${fmtNum(m.a, 1)} x ${fmtNum(m.b, 1)} x ${fmtNum(m.c, 1)} cm` : "";
    const ecoP = asStr(values.prostataEco);
    const ecoPTxt = ecoP === "heterogenea" ? "textura ecográfica heterogênea" : "textura ecográfica habitual";
    let prostata = `Próstata com volume ${pv != null && pv > 40 ? "aumentado" : "normal"}, bem delimitada, com ${ecoPTxt}, na análise por via abdominal.`;
    if (dims) {
      prostata += `\nMedidas da próstata: ${dims}          Volume: ${fmtNum(pv, 1)} cc          Peso: ${fmtNum(peso, 1)} gramas`;
    }
    if (asStr(values.prostataNota)) prostata += "\n" + asStr(values.prostataNota);

    const vesiculas =
      asStr(values.vesiculas) === "habitual" || !asStr(values.vesiculas)
        ? "Vesículas seminais simétricas;"
        : sentence("Vesículas seminais: " + asStr(values.vesiculas));

    const vols = [
      asNum(values.volPre) != null ? `Volume vesical pré-miccional: ${fmtNum(asNum(values.volPre), 1)} ml.` : "",
      asNum(values.volPos) != null ? `Volume vesical pós-miccional: ${fmtNum(asNum(values.volPos), 1)} ml.` : "",
    ]
      .filter(Boolean)
      .join("\n");

    return joinSentences([
      figado,
      vias,
      vesicula,
      pancreas,
      baco,
      rins,
      retro,
      aorta,
      bexiga,
      prostata,
      vesiculas,
      vols,
      asStr(values.notes),
    ]);
  },
  conclusion: (values) => {
    const eco = asStr(values.figadoEco);
    const m = asMeasure(values.prostata);
    const pv = ellipsoidVolume(m.a, m.b, m.c);
    const peso = pv != null ? Math.round(pv * 1.05 * 10) / 10 : null;
    const pos = asNum(values.volPos);
    const lines: string[] = [];
    if (eco === "esteatose1") {
      lines.push("Aumento discreto da ecogenicidade hepática, comumente relacionado a infiltração gordurosa (esteatose grau I).");
    } else if (eco === "esteatose2") {
      lines.push("Aumento moderado da ecogenicidade hepática, comumente relacionado a infiltração gordurosa (esteatose grau II).");
    } else if (eco === "esteatose3") {
      lines.push("Aumento acentuado da ecogenicidade hepática, comumente relacionado a infiltração gordurosa (esteatose grau III).");
    } else if (eco === "hepatopatia") {
      lines.push("Alteração da ecotextura hepática — correlação clínica.");
    }
    if (asStr(values.vesicula) === "calculos") lines.push("Colelitíase.");
    if (asStr(values.rinsNota)) lines.push("Alteração renal — ver relatório.");
    if (peso != null) lines.push(`Próstata com peso estimado em ${fmtNum(peso, 1)} gramas.`);
    if (pos != null && pos <= 20) lines.push("Volume vesical pós miccional desprezível.");
    else if (pos != null) lines.push(`Resíduo vesical pós-miccional de ${fmtNum(pos, 1)} ml.`);
    if (!lines.length) return "Ultrassonografia do abdome total e próstata dentro dos padrões da normalidade.";
    return lines.join("\n");
  },
};
