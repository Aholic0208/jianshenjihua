import { describe, expect, it } from "vitest";

import {
  analyzeSafety,
  generateFitnessPlan,
  proposePlanAdjustment,
} from "./fitness";
import type { AssessmentInput, PlanDay } from "./types";

const baseAssessment: AssessmentInput = {
  userId: "user-1",
  age: 31,
  sex: "male",
  heightCm: 175,
  weightKg: 82,
  targetWeightKg: 74,
  goalText: "lose fat while keeping muscle",
  experience: "beginner",
  trainingDaysPerWeek: 4,
  sessionMinutes: 45,
  trainingEnvironment: "both",
  equipment: ["mat", "dumbbell"],
  injuries: [],
  chronicConditions: [],
  dietaryRestrictions: ["beef"],
  allergies: ["peanut"],
  sleepHours: 7,
  foodBudget: "normal",
  uploadedImages: [
    {
      id: "image-current",
      kind: "current",
      url: "/uploads/current.jpg",
      aiSummary: "Needs a steady fat-loss plan with posture cleanup.",
    },
  ],
};

describe("fitness safety rules", () => {
  it("blocks minors and avoids generating a high-risk plan", () => {
    const result = analyzeSafety({ ...baseAssessment, age: 17 });

    expect(result.canGeneratePlan).toBe(false);
    expect(result.riskLevel).toBe("blocked");
    expect(result.messages.length).toBeGreaterThan(0);
  });

  it("limits high-risk health conditions to conservative guidance", () => {
    const result = analyzeSafety({
      ...baseAssessment,
      chronicConditions: ["chest pain"],
      injuries: ["post op knee"],
    });

    expect(result.canGeneratePlan).toBe(false);
    expect(result.riskLevel).toBe("medical_review");
    expect(result.messages.length).toBeGreaterThan(0);
  });

  it("flags extreme weight targets as unsafe", () => {
    const result = analyzeSafety({
      ...baseAssessment,
      targetWeightKg: 52,
    });

    expect(result.canGeneratePlan).toBe(false);
    expect(result.messages.length).toBeGreaterThan(0);
  });
});

describe("fitness plan generation", () => {
  it("creates a four-week plan with daily training and nutrition guidance", () => {
    const plan = generateFitnessPlan(baseAssessment);

    expect(plan.weeks).toHaveLength(4);
    expect(plan.days).toHaveLength(28);
    expect(plan.days[0]?.nutrition.calorieTarget).toBeGreaterThan(1200);
    expect(plan.days[0]?.nutrition.proteinGrams).toBeGreaterThan(80);
    expect(plan.disclaimer.length).toBeGreaterThan(20);
  });

  it("uses the selected training environment and gives media for every workout item", () => {
    const plan = generateFitnessPlan({
      ...baseAssessment,
      trainingEnvironment: "home",
      equipment: ["mat", "band"],
    });

    const workoutItems = plan.days.flatMap((day) => day.workoutItems);

    expect(workoutItems.length).toBeGreaterThan(0);
    expect(workoutItems.every((item) => item.environment !== "gym")).toBe(true);
    expect(workoutItems.every((item) => item.media.imageUrl && item.media.videoUrl)).toBe(true);
  });

  it("keeps dietary restrictions and allergies in the nutrition guidance", () => {
    const plan = generateFitnessPlan(baseAssessment);
    const restrictionNotes = plan.days[0]?.nutrition.restrictionNotes.join(" ") ?? "";

    expect(restrictionNotes).toContain("beef");
    expect(restrictionNotes).toContain("peanut");
  });

  it("creates a lean-gain gym plan with split-oriented structure and moderate cardio", () => {
    const plan = generateFitnessPlan({
      ...baseAssessment,
      weightKg: 64,
      targetWeightKg: 69,
      goalText: "build muscle and strength",
      experience: "intermediate",
      trainingEnvironment: "gym",
      trainingDaysPerWeek: 5,
      sessionMinutes: 60,
      equipment: ["dumbbell", "lat pulldown machine", "treadmill"],
    });

    const firstWeek = plan.days.slice(0, 7);
    const cardioCount = firstWeek.flatMap((day) => day.workoutItems).filter((item) => item.category === "cardio").length;

    expect(firstWeek.some((day) => hasUpperBias(day))).toBe(true);
    expect(firstWeek.some((day) => hasLowerBias(day))).toBe(true);
    expect(cardioCount).toBeGreaterThan(0);
    expect(plan.days[0]?.nutrition.indulgenceGuidance.length).toBeGreaterThan(0);
  });

  it("keeps four-day lean-gain gym plans on upper and lower focused days instead of full-body fallbacks", () => {
    const plan = generateFitnessPlan({
      ...baseAssessment,
      weightKg: 64,
      targetWeightKg: 68,
      goalText: "build muscle and strength",
      experience: "intermediate",
      trainingEnvironment: "gym",
      trainingDaysPerWeek: 4,
      sessionMinutes: 55,
      equipment: ["dumbbell", "lat pulldown machine", "treadmill"],
    });

    const firstFourDays = plan.days.slice(0, 4);

    expect(firstFourDays.some((day) => hasUpperBias(day))).toBe(true);
    expect(firstFourDays.some((day) => hasLowerBias(day))).toBe(true);
    expect(firstFourDays.every((day) => !isFullBodyFallback(day))).toBe(true);
  });

  it("uses gym-specific movements on gym-tagged days for mixed-environment recomposition plans", () => {
    const plan = generateFitnessPlan({
      ...baseAssessment,
      weightKg: 72,
      targetWeightKg: 72,
      goalText: "recomposition with more muscle and lower body fat",
      experience: "intermediate",
      trainingEnvironment: "both",
      trainingDaysPerWeek: 5,
      equipment: ["mat", "band", "dumbbell", "lat pulldown machine", "treadmill"],
    });

    const gymStrengthDay = plan.days.find((day) =>
      day.workoutItems.some((item) => item.exerciseId === "lat-pulldown"),
    );
    const homeStrengthDay = plan.days.find((day) =>
      day.workoutItems.some((item) => item.exerciseId === "band-row")
      && !day.workoutItems.some((item) => item.exerciseId === "lat-pulldown"),
    );

    expect(gymStrengthDay).toBeDefined();
    expect(homeStrengthDay).toBeDefined();
  });

  it("creates a higher-cardio fat-loss plan without dropping resistance work", () => {
    const plan = generateFitnessPlan({
      ...baseAssessment,
      weightKg: 96,
      targetWeightKg: 85,
      goalText: "lose fat without losing too much muscle",
      trainingEnvironment: "home",
      trainingDaysPerWeek: 4,
      equipment: ["mat", "band"],
    });

    const strengthCount = plan.days
      .flatMap((day) => day.workoutItems)
      .filter((item) => item.category === "strength").length;
    const cardioCount = plan.days
      .flatMap((day) => day.workoutItems)
      .filter((item) => item.category === "cardio").length;

    expect(strengthCount).toBeGreaterThan(0);
    expect(cardioCount).toBeGreaterThan(0);
  });
});

