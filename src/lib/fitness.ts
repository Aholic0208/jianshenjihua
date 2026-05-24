import { exerciseLibrary, getExercisesForEnvironment } from "./exercise-library";
import { buildWeekEmphasis, chooseGoalTrack, chooseLowerBodyPrimary, deriveCalorieAdjustment, type GoalTrack, type LowerBodyPrimary } from "./planner-rules";
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
  "急性疼痛",
  "骨折",
  "术后",
  "饮食障碍",
  "pregnant",
  "chest pain",
  "fracture",
  "post op",
];

const DISCLAIMER =
  "本计划仅用于一般健身辅助，不替代医生、营养师或持证教练的诊断与处方。如出现疼痛、胸闷、头晕或其他异常，请立即停止并咨询专业人士。";

export function analyzeSafety(input: AssessmentInput): SafetyAnalysis {
  const messages: string[] = [];

  if (input.age < 18) {
    return {
      canGeneratePlan: false,
      riskLevel: "blocked",
      messages: ["第一版仅服务 18 岁以上成年人，请在监护人与专业人士指导下训练。"],
    };
  }

  const bmi = calculateBmi(input.weightKg, input.heightCm);
  const targetBmi = input.targetWeightKg ? calculateBmi(input.targetWeightKg, input.heightCm) : null;
  const wantsWeightLoss = Boolean(input.targetWeightKg && input.targetWeightKg < input.weightKg)
    || /减脂|减重|fat|lose/i.test(input.goalText);
  const weightLossRatio = input.targetWeightKg ? (input.weightKg - input.targetWeightKg) / input.weightKg : 0;

  if (targetBmi !== null && (targetBmi < 18.5 || weightLossRatio > 0.2)) {
    messages.push("目标体重过低或减重幅度过大，建议先咨询医生或营养师后再制定计划。");
  }

  const riskText = [...input.injuries, ...input.chronicConditions].join(" ").toLowerCase();
  if (HIGH_RISK_TERMS.some((term) => riskText.includes(term.toLowerCase()))) {
    messages.push("你填写的伤病或慢性病信息需要医生或专业教练先评估，系统不会生成高强度计划。");
  }

  if (wantsWeightLoss && bmi < 18.5) {
    messages.push("当前 BMI 偏低，第一版不会建议减重计划。");
  }

  if (input.injuries.join(" ").includes("急性")) {
    messages.push("存在急性疼痛或近期损伤，先处理症状，再考虑恢复训练。");
  }

  if (messages.length > 0) {
    return {
      canGeneratePlan: false,
      riskLevel: messages.some((item) => item.includes("医生")) ? "medical_review" : "caution",
      messages,
    };
  }

  return {
    canGeneratePlan: true,
    riskLevel: "normal",
    messages: ["可生成普通成人新手计划；强度会从保守水平开始，并根据打卡反馈调整。"],
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
      summary: "当前不生成完整训练计划，请先根据安全提示咨询医生或专业教练。",
      disclaimer: DISCLAIMER,
      weeks: [],
      days: [],
    };
  }

  const goalTrack = chooseGoalTrack(input.goalText);
  const lowerBodyPrimary = chooseLowerBodyPrimary(input.injuries);
  const trainingDays = normalizeTrainingDays(input.trainingDaysPerWeek, input.experience);
  const exercises = getExercisesForEnvironment(input.trainingEnvironment, input.equipment);
  const workoutTemplates = buildWorkoutTemplates({
    exercises,
    sessionMinutes: input.sessionMinutes,
    goalTrack,
    lowerBodyPrimary,
    trainingEnvironment: input.trainingEnvironment,
  });
  const nutrition = buildNutrition(input, goalTrack);
  const weekEmphasis = buildWeekEmphasis({
    goalTrack,
    lowerBodyPrimary,
    experience: input.experience,
  });

  const weeks = [
    {
      week: 1,
      title: "建立节奏",
      goal: "先把动作质量、恢复感知和训练出勤稳定下来。",
      emphasis: weekEmphasis[0],
    },
    {
      week: 2,
      title: "稳定推进",
      goal: "在动作不变形的前提下，提升训练密度和完成度。",
      emphasis: weekEmphasis[1],
    },
    {
      week: 3,
      title: "渐进挑战",
      goal: "如果恢复良好，再小幅提高组数或有氧时长。",
      emphasis: weekEmphasis[2],
    },
    {
      week: 4,
      title: "巩固复盘",
      goal: "复盘四周反馈，为下一阶段计划积累依据。",
      emphasis: weekEmphasis[3],
    },
  ];

  const days: PlanDay[] = [];

  for (let dayIndex = 1; dayIndex <= 28; dayIndex += 1) {
    const week = Math.ceil(dayIndex / 7);
    const weekday = ((dayIndex - 1) % 7) + 1;
    const isTrainingDay = weekday <= trainingDays;
    const template = workoutTemplates[(weekday - 1) % workoutTemplates.length] ?? workoutTemplates[0] ?? [];
    const workoutItems = isTrainingDay
      ? template.map((item) => scaleWorkout(item, week, goalTrack))
      : buildRecoveryItems(exercises, input.trainingEnvironment);

    days.push({
      dayIndex,
      week,
      label: `第 ${week} 周 · 第 ${weekday} 天`,
      focus: isTrainingDay
        ? getFocusForDay({
            weekday,
            goalTrack,
            lowerBodyPrimary,
          })
        : "恢复、轻活动与拉伸",
      workoutItems,
      nutrition: buildDailyNutrition(nutrition, isTrainingDay, week, goalTrack),
      checkInPrompt: "记录完成度、疲劳、疼痛、饥饿感和备注，系统会据此微调下一次训练。",
    });
  }

  const imageInsight = input.uploadedImages
    ?.map((image) => image.aiSummary)
    .filter(Boolean)
    .join("；");
  const summary = [
    `4 周个性化计划：每周 ${trainingDays} 天训练，每次约 ${input.sessionMinutes} 分钟。`,
    `目标重点：${summarizeGoalTrack(goalTrack)}。`,
    `当前场景：${describeEnvironment(input.trainingEnvironment)}。`,
    imageInsight ? `图像参考：${imageInsight}` : "",
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
    weeks,
    days,
  };
}

