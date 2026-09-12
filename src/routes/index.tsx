import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { EXAMS } from "@/lib/exams";
import { useAppStore } from "@/lib/store";
import { AppShell } from "@/components/app-shell";
import { formatDateBR } from "@/lib/format";
import { Activity, ArrowUpRight, Bone, Droplets, Heart, HeartPulse, Layers, Map, Scan, ScanLine, User, Venus } from "lucide-react";
import type { ExamId } from "@/lib/exams/types";

export const Route = createFileRoute("/")({ component: Home });

const ICONS: Record<ExamId, typeof Scan> = {
  tireoide: ScanLine,
  cervical: Scan,
  abdomen: Scan,
  "abdomen-superior": Scan,
  "abdomen-prostata": User,
  masculino: User,
  feminino: Venus,
  eco: Heart,
  "partes-moles": Layers,
  articulacoes: Bone,
  "arterial-mmii": Activity,
  "arterial-mmss": Activity,
  "venosa-mmii": Droplets,
  "venoso-mmss": Droplets,
  "mapeamento-venoso": Map,
  carotidas: HeartPulse,
};

function Home() {
  const navigate = useNavigate();
  const createReport = useAppStore((s) => s.createReport);
  const reports = useAppStore((s) => s.reports);

  const start = (id: ExamId) => {
    const r = createReport(id);
    void navigate({ to: "/exame/$tipo", params: { tipo: id }, search: { id: r.id } });
  };

  const us = EXAMS.filter((e) => e.group === "us");
  const vas = EXAMS.filter((e) => e.group === "vascular");
  const recent = reports.slice(0, 6);

  return (
    <AppShell>
      <h1 className="font-display text-3xl tracking-tight text-ink">Sala de laudos</h1>

      <section className="mt-8">
        <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Ultrassonografia</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {us.map((exam) => (
            <ExamCard key={exam.id} exam={exam} Icon={ICONS[exam.id]} onClick={() => start(exam.id)} />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Doppler e vascular</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {vas.map((exam) => (
            <ExamCard key={exam.id} exam={exam} Icon={ICONS[exam.id]} onClick={() => start(exam.id)} />
          ))}
        </div>
      </section>

      <section className="mt-12">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Recentes</h2>
          {reports.length > 0 ? (
            <Link to="/historico" className="text-sm text-teal hover:underline">
              Ver todos
            </Link>
          ) : null}
        </div>
        {recent.length === 0 ? (
          <p className="mt-3 rounded-xl border border-dashed border-line px-4 py-8 text-sm text-faint">
            Ainda não há laudos neste aparelho. Eles ficam só neste navegador — o endereço do app já é o acesso.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-line rounded-xl border border-line bg-paper">
            {recent.map((r) => {
              const exam = EXAMS.find((e) => e.id === r.examId);
              return (
                <li key={r.id}>
                  <Link
                    to="/exame/$tipo"
                    params={{ tipo: r.examId }}
                    search={{ id: r.id }}
                    className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-sunken/60"
                  >
                    <span>
                      <span className="block font-medium">{r.patient.name || "Sem nome"}</span>
                      <span className="text-sm text-muted">
                        {exam?.title} · {formatDateBR(r.patient.examDate || r.createdAt)}
                      </span>
                    </span>
                    <ArrowUpRight className="size-4 text-faint" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </AppShell>
  );
}

function ExamCard({
  exam,
  Icon,
  onClick,
}: {
  exam: (typeof EXAMS)[number];
  Icon: typeof Scan;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex min-h-[7.5rem] flex-col items-start rounded-2xl border border-line bg-paper p-4 text-left shadow-card transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5"
    >
      <span className="flex size-9 items-center justify-center rounded-md bg-teal-soft text-teal">
        <Icon className="size-4" />
      </span>
      <span className="mt-3 font-display text-xl leading-tight">{exam.title}</span>
      <span className="mt-1 text-sm text-muted">{exam.blurb}</span>
    </button>
  );
}
