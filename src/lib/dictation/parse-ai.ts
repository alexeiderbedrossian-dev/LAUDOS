import { createServerFn } from "@tanstack/react-start";
import { getExam } from "@/lib/exams";
import type { ExamId } from "@/lib/exams/types";

type Input = {
  examId: ExamId;
  transcript: string;
  valuesJson: string;
};

type AiResult =
  | { ok: true; patchJson: string; note: string }
  | { ok: false; error: string };

export const parseDictationAi = createServerFn({ method: "POST" })
  .validator((input: Input) => input)
  .handler(async ({ data }): Promise<AiResult> => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false, error: "IA indisponível neste ambiente." };

    const exam = getExam(data.examId);
    if (!exam) return { ok: false, error: "Exame desconhecido." };

    const fieldHint = exam.sections
      .flatMap((s) => s.fields || [])
      .map((f) => `${f.id} (${f.type}) — ${f.label}`)
      .join("\n");

    const system = `Você preenche laudos de ultrassonografia em português do Brasil.
Recebe o ditado do médico radiologista e o JSON atual dos campos.
Devolva APENAS JSON válido no formato:
{"patch":{...somente campos alterados...},"note":"resumo curto do que preencheu"}
Regras:
- Números com ponto decimal no JSON (4.8 não 4,8).
- Medidas em 3 eixos: {"a":n,"b":n,"c":n}. Tireoide/próstata/útero/ovário/testículo em cm; nódulos tireoidianos e diâmetros venosos em mm; PSV em cm/s.
- "exame normal" ou "sem alterações" deve preencher valores típicos de normalidade daquele exame.
- Preserve campos não mencionados.
- Nódulos: acrescente em "nodules" (array). Perfurantes: "perforators".
- Não invente patologias que o médico não falou.
Campos do exame ${exam.title}:
${fieldHint || "(tabelas vasculares: right/left com psv, edv, wave, stenosis; mapeamento: right/left por nível com diam, refluxo, incompetente)"}`;

    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4.5",
        temperature: 0,
        max_tokens: 1800,
        messages: [
          { role: "system", content: system },
          {
            role: "user",
            content: `Ditado:\n${data.transcript}\n\nValores atuais:\n${data.valuesJson.slice(0, 6000)}`,
          },
        ],
      }),
    });

    if (!res.ok) return { ok: false, error: `Falha ao interpretar o ditado (${res.status}).` };

    const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const text = body.choices?.[0]?.message?.content ?? "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { ok: false, error: "A IA não devolveu um preenchimento válido." };

    try {
      const parsed = JSON.parse(jsonMatch[0]) as { patch?: Record<string, never>; note?: string };
      const patchJson = JSON.stringify(parsed.patch ?? {});
      return {
        ok: true,
        patchJson,
        note: parsed.note || "Campos atualizados a partir do ditado.",
      };
    } catch {
      return { ok: false, error: "Não consegui ler o preenchimento da IA." };
    }
  });
