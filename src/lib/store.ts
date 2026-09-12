import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { EXAMS_BY_ID } from "@/lib/exams";
import {
  DEFAULT_CLINIC,
  emptyPatient,
  hydrateClinic,
  type ClinicSettings,
  type ExamId,
  type Patient,
  type Report,
} from "@/lib/exams/types";
import { uid } from "@/lib/utils";

interface AppState {
  clinic: ClinicSettings;
  reports: Report[];
  setClinic: (clinic: Partial<ClinicSettings>) => void;
  createReport: (examId: ExamId, patient?: Partial<Patient>) => Report;
  updateReport: (id: string, patch: Partial<Report>) => void;
  updateValues: (id: string, values: Record<string, unknown>) => void;
  deleteReport: (id: string) => void;
  getReport: (id: string) => Report | undefined;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      clinic: DEFAULT_CLINIC,
      reports: [],
      setClinic: (clinic) => set({ clinic: { ...get().clinic, ...clinic } }),
      createReport: (examId, patient) => {
        const exam = EXAMS_BY_ID[examId];
        const report: Report = {
          id: uid("laudo"),
          examId,
          patient: { ...emptyPatient(), ...patient },
          values: exam ? exam.defaults() : {},
          findingsOverride: null,
          conclusionOverride: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set({ reports: [report, ...get().reports].slice(0, 200) });
        return report;
      },
      updateReport: (id, patch) =>
        set({
          reports: get().reports.map((r) =>
            r.id === id ? { ...r, ...patch, updatedAt: new Date().toISOString() } : r,
          ),
        }),
      updateValues: (id, values) =>
        set({
          reports: get().reports.map((r) =>
            r.id === id ? { ...r, values, updatedAt: new Date().toISOString() } : r,
          ),
        }),
      deleteReport: (id) => set({ reports: get().reports.filter((r) => r.id !== id) }),
      getReport: (id) => get().reports.find((r) => r.id === id),
    }),
    {
      name: "sonolaudo-v1",
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const clinic = hydrateClinic(state.clinic);
        if (JSON.stringify(clinic) !== JSON.stringify(state.clinic)) {
          queueMicrotask(() => useAppStore.setState({ clinic }));
        }
      },
    },
  ),
);

export function useStoreHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    void useAppStore.persist.rehydrate();
    const unsub = useAppStore.persist.onFinishHydration(() => setHydrated(true));
    if (useAppStore.persist.hasHydrated()) setHydrated(true);
    return unsub;
  }, []);
  return hydrated;
}
