import { describe, expect, it } from "vitest";

import {
  analyzeSafety,
  generateFitnessPlan,
  proposePlanAdjustment,
} from "./fitness";
import type { AssessmentInput } from "./types";

const baseAssessment: AssessmentInput = {
  userId: "user-1",
  age: 31,
  sex: "male",
  heightCm: 175,
  weightKg: 82,
  targetWeightKg: 74,
  goalText: "减脂塑形，提高体能，希望腰围下降",
  experience: "beginner",
  trainingDaysPerWeek: 4,
  sessionMinutes: 45,
  trainingEnvironment: "both",
  equipment: ["瑜伽垫", "哑铃"],
  injuries: [],
  chronicConditions: [],
  dietaryRestrictions: ["不吃牛肉"],
  allergies: ["花生"],
  sleepHours: 7,
  foodBudget: "normal",
  uploadedImages: [
    {
      id: "image-current",
      kind: "current",
      url: "/uploads/current.jpg",
      aiSummary: "体态轻微前倾，目标以降低体脂和改善肩颈姿态为主。",
    },
  ],
};

describe("fitness safety rules", () => {
  it("blocks minors and avoids generating a high-risk plan", () => {
    const result = analyzeSafety({ ...baseAssessment, age: 17 });

    expect(result.canGeneratePlan).toBe(false);
    expect(result.riskLevel).toBe("blocked");
    expect(result.messages.join(" ")).toContain("18");
  });

  it("limits high-risk health conditions to conservative guidance", () => {
    const result = analyzeSafety({
      ...baseAssessment,
      chronicConditions: ["未控制高血压"],
      injuries: ["急性膝盖疼痛"],
    });

    expect(result.canGeneratePlan).toBe(false);
    expect(result.riskLevel).toBe("medical_review");
    expect(result.messages.join(" ")).toContain("医生");
  });

  it("flags extreme weight targets as unsafe", () => {
    const result = analyzeSafety({
      ...baseAssessment,
      targetWeightKg: 52,
    });

    expect(result.canGeneratePlan).toBe(false);
    expect(result.messages.join(" ")).toContain("目标体重");
  });
});

describe("fitness plan generation", () => {
  it("creates a four-week plan with daily training and nutrition guidance", () => {
    const plan = generateFitnessPlan(baseAssessment);

    expect(plan.weeks).toHaveLength(4);
    expect(plan.days).toHaveLength(28);
    expect(plan.days[0]?.nutrition.calorieTarget).toBeGreaterThan(1200);
    expect(plan.days[0]?.nutrition.proteinGrams).toBeGreaterThan(80);
    expect(plan.disclaimer).toContain("不替代医生");
  });

  it("uses the selected training environment and gives media for every workout item", () => {
    const plan = generateFitnessPlan({
      ...baseAssessment,
      trainingEnvironment: "home",
      equipment: ["瑜伽垫"],
    });

    const workoutItems = plan.days.flatMap((day) => day.workoutItems);
    expect(workoutItems.length).toBeGreaterThan(0);
    expect(workoutItems.every((item) => item.environment !== "gym")).toBe(true);
    expect(workoutItems.every((item) => item.media.imageUrl && item.media.videoUrl)).toBe(true);
  });

  it("respects allergies and dietary restrictions in meal guidance", () => {
    const plan = generateFitnessPlan(baseAssessment);
    const mealText = plan.days.map((day) => day.nutrition.meals.join(" ")).join(" ");

    expect(mealText).not.toContain("花生");
    expect(mealText).not.toContain("牛肉");
    expect(plan.days[0]?.nutrition.restrictionNotes.join(" ")).toContain("花生");
  });
});

describe("plan adjustments", () => {
  it("replaces knee-stress movements when the user reports knee pain", () => {
    const plan = generateFitnessPlan(baseAssessment);
    const adjustment = proposePlanAdjustment(plan, "今天深蹲膝盖痛，能不能换一个动作？");

    expect(adjustment.type).toBe("exercise_swap");
    expect(adjustment.message).toContain("膝盖");
    expect(adjustment.replacements.some((item) => item.name.includes("臀桥"))).toBe(true);
  });

  it("offers food substitutions for disliked or unavailable foods", () => {
    const plan = generateFitnessPlan(baseAssessment);
    const adjustment = proposePlanAdjustment(plan, "我吃不了鸡胸肉，能换别的吗？");

    expect(adjustment.type).toBe("nutrition_swap");
    expect(adjustment.message).toContain("替换");
    expect(adjustment.nutritionSuggestions.join(" ")).toContain("鱼");
  });

  it("compresses the session when the user only has a short window", () => {
    const plan = generateFitnessPlan(baseAssessment);
    const adjustment = proposePlanAdjustment(plan, "我今天只有 20 分钟，帮我压缩训练。");

    expect(adjustment.type).toBe("time_adjustment");
    expect(adjustment.message).toContain("20");
  });

  it("swaps equipment-dependent work when the user loses access to dumbbells", () => {
    const plan = generateFitnessPlan(baseAssessment);
    const adjustment = proposePlanAdjustment(plan, "今天没有哑铃，只有弹力带，帮我换一下。");

    expect(adjustment.type).toBe("exercise_swap");
    expect(adjustment.message).toContain("器械");
    expect(adjustment.replacements.some((item) => item.name.includes("弹力带"))).toBe(true);
  });
});
