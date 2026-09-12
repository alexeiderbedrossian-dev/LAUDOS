import type { FieldDef } from "@/lib/exams/types";
import { emptyMeasure } from "@/lib/exams/types";
import { renderField } from "@/components/fields";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

export function NoduleList({
  field,
  items,
  onChange,
}: {
  field: FieldDef;
  items: Record<string, unknown>[];
  onChange: (items: Record<string, unknown>[]) => void;
}) {
  const itemFields = field.itemFields || [];
  const add = () => {
    const blank: Record<string, unknown> = {};
    for (const f of itemFields) {
      if (f.type === "measure3") blank[f.id] = emptyMeasure();
      else if (f.type === "select") blank[f.id] = f.options?.[0]?.value ?? "";
      else if (f.type === "number") blank[f.id] = null;
      else blank[f.id] = "";
    }
    onChange([...items, blank]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-muted">{field.label}</p>
        <Button type="button" variant="outline" size="sm" onClick={add}>
          <Plus />
          Adicionar nódulo
        </Button>
      </div>
      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line px-4 py-6 text-sm text-faint">
          Nenhum nódulo lançado. Dite «nódulo no terço médio do lobo direito de 8 por 6 por 5 milímetros, TIRADS 4»
          ou adicione manualmente.
        </p>
      ) : (
        items.map((item, i) => (
          <div key={i} className="rounded-xl border border-line bg-paper p-4 shadow-card">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-display text-base text-ink">Nódulo {i + 1}</p>
              <Button type="button" variant="ghost" size="sm" onClick={() => onChange(items.filter((_, j) => j !== i))}>
                <Trash2 />
                Remover
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {itemFields.map((f) =>
                renderField(f, item, (id, v) => {
                  const next = items.slice();
                  next[i] = { ...item, [id]: v };
                  onChange(next);
                }, new Set()),
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
