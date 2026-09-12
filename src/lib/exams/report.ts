import { ageFromBirth, formatDateBR, formatLongDateBR } from "@/lib/format";
import { getExam } from "./index";
import type { ClinicSettings, Patient, Report } from "./types";

export function generatedFindings(report: Report): string {
  const exam = getExam(report.examId);
  if (!exam) return "";
  return exam.findings(report.values, report.patient);
}

export function generatedConclusion(report: Report): string {
  const exam = getExam(report.examId);
  if (!exam) return "";
  return exam.conclusion(report.values, report.patient);
}

export function findingsText(report: Report): string {
  return report.findingsOverride ?? generatedFindings(report);
}

export function conclusionText(report: Report): string {
  return report.conclusionOverride ?? generatedConclusion(report);
}

export function patientLine(patient: Patient): string {
  const age = ageFromBirth(patient.birthDate, patient.examDate);
  const bits = [
    patient.name || "—",
    patient.sex ? `Sexo: ${patient.sex === "F" ? "Feminino" : "Masculino"}` : "",
    patient.birthDate ? `DN: ${formatDateBR(patient.birthDate)}` : "",
    age != null ? `${age} anos` : "",
    patient.record ? `Prontuário: ${patient.record}` : "",
  ].filter(Boolean);
  return bits.join("  ·  ");
}

export function signatureBlock(clinic: ClinicSettings, examDate: string): string {
  const city = clinic.city || "Curitiba";
  const date = formatLongDateBR(examDate || new Date().toISOString());
  return `${city}, ${date}.`;
}

export function displayDoctorName(clinic: ClinicSettings): string {
  const name = (clinic.doctorName ?? "").trim();
  if (!name) return "";
  return /^dr\.?\s/i.test(name) ? name : `Dr. ${name}`;
}

export function doctorLines(clinic: ClinicSettings): string[] {
  const name = displayDoctorName(clinic) || "Dr. ________________";
  const crm = clinic.crm
    ? /crm/i.test(clinic.crm)
      ? clinic.crm
      : `CRM ${clinic.crm}`
    : "";
  const rqe = clinic.rqe
    ? /rqe/i.test(clinic.rqe)
      ? clinic.rqe
      : `RQE ${clinic.rqe}`
    : "";
  return [
    name,
    [crm, rqe].filter(Boolean).join("  ·  "),
    clinic.doctorSpecialty || "Radiologia · Ultrassonografia",
  ].filter(Boolean);
}
