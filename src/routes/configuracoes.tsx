import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useAppStore } from "@/lib/store";
import { useState } from "react";

export const Route = createFileRoute("/configuracoes")({ component: Configuracoes });

function Configuracoes() {
  const clinic = useAppStore((s) => s.clinic);
  const setClinic = useAppStore((s) => s.setClinic);
  const [saved, setSaved] = useState(false);

  const field = (key: keyof typeof clinic, label: string, placeholder = "") => (
    <div>
      <Label>{label}</Label>
      <Input
        value={clinic[key]}
        placeholder={placeholder}
        onChange={(e) => {
          setClinic({ [key]: e.target.value });
          setSaved(false);
        }}
      />
    </div>
  );

  return (
    <AppShell>
      <h1 className="font-display text-3xl tracking-tight">Clínica e assinatura</h1>
      <p className="mt-2 max-w-xl text-sm text-muted">
        Esses dados vão no cabeçalho e no rodapé do laudo impresso. Ficam neste navegador.
      </p>
      <form
        className="mt-8 max-w-xl space-y-4 rounded-2xl border border-line bg-paper p-5 shadow-card"
        onSubmit={(e) => {
          e.preventDefault();
          setSaved(true);
        }}
      >
        {field("clinicName", "Nome da clínica", "Centro Médico Mercês")}
        {field("specialty", "Setor", "setor de exames de imagem")}
        {field("address", "Endereço", "Rua Jacarezinho, 258 · CEP 80710-150 · Bairro Mercês, Curitiba/PR")}
        {field("phone", "Telefone", "(41) 3029-2030")}
        {field("city", "Cidade no rodapé", "Curitiba")}
        {field("doctorName", "Médico radiologista", "Ralff Mallmann")}
        {field("crm", "CRM", "CRM-PR 25980")}
        {field("doctorSpecialty", "Especialidade na assinatura", "Radiologia · Ultrassonografia")}
        {field("rqe", "RQE (opcional)")}
        <div className="flex items-center gap-3 pt-2">
          <Button type="submit">Guardar</Button>
          <Link to="/" className="text-sm text-teal hover:underline">
            Voltar
          </Link>
          {saved ? <span className="text-sm text-ok">Dados da clínica atualizados.</span> : null}
        </div>
      </form>
    </AppShell>
  );
}
