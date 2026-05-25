import { describe, expect, it } from "vitest";

import { generateFitnessPlan } from "./fitness";
import type { AssessmentInput, PlanDay } from "./types";

const gymRecompPersona: AssessmentInput = {
  userId: "persona-user",
  age: 19,
  sex: "male",
  heightCm: 180,
  weightKg: 74,
  targetWeightKg: 70,
  goalText: "我现在体脂率很高，我要在减肥的同时，练出薄肌身材，要三分化训练",
  experience: "intermediate",
  trainingDaysPerWeek: 5,
  sessionMinutes: 45,
  trainingEnvironment: "gym",
  equipment: ["哑铃", "瑜伽垫", "还有一个一体化机器"],
  injuries: ["无"],
  chronicConditions: ["无"],
  dietaryRestrictions: ["无"],
  allergies: ["无"],
  sleepHours: 8,
  foodBudget: "normal",
  uploadedImages: [],
};

describe("fitness plan persona coverage", () => {
  it("gives gym recomposition users who explicitly ask for 三分化 a real split instead of upper full-body fallback", () => {
    const plan = generateFitnessPlan(gymRecompPersona);
    const firstWeek = plan.days.slice(0, 5);

    expect(firstWeek.some((day) => day.focus.includes("推"))).toBe(true);
    expect(firstWeek.some((day) => day.focus.includes("拉"))).toBe(true);
    expect(firstWeek.some((day) => day.focus.includes("下肢"))).toBe(true);
    expect(firstWeek.some((day) => day.workoutItems.some((item) => item.environment === "gym"))).toBe(true);
    expect(firstWeek.some((day) => day.workoutItems.some((item) => item.exerciseId === "machine-chest-press"))).toBe(true);
    expect(firstWeek.some((day) => day.workoutItems.some((item) => item.exerciseId === "lat-pulldown" || item.exerciseId === "seated-cable-row"))).toBe(true);
    expect(
      firstWeek
        .flatMap((day) => day.workoutItems)
        .filter((item) => item.category === "strength")
        .every((item) => (item.sets ?? 0) >= 3),
    ).toBe(true);
    expect(firstWeek.filter((day) => isUpperOrPullFocus(day)).every((day) => !hasSquatFallback(day))).toBe(true);
  });
});

function isUpperOrPullFocus(day: PlanDay) {
  return day.focus.includes("上肢") || day.focus.includes("推") || day.focus.includes("拉");
}

function hasSquatFallback(day: PlanDay) {
  return day.workoutItems.some((item) => item.exerciseId === "bodyweight-squat" || item.exerciseId === "glute-bridge");
}