export function proposePlanAdjustment(plan: FitnessPlan, feedback: string): PlanAdjustment {
  const text = feedback.toLowerCase();

  if (containsAny(text, ["胸闷", "头晕", "剧痛", "刺痛", "晕", "心脏", "chest pain", "dizzy"])) {
    return {
      type: "safety_referral",
      message: "这类不适超出了普通训练反馈范围，请立即停止训练，并优先咨询医生。",
      replacements: [],
      nutritionSuggestions: [],
    };
  }

  if (containsAny(text, ["膝盖", "膝", "deep squat", "squat pain", "蹲不下", "knee"])) {
    const replacement = toWorkoutItem(findExerciseById("glute-bridge"), 1);
    return {
      type: "exercise_swap",
      message: "建议先把今天的下肢重点转成髋主导动作，先避开让膝盖受压更大的深蹲模式；如果疼痛持续，请暂停下肢训练。",
      replacements: [replacement],
      nutritionSuggestions: [],
    };
  }

  if (containsAny(text, ["鸡胸", "鸡肉", "吃不了", "不想吃", "没有食材", "can't eat chicken"])) {
    return {
      type: "nutrition_swap",
      message: "可以替换蛋白来源，不需要死守鸡胸肉，关键是总热量和蛋白目标接近。",
      replacements: [],
      nutritionSuggestions: ["鱼肉 120-150g", "虾仁 120g", "鸡蛋 2 个 + 无糖酸奶", "豆腐 200g"],
    };
  }

  if (containsAny(text, ["太累", "疲劳", "没力气", "睡不好", "tired", "fatigue"])) {
    return {
      type: "load_adjustment",
      message: "今天建议先降载：每个力量动作少做 1 组，有氧控制在能完整说短句的强度。",
      replacements: [],
      nutritionSuggestions: ["训练后补一份蛋白和主食", "今晚优先保证睡眠"],
    };
  }

  return {
    type: "general_guidance",
    message: `我收到了这条反馈：“${feedback}”。第一版会优先保证安全和可坚持，建议先降低难度，必要时切换成计划中的替代动作。`,
    replacements: [],
    nutritionSuggestions: [],
  };
}

