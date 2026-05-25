import { describe, expect, it } from "vitest";

import { generateFitnessPlan } from "./fitness";
import type { AssessmentInput } from "./types";

const baseAssessment: AssessmentInput = {
  userId: "user-1",
  age: 31,
  sex: "male",
  heightCm: 175,
  weightKg: 72,
  targetWeightKg: 76,
  goalText: "build muscle with a split plan",
  experience: "intermediate",
  trainingDaysPerWeek: 5,
  sessionMinutes: 55,
  trainingEnvironment: "both",
  equipment: ["mat", "band", "dumbbell", "treadmill"],
  injuries: [],
  chronicConditions: [],
  dietaryRestrictions: [],
  allergies: [],
  sleepHours: 7,
  foodBudget: "normal",
};

describe("fitness environment split", () => {
  it("keeps mixed-environment gym upper and pull days in an upper-body movement pool when lat pulldown is unavailable", () => {
    const plan = generateFitnessPlan(baseAssessment);
    const pullGymDay = plan.days[1];
    const strengthIds = pullGymDay?.workoutItems
      .filter((item) => item.category === "strength")
      .map((item) => item.exerciseId) ?? [];

    expect(strengthIds).not.toContain("bodyweight-squat");
    expect(strengthIds).not.toContain("glute-bridge");
    expect(strengthIds).toContain("dumbbell-row");
  });

  it("keeps mixed home and gym days on separate environment-specific exercise pools", () => {
    const plan = generateFitnessPlan({
      ...baseAssessment,
      trainingDaysPerWeek: 5,
      equipment: ["mat", "band", "dumbbell", "lat pulldown machine", "treadmill"],
    });

    const firstWeek = plan.days.slice(0, 5);
    const gymDay = firstWeek.find((day) => day.workoutItems.some((item) => item.exerciseId === "lat-pulldown"));
    const homeDay = firstWeek.find((day) => day.workoutItems.some((item) => item.exerciseId === "band-row"));

    expect(gymDay).toBeDefined();
    expect(homeDay).toBeDefined();
    expect(gymDay?.workoutItems.some((item) => item.exerciseId === "band-row")).toBe(false);
    expect(homeDay?.workoutItems.some((item) => item.exerciseId === "lat-pulldown")).toBe(false);
    expect(gymDay?.workoutItems.some((item) => item.exerciseId === "treadmill-walk")).toBe(false);
    expect(homeDay?.workoutItems.some((item) => item.exerciseId === "treadmill-walk")).toBe(false);
  });
});
