import { conclusionText, doctorLines, findingsText, signatureBlock } from "@/lib/exams/report";
import { getExam } from "@/lib/exams";
import { formatDateBR } from "@/lib/format";
import { ClinicLogo } from "@/components/clinic-logo";
import type { ClinicSettings, Report } from "@/lib/exams/types";

export function PrintDocument({ report, clinic }: { report: Report; clinic: ClinicSettings }) {
  const exam = getExam(report.examId);
  const p = report.patient;
  const doctors = doctorLines(clinic);

  return (
    <article className="mx-auto max-w-[720px] bg-white px-8 py-10 text-[#111] print:max-w-none print:px-0 print:py-0">
      <header className="border-b border-[#222] pb-4 text-center">
        <ClinicLogo className="mx-auto h-20 w-auto" />
        <p className="mt-2 text-sm">{clinic.specialty || "setor de exames de imagem"}</p>
        <p className="mt-1 text-xs leading-relaxed text-[#444]">
          {clinic.address}
          {clinic.address && clinic.phone ? " · " : ""}
          {clinic.phone ? `Tel. ${clinic.phone}` : ""}
        </p>
      </header>

      <h1 className="mt-8 text-center font-display text-lg font-semibold tracking-wide">
        {exam?.printTitle || "LAUDO DE ULTRASSONOGRAFIA"}
      </h1>

      <section className="mt-6 space-y-1 border border-[#ddd] px-4 py-3 text-sm">
        <p>
          <strong>Paciente:</strong> {p.name || "—"}
        </p>
        <p>
          <strong>Nascimento:</strong> {p.birthDate ? formatDateBR(p.birthDate) : "—"}
          {p.sex ? `  ·  Sexo: ${p.sex === "F" ? "Feminino" : "Masculino"}` : ""}
          {p.record ? `  ·  Prontuário: ${p.record}` : ""}
        </p>
        <p>
          <strong>Data do exame:</strong> {p.examDate ? formatDateBR(p.examDate) : "—"}
          {p.requester ? `  ·  Solicitante: ${p.requester}` : ""}
        </p>
        {p.indication ? (
          <p>
            <strong>Indicação:</strong> {p.indication}
          </p>
        ) : null}
      </section>

      {exam ? (
        <section className="mt-6">
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em]">Técnica</h2>
          <p className="mt-1 text-sm leading-relaxed">{exam.technique}</p>
        </section>
      ) : null}

      <section className="mt-6">
        <h2 className="text-xs font-semibold uppercase tracking-[0.14em]">Relatório</h2>
        <div className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{findingsText(report)}</div>
      </section>

      <section className="mt-6">
        <h2 className="text-xs font-semibold uppercase tracking-[0.14em]">Impressão diagnóstica</h2>
        <div className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{conclusionText(report)}</div>
      </section>

      {exam?.disclaimer ? (
        <p className="mt-6 text-xs leading-relaxed text-[#444]">{exam.disclaimer}</p>
      ) : null}

      <footer className="mt-14 text-center text-sm">
        <p>{signatureBlock(clinic, p.examDate)}</p>
        <div className="mx-auto mt-10 max-w-xs border-t border-[#222] pt-2">
          {doctors.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </footer>
    </article>
  );
}
