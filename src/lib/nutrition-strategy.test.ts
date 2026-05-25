import { describe, expect, it } from "vitest";

import { buildNutritionStrategy } from "./nutrition-strategy";
import type { AssessmentInput, PlanProfile } from "./types";

const baseAssessment: AssessmentInput = {
  userId: "user-1",
  age: 28,
  sex: "female",
  heightCm: 165,
  weightKg: 68,
  goalText: "test",
  experience: "beginner",
  trainingDaysPerWeek: 4,
  sessionMinutes: 45,
  trainingEnvironment: "both",
  equipment: ["mat", "band"],
  injuries: [],
  chronicConditions: [],
  dietaryRestrictions: [],
  allergies: [],
  foodBudget: "normal",
};

const fatLossProfile: PlanProfile = {
  primaryGoal: "fat_loss_preserve_muscle",
  environmentBias: "home",
  trainingPriority: "adherence",
  cardioPriority: "high",
  calorieStrategy: "deficit",
};

const gainProfile: PlanProfile = {
  primaryGoal: "lean_gain_strength",
  environmentBias: "gym",
  trainingPriority: "strength_hypertrophy",
  cardioPriority: "low",
  calorieStrategy: "small_surplus",
};

const recompProfile: PlanProfile = {
  primaryGoal: "recomposition",
  environmentBias: "mixed",
  trainingPriority: "hypertrophy",
  cardioPriority: "moderate",
  calorieStrategy: "maintenance_or_small_deficit",
};

describe("buildNutritionStrategy", () => {
  it("uses a higher calorie target for lean-gain users than fat-loss users", () => {
    const fatLoss = buildNutritionStrategy(baseAssessment, fatLossProfile);
    const gain = buildNutritionStrategy(baseAssessment, gainProfile);

    expect(gain.calorieTarget).toBeGreaterThan(fatLoss.calorieTarget);
    expect(fatLoss.proteinGrams).toBeGreaterThanOrEqual(gain.proteinGrams);
  });

  it("adds flexible swaps and indulgence guidance for fat-loss users", () => {
    const strategy = buildNutritionStrategy(baseAssessment, fatLossProfile);

    expect(strategy.swaps.length).toBeGreaterThan(2);
    expect(strategy.indulgenceGuidance).toContain("放松");
  });

  it("adds training-day carb support for lean-gain users", () => {
    const strategy = buildNutritionStrategy(baseAssessment, gainProfile);

    expect(strategy.meals.join(" ")).toContain("训练前");
    expect(strategy.meals.join(" ")).toContain("训练后");
  });

  it("keeps recomposition close to maintenance while keeping protein high", () => {
    const strategy = buildNutritionStrategy(baseAssessment, recompProfile);
    const fatLoss = buildNutritionStrategy(baseAssessment, fatLossProfile);

    expect(strategy.calorieTarget).toBeGreaterThan(fatLoss.calorieTarget);
    expect(strategy.proteinGrams).toBeGreaterThan(100);
  });
});
