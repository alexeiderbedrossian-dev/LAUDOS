import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Settings, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore, useStoreHydrated } from "@/lib/store";
import { UserButton } from "@/lib/auth/gates";
import { ClinicLogo } from "@/components/clinic-logo";

export function AppShell({ children, className }: { children: ReactNode; className?: string }) {
  const clinic = useAppStore((s) => s.clinic);
  useStoreHydrated();
  return (
    <div className="min-h-screen bg-bg text-ink">
      <header className="no-print sticky top-0 z-20 border-b border-line/80 bg-bg/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <ClinicLogo className="h-12 w-auto shrink-0 sm:h-14" />
            <span className="hidden min-w-0 leading-tight lg:block">
              <span className="block text-[11px] uppercase tracking-[0.16em] text-muted">
                {clinic.specialty || "setor de exames de imagem"}
              </span>
            </span>
          </Link>
          <nav className="flex shrink-0 items-center gap-1">
            <Link
              to="/historico"
              className="inline-flex h-11 items-center gap-2 rounded-md px-3 text-sm text-ink-soft hover:bg-sunken"
            >
              <FileText className="size-4" />
              <span className="hidden sm:inline">Laudos</span>
            </Link>
            <Link
              to="/configuracoes"
              className="inline-flex h-11 items-center gap-2 rounded-md px-3 text-sm text-ink-soft hover:bg-sunken"
            >
              <Settings className="size-4" />
              <span className="hidden sm:inline">Clínica</span>
            </Link>
            <div className="ml-1 border-l border-line pl-2 max-sm:[&_span.text-sm.font-medium]:hidden">
              <UserButton />
            </div>
          </nav>
        </div>
      </header>
      <div className={cn("mx-auto max-w-6xl px-4 py-6 pb-28 sm:py-8", className)}>{children}</div>
    </div>
  );
}
