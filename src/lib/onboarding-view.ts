import type { AssessmentInput } from "./types";

export type OnboardingStepId = "basics" | "goals" | "equipment" | "limits" | "confirm";
export type OnboardingStepState = "complete" | "current" | "upcoming";

export type OnboardingAnswers = {
  displayName: string;
  email: string;
  age: string;
  sex: string;
  heightCm: string;
  weightKg: string;
  targetWeightKg: string;
  goalText: string;
  trainingDays: string;
  sessionMinutes: string;
  trainingEnvironment: string;
  experience: string;
  equipment: string;
  injuries: string;
  chronicConditions: string;
  dietaryRestrictions: string;
  allergies: string;
  sleepHours: string;
  foodBudget: string;
  currentImageUrl: string;
  targetImageUrl: string;
};

export type OnboardingStepView = {
  id: OnboardingStepId;
  label: string;
  description: string;
  state: OnboardingStepState;
  isVisible: boolean;
  isComplete: boolean;
};

export type OnboardingSummary = {
  metrics: string;
  goal: string;
  schedule: string;
  restrictions: string;
  equipment: string;
};

type BuildOnboardingStepsInput = {
  requestedStep?: string;
  answers?: Partial<OnboardingAnswers>;
};

const stepOrder: OnboardingStepId[] = ["basics", "goals", "equipment", "limits", "confirm"];

const stepMeta: Record<OnboardingStepId, { label: string; description: string }> = {
  basics: {
    label: "基础信息",
    description: "先确认身体基础数据，后面的计划强度才能合理。",
  },
  goals: {
    label: "目标与节奏",
    description: "把目标、每周频率和单次训练时间说清楚。",
  },
  equipment: {
    label: "场景与器械",
    description: "告诉系统你在哪里练、手里有什么器械、练到什么程度。",
  },
  limits: {
    label: "限制条件",
    description: "把伤病、疼痛、饮食限制和预算边界提前讲明白。",
  },
  confirm: {
    label: "确认生成",
    description: "最后确认一遍，再生成你的 4 周专属计划。",
  },
};

export function buildOnboardingSteps(input: BuildOnboardingStepsInput) {
  const answers = withAnswerDefaults(input.answers);
  const requestedStep = normalizeStepId(input.requestedStep);
  const firstIncompleteIndex = stepOrder.findIndex((stepId) => !isStepComplete(stepId, answers));
  const highestAvailableIndex = firstIncompleteIndex === -1 ? stepOrder.length - 1 : firstIncompleteIndex;
  const currentIndex = Math.min(stepOrder.indexOf(requestedStep), highestAvailableIndex);
  const currentStep = stepOrder[currentIndex];

  const steps = stepOrder.map((id, index) => ({
    id,
    label: stepMeta[id].label,
    description: stepMeta[id].description,
    state: resolveState(index, currentIndex),
    isVisible: index <= currentIndex,
    isComplete: isStepComplete(id, answers),
  }));

  return {
    currentStep,
    currentIndex,
    steps,
    summary: buildOnboardingSummary(answers),
  };
}

export function buildOnboardingSummary(answers: Partial<OnboardingAnswers>): OnboardingSummary {
  const safeAnswers = withAnswerDefaults(answers);
  const metricsParts = [
    safeAnswers.age ? `${safeAnswers.age} 岁` : "",
    safeAnswers.sex ? sexLabel(safeAnswers.sex) : "",
    safeAnswers.heightCm ? `${safeAnswers.heightCm} cm` : "",
    safeAnswers.weightKg ? `${safeAnswers.weightKg} kg` : "",
    safeAnswers.targetWeightKg ? `目标 ${safeAnswers.targetWeightKg} kg` : "",
  ].filter(Boolean);

  const scheduleParts = [
    safeAnswers.trainingDays ? `每周 ${safeAnswers.trainingDays} 天` : "",
    safeAnswers.sessionMinutes ? `每次 ${safeAnswers.sessionMinutes} 分钟` : "",
    safeAnswers.trainingEnvironment ? environmentLabel(safeAnswers.trainingEnvironment) : "",
    safeAnswers.experience ? experienceLabel(safeAnswers.experience) : "",
  ].filter(Boolean);

  const restrictionParts = [
    safeAnswers.injuries,
    safeAnswers.chronicConditions,
    safeAnswers.dietaryRestrictions,
    safeAnswers.allergies,
  ]
    .map((value) => value.trim())
    .filter((value) => value && value !== "无");

  return {
    metrics: metricsParts.join(" / ") || "先填写基础信息",
    goal: safeAnswers.goalText.trim() || "还没有填写目标描述",
    schedule: scheduleParts.join(" / ") || "还没有确认每周训练节奏",
    restrictions: restrictionParts.join("；") || "未填写限制条件",
    equipment: safeAnswers.equipment.trim() || "未填写器械条件",
  };
}

