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

  it("creates a lean-gain gym plan with a distinct gym-only hypertrophy split", () => {
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
    const pushDay = firstWeek[0];
    const pullDay = firstWeek[1];
    const quadDay = firstWeek[2];
    const accessoryDay = firstWeek[3];
    const posteriorDay = firstWeek[4];

    expect(pushDay?.workoutItems.map((item) => item.exerciseId)).toEqual(
      expect.arrayContaining(["machine-chest-press", "incline-push-up"]),
    );
    expect(pullDay?.workoutItems.map((item) => item.exerciseId)).toEqual(
      expect.arrayContaining(["lat-pulldown", "seated-cable-row"]),
    );
    expect(quadDay?.workoutItems.map((item) => item.exerciseId)).toEqual(
      expect.arrayContaining(["leg-press", "goblet-squat"]),
    );
    expect(accessoryDay?.workoutItems.map((item) => item.exerciseId)).toEqual(
      expect.arrayContaining(["machine-chest-press", "seated-cable-row"]),
    );
    expect(posteriorDay?.workoutItems.map((item) => item.exerciseId)).toEqual(
      expect.arrayContaining(["glute-bridge", "leg-press"]),
    );
    expect(firstWeek.flatMap((day) => day.workoutItems).every((item) => item.environment !== "home")).toBe(true);
    expect(plan.days[0]?.nutrition.indulgenceGuidance.length).toBeGreaterThan(0);
  });

  it("keeps four-day lean-gain gym plans on gym-only body-part days instead of full-body fallbacks", () => {
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

    expect(firstFourDays[0]?.workoutItems.map((item) => item.exerciseId)).toEqual(
      expect.arrayContaining(["machine-chest-press", "incline-push-up"]),
    );
    expect(firstFourDays[1]?.workoutItems.map((item) => item.exerciseId)).toEqual(
      expect.arrayContaining(["lat-pulldown", "seated-cable-row"]),
    );
    expect(firstFourDays[2]?.workoutItems.map((item) => item.exerciseId)).toEqual(
      expect.arrayContaining(["leg-press", "goblet-squat"]),
    );
    expect(firstFourDays[3]?.workoutItems.map((item) => item.exerciseId)).toEqual(
      expect.arrayContaining(["glute-bridge", "leg-press"]),
    );
    expect(firstFourDays.every((day) => !isFullBodyFallback(day))).toBe(true);
  });

  it("splits mixed-environment recomposition plans into explicit gym and home days across the week", () => {
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

    const firstFiveDays = plan.days.slice(0, 5);
    const gymDays = firstFiveDays.filter((day) =>
      day.workoutItems.some((item) => item.environment === "gym"),
    );
    const homeDays = firstFiveDays.filter((day) =>
      day.workoutItems.every((item) => item.environment !== "gym"),
    );

    expect(gymDays).toHaveLength(2);
    expect(homeDays).toHaveLength(3);
    expect(gymDays.some((day) => day.workoutItems.some((item) => item.exerciseId === "lat-pulldown"))).toBe(true);
    expect(homeDays.some((day) => day.workoutItems.some((item) => item.exerciseId === "band-row"))).toBe(true);
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

  it("changes weekly volume and cardio by goal and training base", () => {
    const leanGainPlan = generateFitnessPlan({
      ...baseAssessment,
      weightKg: 68,
      targetWeightKg: 73,
      goalText: "gain muscle",
      experience: "intermediate",
      trainingEnvironment: "gym",
      trainingDaysPerWeek: 5,
      sessionMinutes: 60,
      equipment: ["dumbbell", "lat pulldown machine", "treadmill"],
    });
    const recompPlan = generateFitnessPlan({
      ...baseAssessment,
      weightKg: 72,
      targetWeightKg: 72,
      goalText: "body recomposition",
      experience: "intermediate",
      trainingEnvironment: "both",
      trainingDaysPerWeek: 5,
      equipment: ["mat", "band", "dumbbell", "lat pulldown machine", "treadmill"],
    });
    const fatLossPlan = generateFitnessPlan({
      ...baseAssessment,
      weightKg: 96,
      targetWeightKg: 84,
      goalText: "lose fat",
      experience: "beginner",
      trainingEnvironment: "home",
      trainingDaysPerWeek: 4,
      sessionMinutes: 45,
      equipment: ["mat", "band"],
    });

    const leanGainStrengthSets = totalStrengthSets(leanGainPlan.days.slice(0, 7));
    const recompStrengthSets = totalStrengthSets(recompPlan.days.slice(0, 7));
    const fatLossStrengthSets = totalStrengthSets(fatLossPlan.days.slice(0, 7));
    const leanGainCardioMinutes = totalCardioMinutes(leanGainPlan.days.slice(0, 7));
    const recompCardioMinutes = totalCardioMinutes(recompPlan.days.slice(0, 7));
    const fatLossCardioMinutes = totalCardioMinutes(fatLossPlan.days.slice(0, 7));

    expect(leanGainStrengthSets).toBeGreaterThan(recompStrengthSets);
    expect(recompStrengthSets).toBeGreaterThan(fatLossStrengthSets);
    expect(fatLossCardioMinutes).toBeGreaterThan(recompCardioMinutes);
    expect(recompCardioMinutes).toBeGreaterThan(leanGainCardioMinutes);
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

function totalStrengthSets(days: PlanDay[]) {
  return days
    .flatMap((day) => day.workoutItems)
    .filter((item) => item.category === "strength")
    .reduce((sum, item) => sum + (item.sets ?? 0), 0);
}

function totalCardioMinutes(days: PlanDay[]) {
  return days
    .flatMap((day) => day.workoutItems)
    .filter((item) => item.category === "cardio")
    .reduce((sum, item) => sum + (item.durationMinutes ?? 0), 0);
}
