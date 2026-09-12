import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { DictationBar } from "@/components/dictation-bar";
import { ExamForm, PatientFields } from "@/components/exam-form";
import { ReportPreview } from "@/components/report-preview";
import { Button } from "@/components/ui/button";
import { getExam } from "@/lib/exams";
import { EXAM_IDS, type ExamId, type Patient } from "@/lib/exams/types";
import { useAppStore, useStoreHydrated } from "@/lib/store";
import { Check, Printer, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type Search = { id?: string };
type Tab = "medidas" | "laudo";

export const Route = createFileRoute("/exame/$tipo")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    id: typeof s.id === "string" ? s.id : undefined,
  }),
  component: ExamEditor,
});

function ExamEditor() {
  const { tipo } = Route.useParams();
  const { id } = Route.useSearch();
  const navigate = useNavigate();
  const exam = getExam(tipo);
  const reports = useAppStore((s) => s.reports);
  const createReport = useAppStore((s) => s.createReport);
  const updateReport = useAppStore((s) => s.updateReport);
  const updateValues = useAppStore((s) => s.updateValues);
  const hydrated = useStoreHydrated();
  const [tab, setTab] = useState<Tab>("medidas");
  const [highlighted, setHighlighted] = useState<string[]>([]);
  const [flash, setFlash] = useState("");

  const report = useMemo(() => reports.find((r) => r.id === id), [reports, id]);

  useEffect(() => {
    if (!hydrated) return;
    if (!exam || !EXAM_IDS.includes(tipo as ExamId)) return;
    if (!id) {
      const r = createReport(tipo as ExamId);
      void navigate({
        to: "/exame/$tipo",
        params: { tipo },
        search: { id: r.id },
        replace: true,
      });
    }
  }, [hydrated, exam, id, tipo, createReport, navigate]);

  if (!exam) {
    return (
      <AppShell>
        <p>Exame não encontrado.</p>
        <Link to="/" className="text-teal">
          Voltar
        </Link>
      </AppShell>
    );
  }

  if (!report) {
    return (
      <AppShell>
        <p className="text-muted">{hydrated ? "Laudo não encontrado neste aparelho." : "Abrindo o laudo…"}</p>
      </AppShell>
    );
  }

  const applyNormal = () => {
    const next = exam.applyNormal(report.values, report.patient);
    updateValues(report.id, next);
    setFlash("Padrão de normalidade aplicado. Ajuste o que for diferente.");
    setHighlighted(["ld", "le", "istmo", "figadoLD", "rimD", "rimE", "prostata", "utero"]);
    window.setTimeout(() => setHighlighted([]), 2500);
  };

  return (
    <AppShell className="max-w-6xl pb-64">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link to="/" className="text-xs uppercase tracking-[0.16em] text-teal hover:underline">
            Novo exame
          </Link>
          <h1 className="mt-1 font-display text-3xl tracking-tight">{exam.title}</h1>
          <p className="text-sm text-muted">{exam.blurb}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={applyNormal}>
            <Sparkles />
            Exame normal
          </Button>
          <Link
            to="/imprimir/$id"
            params={{ id: report.id }}
            className="inline-flex h-11 items-center gap-2 rounded-md bg-teal px-4 text-sm font-medium text-teal-fg"
          >
            <Printer className="size-4" />
            Imprimir
          </Link>
        </div>
      </div>

      {flash ? (
        <p className="mt-4 flex items-center gap-2 rounded-lg bg-teal-soft px-3 py-2 text-sm text-teal">
          <Check className="size-4" />
          {flash}
        </p>
      ) : null}

      <div className="mt-6 rounded-2xl border border-line bg-paper p-4 shadow-card sm:p-5">
        <PatientFields
          patient={report.patient}
          onChange={(p) => updateReport(report.id, { patient: p as Patient })}
        />
      </div>

      <div className="mt-6 flex gap-1 rounded-lg bg-sunken p-1 sm:hidden">
        {(["medidas", "laudo"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "h-10 flex-1 rounded-md text-sm font-medium",
              tab === t ? "bg-paper text-ink shadow-sm" : "text-muted",
            )}
          >
            {t === "medidas" ? "Medidas" : "Laudo"}
          </button>
        ))}
      </div>

      <div className={cn(
        "mt-6 grid gap-6",
        exam.sections.some((s) => s.kind === "vessel-table" || s.kind === "mapping")
          ? "lg:grid-cols-1"
          : "lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]",
      )}>
        <div className={cn("rounded-2xl border border-line bg-paper p-4 shadow-card sm:p-6", tab !== "medidas" && "hidden lg:block")}>
          <ExamForm
            exam={exam}
            values={report.values}
            highlighted={highlighted}
            onChange={(values) => {
              updateValues(report.id, values);
            }}
          />
        </div>
        <div className={cn("rounded-2xl border border-line bg-paper p-4 shadow-card sm:p-6 lg:sticky lg:top-24 lg:self-start", tab !== "laudo" && "hidden lg:block")}>
          <h2 className="font-display text-xl">Laudo</h2>
          <p className="mb-4 text-sm text-muted">Texto gerado a partir das medidas. Edite à vontade antes de imprimir.</p>
          <ReportPreview
            report={report}
            onFindings={(text) => updateReport(report.id, { findingsOverride: text })}
            onConclusion={(text) => updateReport(report.id, { conclusionOverride: text })}
          />
        </div>
      </div>

      <div className="no-print fixed inset-x-0 bottom-0 z-30 p-3 sm:p-4">
        <div className="mx-auto max-w-3xl">
          <DictationBar
            examId={exam.id}
            values={report.values}
            hints={exam.dictationHints}
            onApply={(next, applied, note) => {
              updateValues(report.id, next);
              updateReport(report.id, { findingsOverride: null, conclusionOverride: null });
              setHighlighted(applied.map((a) => a.toLowerCase()));
              setFlash(note);
              window.setTimeout(() => setHighlighted([]), 2800);
            }}
          />
        </div>
      </div>
    </AppShell>
  );
}
