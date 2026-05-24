import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { generateFitnessPlan } from "./fitness";
import { createAppRepository } from "./repository";
import type { AssessmentInput } from "./types";

const assessment: AssessmentInput = {
  userId: "repo-user",
  age: 30,
  sex: "female",
  heightCm: 165,
  weightKg: 68,
  targetWeightKg: 61,
  goalText: "减脂塑形，提升基础力量",
  experience: "beginner",
  trainingDaysPerWeek: 4,
  sessionMinutes: 40,
  trainingEnvironment: "home",
  equipment: ["瑜伽垫"],
  injuries: [],
  chronicConditions: [],
  dietaryRestrictions: [],
  allergies: [],
  foodBudget: "normal",
};

describe("app repository", () => {
  it("initializes schema and seeds exercise media", () => {
    const repository = createRepository();

    const media = repository.listExerciseMedia();

    expect(media.length).toBeGreaterThan(3);
    expect(media.some((item) => item.name.includes("深蹲"))).toBe(true);
  });

  it("persists a generated plan summary for a user", () => {
    const repository = createRepository();
    const plan = generateFitnessPlan(assessment);

    repository.upsertUser({
      id: assessment.userId,
      name: "测试用户",
      email: "test@example.com",
    });
    repository.savePlan(plan);

    const savedPlan = repository.getLatestPlan(assessment.userId);

    expect(savedPlan?.userId).toBe(assessment.userId);
    expect(savedPlan?.dayCount).toBe(28);
    expect(savedPlan?.status).toBe("active");
  });
});

function createRepository() {
  const dir = join(process.cwd(), "data", `test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
  mkdirSync(dir, { recursive: true });
  return createAppRepository(join(dir, "app.db"));
}
