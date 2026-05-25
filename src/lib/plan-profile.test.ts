import { describe, expect, it } from "vitest";

import { classifyPlanProfile } from "./plan-profile";
import type { AssessmentInput } from "./types";

const baseAssessment: AssessmentInput = {
  userId: "user-1",
  age: 30,
  sex: "male",
  heightCm: 178,
  weightKg: 84,
  goalText: "希望减脂并保留肌肉",
  experience: "beginner",
  trainingDaysPerWeek: 4,
  sessionMinutes: 45,
  trainingEnvironment: "both",
  equipment: ["mat", "dumbbell"],
  injuries: [],
  chronicConditions: [],
  dietaryRestrictions: [],
  allergies: [],
  foodBudget: "normal",
};

describe("classifyPlanProfile", () => {
  it("classifies heavier fat-loss users as fat loss preserve muscle", () => {
    const profile = classifyPlanProfile({
      ...baseAssessment,
      weightKg: 98,
      goalText: "想减脂减重，先把肚子减下去",
    });

    expect(profile.primaryGoal).toBe("fat_loss_preserve_muscle");
    expect(profile.calorieStrategy).toBe("deficit");
    expect(profile.cardioPriority).toBe("high");
  });

  it("classifies normal-weight muscle-and-lean wording as recomposition", () => {
    const profile = classifyPlanProfile({
      ...baseAssessment,
      weightKg: 72,
      goalText: "不想继续瘦体重，只想增肌降体脂，线条更明显",
    });

    expect(profile.primaryGoal).toBe("recomposition");
    expect(profile.trainingPriority).toBe("hypertrophy");
    expect(profile.calorieStrategy).toBe("maintenance_or_small_deficit");
  });

  it("classifies lean gain wording as lean gain strength", () => {
    const profile = classifyPlanProfile({
      ...baseAssessment,
      weightKg: 63,
      goalText: "我偏瘦，想增肌变壮，提升力量",
      targetWeightKg: 69,
      trainingEnvironment: "gym",
      experience: "intermediate",
    });

    expect(profile.primaryGoal).toBe("lean_gain_strength");
    expect(profile.trainingPriority).toBe("strength_hypertrophy");
    expect(profile.cardioPriority).toBe("low");
  });
});
