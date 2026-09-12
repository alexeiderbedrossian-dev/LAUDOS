import { useEffect, useRef, useState } from "react";
import { Mic, Square, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { parseLocal, mergeValues } from "@/lib/dictation/parse-local";
import { parseDictationAi } from "@/lib/dictation/parse-ai";
import type { ExamId } from "@/lib/exams/types";
import { cn } from "@/lib/utils";

type SpeechRec = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((ev: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null;
  onerror: ((ev: { error: string }) => void) | null;
  onend: (() => void) | null;
};

function getRecognition(): SpeechRec | null {
  if (typeof window === "undefined") return null;
  const C =
    (window as unknown as { SpeechRecognition?: new () => SpeechRec; webkitSpeechRecognition?: new () => SpeechRec })
      .SpeechRecognition ||
    (window as unknown as { webkitSpeechRecognition?: new () => SpeechRec }).webkitSpeechRecognition;
  if (!C) return null;
  const rec = new C();
  rec.lang = "pt-BR";
  rec.continuous = true;
  rec.interimResults = true;
  return rec;
}

export function DictationBar({
  examId,
  values,
  onApply,
  hints,
}: {
  examId: ExamId;
  values: Record<string, unknown>;
  onApply: (next: Record<string, unknown>, applied: string[], note: string) => void;
  hints: string[];
}) {
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const recRef = useRef<SpeechRec | null>(null);
  const baseRef = useRef("");

  useEffect(() => {
    return () => recRef.current?.stop();
  }, []);

  const toggleMic = () => {
    if (listening) {
      recRef.current?.stop();
      setListening(false);
      return;
    }
    const rec = getRecognition();
    if (!rec) {
      setStatus("O microfone não está disponível neste navegador. Digite o ditado abaixo.");
      return;
    }
    baseRef.current = text ? text + " " : "";
    rec.onresult = (ev) => {
      let interim = "";
      let finals = "";
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const r = ev.results[i];
        if (r.isFinal) finals += r[0].transcript + " ";
        else interim += r[0].transcript;
      }
      if (finals) baseRef.current += finals;
      setText((baseRef.current + interim).trim());
    };
    rec.onerror = (ev) => {
      if (ev.error !== "no-speech") setStatus("Microfone: " + ev.error);
      setListening(false);
    };
    rec.onend = () => setListening(false);
    recRef.current = rec;
    try {
      rec.start();
      setListening(true);
      setStatus("Ouvindo… fale as medidas. Clique de novo para parar.");
    } catch {
      setStatus("Não foi possível iniciar o microfone.");
    }
  };

  const apply = async (useAi: boolean) => {
    const transcript = text.trim();
    if (!transcript) {
      setStatus("Fale ou escreva as medidas primeiro.");
      return;
    }
    setBusy(true);
    const local = parseLocal(examId, transcript, values);
    if (!useAi) {
      onApply(local.values, local.applied, local.note);
      setStatus(local.note);
      setBusy(false);
      return;
    }
    try {
      const ai = await parseDictationAi({
        data: { examId, transcript, valuesJson: JSON.stringify(values) },
      });
      if (ai.ok) {
        const patch = JSON.parse(ai.patchJson) as Record<string, unknown>;
        if (Object.keys(patch).length) {
          const merged = mergeValues(local.values, patch);
          onApply(merged, local.applied.length ? local.applied : ["Ditado"], ai.note);
          setStatus(ai.note);
        } else {
          onApply(local.values, local.applied, local.note);
          setStatus(local.note);
        }
      } else {
        onApply(local.values, local.applied, local.note);
        setStatus(local.note + " (IA indisponível — usei o reconhecimento local.)");
      }
    } catch {
      onApply(local.values, local.applied, local.note);
      setStatus(local.note);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="no-print rounded-2xl border border-line bg-ink text-teal-fg shadow-card">
      <div className="flex flex-col gap-3 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-display text-lg text-paper">Ditado</p>
            <p className="text-xs text-faint">Fale as medidas. Elas entram nos campos e o laudo se escreve sozinho.</p>
          </div>
          <Button
            type="button"
            size="icon"
            variant={listening ? "danger" : "default"}
            className={cn("size-14 rounded-full", listening && "animate-pulse")}
            onClick={toggleMic}
            aria-pressed={listening}
            aria-label={listening ? "Parar ditado" : "Começar ditado"}
          >
            {listening ? <Square className="size-5" /> : <Mic className="size-6" />}
          </Button>
        </div>
        <Textarea
          className="min-h-20 border-white/10 bg-ink-soft/40 text-paper placeholder:text-faint"
          placeholder={hints[0] ? `ex.: ${hints[0]}` : "Dite ou escreva as medidas"}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          <Button type="button" disabled={busy} onClick={() => apply(true)}>
            <Sparkles />
            {busy ? "Lendo…" : "Lançar no laudo"}
          </Button>
          <Button type="button" variant="secondary" disabled={busy} onClick={() => apply(false)}>
            Só local
          </Button>
          <Button type="button" variant="ghost" className="text-paper/80 hover:text-paper" onClick={() => setText("")}>
            Limpar
          </Button>
        </div>
        {status ? <p className="text-sm text-teal-soft">{status}</p> : null}
        <p className="text-[11px] leading-relaxed text-faint">
          Exemplos: {hints.slice(0, 3).join(" · ")}
        </p>
      </div>
    </div>
  );
}
