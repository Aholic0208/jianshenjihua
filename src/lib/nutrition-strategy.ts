import { EVIDENCE_RULES } from "./evidence-rules";
import type { AssessmentInput, NutritionDay, PlanProfile } from "./types";

function estimateMaintenanceCalories(input: AssessmentInput) {
  const bmr = input.sex === "female"
    ? 10 * input.weightKg + 6.25 * input.heightCm - 5 * input.age - 161
    : 10 * input.weightKg + 6.25 * input.heightCm - 5 * input.age + 5;

  return Math.round(bmr * (input.trainingDaysPerWeek >= 4 ? 1.5 : 1.42));
}

export function buildNutritionStrategy(
  input: AssessmentInput,
  profile: PlanProfile,
): NutritionDay {
  const maintenance = estimateMaintenanceCalories(input);
  const restrictionNotes = [
    ...input.dietaryRestrictions.filter(Boolean),
    ...input.allergies.filter(Boolean),
  ];
  const normalizedRestrictionNotes = restrictionNotes.length > 0
    ? [`已避开或提示限制：${restrictionNotes.join("、")}`]
    : ["没有填写明显忌口，仍建议根据个人耐受做调整。"];

  if (profile.primaryGoal === "lean_gain_strength") {
    return {
      calorieTarget: maintenance + EVIDENCE_RULES.surplus.moderateKcal,
      proteinGrams: Math.round(input.weightKg * EVIDENCE_RULES.protein.hypertrophy),
      waterLiters: input.weightKg >= 80 ? 2.8 : 2.4,
      meals: [
        "早餐：主食 + 蛋白质 + 水果。",
        "训练前 1-2 小时：主食 + 易消化蛋白。",
        "训练后 1-2 小时：主食 + 优质蛋白，帮助恢复。",
        "晚餐：蛋白质 + 主食 + 蔬菜。",
      ],
      swaps: [
        "鸡胸可换鱼虾蛋豆制品。",
        "米饭可换面、燕麦、土豆。",
        "食欲不足时可用奶昔补足蛋白和热量。",
      ],
      restrictionNotes: normalizedRestrictionNotes,
      indulgenceGuidance: "可以安排放松餐，但不要用它替代大部分正餐。",
    };
  }

  if (profile.primaryGoal === "recomposition") {
    return {
      calorieTarget: maintenance,
      proteinGrams: Math.round(input.weightKg * EVIDENCE_RULES.protein.hypertrophy),
      waterLiters: 2.4,
      meals: [
        "早餐：高蛋白早餐，避免只吃精制碳水。",
        "午餐：优质蛋白 + 主食 + 两份蔬菜。",
        "训练前后：保留主食和蛋白，支持力量输出和恢复。",
        "晚餐：蛋白质为主，主食按当天训练量调整。",
      ],
      swaps: [
        "外食优先选有蛋白和主食的组合。",
        "零食替换为酸奶、水果或即食蛋白。",
        "没时间做饭时，先保证蛋白来源而不是只吃零食。",
      ],
      restrictionNotes: normalizedRestrictionNotes,
      indulgenceGuidance: "放松餐可以保留，更关键的是周平均热量和蛋白完成度。",
    };
  }

  return {
    calorieTarget: maintenance - 350,
    proteinGrams: Math.round(input.weightKg * EVIDENCE_RULES.protein.highDieting),
    waterLiters: 2.5,
    meals: [
      "早餐：高蛋白 + 高纤维主食，减少过早饥饿。",
      "午餐：优质蛋白 + 一份主食 + 两份蔬菜。",
      "晚餐：优质蛋白 + 蔬菜，保留适量主食支持恢复。",
      "加餐：按饥饿感选择酸奶、鸡蛋、水果。",
    ],
    swaps: [
      "鸡胸可换鱼虾、豆腐、瘦牛肉。",
      "米饭可换土豆、玉米、燕麦。",
      "嘴馋时先用高蛋白加餐顶住。",
    ],
    restrictionNotes: normalizedRestrictionNotes,
    indulgenceGuidance: "每周可以安排一次放松餐，但把它控制在一餐，而不是一天失控。",
  };
}
