import { exerciseLibrary, getExercisesForEnvironment } from "./exercise-library";
import type {
  AssessmentInput,
  ExerciseMedia,
  FitnessPlan,
  NutritionDay,
  PlanAdjustment,
  PlanDay,
  SafetyAnalysis,
  WorkoutItem,
} from "./types";

const HIGH_RISK_TERMS = [
  "未控制高血压",
  "心脏病",
  "胸痛",
  "糖尿病并发症",
  "怀孕",
  "急性",
  "骨折",
  "术后",
  "饮食障碍",
];

const DISCLAIMER =
  "本计划仅用于一般健身辅助，不替代医生、营养师或持证教练的诊断与处方。如出现疼痛、胸闷、头晕或其他异常，请立即停止并咨询专业人士。";

export function analyzeSafety(input: AssessmentInput): SafetyAnalysis {
  const messages: string[] = [];

  if (input.age < 18) {
    return {
      canGeneratePlan: false,
      riskLevel: "blocked",
      messages: ["第一版仅服务 18 岁以上成年人，请在监护人和专业人士指导下训练。"],
    };
  }

  const bmi = calculateBmi(input.weightKg, input.heightCm);
  if (input.targetWeightKg) {
    const targetBmi = calculateBmi(input.targetWeightKg, input.heightCm);
    const weightLossRatio = (input.weightKg - input.targetWeightKg) / input.weightKg;
    if (targetBmi < 18.5 || weightLossRatio > 0.2) {
      messages.push("目标体重过低或减重幅度过大，建议先咨询医生或营养师后再制定计划。");
    }
  }

  const riskText = [...input.injuries, ...input.chronicConditions].join(" ");
  const hasHighRiskCondition = HIGH_RISK_TERMS.some((term) => riskText.includes(term));
  if (hasHighRiskCondition) {
    messages.push("你填写的伤病或慢性病信息需要医生/专业教练先评估，系统不会生成高强度计划。");
  }

  if (bmi < 18.5) {
    messages.push("当前 BMI 偏低，第一版不会建议减重计划。");
  }

  if (messages.length > 0) {
    return {
      canGeneratePlan: false,
      riskLevel: hasHighRiskCondition ? "medical_review" : "caution",
      messages,
    };
  }

  return {
    canGeneratePlan: true,
    riskLevel: "normal",
    messages: ["可以生成普通新手计划；训练强度会从保守水平开始并根据打卡反馈调整。"],
  };
}

