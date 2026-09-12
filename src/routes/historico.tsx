import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { getExam } from "@/lib/exams";
import { formatDateBR } from "@/lib/format";
import { useAppStore } from "@/lib/store";
import { Printer, Trash2 } from "lucide-react";

export const Route = createFileRoute("/historico")({ component: Historico });

function Historico() {
  const reports = useAppStore((s) => s.reports);
  const deleteReport = useAppStore((s) => s.deleteReport);

  return (
    <AppShell>
      <h1 className="font-display text-3xl tracking-tight">Laudos neste aparelho</h1>
      <p className="mt-2 max-w-xl text-sm text-muted">
        Guardados só neste navegador. Quem não tiver o endereço do app não acessa; não há lista pública.
      </p>
      {reports.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-line px-4 py-10 text-sm text-faint">
          Nenhum laudo ainda.{" "}
          <Link to="/" className="text-teal hover:underline">
            Começar um exame
          </Link>
          .
        </p>
      ) : (
        <ul className="mt-8 divide-y divide-line rounded-2xl border border-line bg-paper">
          {reports.map((r) => {
            const exam = getExam(r.examId);
            return (
              <li key={r.id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">{r.patient.name || "Sem nome"}</p>
                  <p className="text-sm text-muted">
                    {exam?.title} · {formatDateBR(r.patient.examDate || r.createdAt)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    to="/exame/$tipo"
                    params={{ tipo: r.examId }}
                    search={{ id: r.id }}
                    className="inline-flex h-11 items-center rounded-md bg-sunken px-4 text-sm"
                  >
                    Abrir
                  </Link>
                  <Link
                    to="/imprimir/$id"
                    params={{ id: r.id }}
                    className="inline-flex h-11 items-center gap-2 rounded-md px-3 text-sm text-ink-soft"
                  >
                    <Printer className="size-4" />
                    Imprimir
                  </Link>
                  <Button type="button" variant="ghost" size="sm" onClick={() => deleteReport(r.id)}>
                    <Trash2 />
                    Excluir
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </AppShell>
  );
}
