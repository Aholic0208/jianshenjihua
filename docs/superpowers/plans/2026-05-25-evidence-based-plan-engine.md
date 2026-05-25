# Evidence-Based Plan Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current mostly-template-based fitness generator with an evidence-based plan engine that differentiates fat-loss, recomposition, and muscle-gain users across home, gym, and mixed environments, and expose context-aware FAQ guidance in the generated plan.

**Architecture:** Split the current logic in `src/lib/fitness.ts` into focused modules: user profiling, evidence constants, program templating, nutrition strategy, and FAQ rules. Keep `fitness.ts` as the orchestration layer so existing service and repository code continue to call the same entrypoints while generated plans become more differentiated and evidence-backed.

**Tech Stack:** Next.js 15, TypeScript, Vitest, local SQLite-backed repository, existing server actions and dashboard UI.

---

## File Structure

**Create**

- `src/lib/evidence-rules.ts`
  Central constants and helper functions for protein targets, calorie adjustments, cardio floors, and progression thresholds that come from approved evidence-backed rules.
- `src/lib/plan-profile.ts`
  Classifies an assessment into a plan profile such as fat loss preserve muscle, recomposition, or lean gain.
- `src/lib/plan-profile.test.ts`
  TDD coverage for user classification decisions.
- `src/lib/program-template.ts`
  Builds weekly training structures and day templates by profile, experience, environment, and frequency.
- `src/lib/program-template.test.ts`
  TDD coverage for training structure differences.
- `src/lib/nutrition-strategy.ts`
  Builds calorie, protein, meal, swap, and indulgence guidance by profile and budget/restrictions.
- `src/lib/nutrition-strategy.test.ts`
  TDD coverage for differentiated nutrition outputs.
- `src/lib/faq-rules.ts`
  Returns contextual FAQ entries and misconception warnings from the generated plan.
- `src/lib/faq-rules.test.ts`
  TDD coverage for FAQ recommendations.

**Modify**

- `src/lib/types.ts`
  Add profile, FAQ, and richer nutrition/plan metadata types.
- `src/lib/exercise-library.ts`
  Expand exercise inventory and home/gym replacements for cardio and split-specific movements.
- `src/lib/fitness.ts`
  Convert from monolithic generator to orchestration layer that delegates to the new modules.
- `src/lib/fitness.test.ts`
  Replace broad smoke checks with targeted assertions for differentiated plans and evidence-backed defaults.
- `src/lib/fitness-service.test.ts`
  Verify service-level outputs still work with richer plan objects.
- `src/app/dashboard/page.tsx`
  Render the FAQ section and any new plan metadata without disturbing the main workbench flow.

**Verification**

- `npm test -- src/lib/plan-profile.test.ts`
- `npm test -- src/lib/program-template.test.ts`
- `npm test -- src/lib/nutrition-strategy.test.ts`
- `npm test -- src/lib/faq-rules.test.ts`
- `npm test -- src/lib/fitness.test.ts src/lib/fitness-service.test.ts`
- `npm run typecheck`

---

### Task 1: Add plan profile classification and evidence constants

**Files:**
- Create: `src/lib/evidence-rules.ts`
- Create: `src/lib/plan-profile.ts`
- Create: `src/lib/plan-profile.test.ts`
- Modify: `src/lib/types.ts`
- Test: `src/lib/plan-profile.test.ts`

- [ ] **Step 1: Write the failing classification tests**