function buildWorkoutTemplates(input: {
  exercises: ExerciseMedia[];
  sessionMinutes: number;
  goalTrack: GoalTrack;
  lowerBodyPrimary: LowerBodyPrimary;
  trainingEnvironment: AssessmentInput["trainingEnvironment"];
}) {
  const warmup = pick(input.exercises, "warmup", "warmup-march");
  const squat = input.lowerBodyPrimary === "hip_dominant"
    ? pick(input.exercises, "strength", "glute-bridge")
    : pick(input.exercises, "strength", "bodyweight-squat");
  const bridge = pick(input.exercises, "strength", "glute-bridge");
  const push = pick(input.exercises, "strength", "incline-push-up");
  const row = input.trainingEnvironment === "gym"
    ? pick(input.exercises, "strength", "lat-pulldown")
    : pick(input.exercises, "strength", "dumbbell-row");
  const secondaryPull = pick(input.exercises, "strength", "dumbbell-row");
  const core = pick(input.exercises, "strength", "plank");
  const cardio = input.trainingEnvironment === "gym"
    ? pick(input.exercises, "cardio", "treadmill-walk")
    : pick(input.exercises, "cardio", "warmup-march");
  const stretch = pick(input.exercises, "mobility", "stretch-full-body");
  const cardioMinutes = input.goalTrack === "fat_loss"
    ? input.sessionMinutes >= 45 ? 16 : 10
    : input.sessionMinutes >= 45
      ? 12
      : 8;

  if (input.goalTrack === "muscle_gain") {
    return [
      [toWorkoutItem(warmup, 1), toWorkoutItem(squat, 1), toWorkoutItem(push, 1), toWorkoutItem(row, 1), toWorkoutItem(stretch, 1)],
      [toWorkoutItem(warmup, 1), toWorkoutItem(bridge, 1), toWorkoutItem(secondaryPull, 1), toWorkoutItem(core, 1), toWorkoutItem(stretch, 1)],
      [toWorkoutItem(warmup, 1), toWorkoutItem(push, 1), toWorkoutItem(row, 1), toWorkoutItem(core, 1), toWorkoutItem(stretch, 1)],
      [toWorkoutItem(warmup, 1), toWorkoutItem(squat, 1), toWorkoutItem(bridge, 1), toWorkoutItem(cardio, 1, cardioMinutes), toWorkoutItem(stretch, 1)],
    ];
  }

  if (input.goalTrack === "posture") {
    return [
      [toWorkoutItem(warmup, 1), toWorkoutItem(core, 1), toWorkoutItem(row, 1), toWorkoutItem(stretch, 1, 10)],
      [toWorkoutItem(warmup, 1), toWorkoutItem(bridge, 1), toWorkoutItem(push, 1), toWorkoutItem(stretch, 1)],
      [toWorkoutItem(warmup, 1), toWorkoutItem(core, 1), toWorkoutItem(cardio, 1, cardioMinutes), toWorkoutItem(stretch, 1, 10)],
      [toWorkoutItem(warmup, 1), toWorkoutItem(squat, 1), toWorkoutItem(row, 1), toWorkoutItem(stretch, 1)],
    ];
  }

  if (input.goalTrack === "body_shape") {
    return [
      [toWorkoutItem(warmup, 1), toWorkoutItem(squat, 1), toWorkoutItem(push, 1), toWorkoutItem(core, 1), toWorkoutItem(stretch, 1)],
      [toWorkoutItem(warmup, 1), toWorkoutItem(bridge, 1), toWorkoutItem(row, 1), toWorkoutItem(cardio, 1, cardioMinutes), toWorkoutItem(stretch, 1)],
      [toWorkoutItem(warmup, 1), toWorkoutItem(squat, 1), toWorkoutItem(secondaryPull, 1), toWorkoutItem(core, 1), toWorkoutItem(stretch, 1)],
      [toWorkoutItem(warmup, 1), toWorkoutItem(bridge, 1), toWorkoutItem(push, 1), toWorkoutItem(cardio, 1, cardioMinutes), toWorkoutItem(stretch, 1)],
    ];
  }

  return [
    [toWorkoutItem(warmup, 1), toWorkoutItem(squat, 1), toWorkoutItem(push, 1), toWorkoutItem(cardio, 1, cardioMinutes), toWorkoutItem(stretch, 1)],
    [toWorkoutItem(warmup, 1), toWorkoutItem(bridge, 1), toWorkoutItem(row, 1), toWorkoutItem(core, 1), toWorkoutItem(stretch, 1)],
    [toWorkoutItem(warmup, 1), toWorkoutItem(squat, 1), toWorkoutItem(secondaryPull, 1), toWorkoutItem(cardio, 1, cardioMinutes), toWorkoutItem(stretch, 1)],
    [toWorkoutItem(warmup, 1), toWorkoutItem(bridge, 1), toWorkoutItem(push, 1), toWorkoutItem(core, 1), toWorkoutItem(stretch, 1)],
  ];
}