export function createInitialOnboardingAnswers(input: {
  displayName: string;
  email: string;
  assessment: AssessmentInput | null;
  query?: Record<string, string | string[] | undefined>;
}) {
  const assessment = input.assessment;
  const defaults: OnboardingAnswers = {
    displayName: input.displayName,
    email: input.email,
    age: String(assessment?.age ?? 29),
    sex: assessment?.sex ?? "female",
    heightCm: String(assessment?.heightCm ?? 168),
    weightKg: String(assessment?.weightKg ?? 70),
    targetWeightKg: assessment?.targetWeightKg ? String(assessment.targetWeightKg) : "",
    goalText: assessment?.goalText ?? "希望先稳步减脂，再逐步改善核心稳定和体态。",
    trainingDays: String(assessment?.trainingDaysPerWeek ?? 3),
    sessionMinutes: String(assessment?.sessionMinutes ?? 45),
    trainingEnvironment: assessment?.trainingEnvironment ?? "both",
    experience: assessment?.experience ?? "beginner",
    equipment: joinLines(assessment?.equipment) || "瑜伽垫，弹力带",
    injuries: joinLines(assessment?.injuries) || "无",
    chronicConditions: joinLines(assessment?.chronicConditions) || "无",
    dietaryRestrictions: joinLines(assessment?.dietaryRestrictions) || "无",
    allergies: joinLines(assessment?.allergies) || "无",
    sleepHours: assessment?.sleepHours ? String(assessment.sleepHours) : "",
    foodBudget: assessment?.foodBudget ?? "normal",
    currentImageUrl: findImageUrl(assessment, "current"),
    targetImageUrl: findImageUrl(assessment, "target"),
  };

  if (!input.query) {
    return defaults;
  }

  return withAnswerDefaults({
    ...defaults,
    displayName: defaults.displayName,
    email: defaults.email,
    age: readQueryValue(input.query.age, defaults.age),
    sex: readQueryValue(input.query.sex, defaults.sex),
    heightCm: readQueryValue(input.query.heightCm, defaults.heightCm),
    weightKg: readQueryValue(input.query.weightKg, defaults.weightKg),
    targetWeightKg: readQueryValue(input.query.targetWeightKg, defaults.targetWeightKg),
    goalText: readQueryValue(input.query.goalText, defaults.goalText),
    trainingDays: readQueryValue(input.query.trainingDays, defaults.trainingDays),
    sessionMinutes: readQueryValue(input.query.sessionMinutes, defaults.sessionMinutes),
    trainingEnvironment: readQueryValue(input.query.trainingEnvironment, defaults.trainingEnvironment),
    experience: readQueryValue(input.query.experience, defaults.experience),
    equipment: readQueryValue(input.query.equipment, defaults.equipment),
    injuries: readQueryValue(input.query.injuries, defaults.injuries),
    chronicConditions: readQueryValue(input.query.chronicConditions, defaults.chronicConditions),
    dietaryRestrictions: readQueryValue(input.query.dietaryRestrictions, defaults.dietaryRestrictions),
    allergies: readQueryValue(input.query.allergies, defaults.allergies),
    sleepHours: readQueryValue(input.query.sleepHours, defaults.sleepHours),
    foodBudget: readQueryValue(input.query.foodBudget, defaults.foodBudget),
    currentImageUrl: readQueryValue(input.query.currentImageUrl, defaults.currentImageUrl),
    targetImageUrl: readQueryValue(input.query.targetImageUrl, defaults.targetImageUrl),
  });
}

