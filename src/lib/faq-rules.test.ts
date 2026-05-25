import { describe, expect, it } from "vitest";

import { buildFaqEntries } from "./faq-rules";
import type { NutritionDay, PlanProfile, ProgramTemplate } from "./types";

const baseNutrition: NutritionDay = {
  calorieTarget: 2400,
  proteinGrams: 130,
  waterLiters: 2.4,
  meals: [],
  swaps: [],
  restrictionNotes: [],
  indulgenceGuidance: "可以安排放松餐，但不要失控。",
};

function questionsOf(entries: ReturnType<typeof buildFaqEntries>) {
  return entries.map((item) => item.question);
}

function entryById(entries: ReturnType<typeof buildFaqEntries>, id: string) {
  return entries.find((item) => item.id === id);
}

describe("buildFaqEntries", () => {
  it("adds broad protein and split guidance for lean-gain gym users", () => {
    const entries = buildFaqEntries({
      goalText: "增肌变壮",
      profile: {
        primaryGoal: "lean_gain_strength",
        environmentBias: "gym",
        trainingPriority: "strength_hypertrophy",
        cardioPriority: "low",
        calorieStrategy: "small_surplus",
      } satisfies PlanProfile,
      program: {
        splitStyle: "push_pull_legs",
        weeklyStructure: ["push", "pull", "legs", "push", "pull"],
        cardioMinutesPerWeek: 60,
      } satisfies ProgramTemplate,
      nutrition: baseNutrition,
    });

    const questions = questionsOf(entries);

    expect(entries.length).toBeGreaterThanOrEqual(7);
    expect(questions).toEqual(
      expect.arrayContaining([
        "为什么要吃蛋白粉？",
        "蛋白粉是不是必须？",
        "蛋白粉应该怎么吃、什么时候吃？",
        "乳清、酪蛋白、植物蛋白怎么选？",
        "三分化或推拉腿为什么适合我现在这个阶段？",
      ]),
    );

    expect(entryById(entries, "protein-powder-why")?.answer).toContain("方便补足");
    expect(entryById(entries, "protein-powder-why")?.answer).toContain("正常食物");
    expect(entryById(entries, "protein-powder-timing")?.answer).toContain("总量吃够");
    expect(entryById(entries, "protein-powder-timing")?.answer).toContain("一餐或半餐");
    expect(entryById(entries, "protein-powder-types")?.answer).toContain("乳糖不耐");
    expect(entryById(entries, "protein-powder-types")?.answer).toContain("植物蛋白");
  });

  it("adds strength-plus-cardio explanations for fat-loss users", () => {
    const entries = buildFaqEntries({
      goalText: "减脂",
      profile: {
        primaryGoal: "fat_loss_preserve_muscle",
        environmentBias: "home",
        trainingPriority: "adherence",
        cardioPriority: "high",
        calorieStrategy: "deficit",
      } satisfies PlanProfile,
      program: {
        splitStyle: "full_body",
        weeklyStructure: ["full_body", "cardio_home", "full_body"],
        cardioMinutesPerWeek: 180,
      } satisfies ProgramTemplate,
      nutrition: baseNutrition,
    });

    const questions = questionsOf(entries);

    expect(questions).toEqual(
      expect.arrayContaining([
        "为什么减脂也要练力量？",
        "为什么不是只让我做有氧？",
        "没酸是不是白练了？",
      ]),
    );

    expect(entries.find((item) => item.id === "cardio-not-everything")?.answer).toContain("有氧");
    expect(entries.find((item) => item.id === "why-lift-while-losing-fat")?.answer).toContain("肌肉");
  });

  it("explains why gym users get split training, cardio, and recovery space", () => {
    const entries = buildFaqEntries({
      goalText: "想系统增肌，也想把力量练上去",
      profile: {
        primaryGoal: "lean_gain_strength",
        environmentBias: "gym",
        trainingPriority: "strength_hypertrophy",
        cardioPriority: "low",
        calorieStrategy: "small_surplus",
      } satisfies PlanProfile,
      program: {
        splitStyle: "upper_lower",
        weeklyStructure: ["upper", "lower", "cardio", "upper", "lower"],
        cardioMinutesPerWeek: 75,
      } satisfies ProgramTemplate,
      nutrition: baseNutrition,
    });

    expect(entryById(entries, "why-upper-lower")?.answer).toContain("训练量铺开");
    expect(entryById(entries, "why-cardio-while-gaining")?.answer).toContain("心肺");
    expect(entryById(entries, "why-cardio-while-gaining")?.answer).toContain("恢复");
    expect(entryById(entries, "why-not-all-out-every-day")?.answer).toContain("恢复");
    expect(entryById(entries, "why-not-all-out-every-day")?.answer).toContain("下一次");
  });

  it("explains recomp logic and gym-versus-home differences", () => {
    const entries = buildFaqEntries({
      goalText: "体型重组，想更紧实一些",
      profile: {
        primaryGoal: "recomposition",
        environmentBias: "gym",
        trainingPriority: "hypertrophy",
        cardioPriority: "moderate",
        calorieStrategy: "maintenance_or_small_deficit",
      } satisfies PlanProfile,
      program: {
        splitStyle: "modified_split",
        weeklyStructure: ["upper", "lower", "upper", "conditioning"],
        cardioMinutesPerWeek: 90,
      } satisfies ProgramTemplate,
      nutrition: baseNutrition,
    });

    const questions = questionsOf(entries);

    expect(questions).toEqual(
      expect.arrayContaining([
        "为什么我的计划不是纯减脂，也不是纯增肌？",
        "为什么健身房计划和居家计划会不同？",
      ]),
    );

    expect(entries.find((item) => item.id === "why-recomp")?.answer).toContain("力量");
    expect(entries.find((item) => item.id === "environment-plan-difference")?.answer).toContain("健身房");
  });

  it("changes environment explanation based on home, gym, and mixed execution realities", () => {
    const homeEntries = buildFaqEntries({
      goalText: "减脂",
      profile: {
        primaryGoal: "fat_loss_preserve_muscle",
        environmentBias: "home",
        trainingPriority: "adherence",
        cardioPriority: "high",
        calorieStrategy: "deficit",
      } satisfies PlanProfile,
      program: {
        splitStyle: "full_body",
        weeklyStructure: ["full_body", "walk", "full_body"],
        cardioMinutesPerWeek: 150,
      } satisfies ProgramTemplate,
      nutrition: baseNutrition,
    });
    const gymEntries = buildFaqEntries({
      goalText: "增肌",
      profile: {
        primaryGoal: "lean_gain_strength",
        environmentBias: "gym",
        trainingPriority: "strength_hypertrophy",
        cardioPriority: "low",
        calorieStrategy: "small_surplus",
      } satisfies PlanProfile,
      program: {
        splitStyle: "push_pull_legs",
        weeklyStructure: ["push", "pull", "legs", "push"],
        cardioMinutesPerWeek: 60,
      } satisfies ProgramTemplate,
      nutrition: baseNutrition,
    });
    const mixedEntries = buildFaqEntries({
      goalText: "重组",
      profile: {
        primaryGoal: "recomposition",
        environmentBias: "mixed",
        trainingPriority: "hypertrophy",
        cardioPriority: "moderate",
        calorieStrategy: "maintenance_or_small_deficit",
      } satisfies PlanProfile,
      program: {
        splitStyle: "modified_split",
        weeklyStructure: ["gym_upper", "home_lower", "cardio_home", "gym_upper"],
        cardioMinutesPerWeek: 90,
      } satisfies ProgramTemplate,
      nutrition: baseNutrition,
    });

    expect(entryById(homeEntries, "environment-plan-difference")?.answer).toContain("节奏");
    expect(entryById(homeEntries, "environment-plan-difference")?.answer).toContain("循环安排");
    expect(entryById(gymEntries, "environment-plan-difference")?.answer).toContain("自由重量");
    expect(entryById(gymEntries, "environment-plan-difference")?.answer).toContain("稳定加重");
    expect(entryById(mixedEntries, "environment-plan-difference")?.answer).toContain("健身房");
    expect(entryById(mixedEntries, "environment-plan-difference")?.answer).toContain("家里");
    expect(entryById(mixedEntries, "environment-plan-difference")?.answer).toContain("不是简单把同一套动作复制两遍");
  });
});