function buildRecoveryItems(exercises: ExerciseMedia[], environment: AssessmentInput["trainingEnvironment"]) {
  const stretch = pick(exercises, "mobility", "stretch-full-body");
  const walk = environment === "gym"
    ? pick(exercises, "cardio", "treadmill-walk")
    : pick(exercises, "cardio", "warmup-march");

  return [toWorkoutItem(walk, 1, 8), toWorkoutItem(stretch, 1, 8)];
}

function buildNutrition(input: AssessmentInput, goalTrack: GoalTrack): NutritionDay {
  const bmr = input.sex === "female"
    ? 10 * input.weightKg + 6.25 * input.heightCm - 5 * input.age - 161
    : 10 * input.weightKg + 6.25 * input.heightCm - 5 * input.age + 5;
  const maintenance = bmr * (input.trainingDaysPerWeek >= 4 ? 1.5 : 1.42);
  const wantsWeightLoss = Boolean(input.targetWeightKg && input.targetWeightKg < input.weightKg) || goalTrack === "fat_loss";
  const calorieAdjustment = deriveCalorieAdjustment({
    wantsWeightLoss,
    sex: input.sex,
  });
  const calorieTarget = Math.round((maintenance + calorieAdjustment) / 50) * 50;
  const safeCalories = Math.max(input.sex === "female" ? 1300 : 1500, calorieTarget);
  const proteinMultiplier = goalTrack === "muscle_gain" ? 1.8 : 1.6;
  const proteinGrams = Math.round(input.weightKg * proteinMultiplier);
  const restrictions = [...input.dietaryRestrictions, ...input.allergies].filter(Boolean);

  const meals = [
    "早餐：燕麦或全麦主食 + 鸡蛋/无糖酸奶 + 一份水果。",
    "午餐：米饭/土豆/杂粮饭 + 优质蛋白 + 两份蔬菜。",
    "晚餐：优质蛋白 + 大量蔬菜 + 适量主食，训练日不要完全不吃碳水。",
    "加餐：无糖酸奶、低脂奶、鸡蛋或水果，按饥饿感选择。",
  ].map((meal) => applyFoodRestrictions(meal, restrictions));

  return {
    calorieTarget: safeCalories,
    proteinGrams,
    waterLiters: input.weightKg >= 80 ? 2.6 : 2.2,
    meals,
    swaps: [
      "鸡胸肉可替换成鱼、虾、鸡蛋、豆腐或瘦猪肉。",
      "米饭可替换成土豆、玉米、燕麦或全麦面。",
      "不方便做饭时，优先选便利店里有蛋白质和主食的组合，而不是只吃零食。",
    ],
    restrictionNotes: restrictions.length > 0
      ? [`已避开或提示限制：${restrictions.join("、")}`]
      : ["没有填写明显忌口，仍建议根据个人耐受做调整。"],
  };
}

