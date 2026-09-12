import {
  ARTERIES,
  CAROTID_SEGS_LIST,
  GSV_LEVELS,
  STENOSIS,
  VEINS_DEEP,
  VEIN_STATUS,
  WAVES,
} from "@/lib/exams";
import { parseLocaleNumber } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function CellInput({
  value,
  onChange,
  placeholder,
}: {
  value: number | null | undefined;
  onChange: (n: number | null) => void;
  placeholder?: string;
}) {
  return (
    <Input
      inputMode="decimal"
      className="h-9 px-2 text-sm"
      value={value ?? ""}
      placeholder={placeholder ?? "—"}
      onChange={(e) => onChange(parseLocaleNumber(e.target.value))}
    />
  );
}

function MiniSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <select
      className="h-9 w-full min-w-[8.5rem] rounded-md border border-line bg-paper px-2 text-sm text-ink"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

type Vessel = { psv?: number | null; edv?: number | null; wave?: string; stenosis?: string };

export function ArterialTable({
  values,
  onChange,
  segs = ARTERIES as unknown as { id: string; label: string }[],
  showItb,
}: {
  values: Record<string, unknown>;
  onChange: (v: Record<string, unknown>) => void;
  segs?: { id: string; label: string }[];
  showItb?: boolean;
}) {
  const patch = (side: "right" | "left", id: string, k: string, val: unknown) => {
    const block = { ...((values[side] as Record<string, Vessel>) || {}) };
    block[id] = { ...block[id], [k]: val };
    onChange({ ...values, [side]: block });
  };

  return (
    <div className="space-y-4">
      {(["right", "left"] as const).map((side) => {
        const block = (values[side] || {}) as Record<string, Vessel>;
        return (
          <div key={side} className="overflow-x-auto rounded-lg border border-line bg-paper">
            <p className="border-b border-line px-3 py-2 text-xs font-medium uppercase tracking-wider text-muted">
              {side === "right" ? "Membro / lado direito" : "Membro / lado esquerdo"}
            </p>
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="text-left text-xs text-muted">
                  <th className="px-3 py-2 font-medium whitespace-nowrap">Eixo</th>
                  <th className="px-2 py-2 font-medium whitespace-nowrap">PSV cm/s</th>
                  <th className="px-2 py-2 font-medium whitespace-nowrap">EDV</th>
                  <th className="px-2 py-2 font-medium whitespace-nowrap">Onda</th>
                  <th className="px-2 py-2 font-medium whitespace-nowrap">Estenose</th>
                </tr>
              </thead>
              <tbody>
                {segs.map((s, i) => {
                  const row = block[s.id] || {};
                  return (
                    <tr key={s.id} className={cn(i % 2 === 1 && "bg-sunken/40")}>
                      <td className="px-3 py-1.5 text-ink-soft">{s.label}</td>
                      <td className="px-2 py-1.5 w-24">
                        <CellInput value={row.psv ?? null} onChange={(n) => patch(side, s.id, "psv", n)} />
                      </td>
                      <td className="px-2 py-1.5 w-24">
                        <CellInput value={row.edv ?? null} onChange={(n) => patch(side, s.id, "edv", n)} />
                      </td>
                      <td className="px-2 py-1.5 w-36">
                        <MiniSelect value={row.wave || "trifasica"} options={WAVES} onChange={(v) => patch(side, s.id, "wave", v)} />
                      </td>
                      <td className="px-2 py-1.5 w-36">
                        <MiniSelect
                          value={row.stenosis || "0"}
                          options={STENOSIS}
                          onChange={(v) => patch(side, s.id, "stenosis", v)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      })}
      {showItb ? (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted">ITB direito</p>
            <CellInput
              value={(values.itbD as number | null) ?? null}
              onChange={(n) => onChange({ ...values, itbD: n })}
            />
          </div>
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted">ITB esquerdo</p>
            <CellInput
              value={(values.itbE as number | null) ?? null}
              onChange={(n) => onChange({ ...values, itbE: n })}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function CarotidTable({
  values,
  onChange,
}: {
  values: Record<string, unknown>;
  onChange: (v: Record<string, unknown>) => void;
}) {
  return (
    <div className="space-y-4">
      <ArterialTable values={values} onChange={onChange} segs={[...CAROTID_SEGS_LIST]} />
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <p className="mb-1.5 text-xs font-medium text-muted">Placas à direita</p>
          <Input
            value={(values.placaD as string) || ""}
            onChange={(e) => onChange({ ...values, placaD: e.target.value })}
            placeholder="ex.: placa hiperecogênica no bulbo"
          />
        </div>
        <div>
          <p className="mb-1.5 text-xs font-medium text-muted">Placas à esquerda</p>
          <Input
            value={(values.placaE as string) || ""}
            onChange={(e) => onChange({ ...values, placaE: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}

type Vein = { status?: string; refluxo?: number | null; diam?: number | null };

export function VenousTable({
  values,
  onChange,
  veins = VEINS_DEEP as unknown as { id: string; label: string }[],
  showSuperficial = true,
}: {
  values: Record<string, unknown>;
  onChange: (v: Record<string, unknown>) => void;
  veins?: { id: string; label: string }[];
  showSuperficial?: boolean;
}) {
  const patchDeep = (side: "rightDeep" | "leftDeep", id: string, k: string, val: unknown) => {
    const block = { ...((values[side] as Record<string, Vein>) || {}) };
    block[id] = { ...block[id], [k]: val };
    onChange({ ...values, [side]: block });
  };
  const patchVein = (key: string, k: string, val: unknown) => {
    const cur = { ...((values[key] as Vein) || {}) };
    onChange({ ...values, [key]: { ...cur, [k]: val } });
  };

  return (
    <div className="space-y-4">
      {(["rightDeep", "leftDeep"] as const).map((side) => {
        const block = (values[side] || {}) as Record<string, Vein>;
        return (
          <div key={side} className="overflow-x-auto rounded-lg border border-line bg-paper">
            <p className="border-b border-line px-3 py-2 text-xs font-medium uppercase tracking-wider text-muted">
              Profundo — {side === "rightDeep" ? "direito" : "esquerdo"}
            </p>
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="text-left text-xs text-muted">
                  <th className="px-3 py-2 font-medium">Veia</th>
                  <th className="px-2 py-2 font-medium">Status</th>
                  <th className="px-2 py-2 font-medium">Refluxo (s)</th>
                </tr>
              </thead>
              <tbody>
                {veins.map((s, i) => {
                  const row = block[s.id] || {};
                  return (
                    <tr key={s.id} className={cn(i % 2 === 1 && "bg-sunken/40")}>
                      <td className="px-3 py-1.5">{s.label}</td>
                      <td className="px-2 py-1.5">
                        <MiniSelect
                          value={row.status || "livre"}
                          options={VEIN_STATUS}
                          onChange={(v) => patchDeep(side, s.id, "status", v)}
                        />
                      </td>
                      <td className="px-2 py-1.5 w-28">
                        <CellInput value={row.refluxo ?? null} onChange={(n) => patchDeep(side, s.id, "refluxo", n)} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      })}
      {showSuperficial ? (
      <div className="overflow-x-auto rounded-lg border border-line bg-paper">
        <p className="border-b border-line px-3 py-2 text-xs font-medium uppercase tracking-wider text-muted">
          Superficial
        </p>
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="text-left text-xs text-muted">
              <th className="px-3 py-2 font-medium">Veia</th>
              <th className="px-2 py-2 font-medium">Status</th>
              <th className="px-2 py-2 font-medium">Ø mm</th>
              <th className="px-2 py-2 font-medium">Refluxo (s)</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["vsmD", "VSM direita"],
              ["vsmE", "VSM esquerda"],
              ["vspD", "VSP direita"],
              ["vspE", "VSP esquerda"],
            ].map(([key, label], i) => {
              const row = (values[key] || {}) as Vein;
              return (
                <tr key={key} className={cn(i % 2 === 1 && "bg-sunken/40")}>
                  <td className="px-3 py-1.5">{label}</td>
                  <td className="px-2 py-1.5">
                    <MiniSelect value={row.status || "livre"} options={VEIN_STATUS} onChange={(v) => patchVein(key, "status", v)} />
                  </td>
                  <td className="px-2 py-1.5 w-24">
                    <CellInput value={row.diam ?? null} onChange={(n) => patchVein(key, "diam", n)} />
                  </td>
                  <td className="px-2 py-1.5 w-24">
                    <CellInput value={row.refluxo ?? null} onChange={(n) => patchVein(key, "refluxo", n)} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      ) : null}
    </div>
  );
}

type Level = { diam?: number | null; refluxo?: number | null; incompetente?: boolean };

export function MappingTable({
  values,
  onChange,
}: {
  values: Record<string, unknown>;
  onChange: (v: Record<string, unknown>) => void;
}) {
  const patch = (side: "right" | "left", id: string, k: string, val: unknown) => {
    const block = { ...((values[side] as Record<string, Level>) || {}) };
    block[id] = { ...block[id], [k]: val };
    onChange({ ...values, [side]: block });
  };
  const patchOne = (key: string, k: string, val: unknown) => {
    const cur = { ...((values[key] as Level) || {}) };
    onChange({ ...values, [key]: { ...cur, [k]: val } });
  };
  const perfs = Array.isArray(values.perforators) ? (values.perforators as Record<string, unknown>[]) : [];

  return (
    <div className="space-y-4">
      {(["right", "left"] as const).map((side) => {
        const block = (values[side] || {}) as Record<string, Level>;
        return (
          <div key={side} className="overflow-x-auto rounded-lg border border-line bg-paper">
            <p className="border-b border-line px-3 py-2 text-xs font-medium uppercase tracking-wider text-muted">
              Safena magna — {side === "right" ? "direita" : "esquerda"}
            </p>
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="text-left text-xs text-muted">
                  <th className="px-3 py-2 font-medium">Nível</th>
                  <th className="px-2 py-2 font-medium">Ø mm</th>
                  <th className="px-2 py-2 font-medium">Refluxo (s)</th>
                  <th className="px-2 py-2 font-medium">Incompetente</th>
                </tr>
              </thead>
              <tbody>
                {GSV_LEVELS.map((lv, i) => {
                  const row = block[lv.id] || {};
                  return (
                    <tr key={lv.id} className={cn(i % 2 === 1 && "bg-sunken/40")}>
                      <td className="px-3 py-1.5">{lv.label}</td>
                      <td className="px-2 py-1.5 w-24">
                        <CellInput value={row.diam ?? null} onChange={(n) => patch(side, lv.id, "diam", n)} />
                      </td>
                      <td className="px-2 py-1.5 w-24">
                        <CellInput value={row.refluxo ?? null} onChange={(n) => patch(side, lv.id, "refluxo", n)} />
                      </td>
                      <td className="px-2 py-1.5">
                        <label className="inline-flex h-9 items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            className="size-4 accent-teal"
                            checked={row.incompetente === true}
                            onChange={(e) => patch(side, lv.id, "incompetente", e.target.checked)}
                          />
                          Sim
                        </label>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      })}
      <div className="grid gap-3 sm:grid-cols-2">
        {(["jspD", "jspE", "vspD", "vspE"] as const).map((key) => {
          const labels: Record<string, string> = {
            jspD: "JSP direita Ø mm",
            jspE: "JSP esquerda Ø mm",
            vspD: "VSP direita Ø mm",
            vspE: "VSP esquerda Ø mm",
          };
          const row = (values[key] || {}) as Level;
          return (
            <div key={key} className="flex items-end gap-2">
              <div className="flex-1">
                <p className="mb-1.5 text-xs font-medium text-muted">{labels[key]}</p>
                <CellInput value={row.diam ?? null} onChange={(n) => patchOne(key, "diam", n)} />
              </div>
              <label className="mb-1 inline-flex h-9 items-center gap-2 text-xs text-muted">
                <input
                  type="checkbox"
                  className="size-4 accent-teal"
                  checked={row.incompetente === true}
                  onChange={(e) => patchOne(key, "incompetente", e.target.checked)}
                />
                Inc.
              </label>
            </div>
          );
        })}
      </div>
      <div className="rounded-lg border border-line bg-paper p-3">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wider text-muted">Perfurantes</p>
          <button
            type="button"
            className="text-sm text-teal hover:underline"
            onClick={() =>
              onChange({
                ...values,
                perforators: [...perfs, { nome: "Cockett", lado: "direita", dist: null, diam: null, refluxo: true }],
              })
            }
          >
            Adicionar
          </button>
        </div>
        {perfs.length === 0 ? (
          <p className="text-sm text-faint">Nenhuma perfurante lançada.</p>
        ) : (
          <div className="space-y-2">
            {perfs.map((p, i) => (
              <div key={i} className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                <Input
                  className="h-9"
                  value={(p.nome as string) || ""}
                  placeholder="Nome"
                  onChange={(e) => {
                    const next = perfs.slice();
                    next[i] = { ...p, nome: e.target.value };
                    onChange({ ...values, perforators: next });
                  }}
                />
                <select
                  className="h-9 rounded-md border border-line bg-paper px-2 text-sm"
                  value={(p.lado as string) || "direita"}
                  onChange={(e) => {
                    const next = perfs.slice();
                    next[i] = { ...p, lado: e.target.value };
                    onChange({ ...values, perforators: next });
                  }}
                >
                  <option value="direita">Direita</option>
                  <option value="esquerda">Esquerda</option>
                </select>
                <CellInput
                  value={(p.dist as number | null) ?? null}
                  placeholder="cm maléolo"
                  onChange={(n) => {
                    const next = perfs.slice();
                    next[i] = { ...p, dist: n };
                    onChange({ ...values, perforators: next });
                  }}
                />
                <CellInput
                  value={(p.diam as number | null) ?? null}
                  placeholder="Ø mm"
                  onChange={(n) => {
                    const next = perfs.slice();
                    next[i] = { ...p, diam: n };
                    onChange({ ...values, perforators: next });
                  }}
                />
                <button
                  type="button"
                  className="h-9 text-sm text-danger"
                  onClick={() => onChange({ ...values, perforators: perfs.filter((_, j) => j !== i) })}
                >
                  Remover
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
