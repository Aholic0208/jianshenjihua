import { exerciseLibrary, getExercisesForEnvironment } from "./exercise-library";
import { classifyPlanProfile } from "./plan-profile";
import { chooseLowerBodyPrimary, type LowerBodyPrimary } from "./planner-rules";
import { buildProgramTemplate } from "./program-template";
import { buildNutritionStrategy } from "./nutrition-strategy";
import { buildFaqEntries } from "./faq-rules";
import type {
  AssessmentInput,
  ExerciseMedia,
  FitnessPlan,
  NutritionDay,
  PlanPrimaryGoal,
  PlanAdjustment,
  PlanDay,
  PlanWeek,
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

  const profile = classifyPlanProfile(input);
  const lowerBodyPrimary = chooseLowerBodyPrimary(input.injuries);
  const trainingDays = normalizeTrainingDays(input.trainingDaysPerWeek, input.experience);
  const program = buildProgramTemplate(
    {
      ...input,
      trainingDaysPerWeek: trainingDays,
    },
    profile,
  );
  const exercises = getExercisesForEnvironment(input.trainingEnvironment, input.equipment);
  const nutrition = buildNutritionStrategy(input, profile);
  const faqEntries = buildFaqEntries({
    goalText: input.goalText,
    profile,
    program,
    nutrition,
  });
  const weeks = buildWeeks(profile.primaryGoal, lowerBodyPrimary);

  const days: PlanDay[] = [];

  for (let dayIndex = 1; dayIndex <= 28; dayIndex += 1) {
    const week = Math.ceil(dayIndex / 7);
    const weekday = ((dayIndex - 1) % 7) + 1;
    const dayTag = program.weeklyStructure[weekday - 1] ?? "recovery";
    const isTrainingDay = dayTag !== "recovery";
    const workoutItems = isTrainingDay
      ? buildWorkoutItemsForTag({
          dayTag,
          exercises,
          trainingEnvironment: input.trainingEnvironment,
          sessionMinutes: input.sessionMinutes,
          lowerBodyPrimary,
          week,
          primaryGoal: profile.primaryGoal,
        })
      : buildRecoveryItems(exercises, input.trainingEnvironment);

    days.push({
      dayIndex,
      week,
      label: `第 ${week} 周 · 第 ${weekday} 天`,
      focus: getFocusForDayTag(dayTag, lowerBodyPrimary),
      workoutItems,
      nutrition: buildDailyNutrition(nutrition, isTrainingDay, week, profile.primaryGoal),
      checkInPrompt: "记录完成度、疲劳、疼痛、饥饿感和备注，系统会据此微调下一次训练。",
    });
  }

  const imageInsight = input.uploadedImages
    ?.map((image) => image.aiSummary)
    .filter(Boolean)
    .join("；");
  const summary = [
    `4 周个性化计划：每周 ${trainingDays} 天训练，每次约 ${input.sessionMinutes} 分钟。`,
    `目标重点：${summarizePlanPrimaryGoal(profile.primaryGoal)}。`,
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
    profile,
    faqEntries,
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

  if (containsAny(text, ["没有哑铃", "没哑铃", "只有弹力带", "器械不够", "no dumbbell", "no equipment"])) {
    return {
      type: "exercise_swap",
      message: "器械临时受限时，先把今天依赖负重或器械的动作换成弹力带或徒手版本，优先保证发力路径和稳定性。",
      replacements: [
        toWorkoutItem(findExerciseById("band-row"), 1),
        toWorkoutItem(findExerciseById("glute-bridge"), 1),
        toWorkoutItem(findExerciseById("plank"), 1),
      ],
      nutritionSuggestions: [],
    };
  }

  if (containsAny(text, ["时间不够", "赶时间", "只有 20", "只有20", "只有 25", "只有25", "20 分钟", "25 分钟", "30 分钟", "short on time"])) {
    const minutes = readMinuteHint(feedback) ?? 20;
    return {
      type: "time_adjustment",
      message: `今天先切到 ${minutes} 分钟版本：保留热身、两个主动作和最后的拉伸，剩下的内容下次再补，不用为了凑完整套把动作做乱。`,
      replacements: [],
      nutritionSuggestions: ["训练后 30-60 分钟内补一份蛋白和主食，避免因为赶时间漏掉恢复。"],
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

function buildWorkoutItemsForTag(input: {
  dayTag: string;
  exercises: ExerciseMedia[];
  sessionMinutes: number;
  lowerBodyPrimary: LowerBodyPrimary;
  trainingEnvironment: AssessmentInput["trainingEnvironment"];
  week: number;
  primaryGoal: PlanPrimaryGoal;
}) {
  const warmup = pick(input.exercises, "warmup", "warmup-march");
  const squat = input.lowerBodyPrimary === "hip_dominant"
    ? pick(input.exercises, "strength", "glute-bridge")
    : pick(input.exercises, "strength", "bodyweight-squat");
  const bridge = pick(input.exercises, "strength", "glute-bridge");
  const push = pick(input.exercises, "strength", "incline-push-up");
  const preferredHomePull = input.exercises.some((exercise) => exercise.id === "band-row") ? "band-row" : "dumbbell-row";
  const row = input.trainingEnvironment === "gym"
    ? pick(input.exercises, "strength", "lat-pulldown")
    : pick(input.exercises, "strength", preferredHomePull);
  const secondaryPull = pick(input.exercises, "strength", preferredHomePull);
  const core = pick(input.exercises, "strength", "plank");
  const cardio = input.trainingEnvironment === "gym"
    ? pick(input.exercises, "cardio", "treadmill-walk")
    : pick(input.exercises, "cardio", "step-cardio");
  const stretch = pick(input.exercises, "mobility", "stretch-full-body");
  const cardioMinutes = readCardioMinutes(input.primaryGoal, input.sessionMinutes, input.dayTag.includes("recovery"));
  const template = input.dayTag === "push"
    ? [toWorkoutItem(warmup, 1), toWorkoutItem(push, 1), toWorkoutItem(push, 1), toWorkoutItem(core, 1), toWorkoutItem(stretch, 1)]
    : input.dayTag === "pull"
      ? [toWorkoutItem(warmup, 1), toWorkoutItem(row, 1), toWorkoutItem(secondaryPull, 1), toWorkoutItem(core, 1), toWorkoutItem(stretch, 1)]
      : input.dayTag === "legs"
        ? [toWorkoutItem(warmup, 1), toWorkoutItem(squat, 1), toWorkoutItem(bridge, 1), toWorkoutItem(core, 1), toWorkoutItem(stretch, 1)]
        : input.dayTag === "upper_accessory"
          ? [toWorkoutItem(warmup, 1), toWorkoutItem(push, 1), toWorkoutItem(row, 1), toWorkoutItem(core, 1), toWorkoutItem(stretch, 1)]
          : input.dayTag === "upper_gym"
            ? [toWorkoutItem(warmup, 1), toWorkoutItem(push, 1), toWorkoutItem(row, 1), toWorkoutItem(secondaryPull, 1), toWorkoutItem(stretch, 1)]
            : input.dayTag === "lower_home"
              ? [toWorkoutItem(warmup, 1), toWorkoutItem(squat, 1), toWorkoutItem(bridge, 1), toWorkoutItem(core, 1), toWorkoutItem(stretch, 1)]
              : input.dayTag === "upper_home"
                ? [toWorkoutItem(warmup, 1), toWorkoutItem(push, 1), toWorkoutItem(secondaryPull, 1), toWorkoutItem(core, 1), toWorkoutItem(stretch, 1)]
                : input.dayTag === "lower_gym"
                  ? [toWorkoutItem(warmup, 1), toWorkoutItem(squat, 1), toWorkoutItem(bridge, 1), toWorkoutItem(cardio, 1, cardioMinutes), toWorkoutItem(stretch, 1)]
                  : input.dayTag.includes("cardio")
                    ? [toWorkoutItem(cardio, 1, cardioMinutes), toWorkoutItem(stretch, 1, 8)]
                    : [toWorkoutItem(warmup, 1), toWorkoutItem(squat, 1), toWorkoutItem(push, 1), toWorkoutItem(row, 1), toWorkoutItem(stretch, 1)];

  return template.map((item) => scaleWorkout(item, input.week, input.primaryGoal));
}

function buildRecoveryItems(exercises: ExerciseMedia[], environment: AssessmentInput["trainingEnvironment"]) {
  const stretch = pick(exercises, "mobility", "stretch-full-body");
  const walk = environment === "gym"
    ? pick(exercises, "cardio", "treadmill-walk")
    : pick(exercises, "cardio", "step-cardio");

  return [toWorkoutItem(walk, 1, 8), toWorkoutItem(stretch, 1, 8)];
}

function buildDailyNutrition(base: NutritionDay, isTrainingDay: boolean, week: number, primaryGoal: PlanPrimaryGoal): NutritionDay {
  if (!isTrainingDay) {
    return {
      ...base,
      calorieTarget: primaryGoal === "lean_gain_strength" ? base.calorieTarget : base.calorieTarget - 100,
      meals: [...base.meals],
      swaps: [...base.swaps, "恢复日如果活动量较低，可把主食分量略减半拳到一拳。"],
      restrictionNotes: [...base.restrictionNotes],
      indulgenceGuidance: base.indulgenceGuidance,
    };
  }

  return {
    ...base,
    calorieTarget: week >= 3 && primaryGoal === "lean_gain_strength" ? base.calorieTarget + 100 : base.calorieTarget,
    meals: [...base.meals],
    swaps: [...base.swaps],
    restrictionNotes: [...base.restrictionNotes],
    indulgenceGuidance: base.indulgenceGuidance,
  };
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

function scaleWorkout(item: WorkoutItem, week: number, primaryGoal: PlanPrimaryGoal): WorkoutItem {
  if (item.sets) {
    return {
      ...item,
      sets: Math.min(primaryGoal === "lean_gain_strength" ? 5 : 4, item.sets + (week >= 3 ? 1 : 0)),
      intensity: week >= 3 ? "moderate" : item.intensity,
    };
  }

  if (item.durationMinutes && item.category === "cardio") {
    return {
      ...item,
      durationMinutes: item.durationMinutes + (primaryGoal === "fat_loss_preserve_muscle" ? week : Math.max(0, week - 2)),
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

function getFocusForDayTag(dayTag: string, lowerBodyPrimary: LowerBodyPrimary) {
  const lowerBodyFocus = lowerBodyPrimary === "hip_dominant" ? "臀腿控制" : "下肢力量";
  if (dayTag === "push") {
    return "推训练";
  }
  if (dayTag === "pull") {
    return "拉训练";
  }
  if (dayTag === "legs") {
    return lowerBodyFocus;
  }
  if (dayTag === "upper_accessory" || dayTag === "upper_gym" || dayTag === "upper_home") {
    return "上肢强化";
  }
  if (dayTag === "lower_home" || dayTag === "lower_gym") {
    return lowerBodyFocus;
  }
  if (dayTag.includes("cardio")) {
    return "有氧与恢复";
  }
  if (dayTag.includes("full_body")) {
    return "全身训练";
  }
  return "恢复、轻活动与拉伸";
}

function summarizePlanPrimaryGoal(primaryGoal: PlanPrimaryGoal) {
  if (primaryGoal === "lean_gain_strength") {
    return "以增肌增力和渐进超负荷为主";
  }
  if (primaryGoal === "recomposition") {
    return "以增肌降体脂和训练质量为主";
  }
  return "以减脂保肌、出勤和恢复为主";
}

function buildWeeks(primaryGoal: PlanPrimaryGoal, lowerBodyPrimary: LowerBodyPrimary): PlanWeek[] {
  const lowerBodyCue = lowerBodyPrimary === "hip_dominant" ? "臀后链控制" : "下肢发力模式";
  const weekEmphasis = primaryGoal === "lean_gain_strength"
    ? [
        ["动作稳定", "记录主动作表现", lowerBodyCue],
        ["增加训练完成度", "稳定组数", "保留恢复"],
        ["渐进超负荷", "核心动作推进", "小幅加量"],
        ["巩固表现", "复盘恢复", "为下一阶段做准备"],
      ]
    : primaryGoal === "recomposition"
      ? [
          ["动作质量", "力量输出", lowerBodyCue],
          ["维持训练节奏", "蛋白完成度", "保留有氧"],
          ["提升完成度", "观察围度与主观状态", "稳步推进"],
          ["巩固习惯", "复盘反馈", "准备下一轮计划"],
        ]
      : [
          ["规律出勤", "动作学习", lowerBodyCue],
          ["抗阻训练优先", "逐步增加活动量", "恢复跟上"],
          ["维持力量", "提高有氧完成度", "避免激进节食"],
          ["巩固执行", "复盘饥饿与疲劳", "准备下一轮"],
        ];

  return [
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

function readCardioMinutes(primaryGoal: PlanPrimaryGoal, sessionMinutes: number, isRecoveryDay: boolean) {
  if (primaryGoal === "fat_loss_preserve_muscle") {
    return isRecoveryDay ? Math.max(12, Math.round(sessionMinutes * 0.4)) : Math.max(10, Math.round(sessionMinutes * 0.25));
  }
  if (primaryGoal === "lean_gain_strength") {
    return isRecoveryDay ? 12 : 8;
  }
  return isRecoveryDay ? 14 : 10;
}

function containsAny(text: string, terms: string[]) {
  return terms.some((term) => text.includes(term));
}

function readMinuteHint(text: string) {
  const matched = text.match(/(\d{1,2})\s*分钟/);
  if (!matched) {
    return null;
  }

  const minutes = Number.parseInt(matched[1] ?? "", 10);
  return Number.isFinite(minutes) ? minutes : null;
}

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function findExerciseById(id: string) {
  return exerciseLibrary.find((exercise) => exercise.id === id) ?? exerciseLibrary[0];
}
