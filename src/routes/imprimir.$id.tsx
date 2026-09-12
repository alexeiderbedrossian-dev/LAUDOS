import { createFileRoute, Link } from "@tanstack/react-router";
import { PrintDocument } from "@/components/print-document";
import { Button } from "@/components/ui/button";
import { useAppStore, useStoreHydrated } from "@/lib/store";
import { Printer } from "lucide-react";

export const Route = createFileRoute("/imprimir/$id")({ component: Imprimir });

function Imprimir() {
  const { id } = Route.useParams();
  const hydrated = useStoreHydrated();
  const report = useAppStore((s) => s.reports.find((r) => r.id === id));
  const clinic = useAppStore((s) => s.clinic);

  if (!hydrated) {
    return (
      <main className="min-h-screen bg-bg p-8 text-ink">
        <p>Carregando laudo…</p>
      </main>
    );
  }

  if (!report) {
    return (
      <main className="min-h-screen bg-bg p-8 text-ink">
        <p>Laudo não encontrado neste aparelho.</p>
        <Link to="/" className="text-teal">
          Início
        </Link>
      </main>
    );
  }

  return (
    <main className="print-root min-h-screen bg-sunken py-6 print:bg-white print:py-0">
      <div className="no-print mx-auto mb-4 flex max-w-[720px] items-center justify-between px-4">
        <Link to="/exame/$tipo" params={{ tipo: report.examId }} search={{ id: report.id }} className="text-sm text-teal">
          Voltar ao editor
        </Link>
        <Button type="button" onClick={() => window.print()}>
          <Printer />
          Imprimir / PDF
        </Button>
      </div>
      <div className="mx-auto max-w-[760px] shadow-card print:shadow-none">
        <PrintDocument report={report} clinic={clinic} />
      </div>
    </main>
  );
}