export function generateFitnessPlan(input: AssessmentInput): FitnessPlan {
  const safety = analyzeSafety(input);
  if (!safety.canGeneratePlan) {
    return {
      id: createId("restricted-plan"),
      userId: input.userId,
      createdAt: new Date().toISOString(),
      status: "restricted",
      safety,
      summary: "暂不生成完整训练计划。请先根据安全提示咨询医生或专业教练。",
      disclaimer: DISCLAIMER,
      weeks: [],
      days: [],
    };
  }

  const trainingDays = clamp(input.trainingDaysPerWeek, 2, 5);
  const exercises = getExercisesForEnvironment(input.trainingEnvironment, input.equipment);
  const workoutTemplates = buildWorkoutTemplates(exercises, input.sessionMinutes);
  const nutrition = buildNutrition(input);
  const days: PlanDay[] = [];

  for (let dayIndex = 1; dayIndex <= 28; dayIndex += 1) {
    const week = Math.ceil(dayIndex / 7);
    const weekday = ((dayIndex - 1) % 7) + 1;
    const isTrainingDay = weekday <= trainingDays;
    const workoutItems = isTrainingDay
      ? workoutTemplates[(weekday - 1) % workoutTemplates.length]?.map((item) => scaleWorkout(item, week)) ?? []
      : buildRecoveryItems(exercises);

    days.push({
      dayIndex,
      week,
      label: `第 ${week} 周 · 第 ${weekday} 天`,
      focus: isTrainingDay ? getFocusForDay(weekday) : "恢复、轻活动与拉伸",
      workoutItems,
      nutrition,
      checkInPrompt: "记录今天完成度、体重、疲劳、疼痛和饥饿感，系统会据此调整下一步建议。",
    });
  }

  const imageInsight = input.uploadedImages?.map((image) => image.aiSummary).filter(Boolean).join("；");
  const summary = [
    `4 周新手计划：每周 ${trainingDays} 天训练，每次约 ${input.sessionMinutes} 分钟。`,
    `目标：${input.goalText}`,
    imageInsight ? `图片辅助观察：${imageInsight} 这些仅作为目标理解，不作为医学或审美判断。` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return {
    id: createId("plan"),
    userId: input.userId,
    createdAt: new Date().toISOString(),
    status: "active",
    safety,
    summary,
    disclaimer: DISCLAIMER,
    weeks: [
      { week: 1, title: "适应周", goal: "学习动作、建立节奏，强度保持轻到中等。" },
      { week: 2, title: "稳定周", goal: "保持动作质量，略微增加训练密度。" },
      { week: 3, title: "进阶周", goal: "在没有疼痛的前提下提高挑战度。" },
      { week: 4, title: "巩固周", goal: "复盘打卡反馈，形成下一阶段计划依据。" },
    ],
    days,
  };
}

export function proposePlanAdjustment(plan: FitnessPlan, feedback: string): PlanAdjustment {
  const text = feedback.toLowerCase();

  if (containsAny(text, ["胸闷", "头晕", "剧痛", "刺痛", "晕", "心脏"])) {
    return {
      type: "safety_referral",
      message: "出现高风险不适时，请立即停止训练并咨询医生。今天不要继续提高强度。",
      replacements: [],
      nutritionSuggestions: [],
    };
  }

  if (containsAny(text, ["膝盖", "膝", "深蹲痛", "蹲不了"])) {
    const replacement = toWorkoutItem(exerciseLibrary.find((exercise) => exercise.id === "glute-bridge") ?? exerciseLibrary[0], 1);
    return {
      type: "exercise_swap",
      message: "已根据膝盖不适建议替换为更偏髋部发力、膝关节压力更低的动作。若疼痛持续，请停止下肢训练并咨询专业人士。",
      replacements: [replacement],
      nutritionSuggestions: [],
    };
  }

  if (containsAny(text, ["鸡胸", "鸡肉", "吃不了", "不想吃", "没有食材"])) {
    return {
      type: "nutrition_swap",
      message: "可以替换蛋白质来源，保持总热量和蛋白质目标接近即可。",
      replacements: [],
      nutritionSuggestions: ["鱼肉 120-150g", "虾仁 120g", "鸡蛋 2 个 + 无糖酸奶", "豆腐 200g"],
    };
  }

  if (containsAny(text, ["太累", "疲劳", "没力气", "睡不好"])) {
    return {
      type: "load_adjustment",
      message: "今天建议降低训练量：每个力量动作少做 1 组，心肺控制在能完整说话的强度。",
      replacements: [],
      nutritionSuggestions: ["训练后补充优质蛋白和主食", "今晚优先保证睡眠"],
    };
  }

  return {
    type: "general_guidance",
    message: `我理解你的反馈：“${feedback}”。第一版会优先保持安全和可坚持，建议先降低难度或选择计划中的替代动作。`,
    replacements: [],
    nutritionSuggestions: [],
  };
}

function buildWorkoutTemplates(exercises: ExerciseMedia[], sessionMinutes: number): WorkoutItem[][] {
  const warmup = pick(exercises, "warmup", "warmup-march");
  const squat = pick(exercises, "strength", "bodyweight-squat");
  const bridge = pick(exercises, "strength", "glute-bridge");
  const push = pick(exercises, "strength", "incline-push-up");
  const row = pick(exercises, "strength", "dumbbell-row");
  const core = pick(exercises, "strength", "plank");
  const cardio = pick(exercises, "cardio", exercises.some((item) => item.id === "treadmill-walk") ? "treadmill-walk" : "warmup-march");
  const stretch = pick(exercises, "mobility", "stretch-full-body");
  const cardioMinutes = sessionMinutes >= 45 ? 14 : 8;

  return [
    [toWorkoutItem(warmup, 1), toWorkoutItem(squat, 1), toWorkoutItem(push, 1), toWorkoutItem(core, 1), toWorkoutItem(stretch, 1)],
    [toWorkoutItem(warmup, 1), toWorkoutItem(bridge, 1), toWorkoutItem(row, 1), toWorkoutItem(cardio, 1, cardioMinutes), toWorkoutItem(stretch, 1)],
    [toWorkoutItem(warmup, 1), toWorkoutItem(squat, 1), toWorkoutItem(row, 1), toWorkoutItem(core, 1), toWorkoutItem(stretch, 1)],
    [toWorkoutItem(warmup, 1), toWorkoutItem(bridge, 1), toWorkoutItem(push, 1), toWorkoutItem(cardio, 1, cardioMinutes), toWorkoutItem(stretch, 1)],
  ];
}

function buildRecoveryItems(exercises: ExerciseMedia[]): WorkoutItem[] {
  const stretch = pick(exercises, "mobility", "stretch-full-body");
  return [toWorkoutItem(stretch, 1, 8)];
}

function buildNutrition(input: AssessmentInput): NutritionDay {
  const bmr = input.sex === "female"
    ? 10 * input.weightKg + 6.25 * input.heightCm - 5 * input.age - 161
    : 10 * input.weightKg + 6.25 * input.heightCm - 5 * input.age + 5;
  const maintenance = bmr * 1.45;
  const wantsWeightLoss = input.targetWeightKg ? input.targetWeightKg < input.weightKg : input.goalText.includes("减脂");
  const calorieTarget = Math.round((wantsWeightLoss ? maintenance - 400 : maintenance + 100) / 50) * 50;
  const safeCalories = Math.max(input.sex === "female" ? 1300 : 1500, calorieTarget);
  const proteinGrams = Math.round(input.weightKg * 1.6);
  const restrictions = [...input.dietaryRestrictions, ...input.allergies].filter(Boolean);

  const meals = [
    "早餐：燕麦或全麦面包 + 鸡蛋/无糖酸奶 + 一份水果",
    "午餐：米饭/土豆/杂粮饭 + 鸡胸肉或鱼虾豆腐 + 两拳蔬菜",
    "晚餐：优质蛋白 + 大量蔬菜 + 适量主食，训练日不要完全不吃碳水",
    "加餐：无糖酸奶、低脂奶、鸡蛋或水果，按饥饿感选择",
  ].map((meal) => applyFoodRestrictions(meal, restrictions));

  return {
    calorieTarget: safeCalories,
    proteinGrams,
    waterLiters: input.weightKg >= 80 ? 2.5 : 2,
    meals,
    swaps: [
      "鸡胸肉可替换为鱼、虾、鸡蛋、豆腐或瘦猪肉",
      "米饭可替换为土豆、玉米、燕麦或全麦面",
      "不方便做饭时选择便利店的茶叶蛋、无糖酸奶、饭团和沙拉组合",
    ],
    restrictionNotes: restrictions.length > 0 ? [`已避开或提示限制：${restrictions.join("、")}`] : ["没有填写明显忌口，仍建议根据个人耐受调整。"],
  };
}

function applyFoodRestrictions(meal: string, restrictions: string[]) {
  let updated = meal;
  for (const restriction of restrictions) {
    if (restriction.includes("牛肉")) {
      updated = updated.replaceAll("牛肉", "鱼虾豆腐");
    }
    if (restriction.includes("花生")) {
      updated = updated.replaceAll("花生", "无糖酸奶");
    }
  }
  return updated;
}

function toWorkoutItem(exercise: ExerciseMedia | undefined, week: number, durationMinutes?: number): WorkoutItem {
  const safeExercise = exercise ?? exerciseLibrary[0];
  const isTimed = safeExercise.category === "warmup" || safeExercise.category === "cardio" || safeExercise.category === "mobility";
  return {
    id: createId(`workout-${safeExercise.id}`),
    exerciseId: safeExercise.id,
    name: safeExercise.name,
    category: safeExercise.category,
    environment: safeExercise.environment,
    sets: isTimed ? undefined : Math.min(4, 2 + Math.floor((week - 1) / 2)),
    reps: isTimed ? undefined : week >= 3 ? "10-12 次" : "8-10 次",
    durationMinutes: durationMinutes ?? (isTimed ? (safeExercise.category === "cardio" ? 12 : 6) : undefined),
    restSeconds: isTimed ? undefined : 75,
    intensity: week >= 3 ? "moderate" : "easy",
    notes: "保持能说短句的强度；任何疼痛都优先降级或停止。",
    media: {
      imageUrl: safeExercise.imageUrl,
      videoUrl: safeExercise.videoUrl,
      steps: safeExercise.steps,
      cues: safeExercise.cues,
      commonMistakes: safeExercise.commonMistakes,
      alternatives: safeExercise.alternatives,
    },
  };
}

function scaleWorkout(item: WorkoutItem, week: number): WorkoutItem {
  if (item.sets) {
    return {
      ...item,
      sets: Math.min(4, item.sets + (week >= 3 ? 1 : 0)),
      intensity: week >= 3 ? "moderate" : "easy",
    };
  }
  if (item.durationMinutes && item.category === "cardio") {
    return {
      ...item,
      durationMinutes: item.durationMinutes + (week - 1) * 2,
      intensity: week >= 3 ? "moderate" : "easy",
    };
  }
  return item;
}

function pick(exercises: ExerciseMedia[], category: ExerciseMedia["category"], preferredId: string) {
  return exercises.find((exercise) => exercise.id === preferredId)
    ?? exercises.find((exercise) => exercise.category === category)
    ?? exerciseLibrary.find((exercise) => exercise.id === preferredId)
    ?? exerciseLibrary.find((exercise) => exercise.category === category)
    ?? exerciseLibrary[0];
}

function getFocusForDay(weekday: number) {
  const focus = ["全身基础力量", "臀腿与背部", "核心与体态", "全身循环", "轻心肺与拉伸"];
  return focus[(weekday - 1) % focus.length] ?? "全身训练";
}

function calculateBmi(weightKg: number, heightCm: number) {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function containsAny(text: string, terms: string[]) {
  return terms.some((term) => text.includes(term));
}

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}
