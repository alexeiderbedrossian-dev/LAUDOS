import type { ExamDefinition, ExamId } from "./types";
import { ABDOMEN, CERVICAL, FEMININO, MASCULINO, TIREOIDE } from "./exams-us";
import { ABDOMEN_SUPERIOR, ABDOMEN_PROSTATA, ARTICULACOES, ECOCARDIO, PARTES_MOLES } from "./exams-more";
import { ARTERIAL, ARTERIAL_MMSS, CAROTIDAS, MAPEAMENTO, VENOSA, VENOSO_MMSS } from "./exams-vascular";

export const EXAMS: ExamDefinition[] = [
  TIREOIDE,
  CERVICAL,
  ABDOMEN,
  ABDOMEN_SUPERIOR,
  ABDOMEN_PROSTATA,
  MASCULINO,
  FEMININO,
  ECOCARDIO,
  PARTES_MOLES,
  ARTICULACOES,
  ARTERIAL,
  ARTERIAL_MMSS,
  VENOSA,
  VENOSO_MMSS,
  MAPEAMENTO,
  CAROTIDAS,
];

export const EXAMS_BY_ID: Record<ExamId, ExamDefinition> = Object.fromEntries(
  EXAMS.map((e) => [e.id, e]),
) as Record<ExamId, ExamDefinition>;

export function getExam(id: string): ExamDefinition | undefined {
  return EXAMS_BY_ID[id as ExamId];
}

export * from "./types";
export {
  ARTERIES,
  ARTERIES_MMSS,
  VEINS_DEEP,
  VEINS_MMSS,
  GSV_LEVELS,
  WAVES,
  STENOSIS,
  VEIN_STATUS,
  CAROTID_SEGS_LIST,
} from "./exams-vascular";
