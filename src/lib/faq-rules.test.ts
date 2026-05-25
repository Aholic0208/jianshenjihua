import { describe, expect, it } from "vitest";

import { buildFaqEntries } from "./faq-rules";
import type { NutritionDay, PlanProfile, ProgramTemplate } from "./types";

const baseNutrition: NutritionDay = {
  calorieTarget: 2400,
  proteinGrams: 130,
  waterLiters: 2.4,
  meals: [],
  swaps: [],
  restrictionNotes: [],
  indulgenceGuidance: "可以安排放松餐，但不要失控。",
};

describe("buildFaqEntries", () => {
  it("recommends protein guidance for lean-gain users", () => {
    const entries = buildFaqEntries({
      goalText: "增肌变壮",
      profile: {
        primaryGoal: "lean_gain_strength",
        environmentBias: "gym",
        trainingPriority: "strength_hypertrophy",
        cardioPriority: "low",
        calorieStrategy: "small_surplus",
      } satisfies PlanProfile,
      program: {
        splitStyle: "push_pull_legs",
        weeklyStructure: ["push", "pull", "legs"],
        cardioMinutesPerWeek: 60,
      } satisfies ProgramTemplate,
      nutrition: baseNutrition,
    });

    expect(entries.some((item) => item.question.includes("蛋白粉"))).toBe(true);
  });

  it("recommends cardio-plus-strength explanations for fat-loss users", () => {
    const entries = buildFaqEntries({
      goalText: "减脂",
      profile: {
        primaryGoal: "fat_loss_preserve_muscle",
        environmentBias: "home",
        trainingPriority: "adherence",
        cardioPriority: "high",
        calorieStrategy: "deficit",
      } satisfies PlanProfile,
      program: {
        splitStyle: "full_body",
        weeklyStructure: ["full_body", "cardio_home", "full_body"],
        cardioMinutesPerWeek: 180,
      } satisfies ProgramTemplate,
      nutrition: baseNutrition,
    });

    expect(entries.some((item) => item.question.includes("为什么减脂也要练力量"))).toBe(true);
  });
});
