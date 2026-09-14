import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { ClinicLogo } from "@/components/clinic-logo";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const { user } = useCurrentUserState();
  if (user) return <Navigate to="/" />;
  return <LoginForm />;
}

function LoginForm() {
  const [mode, setMode] = useState<"entrar" | "criar">("entrar");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "criar") {
        const { error: err } = await authClient.signUp.email({
          email: email.trim(),
          password,
          name: name.trim() || "Médico",
        });
        if (err) throw new Error(translateAuthError(err.message));
      } else {
        const { error: err } = await authClient.signIn.email({
          email: email.trim(),
          password,
        });
        if (err) throw new Error(translateAuthError(err.message));
      }
      window.location.assign("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível entrar.");
      setBusy(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-bg px-4 py-10 text-ink">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <ClinicLogo className="mx-auto h-auto w-full max-w-[280px]" />
          <p className="mt-3 text-[11px] uppercase tracking-[0.16em] text-muted">
            setor de exames de imagem
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-paper p-5 shadow-card">
          <p className="text-sm text-muted">
            Entre com e-mail e senha.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-1 rounded-md bg-sunken p-1">
            <button
              type="button"
              className={`h-10 rounded-md text-sm font-medium ${mode === "entrar" ? "bg-paper text-ink shadow-sm" : "text-muted"}`}
              onClick={() => setMode("entrar")}
            >
              Entrar
            </button>
            <button
              type="button"
              className={`h-10 rounded-md text-sm font-medium ${mode === "criar" ? "bg-paper text-ink shadow-sm" : "text-muted"}`}
              onClick={() => setMode("criar")}
            >
              Criar acesso
            </button>
          </div>

          {authEnabled ? (
            <form className="mt-4 space-y-3" onSubmit={(e) => void submit(e)}>
              {mode === "criar" ? (
                <div>
                  <Label htmlFor="nome">Nome</Label>
                  <Input
                    id="nome"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Dr. Ralff Mallmann"
                  />
                </div>
              ) : null}
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="equipe@exemplo.com"
                />
              </div>
              <div>
                <Label htmlFor="senha">Senha</Label>
                <Input
                  id="senha"
                  type="password"
                  required
                  minLength={8}
                  autoComplete={mode === "criar" ? "new-password" : "current-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="mínimo 8 caracteres"
                />
              </div>
              {error ? <p className="text-sm text-danger">{error}</p> : null}
              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? "Aguarde…" : mode === "criar" ? "Criar acesso" : "Entrar"}
              </Button>
            </form>
          ) : (
            <p className="mt-4 text-sm text-muted">O acesso com senha está desligado.</p>
          )}

          <div className="relative my-5">
            <div className="h-px bg-line" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-paper px-2 text-xs uppercase tracking-[0.14em] text-faint">
              ou
            </span>
          </div>

          {authEnabled ? (
            <div className="space-y-2">
              {GROK_PROVIDERS.map((p) => (
                <Button
                  key={p.providerId}
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => void signIn(p.providerId, { callbackURL: "/" })}
                >
                  Continuar com {p.label}
                </Button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}

function translateAuthError(message?: string | null): string {
  const m = (message ?? "").toLowerCase();
  if (m.includes("invalid") && m.includes("password")) return "E-mail ou senha incorretos.";
  if (m.includes("invalid email or password") || m.includes("invalid credentials")) {
    return "E-mail ou senha incorretos.";
  }
  if (m.includes("already") || m.includes("exists")) return "Este e-mail já tem acesso. Entre com a senha.";
  if (m.includes("too short") || m.includes("password")) return "A senha precisa ter pelo menos 8 caracteres.";
  if (m.includes("user not found")) return "Não há acesso com este e-mail. Crie o acesso primeiro.";
  return message || "Não foi possível entrar.";
}