describe("plan adjustments", () => {
  it("replaces knee-stress movements when the user reports knee pain", () => {
    const plan = generateFitnessPlan(baseAssessment);
    const adjustment = proposePlanAdjustment(plan, "deep squat knee pain");

    expect(adjustment.type).toBe("exercise_swap");
    expect(adjustment.replacements.some((item) => item.exerciseId === "glute-bridge")).toBe(true);
  });

  it("offers food substitutions for disliked or unavailable foods", () => {
    const plan = generateFitnessPlan(baseAssessment);
    const adjustment = proposePlanAdjustment(plan, "can't eat chicken");

    expect(adjustment.type).toBe("nutrition_swap");
    expect(adjustment.nutritionSuggestions.length).toBeGreaterThan(0);
  });

  it("compresses the session when the user only has a short window", () => {
    const plan = generateFitnessPlan(baseAssessment);
    const adjustment = proposePlanAdjustment(plan, "short on time today");

    expect(adjustment.type).toBe("time_adjustment");
    expect(adjustment.message.length).toBeGreaterThan(0);
  });

  it("swaps equipment-dependent work when the user loses access to dumbbells", () => {
    const plan = generateFitnessPlan(baseAssessment);
    const adjustment = proposePlanAdjustment(plan, "no dumbbell today");

    expect(adjustment.type).toBe("exercise_swap");
    expect(adjustment.replacements.some((item) => item.exerciseId === "band-row")).toBe(true);
  });
});

function hasUpperBias(day: PlanDay) {
  const exerciseIds = day.workoutItems.map((item) => item.exerciseId);

  return (
    (exerciseIds.includes("lat-pulldown") || exerciseIds.includes("band-row") || exerciseIds.includes("dumbbell-row"))
    && !exerciseIds.includes("bodyweight-squat")
    && !exerciseIds.includes("glute-bridge")
  );
}

function hasLowerBias(day: PlanDay) {
  const exerciseIds = day.workoutItems.map((item) => item.exerciseId);

  return (
    (exerciseIds.includes("bodyweight-squat") || exerciseIds.includes("glute-bridge"))
    && !exerciseIds.includes("lat-pulldown")
    && !exerciseIds.includes("band-row")
    && !exerciseIds.includes("dumbbell-row")
  );
}

function isFullBodyFallback(day: PlanDay) {
  const exerciseIds = day.workoutItems.map((item) => item.exerciseId);

  return (
    exerciseIds.includes("bodyweight-squat")
    && exerciseIds.includes("incline-push-up")
    && (exerciseIds.includes("lat-pulldown") || exerciseIds.includes("band-row") || exerciseIds.includes("dumbbell-row"))
  );
}
