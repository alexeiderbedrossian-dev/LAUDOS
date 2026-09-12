import { ellipsoidVolume, fmtNum, parseLocaleNumber } from "@/lib/format";
import type { FieldDef, Measure3 } from "@/lib/exams/types";
import { asMeasure, asNum, asStr } from "@/lib/exams/types";
import { cn } from "@/lib/utils";
import { Input, Label, Textarea } from "@/components/ui/input";

export function NumberField({
  label,
  value,
  unit,
  onChange,
  highlight,
}: {
  label: string;
  value: number | null;
  unit?: string;
  onChange: (n: number | null) => void;
  highlight?: boolean;
}) {
  return (
    <div className={cn(highlight && "rounded-md ring-2 ring-teal/40 ring-offset-2 ring-offset-bg")}>
      <Label>{label}</Label>
      <div className="relative">
        <Input
          inputMode="decimal"
          value={value ?? ""}
          placeholder="—"
          onChange={(e) => onChange(parseLocaleNumber(e.target.value))}
        />
        {unit ? (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-faint">
            {unit}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function Measure3Field({
  label,
  value,
  unit,
  onChange,
  highlight,
  showVolume,
}: {
  label: string;
  value: Measure3;
  unit?: string;
  onChange: (m: Measure3) => void;
  highlight?: boolean;
  showVolume?: boolean;
}) {
  const vol = showVolume !== false ? ellipsoidVolume(value.a, value.b, value.c) : null;
  const set = (k: keyof Measure3, n: number | null) => onChange({ ...value, [k]: n });
  return (
    <div className={cn("space-y-1.5", highlight && "rounded-lg ring-2 ring-teal/40 ring-offset-2 ring-offset-bg p-1")}>
      <div className="flex items-baseline justify-between gap-2">
        <Label className="mb-0">{label}</Label>
        {vol != null ? (
          <span className="text-xs tabular-nums text-teal">
            vol. {fmtNum(vol, 1)} cm³
          </span>
        ) : null}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {(["a", "b", "c"] as const).map((k) => (
          <Input
            key={k}
            inputMode="decimal"
            value={value[k] ?? ""}
            placeholder={k === "a" ? "C" : k === "b" ? "AP" : "T"}
            onChange={(e) => set(k, parseLocaleNumber(e.target.value))}
          />
        ))}
      </div>
      {unit ? <p className="text-[11px] text-faint">{unit} · C × AP × T</p> : null}
    </div>
  );
}

export function SelectField({
  label,
  value,
  options,
  onChange,
  highlight,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  highlight?: boolean;
}) {
  return (
    <div className={cn(highlight && "rounded-md ring-2 ring-teal/40 ring-offset-2 ring-offset-bg")}>
      <Label>{label}</Label>
      <select
        className="h-11 w-full rounded-md border border-line bg-paper px-3 text-base text-ink shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/35"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function TextField({
  label,
  value,
  onChange,
  multiline,
  highlight,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  highlight?: boolean;
  placeholder?: string;
}) {
  return (
    <div className={cn(highlight && "rounded-md ring-2 ring-teal/40 ring-offset-2 ring-offset-bg")}>
      <Label>{label}</Label>
      {multiline ? (
        <Textarea value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <Input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}

export function renderField(
  field: FieldDef,
  values: Record<string, unknown>,
  onPatch: (id: string, v: unknown) => void,
  highlighted: Set<string>,
) {
  const hl = highlighted.has(field.id);
  if (field.type === "number") {
    return (
      <NumberField
        key={field.id}
        label={field.label}
        value={asNum(values[field.id])}
        unit={field.unit}
        highlight={hl}
        onChange={(n) => onPatch(field.id, n)}
      />
    );
  }
  if (field.type === "measure3") {
    return (
      <Measure3Field
        key={field.id}
        label={field.label}
        value={asMeasure(values[field.id])}
        unit={field.unit}
        highlight={hl}
        onChange={(m) => onPatch(field.id, m)}
      />
    );
  }
  if (field.type === "select") {
    return (
      <SelectField
        key={field.id}
        label={field.label}
        value={asStr(values[field.id])}
        options={field.options || []}
        highlight={hl}
        onChange={(v) => onPatch(field.id, v)}
      />
    );
  }
  if (field.type === "text") {
    return (
      <div key={field.id} className={field.span === 3 ? "sm:col-span-2 lg:col-span-3" : field.span === 2 ? "sm:col-span-2" : ""}>
        <TextField
          label={field.label}
          value={asStr(values[field.id])}
          multiline
          highlight={hl}
          onChange={(v) => onPatch(field.id, v)}
        />
      </div>
    );
  }
  return null;
}
