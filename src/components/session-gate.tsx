import type { ReactNode } from "react";
import { Outlet, useRouterState } from "@tanstack/react-router";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export function SessionGate() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname === "/login") return <Outlet />;
  return <RequireSession />;
}

function RequireSession() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) return <SessionSkeleton />;
  if (!user) return <RedirectToSignIn />;
  return <Outlet />;
}

function SessionSkeleton({ children }: { children?: ReactNode }) {
  return (
    <div className="min-h-screen bg-bg text-ink">
      <header className="border-b border-line/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="h-9 w-56 animate-pulse rounded-md bg-sunken" />
          <div className="h-8 w-28 animate-pulse rounded-full bg-sunken" />
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-10">
        {children ?? (
          <div className="space-y-4">
            <div className="h-10 w-2/3 max-w-md animate-pulse rounded-md bg-sunken" />
            <div className="h-4 w-1/2 max-w-sm animate-pulse rounded-md bg-sunken" />
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-32 animate-pulse rounded-2xl bg-sunken" />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export { SessionSkeleton };