```ts
import { describe, expect, it } from "vitest";

import { classifyPlanProfile } from "./plan-profile";
import type { AssessmentInput } from "./types";

const baseAssessment: AssessmentInput = {
  userId: "user-1",
  age: 30,
  sex: "male",
  heightCm: 178,
  weightKg: 84,
  goalText: "希望减脂并保留肌肉",
  experience: "beginner",
  trainingDaysPerWeek: 4,
  sessionMinutes: 45,
  trainingEnvironment: "both",
  equipment: ["mat", "dumbbell"],
  injuries: [],
  chronicConditions: [],
  dietaryRestrictions: [],
  allergies: [],
  foodBudget: "normal",
};

describe("classifyPlanProfile", () => {
  it("classifies heavier fat-loss users as fat loss preserve muscle", () => {
    const profile = classifyPlanProfile({
      ...baseAssessment,
      weightKg: 98,
      goalText: "想减脂减重，先把肚子减下去",
    });

    expect(profile.primaryGoal).toBe("fat_loss_preserve_muscle");
  });

  it("classifies normal-weight high-fat-loss wording as recomposition", () => {
    const profile = classifyPlanProfile({
      ...baseAssessment,
      weightKg: 72,
      goalText: "不想继续瘦体重，只想增肌降体脂，线条更明显",
    });

    expect(profile.primaryGoal).toBe("recomposition");
  });

  it("classifies lean gain wording as lean gain strength", () => {
    const profile = classifyPlanProfile({
      ...baseAssessment,
      weightKg: 63,
      goalText: "我偏瘦，想增肌变壮，提升力量",
      targetWeightKg: 69,
    });

    expect(profile.primaryGoal).toBe("lean_gain_strength");
  });
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `npm test -- src/lib/plan-profile.test.ts`
Expected: FAIL because `classifyPlanProfile` and the new profile types do not exist yet.

- [ ] **Step 3: Add the minimal types and classification implementation**

```ts
// src/lib/types.ts
export type PlanPrimaryGoal =
  | "fat_loss_preserve_muscle"
  | "recomposition"
  | "lean_gain_strength";

export interface PlanProfile {
  primaryGoal: PlanPrimaryGoal;
  environmentBias: "home" | "gym" | "mixed";
  trainingPriority: "adherence" | "hypertrophy" | "strength_hypertrophy";
  cardioPriority: "low" | "moderate" | "high";
  calorieStrategy: "deficit" | "maintenance_or_small_deficit" | "small_surplus";
}
```

```ts
// src/lib/evidence-rules.ts
export const EVIDENCE_RULES = {
  protein: {
    base: 1.6,
    hypertrophy: 1.8,
    highDieting: 2.2,
  },
  cardio: {
    minimumHealthMinutes: 150,
    weightLossSupportMinutes: 180,
  },
  surplus: {
    minimumKcal: 100,
    moderateKcal: 250,
  },
} as const;
```

```ts
// src/lib/plan-profile.ts
import type { AssessmentInput, PlanProfile } from "./types";

export function classifyPlanProfile(input: AssessmentInput): PlanProfile {
  const text = input.goalText.toLowerCase();
  const bmi = input.weightKg / ((input.heightCm / 100) ** 2);
  const environmentBias =
    input.trainingEnvironment === "both"
      ? "mixed"
      : input.trainingEnvironment === "gym"
        ? "gym"
        : "home";

  if (
    /增肌|变壮|力量|muscle|strength|bulk/.test(text) &&
    (bmi < 22 || (input.targetWeightKg ?? input.weightKg) > input.weightKg)
  ) {
    return {
      primaryGoal: "lean_gain_strength",
      environmentBias,
      trainingPriority: "strength_hypertrophy",
      cardioPriority: "low",
      calorieStrategy: "small_surplus",
    };
  }

  if (
    /线条|降体脂|recomp|recomposition|塑形|增肌减脂/.test(text) &&
    bmi < 27
  ) {
    return {
      primaryGoal: "recomposition",
      environmentBias,
      trainingPriority: "hypertrophy",
      cardioPriority: "moderate",
      calorieStrategy: "maintenance_or_small_deficit",
    };
  }

  return {
    primaryGoal: "fat_loss_preserve_muscle",
    environmentBias,
    trainingPriority: "adherence",
    cardioPriority: "high",
    calorieStrategy: "deficit",
  };
}
```

- [ ] **Step 4: Run the test and verify it passes**

Run: `npm test -- src/lib/plan-profile.test.ts`
Expected: PASS with 3 passing tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/types.ts src/lib/evidence-rules.ts src/lib/plan-profile.ts src/lib/plan-profile.test.ts
git commit -m "feat: add evidence-based plan profile classification"
```

---

### Task 2: Add differentiated program templates by goal and environment

**Files:**
- Create: `src/lib/program-template.ts`
- Create: `src/lib/program-template.test.ts`
- Modify: `src/lib/exercise-library.ts`
- Modify: `src/lib/types.ts`
- Test: `src/lib/program-template.test.ts`

- [ ] **Step 1: Write the failing training-template tests**

