import type { ExamDefinition } from "@/lib/exams/types";
import { asList } from "@/lib/exams/types";
import { renderField } from "@/components/fields";
import { NoduleList } from "@/components/nodule-list";
import { ArterialTable, CarotidTable, MappingTable, VenousTable } from "@/components/vessel-tables";
import { ARTERIES_MMSS, VEINS_MMSS } from "@/lib/exams";
import { Input, Label, Textarea } from "@/components/ui/input";

export function ExamForm({
  exam,
  values,
  onChange,
  highlighted,
}: {
  exam: ExamDefinition;
  values: Record<string, unknown>;
  onChange: (values: Record<string, unknown>) => void;
  highlighted: string[];
}) {
  const hl = new Set(highlighted);
  const patch = (id: string, v: unknown) => onChange({ ...values, [id]: v });

  return (
    <div className="space-y-8">
      {exam.sections.map((section) => (
        <section key={section.id} className="space-y-4">
          <header>
            <h2 className="font-display text-xl text-ink">{section.title}</h2>
            {section.hint ? <p className="text-sm text-muted">{section.hint}</p> : null}
          </header>

          {section.kind === "vessel-table" && (exam.id === "arterial-mmii" || exam.id === "arterial-mmss") ? (
            <ArterialTable
              values={values}
              onChange={onChange}
              segs={exam.id === "arterial-mmss" ? [...ARTERIES_MMSS] : undefined}
              showItb={exam.id === "arterial-mmii"}
            />
          ) : null}
          {section.kind === "vessel-table" && exam.id === "carotidas" ? (
            <CarotidTable values={values} onChange={onChange} />
          ) : null}
          {section.kind === "vessel-table" && (exam.id === "venosa-mmii" || exam.id === "venoso-mmss") ? (
            <VenousTable
              values={values}
              onChange={onChange}
              veins={exam.id === "venoso-mmss" ? [...VEINS_MMSS] : undefined}
              showSuperficial={exam.id === "venosa-mmii"}
            />
          ) : null}
          {section.kind === "mapping" ? <MappingTable values={values} onChange={onChange} /> : null}

          {section.kind === "nodules"
            ? (section.fields || [])
                .filter((f) => f.type === "list")
                .map((f) => (
                  <NoduleList
                    key={f.id}
                    field={f}
                    items={asList(values[f.id])}
                    onChange={(items) => patch(f.id, items)}
                  />
                ))
            : null}

          {(!section.kind || section.kind === "fields") && section.fields ? (
            <div
              className={
                section.columns === 3
                  ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                  : section.columns === 1
                    ? "grid gap-4"
                    : "grid gap-4 sm:grid-cols-2"
              }
            >
              {section.fields.map((f) => renderField(f, values, patch, hl))}
            </div>
          ) : null}
        </section>
      ))}

      {exam.sections.every((s) => s.kind === "vessel-table" || s.kind === "mapping") ? (
        <div>
          <Label>Observações</Label>
          <Textarea
            value={(values.notes as string) || ""}
            onChange={(e) => patch("notes", e.target.value)}
            placeholder="Notas livres para o laudo"
          />
        </div>
      ) : null}
    </div>
  );
}

export function PatientFields({
  patient,
  onChange,
}: {
  patient: {
    name: string;
    birthDate: string;
    sex: string;
    examDate: string;
    requester: string;
    indication: string;
    record: string;
  };
  onChange: (p: typeof patient) => void;
}) {
  const set = (k: string, v: string) => onChange({ ...patient, [k]: v });
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <div className="sm:col-span-2">
        <Label>Paciente</Label>
        <Input value={patient.name} placeholder="Nome completo" onChange={(e) => set("name", e.target.value)} />
      </div>
      <div>
        <Label>Prontuário</Label>
        <Input value={patient.record} onChange={(e) => set("record", e.target.value)} />
      </div>
      <div>
        <Label>Nascimento</Label>
        <Input type="date" value={patient.birthDate} onChange={(e) => set("birthDate", e.target.value)} />
      </div>
      <div>
        <Label>Sexo</Label>
        <select
          className="h-11 w-full rounded-md border border-line bg-paper px-3 text-base"
          value={patient.sex}
          onChange={(e) => set("sex", e.target.value)}
        >
          <option value="">—</option>
          <option value="F">Feminino</option>
          <option value="M">Masculino</option>
        </select>
      </div>
      <div>
        <Label>Data do exame</Label>
        <Input type="date" value={patient.examDate} onChange={(e) => set("examDate", e.target.value)} />
      </div>
      <div className="sm:col-span-2">
        <Label>Médico solicitante</Label>
        <Input value={patient.requester} onChange={(e) => set("requester", e.target.value)} />
      </div>
      <div className="sm:col-span-2 lg:col-span-3">
        <Label>Indicação clínica</Label>
        <Input
          value={patient.indication}
          placeholder="ex.: nódulo tireoidiano, dor abdominal, edema de MMII"
          onChange={(e) => set("indication", e.target.value)}
        />
      </div>
    </div>
  );
}
