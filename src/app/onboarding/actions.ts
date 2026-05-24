"use server";

import { randomUUID } from "node:crypto";

import { redirect } from "next/navigation";

import { getFitnessService, getSessionUser } from "@/lib/server-app";
import type { AssessmentInput, TrainingEnvironment } from "@/lib/types";

export async function saveOnboardingAction(formData: FormData) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/auth");
  }

  const assessment: AssessmentInput = {
    userId: user.id,
    age: toNumber(formData.get("age"), 29),
    sex: toSex(formData.get("sex")),
    heightCm: toNumber(formData.get("heightCm"), 168),
    weightKg: toNumber(formData.get("weightKg"), 70),
    targetWeightKg: toOptionalNumber(formData.get("targetWeightKg")),
    goalText: String(formData.get("goalText") ?? "").trim(),
    experience: toExperience(formData.get("experience")),
    trainingDaysPerWeek: toNumber(formData.get("trainingDays"), 4),
    sessionMinutes: toNumber(formData.get("sessionMinutes"), 45),
    trainingEnvironment: toEnvironment(readFirstValue(formData, ["trainingEnvironment", "environment"])),
    equipment: splitLines(formData.get("equipment")),
    injuries: splitLines(formData.get("injuries")),
    chronicConditions: splitLines(formData.get("chronicConditions")),
    dietaryRestrictions: splitLines(formData.get("dietaryRestrictions")),
    allergies: splitLines(formData.get("allergies")),
    sleepHours: toOptionalNumber(formData.get("sleepHours")),
    foodBudget: toBudget(formData.get("foodBudget")),
    uploadedImages: collectImages(formData),
  };

  const service = getFitnessService();
  service.saveOnboardingAssessment(assessment);
  service.generatePlanFromAssessment(assessment);

  redirect("/dashboard?welcome=plan-ready");
}

function toNumber(value: FormDataEntryValue | null, fallback: number) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toOptionalNumber(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  if (!text) {
    return undefined;
  }

  const parsed = Number.parseFloat(text);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function splitLines(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split(/[\n,，、]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function toEnvironment(value: FormDataEntryValue | null): TrainingEnvironment {
  const text = String(value ?? "both");
  if (text === "home" || text === "gym" || text === "both") {
    return text;
  }

  return "both";
}

function toSex(value: FormDataEntryValue | null): "male" | "female" | "other" {
  const text = String(value ?? "female");
  if (text === "male" || text === "female" || text === "other") {
    return text;
  }

  return "female";
}

function toExperience(value: FormDataEntryValue | null): "beginner" | "intermediate" {
  return String(value ?? "beginner") === "intermediate" ? "intermediate" : "beginner";
}

function toBudget(value: FormDataEntryValue | null): "low" | "normal" | "high" {
  const text = String(value ?? "normal");
  if (text === "low" || text === "high" || text === "normal") {
    return text;
  }

  return "normal";
}

function collectImages(formData: FormData) {
  const images = [
    { kind: "current" as const, url: String(formData.get("currentImageUrl") ?? "").trim() },
    { kind: "target" as const, url: String(formData.get("targetImageUrl") ?? "").trim() },
  ];

  return images
    .filter((image) => image.url)
    .map((image) => ({
      id: randomUUID(),
      kind: image.kind,
      url: image.url,
      aiSummary: "已保存为参考图，仅用于帮助理解训练目标，不作为医疗结论。",
    }));
}

function readFirstValue(formData: FormData, names: string[]) {
  for (const name of names) {
    const value = formData.get(name);
    if (value !== null) {
      return value;
    }
  }

  return null;
}