```ts
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
    expect(program.weeklyStructure).toContain("push");
    expect(program.weeklyStructure).toContain("pull");
    expect(program.weeklyStructure).toContain("legs");
  });

  it("builds a full-body plus cardio home template for fat-loss users", () => {
    const program = buildProgramTemplate(
      { ...baseAssessment, trainingEnvironment: "home", equipment: ["mat", "band"], trainingDaysPerWeek: 4 },
      profileMap.fatLoss,
    );

    expect(program.weeklyStructure.some((day) => day.includes("cardio"))).toBe(true);
    expect(program.weeklyStructure.filter((day) => day.includes("full_body")).length).toBeGreaterThan(1);
  });

  it("builds a mixed-location template for mixed recomposition users", () => {
    const program = buildProgramTemplate(
      { ...baseAssessment, trainingEnvironment: "both", equipment: ["mat", "band", "dumbbell"] },
      profileMap.recomp,
    );

    expect(program.weeklyStructure.some((day) => day.includes("gym"))).toBe(true);
    expect(program.weeklyStructure.some((day) => day.includes("home"))).toBe(true);
  });
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `npm test -- src/lib/program-template.test.ts`
Expected: FAIL because `buildProgramTemplate` and related program types do not exist.

- [ ] **Step 3: Add minimal program template types and implementation**

```ts
// src/lib/types.ts
export interface ProgramTemplate {
  weeklyStructure: string[];
  cardioMinutesPerWeek: number;
  splitStyle: "full_body" | "upper_lower" | "modified_split" | "push_pull_legs";
}
```

```ts
// src/lib/program-template.ts
import type { AssessmentInput, PlanProfile, ProgramTemplate } from "./types";
import { EVIDENCE_RULES } from "./evidence-rules";

export function buildProgramTemplate(
  input: AssessmentInput,
  profile: PlanProfile,
): ProgramTemplate {
  if (profile.primaryGoal === "lean_gain_strength" && input.trainingEnvironment === "gym" && input.trainingDaysPerWeek >= 4) {
    return {
      weeklyStructure: ["push_gym", "pull_gym", "legs_gym", "cardio_recovery", "upper_hypertrophy_gym"],
      cardioMinutesPerWeek: 60,
      splitStyle: "push_pull_legs",
    };
  }

  if (profile.primaryGoal === "fat_loss_preserve_muscle") {
    return {
      weeklyStructure: ["full_body_home", "cardio_home", "full_body_home", "full_body_home"],
      cardioMinutesPerWeek: EVIDENCE_RULES.cardio.weightLossSupportMinutes,
      splitStyle: "full_body",
    };
  }

  return {
    weeklyStructure: ["upper_gym", "lower_home", "cardio_home", "upper_home", "lower_gym"],
    cardioMinutesPerWeek: 120,
    splitStyle: "modified_split",
  };
}
```

- [ ] **Step 4: Expand the exercise library enough for the new structures**

```ts
// src/lib/exercise-library.ts additions
{
  id: "walking-lunge",
  name: "行进弓步",
  category: "strength",
  difficulty: "intermediate",
  muscles: ["股四头肌", "臀大肌", "核心"],
  environment: "both",
  equipment: ["dumbbell"],
  imageUrl: "/media/exercises/strength-lower.svg",
  videoUrl: "https://www.verywellfit.com/how-to-do-a-walking-lunge-3498600",
  steps: [
    "站直后双手持哑铃自然下垂，先收紧核心。",
    "向前迈一大步，后膝自然下降，前脚全脚掌踩稳。",
    "前腿发力站起并继续迈出下一步，保持节奏稳定。"
  ],
  cues: ["前膝跟着脚尖方向走", "躯干保持稳定，不要大幅前倾", "每一步都先站稳再继续移动"],
  commonMistakes: ["前膝内扣", "后脚蹬地借力太多", "步幅过短导致膝盖压力集中"],
  alternatives: ["bodyweight-squat"],
  contraindications: ["急性膝痛时暂停"],
},
{
  id: "step-cardio",
  name: "台阶踏步有氧",
  category: "cardio",
  difficulty: "beginner",
  muscles: ["心肺", "下肢"],
  environment: "home",
  equipment: [],
  imageUrl: "/media/exercises/cardio.svg",
  videoUrl: "https://www.verywellfit.com/step-aerobics-guide-1230824",
  steps: [
    "选择稳定台阶或低凳，先用较慢节奏上下踏步热身。",
    "逐渐提高节奏，保持能完整说短句但呼吸明显加快。",
    "结束前放慢 1 到 2 分钟，让心率逐步回落。"
  ],
  cues: ["全脚掌踩稳再换脚", "上台阶时髋和膝一起发力", "躯干保持直立，不要含胸弯腰"],
  commonMistakes: ["台阶太高导致动作变形", "速度过快踩不稳", "一直低头看脚影响节奏"],
  alternatives: ["warmup-march"],
  contraindications: ["头晕或膝踝疼痛加剧时停止"],
},
```

- [ ] **Step 5: Run the test and verify it passes**

Run: `npm test -- src/lib/program-template.test.ts`
Expected: PASS with 3 passing tests.

- [ ] **Step 6: Commit**

```bash
git add src/lib/types.ts src/lib/program-template.ts src/lib/program-template.test.ts src/lib/exercise-library.ts
git commit -m "feat: add differentiated program templates"
```

---

### Task 3: Add differentiated nutrition strategies

**Files:**
- Create: `src/lib/nutrition-strategy.ts`
- Create: `src/lib/nutrition-strategy.test.ts`
- Modify: `src/lib/types.ts`
- Test: `src/lib/nutrition-strategy.test.ts`

- [ ] **Step 1: Write the failing nutrition tests**

```ts
import { describe, expect, it } from "vitest";

