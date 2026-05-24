import { describe, expect, it } from "vitest";

import { buildOnboardingSteps } from "./onboarding-view";

describe("buildOnboardingSteps", () => {
  it("keeps the onboarding flow in the expected order", () => {
    const view = buildOnboardingSteps({
      requestedStep: "basics",
      answers: {},
    });

    expect(view.steps.map((step) => step.id)).toEqual([
      "basics",
      "goals",
      "equipment",
      "limits",
      "confirm",
    ]);
  });

  it("hides future steps until the current step is complete", () => {
    const view = buildOnboardingSteps({
      requestedStep: "equipment",
      answers: {
        age: "29",
        sex: "female",
        heightCm: "168",
        weightKg: "62",
        targetWeightKg: "57",
        goalText: "",
        trainingDays: "4",
        sessionMinutes: "45",
      },
    });

    expect(view.currentStep).toBe("goals");
    expect(view.steps.find((step) => step.id === "basics")?.state).toBe("complete");
    expect(view.steps.find((step) => step.id === "goals")?.state).toBe("current");
    expect(view.steps.find((step) => step.id === "equipment")?.isVisible).toBe(false);
    expect(view.steps.find((step) => step.id === "confirm")?.isVisible).toBe(false);
  });

  it("builds a readable confirmation summary from partial answers", () => {
    const view = buildOnboardingSteps({
      requestedStep: "confirm",
      answers: {
        age: "31",
        sex: "male",
        heightCm: "178",
        weightKg: "83",
        targetWeightKg: "76",
        goalText: "想先稳步减脂，再把核心稳定练起来。",
        trainingDays: "3",
        sessionMinutes: "45",
        trainingEnvironment: "home",
        experience: "beginner",
        equipment: "瑜伽垫\n弹力带",
        injuries: "久坐后下背紧",
        chronicConditions: "无",
        dietaryRestrictions: "乳糖不耐受",
        allergies: "花生过敏",
        foodBudget: "normal",
      },
    });

    expect(view.currentStep).toBe("confirm");
    expect(view.summary.metrics).toContain("31 岁");
    expect(view.summary.metrics).toContain("178 cm");
    expect(view.summary.goal).toContain("想先稳步减脂");
    expect(view.summary.schedule).toContain("每周 3 天");
    expect(view.summary.schedule).toContain("居家");
    expect(view.summary.restrictions).toContain("久坐后下背紧");
    expect(view.summary.restrictions).toContain("乳糖不耐受");
  });
});
