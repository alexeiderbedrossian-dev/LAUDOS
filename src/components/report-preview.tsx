import { conclusionText, findingsText } from "@/lib/exams/report";
import { getExam } from "@/lib/exams";
import type { Report } from "@/lib/exams/types";
import { Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

export function ReportPreview({
  report,
  onFindings,
  onConclusion,
}: {
  report: Report;
  onFindings: (text: string | null) => void;
  onConclusion: (text: string | null) => void;
}) {
  const exam = getExam(report.examId);
  const findings = findingsText(report);
  const conclusion = conclusionText(report);

  return (
    <div className="space-y-5">
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wider text-muted">Relatório</p>
          {report.findingsOverride ? (
            <Button type="button" variant="ghost" size="sm" onClick={() => onFindings(null)}>
              <RotateCcw />
              Regenerar
            </Button>
          ) : null}
        </div>
        <Textarea
          className="min-h-56 font-sans leading-relaxed"
          value={findings}
          onChange={(e) => onFindings(e.target.value)}
        />
      </div>
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wider text-muted">Impressão diagnóstica</p>
          {report.conclusionOverride ? (
            <Button type="button" variant="ghost" size="sm" onClick={() => onConclusion(null)}>
              <RotateCcw />
              Regenerar
            </Button>
          ) : null}
        </div>
        <Textarea
          className="min-h-32 leading-relaxed"
          value={conclusion}
          onChange={(e) => onConclusion(e.target.value)}
        />
      </div>
      {exam ? (
        <p className="text-xs text-faint">
          Técnica: {exam.technique}
        </p>
      ) : null}
    </div>
  );
}