import { buildNutritionStrategy } from "./nutrition-strategy";
import type { AssessmentInput, PlanProfile } from "./types";

const baseAssessment: AssessmentInput = {
  userId: "user-1",
  age: 28,
  sex: "female",
  heightCm: 165,
  weightKg: 68,
  goalText: "test",
  experience: "beginner",
  trainingDaysPerWeek: 4,
  sessionMinutes: 45,
  trainingEnvironment: "both",
  equipment: ["mat", "band"],
  injuries: [],
  chronicConditions: [],
  dietaryRestrictions: [],
  allergies: [],
  foodBudget: "normal",
};

describe("buildNutritionStrategy", () => {
  it("uses a higher calorie target for lean-gain users than fat-loss users", () => {
    const fatLoss = buildNutritionStrategy(baseAssessment, {
      primaryGoal: "fat_loss_preserve_muscle",
      environmentBias: "home",
      trainingPriority: "adherence",
      cardioPriority: "high",
      calorieStrategy: "deficit",
    });
    const gain = buildNutritionStrategy(baseAssessment, {
      primaryGoal: "lean_gain_strength",
      environmentBias: "gym",
      trainingPriority: "strength_hypertrophy",
      cardioPriority: "low",
      calorieStrategy: "small_surplus",
    });

    expect(gain.calorieTarget).toBeGreaterThan(fatLoss.calorieTarget);
    expect(gain.proteinGrams).toBeGreaterThanOrEqual(fatLoss.proteinGrams);
  });

  it("adds flexible swaps and indulgence guidance for fat-loss users", () => {
    const strategy = buildNutritionStrategy(baseAssessment, {
      primaryGoal: "fat_loss_preserve_muscle",
      environmentBias: "home",
      trainingPriority: "adherence",
      cardioPriority: "high",
      calorieStrategy: "deficit",
    });

    expect(strategy.swaps.length).toBeGreaterThan(2);
    expect(strategy.indulgenceGuidance).toContain("放松");
  });

  it("adds training-day carb support for lean-gain users", () => {
    const strategy = buildNutritionStrategy(baseAssessment, {
      primaryGoal: "lean_gain_strength",
      environmentBias: "gym",
      trainingPriority: "strength_hypertrophy",
      cardioPriority: "low",
      calorieStrategy: "small_surplus",
    });

    expect(strategy.meals.join(" ")).toContain("训练前");
    expect(strategy.meals.join(" ")).toContain("训练后");
  });
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `npm test -- src/lib/nutrition-strategy.test.ts`
Expected: FAIL because `buildNutritionStrategy` and `indulgenceGuidance` do not exist.

- [ ] **Step 3: Add nutrition metadata and minimal implementation**

```ts
// src/lib/types.ts
export interface NutritionDay {
  calorieTarget: number;
  proteinGrams: number;
  waterLiters: number;
  meals: string[];
  swaps: string[];
  restrictionNotes: string[];
  indulgenceGuidance: string;
}
```

```ts
// src/lib/nutrition-strategy.ts
import type { AssessmentInput, NutritionDay, PlanProfile } from "./types";
import { EVIDENCE_RULES } from "./evidence-rules";

export function buildNutritionStrategy(
  input: AssessmentInput,
  profile: PlanProfile,
): NutritionDay {
  const maintenance = estimateMaintenanceCalories(input);

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
      swaps: ["鸡胸可换鱼虾蛋豆制品。", "米饭可换面、燕麦、土豆。", "食欲不足时可用奶昔补足蛋白和热量。"],
      restrictionNotes: [],
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
      swaps: ["外食优先选有蛋白和主食的组合。", "零食替换为酸奶、水果或即食蛋白。"] ,
      restrictionNotes: [],
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
    swaps: ["鸡胸可换鱼虾、豆腐、瘦牛肉。", "米饭可换土豆、玉米、燕麦。", "嘴馋时先用高蛋白加餐顶住。"] ,
    restrictionNotes: [],
    indulgenceGuidance: "每周可以安排一次放松餐，但把它控制在一餐，而不是一天失控。",
  };
}

function estimateMaintenanceCalories(input: AssessmentInput) {
  const bmr =
    input.sex === "female"
      ? 10 * input.weightKg + 6.25 * input.heightCm - 5 * input.age - 161
      : 10 * input.weightKg + 6.25 * input.heightCm - 5 * input.age + 5;
  return Math.round(bmr * (input.trainingDaysPerWeek >= 4 ? 1.5 : 1.42));
}
```

- [ ] **Step 4: Run the test and verify it passes**

Run: `npm test -- src/lib/nutrition-strategy.test.ts`
Expected: PASS with 3 passing tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/types.ts src/lib/nutrition-strategy.ts src/lib/nutrition-strategy.test.ts
git commit -m "feat: add differentiated nutrition strategies"
```

---

### Task 4: Integrate the plan engine into `fitness.ts`

**Files:**
- Modify: `src/lib/fitness.ts`
- Modify: `src/lib/fitness.test.ts`
- Modify: `src/lib/fitness-service.test.ts`
- Test: `src/lib/fitness.test.ts`
- Test: `src/lib/fitness-service.test.ts`

- [ ] **Step 1: Write the failing integration tests**

```ts
it("creates a lean-gain gym plan with split emphasis and moderate cardio", () => {
  const plan = generateFitnessPlan({
    ...baseAssessment,
    weightKg: 64,
    targetWeightKg: 69,
    goalText: "想增肌变壮并提升力量",
    experience: "intermediate",
    trainingEnvironment: "gym",
    trainingDaysPerWeek: 5,
    sessionMinutes: 60,
    equipment: ["哑铃", "跑步机", "高位下拉", "器械"],
  });

  const focusText = plan.days.slice(0, 7).map((day) => day.focus).join(" ");
  expect(focusText).toMatch(/推|拉|腿|上肢|下肢/);
  expect(plan.days.some((day) => day.workoutItems.some((item) => item.category === "cardio"))).toBe(true);
  expect(plan.days[0]?.nutrition.indulgenceGuidance).toContain("放松");
});

it("creates a higher-cardio fat-loss plan without dropping resistance work", () => {
  const plan = generateFitnessPlan({
    ...baseAssessment,
    weightKg: 96,
    goalText: "想减脂减重，但不想掉太多肌肉",
    trainingEnvironment: "home",
    trainingDaysPerWeek: 4,
    equipment: ["瑜伽垫", "弹力带"],
  });

  const strengthCount = plan.days.flatMap((day) => day.workoutItems).filter((item) => item.category === "strength").length;
  const cardioCount = plan.days.flatMap((day) => day.workoutItems).filter((item) => item.category === "cardio").length;

  expect(strengthCount).toBeGreaterThan(0);
  expect(cardioCount).toBeGreaterThan(0);
});
```

- [ ] **Step 2: Run the tests and verify they fail**

Run: `npm test -- src/lib/fitness.test.ts src/lib/fitness-service.test.ts`
Expected: FAIL because current plan generation does not expose split-aware focus and richer nutrition metadata.

- [ ] **Step 3: Refactor `fitness.ts` into an orchestration layer**

```ts
import { buildFaqEntries } from "./faq-rules";
import { classifyPlanProfile } from "./plan-profile";
import { buildProgramTemplate } from "./program-template";
import { buildNutritionStrategy } from "./nutrition-strategy";

export function generateFitnessPlan(input: AssessmentInput): FitnessPlan {
  const safety = analyzeSafety(input);
  if (!safety.canGeneratePlan) {
    return buildRestrictedPlan(input, safety);
  }

  const profile = classifyPlanProfile(input);
  const program = buildProgramTemplate(input, profile);
  const baseNutrition = buildNutritionStrategy(input, profile);
  const exercises = getExercisesForEnvironment(input.trainingEnvironment, input.equipment);
  const days = buildPlanDaysFromProgram({
    input,
    profile,
    program,
    baseNutrition,
    exercises,
  });
  const faqEntries = buildFaqEntries({ input, profile, program, nutrition: baseNutrition });

  return {
    id: createId("plan"),
    userId: input.userId,
    createdAt: new Date().toISOString(),
    status: "active",
    safety,
    summary: buildPlanSummary(input, profile, program),
    disclaimer: DISCLAIMER,
    weeks: buildWeeks(profile),
    days,
    profile,
    faqEntries,
  };
}
```

- [ ] **Step 4: Add plan metadata to the shared types**

```ts
// src/lib/types.ts
export interface PlanFaqEntry {
  id: string;
  question: string;
  answer: string;
  category: "training" | "nutrition" | "recovery" | "cardio" | "equipment" | "misconception";
}

export interface FitnessPlan {
  id: string;
  userId: string;
  createdAt: string;
  status: "active" | "restricted";
  safety: SafetyAnalysis;
  summary: string;
  disclaimer: string;
  weeks: PlanWeek[];
  days: PlanDay[];
  profile?: PlanProfile;
  faqEntries?: PlanFaqEntry[];
}
```

- [ ] **Step 5: Run the tests and verify they pass**

Run: `npm test -- src/lib/fitness.test.ts src/lib/fitness-service.test.ts`
Expected: PASS with the new assertions and no regression in service behavior.

- [ ] **Step 6: Commit**

```bash
git add src/lib/types.ts src/lib/fitness.ts src/lib/fitness.test.ts src/lib/fitness-service.test.ts
git commit -m "feat: integrate evidence-based plan engine"
```

---

### Task 5: Add contextual FAQ generation and dashboard display

**Files:**
- Create: `src/lib/faq-rules.ts`
- Create: `src/lib/faq-rules.test.ts`
- Modify: `src/app/dashboard/page.tsx`
- Modify: `src/lib/types.ts`
- Test: `src/lib/faq-rules.test.ts`

- [ ] **Step 1: Write the failing FAQ tests**

```ts
import { describe, expect, it } from "vitest";

import { buildFaqEntries } from "./faq-rules";

describe("buildFaqEntries", () => {
  it("recommends protein guidance for lean-gain users", () => {
    const entries = buildFaqEntries({
      input: { goalText: "增肌变壮" } as never,
      profile: { primaryGoal: "lean_gain_strength" } as never,
      program: { splitStyle: "push_pull_legs" } as never,
      nutrition: { calorieTarget: 2600 } as never,
    });

    expect(entries.some((item) => item.question.includes("蛋白粉"))).toBe(true);
  });

  it("recommends cardio-plus-strength explanations for fat-loss users", () => {
    const entries = buildFaqEntries({
      input: { goalText: "减脂" } as never,
      profile: { primaryGoal: "fat_loss_preserve_muscle" } as never,
      program: { splitStyle: "full_body" } as never,
      nutrition: { calorieTarget: 1900 } as never,
    });

    expect(entries.some((item) => item.question.includes("为什么减脂也要练力量"))).toBe(true);
  });
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `npm test -- src/lib/faq-rules.test.ts`
Expected: FAIL because `buildFaqEntries` does not exist.

- [ ] **Step 3: Add the minimal FAQ rule implementation**

```ts
import type { PlanFaqEntry, PlanProfile, ProgramTemplate, NutritionDay, AssessmentInput } from "./types";

export function buildFaqEntries(input: {
  input: AssessmentInput;
  profile: PlanProfile;
  program: ProgramTemplate;
  nutrition: NutritionDay;
}): PlanFaqEntry[] {
  const shared: PlanFaqEntry[] = [
    {
      id: "soreness-not-required",
      category: "misconception",
      question: "没酸是不是白练了？",
      answer: "不是。是否进步要看动作质量、完成度和长期负荷变化，不是看第二天有多酸。",
    },
  ];

  if (input.profile.primaryGoal === "lean_gain_strength") {
    return [
      {
        id: "protein-powder-why",
        category: "nutrition",
        question: "蛋白粉是不是必须，什么时候吃？",
        answer: "不是必须。它只是更方便补足每日蛋白的工具。总蛋白更重要，训练前后吃只是方便恢复。",
      },
      {
        id: "why-split",
        category: "training",
        question: "为什么这周用三分化或改良分化？",
        answer: "因为你当前目标偏增肌增力，训练频率和场景条件足够，分化能让重点肌群拿到更完整的训练量。",
      },
      ...shared,
    ];
  }

  if (input.profile.primaryGoal === "fat_loss_preserve_muscle") {
    return [
      {
        id: "why-lift-while-losing-fat",
        category: "training",
        question: "为什么减脂也要练力量？",
        answer: "因为减脂期保留力量训练更有利于维持瘦体重、改善线条和长期代谢表现。",
      },
      {
        id: "cardio-not-everything",
        category: "cardio",
        question: "为什么不是只让我做有氧？",
        answer: "只做有氧容易把减脂做成体重下降但肌肉也跟着掉。你的计划会把有氧和抗阻一起安排。",
      },
      ...shared,
    ];
  }

  return [
    {
      id: "why-recomp",
      category: "training",
      question: "为什么我的计划不是纯减脂，也不是纯增肌？",
      answer: "因为你更适合走重组路线：优先提高力量、增加肌肉刺激，同时把体脂慢慢压下来。",
    },
    {
      id: "home-equipment-still-works",
      category: "equipment",
      question: "在家练为什么也有效？",
      answer: "有效刺激不只来自大器械，还来自足够接近力竭、动作质量、单侧训练和节奏控制。",
    },
    ...shared,
  ];
}
```

- [ ] **Step 4: Render the FAQ section on the dashboard**

```tsx
{plan.faqEntries?.length ? (
  <article className="surface stack-md">
    <div className="section-heading">
      <h2>常见问题</h2>
      <p>这些说明会跟着你的计划类型一起变化，帮助你理解为什么这样安排。</p>
    </div>
    <div className="list-stack">
      {plan.faqEntries.map((entry) => (
        <div className="list-row" key={entry.id}>
          <div>
            <strong>{entry.question}</strong>
            <p>{entry.answer}</p>
          </div>
        </div>
      ))}
    </div>
  </article>
) : null}
```

- [ ] **Step 5: Run the test and verify it passes**

Run: `npm test -- src/lib/faq-rules.test.ts`
Expected: PASS with 2 passing tests.

- [ ] **Step 6: Commit**

```bash
git add src/lib/faq-rules.ts src/lib/faq-rules.test.ts src/app/dashboard/page.tsx src/lib/types.ts
git commit -m "feat: add contextual faq guidance"
```

---

### Task 6: Final verification

**Files:**
- Verify only

- [ ] **Step 1: Run the targeted test suite**

Run: `npm test -- src/lib/plan-profile.test.ts src/lib/program-template.test.ts src/lib/nutrition-strategy.test.ts src/lib/faq-rules.test.ts src/lib/fitness.test.ts src/lib/fitness-service.test.ts`
Expected: PASS with all targeted tests green.

- [ ] **Step 2: Run static verification**

Run: `npm run typecheck`
Expected: PASS with no type errors.

- [ ] **Step 3: Run the full test suite**

Run: `npm test`
Expected: PASS with no regressions.

- [ ] **Step 4: Commit any verification-driven fixes**

```bash
git add src/app/dashboard/page.tsx src/lib/*.ts src/lib/*.test.ts
git commit -m "test: verify evidence-based plan engine"
```