export function getOnboardingStepOrder() {
  return stepOrder;
}

function resolveState(index: number, currentIndex: number): OnboardingStepState {
  if (index < currentIndex) {
    return "complete";
  }

  if (index === currentIndex) {
    return "current";
  }

  return "upcoming";
}

function isStepComplete(stepId: OnboardingStepId, answers: OnboardingAnswers) {
  if (stepId === "basics") {
    return hasAllValues(answers.age, answers.sex, answers.heightCm, answers.weightKg);
  }

  if (stepId === "goals") {
    return hasAllValues(answers.goalText, answers.trainingDays, answers.sessionMinutes);
  }

  if (stepId === "equipment") {
    return hasAllValues(answers.trainingEnvironment, answers.experience, answers.equipment);
  }

  if (stepId === "limits") {
    return hasAllValues(
      answers.injuries,
      answers.chronicConditions,
      answers.dietaryRestrictions,
      answers.allergies,
      answers.foodBudget,
    );
  }

  return stepOrder.slice(0, -1).every((current) => isStepComplete(current, answers));
}

function hasAllValues(...values: string[]) {
  return values.every((value) => value.trim().length > 0);
}

function normalizeStepId(value: string | undefined): OnboardingStepId {
  if (value && stepOrder.includes(value as OnboardingStepId)) {
    return value as OnboardingStepId;
  }

  return "basics";
}

function joinLines(values: string[] | undefined) {
  return values?.join("\n") ?? "";
}

function findImageUrl(assessment: AssessmentInput | null, kind: "current" | "target") {
  return assessment?.uploadedImages?.find((image) => image.kind === kind)?.url ?? "";
}

function readQueryValue(value: string | string[] | undefined, fallback: string) {
  if (Array.isArray(value)) {
    return value[0] ?? fallback;
  }

  return value ?? fallback;
}

function withAnswerDefaults(answers: Partial<OnboardingAnswers> | undefined): OnboardingAnswers {
  return {
    displayName: answers?.displayName ?? "",
    email: answers?.email ?? "",
    age: answers?.age ?? "",
    sex: answers?.sex ?? "",
    heightCm: answers?.heightCm ?? "",
    weightKg: answers?.weightKg ?? "",
    targetWeightKg: answers?.targetWeightKg ?? "",
    goalText: answers?.goalText ?? "",
    trainingDays: answers?.trainingDays ?? "",
    sessionMinutes: answers?.sessionMinutes ?? "",
    trainingEnvironment: answers?.trainingEnvironment ?? "",
    experience: answers?.experience ?? "",
    equipment: answers?.equipment ?? "",
    injuries: answers?.injuries ?? "",
    chronicConditions: answers?.chronicConditions ?? "",
    dietaryRestrictions: answers?.dietaryRestrictions ?? "",
    allergies: answers?.allergies ?? "",
    sleepHours: answers?.sleepHours ?? "",
    foodBudget: answers?.foodBudget ?? "",
    currentImageUrl: answers?.currentImageUrl ?? "",
    targetImageUrl: answers?.targetImageUrl ?? "",
  };
}

function sexLabel(value: string) {
  if (value === "male") {
    return "男性";
  }

  if (value === "female") {
    return "女性";
  }

  return "其他";
}

function environmentLabel(value: string) {
  if (value === "home") {
    return "居家训练";
  }

  if (value === "gym") {
    return "健身房训练";
  }

  if (value === "both") {
    return "居家 / 健身房都可以";
  }

  return value;
}

function experienceLabel(value: string) {
  if (value === "intermediate") {
    return "已有基础";
  }

  if (value === "beginner") {
    return "新手起步";
  }

  return value;
}