function buildDailyNutrition(base: NutritionDay, isTrainingDay: boolean, week: number, goalTrack: GoalTrack): NutritionDay {
  if (!isTrainingDay) {
    return {
      ...base,
      calorieTarget: goalTrack === "muscle_gain" ? base.calorieTarget : base.calorieTarget - 100,
      meals: [...base.meals],
      swaps: [...base.swaps, "恢复日如果活动量较低，可把主食分量略减半拳到一拳。"],
      restrictionNotes: [...base.restrictionNotes],
    };
  }

  return {
    ...base,
    calorieTarget: week >= 3 && goalTrack === "muscle_gain" ? base.calorieTarget + 100 : base.calorieTarget,
    meals: [...base.meals],
    swaps: [...base.swaps],
    restrictionNotes: [...base.restrictionNotes],
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
    if (restriction.toLowerCase().includes("lactose")) {
      updated = updated.replaceAll("无糖酸奶", "无乳糖酸奶");
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
    notes: "保持能说短句的强度；任何尖锐疼痛都优先降级或停止。",
    media: {
      imageUrl: safeExercise.imageUrl,
      mistakeImageUrl: safeExercise.mistakeImageUrl,
      videoUrl: safeExercise.videoUrl,
      videoTitle: safeExercise.videoTitle,
      steps: safeExercise.steps,
      cues: safeExercise.cues,
      commonMistakes: safeExercise.commonMistakes,
      alternatives: safeExercise.alternatives,
      contraindications: safeExercise.contraindications,
    },
  };
}

function scaleWorkout(item: WorkoutItem, week: number, goalTrack: GoalTrack): WorkoutItem {
  if (item.sets) {
    return {
      ...item,
      sets: Math.min(goalTrack === "muscle_gain" ? 5 : 4, item.sets + (week >= 3 ? 1 : 0)),
      intensity: week >= 3 ? "moderate" : item.intensity,
    };
  }

  if (item.durationMinutes && item.category === "cardio") {
    return {
      ...item,
      durationMinutes: item.durationMinutes + (goalTrack === "fat_loss" ? week : Math.max(0, week - 2)),
      intensity: week >= 3 ? "moderate" : item.intensity,
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

function getFocusForDay(input: {
  weekday: number;
  goalTrack: GoalTrack;
  lowerBodyPrimary: LowerBodyPrimary;
}) {
  const lowerBodyFocus = input.lowerBodyPrimary === "hip_dominant" ? "臀腿控制" : "下肢力量";

  if (input.goalTrack === "muscle_gain") {
    return [lowerBodyFocus, "上肢推拉", "核心稳定", "全身强化"][input.weekday - 1] ?? "基础力量";
  }

  if (input.goalTrack === "posture") {
    return ["核心稳定", "肩髋活动", lowerBodyFocus, "姿态整合"][input.weekday - 1] ?? "体态恢复";
  }

  if (input.goalTrack === "body_shape") {
    return [lowerBodyFocus, "上肢线条", "核心与代谢", "全身塑形"][input.weekday - 1] ?? "塑形训练";
  }

  return [lowerBodyFocus, "上肢力量", "全身代谢", "核心与步数"][input.weekday - 1] ?? "减脂训练";
}

function summarizeGoalTrack(goalTrack: GoalTrack) {
  if (goalTrack === "muscle_gain") {
    return "以基础力量和训练渐进为主";
  }

  if (goalTrack === "posture") {
    return "以体态改善、核心稳定和活动度为主";
  }

  if (goalTrack === "body_shape") {
    return "以塑形、训练密度和动作质量为主";
  }

  return "以稳定减脂、出勤和恢复为主";
}

function describeEnvironment(environment: AssessmentInput["trainingEnvironment"]) {
  if (environment === "home") {
    return "居家训练";
  }

  if (environment === "gym") {
    return "健身房训练";
  }

  return "居家与健身房都可";
}

function calculateBmi(weightKg: number, heightCm: number) {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

function normalizeTrainingDays(days: number, experience: AssessmentInput["experience"]) {
  const capped = Math.min(5, Math.max(2, days));
  if (experience === "beginner") {
    return Math.min(capped, 4);
  }
  return capped;
}

function containsAny(text: string, terms: string[]) {
  return terms.some((term) => text.includes(term));
}

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function findExerciseById(id: string) {
  return exerciseLibrary.find((exercise) => exercise.id === id) ?? exerciseLibrary[0];
}
