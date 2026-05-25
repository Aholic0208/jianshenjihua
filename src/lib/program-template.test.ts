import { describe, expect, it } from "vitest";

import { buildProgramTemplate } from "./program-template";
import type { AssessmentInput, PlanProfile } from "./types";

const profileMap: Record<string, PlanProfile> = {
  fatLoss: {
    primaryGoal: "fat_loss_preserve_muscle",
    environmentBias: "home",
    trainingPriority: "adherence",
    cardioPriority: "high",
    calorieStrategy: "deficit",
  },
  recomp: {
    primaryGoal: "recomposition",
    environmentBias: "mixed",
    trainingPriority: "hypertrophy",
    cardioPriority: "moderate",
    calorieStrategy: "maintenance_or_small_deficit",
  },
  gain: {
    primaryGoal: "lean_gain_strength",
    environmentBias: "gym",
    trainingPriority: "strength_hypertrophy",
    cardioPriority: "low",
    calorieStrategy: "small_surplus",
  },
};

const baseAssessment: AssessmentInput = {
  userId: "user-1",
  age: 30,
  sex: "male",
  heightCm: 178,
  weightKg: 84,
  goalText: "test",
  experience: "intermediate",
  trainingDaysPerWeek: 5,
  sessionMinutes: 60,
  trainingEnvironment: "gym",
  equipment: ["mat", "dumbbell", "lat pulldown machine", "treadmill"],
  injuries: [],
  chronicConditions: [],
  dietaryRestrictions: [],
  allergies: [],
  foodBudget: "normal",
};

describe("buildProgramTemplate", () => {
  it("builds a split-oriented gym template for lean gain users", () => {
    const program = buildProgramTemplate(baseAssessment, profileMap.gain);

    expect(program.splitStyle).toBe("push_pull_legs");
    expect(program.weeklyStructure).toContain("push_gym");
    expect(program.weeklyStructure).toContain("pull_gym");
    expect(program.weeklyStructure).toContain("legs_gym");
  });

  it("builds a full-body plus cardio home template for fat-loss users", () => {
    const program = buildProgramTemplate(
      {
        ...baseAssessment,
        trainingEnvironment: "home",
        equipment: ["mat", "band"],
        trainingDaysPerWeek: 4,
      },
      profileMap.fatLoss,
    );

    expect(program.splitStyle).toBe("full_body");
    expect(program.weeklyStructure.some((day) => day.includes("cardio"))).toBe(true);
    expect(program.weeklyStructure.filter((day) => day.includes("full_body")).length).toBeGreaterThan(1);
  });

  it("builds a mixed-location template for recomposition users", () => {
    const program = buildProgramTemplate(
      {
        ...baseAssessment,
        trainingEnvironment: "both",
        equipment: ["mat", "band", "dumbbell"],
      },
      profileMap.recomp,
    );

    expect(program.splitStyle).toBe("modified_split");
    expect(program.weeklyStructure.some((day) => day.includes("gym"))).toBe(true);
    expect(program.weeklyStructure.some((day) => day.includes("home"))).toBe(true);
  });

  it("routes four-day gym lean-gain users into a three-way split structure", () => {
    const program = buildProgramTemplate(
      {
        ...baseAssessment,
        trainingEnvironment: "gym",
        trainingDaysPerWeek: 4,
      },
      profileMap.gain,
    );

    expect(program.splitStyle).toBe("push_pull_legs");
    expect(program.weeklyStructure).toContain("push_gym");
    expect(program.weeklyStructure).toContain("pull_gym");
    expect(program.weeklyStructure).toContain("legs_gym");
    expect(program.weeklyStructure.every((day) => !day.includes("_home"))).toBe(true);
  });

  it("keeps four-day mixed lean-gain templates gym-forward with a home top-up day", () => {
    const program = buildProgramTemplate(
      {
        ...baseAssessment,
        trainingEnvironment: "both",
        trainingDaysPerWeek: 4,
        equipment: ["mat", "band", "dumbbell", "lat pulldown machine", "treadmill"],
      },
      profileMap.gain,
    );

    expect(program.weeklyStructure).toContain("push_gym");
    expect(program.weeklyStructure).toContain("pull_gym");
    expect(program.weeklyStructure).toContain("legs_gym");
    expect(program.weeklyStructure.filter((day) => day.includes("_gym")).length).toBe(3);
    expect(program.weeklyStructure.filter((day) => day.includes("_home")).length).toBe(1);
  });

  it("lets intermediate gym recomposition users who explicitly ask for 三分化 use a gym split", () => {
    const program = buildProgramTemplate(
      {
        ...baseAssessment,
        goalText: "体脂高一些，但我想在减脂同时练出薄肌，要三分化训练",
        trainingEnvironment: "gym",
        trainingDaysPerWeek: 5,
      },
      profileMap.recomp,
    );

    expect(program.splitStyle).toBe("push_pull_legs");
    expect(program.weeklyStructure).toContain("push_gym");
    expect(program.weeklyStructure).toContain("pull_gym");
    expect(program.weeklyStructure).toContain("legs_gym");
  });

  it("recognizes Chinese gym equipment wording when mixed recomposition users ask for 三分化", () => {
    const program = buildProgramTemplate(
      {
        ...baseAssessment,
        goalText: "想减脂增肌一起做，也想按推拉腿三分化来练",
        trainingEnvironment: "both",
        trainingDaysPerWeek: 5,
        equipment: ["哑铃", "一体化机器", "跑步机"],
      },
      profileMap.recomp,
    );

    expect(program.weeklyStructure).toContain("push_gym");
    expect(program.weeklyStructure).toContain("pull_gym");
    expect(program.weeklyStructure).toContain("legs_gym");
    expect(program.weeklyStructure.some((day) => day.includes("_home"))).toBe(true);
  });
});
