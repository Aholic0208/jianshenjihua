# Interactive Fitness Workbench Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the current MVP into a responsive interactive fitness workbench with a multi-step onboarding flow, weekly planner workspace, richer exercise teaching content, and stronger personalized planning logic.

**Architecture:** Keep the local Next.js + SQLite stack, but split responsibilities more clearly: a wizard-style onboarding flow in the app layer, a planner-oriented dashboard view model, a strengthened rule engine for plan generation and plan adjustments, and a structured exercise media layer for core teaching content. Build behavior incrementally with tests first, then wire UI to the new behavior.

**Tech Stack:** Next.js App Router, TypeScript, SQLite via `node:sqlite`, Vitest, local static media, OpenAI image generation for first-wave exercise teaching images.

---

## File Structure

### Existing files to modify

- `src/lib/types.ts`
  - Expand plan/workbench types so the UI can reason about weeks, selected days, planner summaries, richer media, and adjustment metadata.
- `src/lib/exercise-library.ts`
  - Upgrade the seeded core exercise catalog with stronger instructional content and richer metadata fields.
- `src/lib/fitness.ts`
  - Strengthen the planning rules, add weekly summaries, improve day generation, and make plan adjustments materially update plan state.
- `src/lib/fitness-service.ts`
  - Add workbench-facing read and mutation methods that return richer planner data and revised plan snapshots.
- `src/lib/repository.ts`
  - Persist richer media/plan metadata and support versioned plan updates for adjustments.
- `src/lib/repository.test.ts`
  - Add failing tests for richer persistence and revised plan storage.
- `src/lib/fitness-service.test.ts`
  - Add failing tests for workbench reads, plan revisions, and differentiated outputs.
- `src/app/onboarding/page.tsx`
  - Replace the static form feel with a real multi-step guided onboarding experience.
- `src/app/onboarding/actions.ts`
  - Support draft-safe step submission and final plan generation.
- `src/app/dashboard/page.tsx`
  - Convert the current dashboard into a true plan workbench with week switching and day detail.
- `src/app/dashboard/actions.ts`
  - Support in-place planner mutations for day selection, check-ins, and adjustments.
- `src/app/dashboard/check-in/page.tsx`
  - Either collapse into the workbench or convert into a focused mobile fallback surface.
- `src/app/dashboard/adjustments/page.tsx`
  - Either collapse into the workbench or convert into a focused mobile fallback surface.
- `src/app/dashboard/profile/page.tsx`
  - Align with the richer plan/version model.
- `src/app/dashboard/exercises/[exerciseId]/page.tsx`
  - Upgrade to a stronger teaching page that mirrors the workbench detail content.
- `src/app/globals.css`
  - Add workbench, wizard, tabs, planner grid, drawer, and teaching detail styles.

### New files to create

- `src/lib/workbench.ts`
  - Build planner/workbench view models from saved plans, assessments, and revisions.
- `src/lib/workbench.test.ts`
  - Test weekly planner shaping, selected-day summaries, and revision reflection.
- `src/lib/planner-rules.ts`
  - Hold focused rule helpers for goal type, equipment routing, recovery day decisions, and safe calorie/training adjustments.
- `src/lib/planner-rules.test.ts`
  - Test differentiated recommendations and safety boundaries.
- `src/lib/exercise-media.ts`
  - Define the richer exercise media contract used by the workbench and detail surfaces.
- `src/app/dashboard/workbench-actions.ts`
  - Server actions for week/day selection, inline adjustments, and mobile fallback interactions if needed.
- `public/media/exercises/generated/`
  - Store first-wave generated teaching images for core exercises.

### Existing files to leave alone for this phase

- `src/app/auth/*`
  - Authentication flow is already sufficient for this phase.
- `src/preview.html`
  - Keep as a static preview artifact; do not make it the main product surface.

---

### Task 1: Lock the richer planner domain model with tests

**Files:**
- Create: `src/lib/planner-rules.test.ts`
- Create: `src/lib/workbench.test.ts`
- Modify: `src/lib/types.ts`
- Modify: `src/lib/repository.test.ts`
- Modify: `src/lib/fitness-service.test.ts`

- [ ] **Step 1: Add a failing repository test for storing richer plan metadata and revisions**

Add a new test block in `src/lib/repository.test.ts` asserting:
- a saved plan can include week summaries and richer daily notes
- after saving a plan revision, the repository can read back the latest revision reason and message
- the latest plan still returns the correct active version

Test shape to add:

```ts
it("stores richer plan metadata and latest revision context", () => {
  const repository = createRepository();
  const assessment = { ...assessmentTemplate, userId: "repo-rich-user" };
  const plan = generateFitnessPlan(assessment);

  plan.weeks[0] = {
    ...plan.weeks[0],
    title: "建立节奏",
    goal: "先把动作质量和训练频率固定下来",
  };
  plan.days[0] = {
    ...plan.days[0],
    focus: "下肢力量 + 核心稳定",
    checkInPrompt: "记录膝盖感觉、疲劳和完成度。",
  };

  repository.upsertUser({
    id: assessment.userId,
    name: "Rich Repo",
    email: "rich@example.com",
    passwordHash: "hash:rich",
    createdAt: "2026-05-24T12:00:00.000Z",
    updatedAt: "2026-05-24T12:00:00.000Z",
  });
  repository.saveAssessment(assessment, "2026-05-24T12:01:00.000Z");
  repository.savePlan(plan);
  repository.savePlanRevision({
    id: "revision-rich-1",
    userId: assessment.userId,
    planId: plan.id,
    reason: "膝盖不舒服",
    adjustmentType: "exercise_swap",
    message: "把深蹲替换为臀桥。",
    replacements: plan.days[0]?.workoutItems.slice(0, 1) ?? [],
    nutritionSuggestions: [],
    sourceMessageId: "message-rich-1",
    createdAt: "2026-05-24T12:02:00.000Z",
  });

  const latestPlan = repository.getLatestPlan(assessment.userId);
  const revisions = repository.listPlanRevisions(plan.id);

  expect(latestPlan?.weeks[0]?.title).toBe("建立节奏");
  expect(latestPlan?.days[0]?.focus).toBe("下肢力量 + 核心稳定");
  expect(revisions[0]?.reason).toBe("膝盖不舒服");
  expect(revisions[0]?.message).toContain("臀桥");
});
```

- [ ] **Step 2: Add a failing service test for differentiated workbench data**

Add a new test in `src/lib/fitness-service.test.ts` asserting:
- two users with different goals/equipment produce different first-week content
- a generated workbench snapshot exposes week list, selected week, and selected day detail

Test shape to add:

```ts
it("builds differentiated planner data for different user profiles", () => {
  const repository = createRepository();
  const service = createFitnessService({ repository, now: createClock() });

  const strengthUser = service.registerUser({
    name: "Strength User",
    email: "strength@example.com",
    password: "StrongPass123!",
  });
  const fatLossUser = service.registerUser({
    name: "Fat Loss User",
    email: "fatloss@example.com",
    password: "StrongPass123!",
  });

  const strengthAssessment = {
    ...createAssessment(strengthUser.user.id),
    goalText: "提升基础力量和上肢稳定",
    trainingEnvironment: "gym" as const,
    equipment: ["瑜伽垫", "哑铃", "高位下拉器"],
  };
  const fatLossAssessment = {
    ...createAssessment(fatLossUser.user.id),
    goalText: "稳定减脂并改善久坐后的僵硬感",
    trainingEnvironment: "home" as const,
    equipment: ["瑜伽垫", "弹力带"],
  };

  service.generatePlanFromAssessment(strengthAssessment);
  service.generatePlanFromAssessment(fatLossAssessment);

  const strengthDashboard = service.fetchLatestDashboardData(strengthUser.user.id);
  const fatLossDashboard = service.fetchLatestDashboardData(fatLossUser.user.id);

  expect(strengthDashboard.plan?.days[0]?.workoutItems.map((item) => item.name))
    .not.toEqual(fatLossDashboard.plan?.days[0]?.workoutItems.map((item) => item.name));
  expect(strengthDashboard.plan?.weeks).toHaveLength(4);
  expect(fatLossDashboard.today?.label).toContain("第 1 周");
});
```

- [ ] **Step 3: Add a failing unit test file for planner rules**

Create `src/lib/planner-rules.test.ts` with focused failing tests for:
- low-equipment home users route to home-safe exercises
- knee-pain users avoid squat-first lower body templates
- aggressive target weight triggers a caution result

```ts
import { describe, expect, it } from "vitest";

import { chooseGoalTrack, chooseLowerBodyPrimary, deriveCalorieAdjustment } from "./planner-rules";

describe("planner rules", () => {
  it("routes fat loss goals to the fat-loss track", () => {
    expect(chooseGoalTrack("稳定减脂并塑形")).toBe("fat_loss");
  });

  it("avoids squat-first lower body work when the user reports knee pain", () => {
    expect(chooseLowerBodyPrimary(["膝盖疼"])).toBe("hip_dominant");
  });

  it("keeps calorie deficits conservative", () => {
    expect(deriveCalorieAdjustment({ wantsWeightLoss: true, sex: "female" })).toBe(-400);
  });
});
```

- [ ] **Step 4: Add a failing unit test file for workbench shaping**

Create `src/lib/workbench.test.ts` asserting:
- a generated plan can be converted into a week-switchable workbench model
- selecting week 2 changes the visible days
- the selected day carries workout, nutrition, and check-in summary

```ts
import { describe, expect, it } from "vitest";

import { generateFitnessPlan } from "./fitness";
import { buildWorkoutWorkbench } from "./workbench";
import type { AssessmentInput } from "./types";

const assessment: AssessmentInput = {
  userId: "workbench-user",
  age: 28,
  sex: "female",
  heightCm: 165,
  weightKg: 62,
  targetWeightKg: 58,
  goalText: "减脂塑形并改善体态",
  experience: "beginner",
  trainingDaysPerWeek: 4,
  sessionMinutes: 45,
  trainingEnvironment: "both",
  equipment: ["瑜伽垫", "弹力带"],
  injuries: [],
  chronicConditions: [],
  dietaryRestrictions: [],
  allergies: [],
  foodBudget: "normal",
};

describe("workbench view model", () => {
  it("builds week tabs and selected day detail", () => {
    const plan = generateFitnessPlan(assessment);
    const workbench = buildWorkoutWorkbench({
      plan,
      selectedWeek: 2,
      selectedDayIndex: 8,
      checkIns: [],
      revisions: [],
    });

    expect(workbench.weeks).toHaveLength(4);
    expect(workbench.selectedWeek.week).toBe(2);
    expect(workbench.days.every((day) => day.week === 2)).toBe(true);
    expect(workbench.selectedDay?.dayIndex).toBe(8);
    expect(workbench.selectedDay?.nutrition.calorieTarget).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 5: Run the focused test files and verify they fail for the expected reasons**

Run:

```bash
npm.cmd test -- src/lib/repository.test.ts src/lib/fitness-service.test.ts src/lib/planner-rules.test.ts src/lib/workbench.test.ts
```

Expected:
- failures for missing `planner-rules.ts`
- failures for missing `workbench.ts`
- or expectation failures showing current planner data is not differentiated enough

---

### Task 2: Implement planner rules and workbench view shaping

**Files:**
- Create: `src/lib/planner-rules.ts`
- Create: `src/lib/workbench.ts`
- Modify: `src/lib/types.ts`
- Modify: `src/lib/fitness.ts`

- [ ] **Step 1: Add the richer planner-facing types**

Update `src/lib/types.ts` by adding these interfaces beneath the existing plan types:

```ts
export interface PlanWeekSummary {
  week: number;
  title: string;
  goal: string;
  emphasis: string[];
}

export interface DayPlannerCard {
  dayIndex: number;
  week: number;
  label: string;
  shortLabel: string;
  focus: string;
  state: "completed" | "current" | "upcoming" | "recovery";
  workoutCount: number;
}

export interface WorkoutWorkbench {
  weeks: PlanWeekSummary[];
  selectedWeek: PlanWeekSummary;
  days: DayPlannerCard[];
  selectedDay: PlanDay | null;
  latestRevisionMessage: string | null;
  latestCheckInSummary: string | null;
}
```

Also extend `PlanWeek` to include `emphasis?: string[]`.

- [ ] **Step 2: Implement focused rule helpers**

Create `src/lib/planner-rules.ts`:

```ts
import type { Sex } from "./types";

export type GoalTrack = "fat_loss" | "muscle_gain" | "body_shape" | "posture";
export type LowerBodyPrimary = "squat_dominant" | "hip_dominant";

export function chooseGoalTrack(goalText: string): GoalTrack {
  const text = goalText.toLowerCase();
  if (text.includes("增肌") || text.includes("力量")) {
    return "muscle_gain";
  }
  if (text.includes("体态") || text.includes("姿势")) {
    return "posture";
  }
  if (text.includes("塑形")) {
    return "body_shape";
  }
  return "fat_loss";
}

export function chooseLowerBodyPrimary(injuries: string[]): LowerBodyPrimary {
  const text = injuries.join(" ");
  if (text.includes("膝")) {
    return "hip_dominant";
  }
  return "squat_dominant";
}

export function deriveCalorieAdjustment(input: { wantsWeightLoss: boolean; sex: Sex }) {
  if (!input.wantsWeightLoss) {
    return 100;
  }
  return input.sex === "female" ? -400 : -500;
}
```

- [ ] **Step 3: Use planner rules inside plan generation**

Modify `src/lib/fitness.ts`:
- import the new planner rules
- derive a `goalTrack`
- derive `lowerBodyPrimary`
- update `buildWorkoutTemplates` to prefer `glute-bridge` first when `lowerBodyPrimary === "hip_dominant"`
- update `buildNutrition` to use `deriveCalorieAdjustment()`
- enrich each `week` with `emphasis`

Implementation sketch:

```ts
const goalTrack = chooseGoalTrack(input.goalText);
const lowerBodyPrimary = chooseLowerBodyPrimary(input.injuries);
const workoutTemplates = buildWorkoutTemplates({
  exercises,
  sessionMinutes: input.sessionMinutes,
  goalTrack,
  lowerBodyPrimary,
});
```

And adapt `buildWorkoutTemplates` to accept:

```ts
function buildWorkoutTemplates(input: {
  exercises: ExerciseMedia[];
  sessionMinutes: number;
  goalTrack: GoalTrack;
  lowerBodyPrimary: LowerBodyPrimary;
}): WorkoutItem[][] { ... }
```

- [ ] **Step 4: Implement the workbench view model**

Create `src/lib/workbench.ts`:

```ts
import type { CheckInRecord, PlanRevisionRecord, SavedPlanRecord } from "./repository";
import type { DayPlannerCard, PlanWeekSummary, WorkoutWorkbench } from "./types";

export function buildWorkoutWorkbench(input: {
  plan: SavedPlanRecord;
  selectedWeek?: number;
  selectedDayIndex?: number;
  checkIns: CheckInRecord[];
  revisions: PlanRevisionRecord[];
}): WorkoutWorkbench {
  const completedDays = new Set(input.checkIns.filter((item) => item.completed).map((item) => item.dayIndex));
  const selectedWeekNumber = input.selectedWeek ?? 1;
  const selectedWeek = input.plan.weeks.find((week) => week.week === selectedWeekNumber) ?? input.plan.weeks[0];
  const days = input.plan.days
    .filter((day) => day.week === selectedWeek.week)
    .map<DayPlannerCard>((day) => ({
      dayIndex: day.dayIndex,
      week: day.week,
      label: day.label,
      shortLabel: `Day ${day.dayIndex - (day.week - 1) * 7}`,
      focus: day.focus,
      state: completedDays.has(day.dayIndex)
        ? "completed"
        : input.selectedDayIndex === day.dayIndex
          ? "current"
          : day.focus.includes("恢复")
            ? "recovery"
            : "upcoming",
      workoutCount: day.workoutItems.length,
    }));
  const selectedDay = input.plan.days.find((day) => day.dayIndex === (input.selectedDayIndex ?? days[0]?.dayIndex)) ?? null;

  return {
    weeks: input.plan.weeks.map<PlanWeekSummary>((week) => ({
      week: week.week,
      title: week.title,
      goal: week.goal,
      emphasis: week.emphasis ?? [],
    })),
    selectedWeek: {
      week: selectedWeek.week,
      title: selectedWeek.title,
      goal: selectedWeek.goal,
      emphasis: selectedWeek.emphasis ?? [],
    },
    days,
    selectedDay,
    latestRevisionMessage: input.revisions[0]?.message ?? null,
    latestCheckInSummary: input.checkIns[0]
      ? `疲劳 ${input.checkIns[0].fatigue}/5 · 疼痛 ${input.checkIns[0].pain}/5`
      : null,
  };
}
```

- [ ] **Step 5: Run the focused tests and verify they pass**

Run:

```bash
npm.cmd test -- src/lib/repository.test.ts src/lib/fitness-service.test.ts src/lib/planner-rules.test.ts src/lib/workbench.test.ts
```

Expected:
- all four files pass

---

### Task 3: Upgrade repository and service contracts for planner revisions

**Files:**
- Modify: `src/lib/repository.ts`
- Modify: `src/lib/fitness-service.ts`
- Modify: `src/lib/repository.test.ts`
- Modify: `src/lib/fitness-service.test.ts`

- [ ] **Step 1: Add a failing test for saving updated plans after an adjustment**

Add this test to `src/lib/fitness-service.test.ts`:

```ts
it("creates a revised plan snapshot after an actionable adjustment", () => {
  const repository = createRepository();
  const service = createFitnessService({ repository, now: createClock() });
  const registration = service.registerUser({
    name: "Revision User",
    email: "revision@example.com",
    password: "StrongPass123!",
  });
  const assessment = createAssessment(registration.user.id);
  const plan = service.generatePlanFromAssessment(assessment);

  service.recordAdjustmentRequest({
    userId: registration.user.id,
    planId: plan.id,
    message: "今天深蹲膝盖疼，换成更稳一点的动作。",
  });

  const dashboard = service.fetchLatestDashboardData(registration.user.id);

  expect(dashboard.revisions.length).toBeGreaterThan(0);
  expect(dashboard.plan?.days[0]?.workoutItems.some((item) => item.name.includes("臀桥"))).toBe(true);
});
```

- [ ] **Step 2: Implement a helper that applies supported adjustments to a plan copy**

Inside `src/lib/fitness-service.ts`, add:

```ts
function applyAdjustmentToPlan(plan: SavedPlanRecord, adjustment: PlanAdjustment): SavedPlanRecord {
  if (!adjustment.replacements.length) {
    return plan;
  }

  const nextDays = plan.days.map((day, index) => {
    if (index !== 0) {
      return day;
    }

    const [, ...rest] = day.workoutItems;
    return {
      ...day,
      workoutItems: [...adjustment.replacements, ...rest],
    };
  });

  return {
    ...plan,
    days: nextDays,
    summary: `${plan.summary} 已根据最近反馈更新今日动作安排。`,
  };
}
```

- [ ] **Step 3: Save the revised plan snapshot during adjustment handling**

Still in `src/lib/fitness-service.ts`, after generating the adjustment:

```ts
const revisedPlan = applyAdjustmentToPlan(plan, adjustment);
repository.savePlan(planToFitnessPlan(revisedPlan));
```

Make sure the repository keeps returning the latest updated plan for the user.

- [ ] **Step 4: Extend `fetchLatestDashboardData()` with planner-oriented read fields**

Update the return shape to include:

```ts
selectedWeek: plan?.days[0]?.week ?? 1,
selectedDayIndex: plan?.days[0]?.dayIndex ?? 1,
```

This gives the UI a stable default until the dedicated workbench helper becomes the final shaping layer.

- [ ] **Step 5: Run the service and repository tests**

Run:

```bash
npm.cmd test -- src/lib/repository.test.ts src/lib/fitness-service.test.ts
```

Expected:
- all service and repository tests pass

---

### Task 4: Replace the current onboarding page with a real multi-step guided flow

**Files:**
- Modify: `src/app/onboarding/page.tsx`
- Modify: `src/app/onboarding/actions.ts`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Add a failing UI-driven regression test for onboarding state shaping**

Add a small pure helper in `src/app/onboarding/page.tsx` first, then test it with a new exported function via `src/lib/preview.test.ts` or a new `src/lib/onboarding-view.test.ts` if needed. The test must verify:
- step order
- hidden future steps until current step is complete
- summary derived from partial answers

If you create a new test file, use:

```ts
import { describe, expect, it } from "vitest";
import { buildOnboardingSteps } from "./onboarding-view";

describe("buildOnboardingSteps", () => {
  it("marks only the active step as current", () => {
    const view = buildOnboardingSteps({ currentStep: "goals" });
    expect(view.steps.find((step) => step.id === "goals")?.state).toBe("current");
    expect(view.steps.find((step) => step.id === "limits")?.state).toBe("upcoming");
  });
});
```

- [ ] **Step 2: Build a pure onboarding step helper**

Create `src/lib/onboarding-view.ts` if needed:

```ts
export type OnboardingStepId = "basics" | "goals" | "equipment" | "limits" | "confirm";

export function buildOnboardingSteps(input: { currentStep: OnboardingStepId }) {
  const ordered: OnboardingStepId[] = ["basics", "goals", "equipment", "limits", "confirm"];
  return {
    steps: ordered.map((id, index) => {
      const currentIndex = ordered.indexOf(input.currentStep);
      return {
        id,
        state: index < currentIndex ? "complete" : index === currentIndex ? "current" : "upcoming",
      };
    }),
  };
}
```

- [ ] **Step 3: Refactor the onboarding page into a step-based wizard**

Update `src/app/onboarding/page.tsx` to:
- read `step` from `searchParams`
- render only the current step’s fields
- show step pills/progress
- keep hidden fields carrying earlier values forward
- include a final confirmation step before submission

Required step ids:

```ts
const stepOrder = ["basics", "goals", "equipment", "limits", "confirm"] as const;
```

The final `confirm` step should show:
- body metrics
- goal summary
- weekly frequency
- key restrictions

- [ ] **Step 4: Keep the final submit path simple**

In `src/app/onboarding/actions.ts`, keep the actual `saveOnboardingAction(formData)` as the final submit, but allow the page to move between steps with `method="get"` and hidden fields until the last step.

Do not create a persistence-heavy draft system yet; use URL-carried state and existing session context for this phase.

- [ ] **Step 5: Run the focused onboarding test and the app test suite**

Run:

```bash
npm.cmd test
```

Expected:
- the new onboarding helper test passes
- existing tests remain green

---

### Task 5: Turn the dashboard into a true weekly planner workbench

**Files:**
- Modify: `src/app/dashboard/page.tsx`
- Create: `src/app/dashboard/workbench-actions.ts`
- Modify: `src/app/globals.css`
- Modify: `src/lib/fitness-service.ts`
- Modify: `src/lib/workbench.ts`

- [ ] **Step 1: Add a failing workbench test for week selection**

Extend `src/lib/workbench.test.ts` with:

```ts
it("switches visible days when another week is selected", () => {
  const plan = generateFitnessPlan(assessment);
  const weekOne = buildWorkoutWorkbench({
    plan,
    selectedWeek: 1,
    selectedDayIndex: 1,
    checkIns: [],
    revisions: [],
  });
  const weekThree = buildWorkoutWorkbench({
    plan,
    selectedWeek: 3,
    selectedDayIndex: 15,
    checkIns: [],
    revisions: [],
  });

  expect(weekOne.days[0]?.week).toBe(1);
  expect(weekThree.days[0]?.week).toBe(3);
  expect(weekThree.selectedDay?.dayIndex).toBe(15);
});
```

- [ ] **Step 2: Add a server action for workbench selection**

Create `src/app/dashboard/workbench-actions.ts`:

```ts
"use server";

import { redirect } from "next/navigation";

export async function selectPlannerViewAction(formData: FormData) {
  const week = String(formData.get("week") ?? "1");
  const dayIndex = String(formData.get("dayIndex") ?? "1");
  redirect(`/dashboard?week=${week}&day=${dayIndex}`);
}
```

- [ ] **Step 3: Refactor the dashboard page around `buildWorkoutWorkbench()`**

In `src/app/dashboard/page.tsx`:
- parse `week` and `day` from `searchParams`
- build the workbench model
- render week tabs as buttons/forms
- render a 7-day planner grid
- render the selected day in a dedicated detail panel
- keep nutrition, check-in CTA, and adjustment CTA inside the selected day panel

Required structure:

```tsx
const workbench = plan
  ? buildWorkoutWorkbench({
      plan,
      selectedWeek,
      selectedDayIndex,
      checkIns: dashboardData.recentCheckIns,
      revisions: dashboardData.revisions,
    })
  : null;
```

- [ ] **Step 4: Collapse secondary “today” information into the selected day panel**

Move the “today should do what”, nutrition, and week schedule sections into:
- week tabs
- day cards
- selected day panel

This removes the current long stacked dashboard feel and makes it behave like a planner workspace.

- [ ] **Step 5: Run tests and a production build**

Run:

```bash
npm.cmd test
npm.cmd run build
```

Expected:
- tests pass
- build passes

---

### Task 6: Upgrade the exercise detail surface into a real teaching module

**Files:**
- Modify: `src/lib/exercise-library.ts`
- Modify: `src/app/dashboard/exercises/[exerciseId]/page.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Add a failing test asserting core exercises carry richer teaching content**

Add to `src/lib/preview.test.ts` or create `src/lib/exercise-library.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { exerciseLibrary } from "./exercise-library";

describe("exercise library teaching quality", () => {
  it("keeps core strength exercises rich enough for teaching", () => {
    const squat = exerciseLibrary.find((item) => item.id === "bodyweight-squat");
    expect(squat?.steps.length).toBeGreaterThanOrEqual(3);
    expect(squat?.commonMistakes.length).toBeGreaterThanOrEqual(3);
    expect(squat?.contraindications.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Enrich the seeded exercise metadata**

In `src/lib/exercise-library.ts`, for the first-wave core exercises:
- increase cues and common mistakes where too thin
- ensure each one has clear contraindications
- make alternatives more practical for beginners

Do not add dozens of new exercises yet; improve the first-wave catalog.

- [ ] **Step 3: Redesign the exercise detail page as a teaching page**

Update `src/app/dashboard/exercises/[exerciseId]/page.tsx` so it has:
- hero with exercise name and media
- “怎么做” section
- “你应该感觉到哪里发力” section
- “新手最容易犯的错误” section
- “什么时候不要做” section
- “可以换成什么” section
- persistent video CTA

Use clearer Chinese instructional copy, not placeholder explanation.

- [ ] **Step 4: Add media callouts for image quality expectations**

If generated image files do not yet exist for all first-wave exercises, structure the page to accept them under:

```ts
/media/exercises/generated/<exercise-id>-proper.png
/media/exercises/generated/<exercise-id>-mistake.png
```

Fallback to current SVGs only until the generated images land.

- [ ] **Step 5: Run the teaching-content test and full build**

Run:

```bash
npm.cmd test
npm.cmd run build
```

Expected:
- new teaching-content test passes
- build passes

---

### Task 7: Generate and integrate first-wave teaching images for core exercises

**Files:**
- Create: `public/media/exercises/generated/bodyweight-squat-proper.png`
- Create: `public/media/exercises/generated/bodyweight-squat-mistake.png`
- Create: `public/media/exercises/generated/glute-bridge-proper.png`
- Create: `public/media/exercises/generated/incline-push-up-proper.png`
- Create: `public/media/exercises/generated/plank-proper.png`
- Modify: `src/lib/exercise-library.ts`

- [ ] **Step 1: Define exact prompts for the first-wave exercise images**

Use the image generation tool with prompts following this pattern:

```text
Professional fitness coaching illustration, realistic human anatomy proportions, clean studio background, Chinese fitness teaching poster style, bodyweight squat, correct form, side view, knees tracking over toes, neutral spine, hips back, clear posture, instructional not artistic
```

And for mistakes:

```text
Professional fitness coaching illustration, clean studio background, bodyweight squat common mistake, knees collapsing inward, clear educational contrast, instructional fitness poster style
```

Do this for:
- squat correct
- squat mistake
- glute bridge correct
- incline push-up correct
- plank correct

- [ ] **Step 2: Save generated images into the generated media folder**

Store the resulting files under:

```text
public/media/exercises/generated/
```

Keep file names deterministic and referenced from the exercise library.

- [ ] **Step 3: Wire generated images into the exercise catalog**

Update `src/lib/exercise-library.ts` to point first-wave exercises to the generated images instead of the current generic SVGs when available.

- [ ] **Step 4: Verify images render in the exercise detail page**

Run:

```bash
npm.cmd run build
```

Then visually inspect at least:
- `/dashboard/exercises/bodyweight-squat`
- `/dashboard/exercises/glute-bridge`
- `/dashboard/exercises/plank`

Expected:
- generated images appear
- layout remains clean on desktop and mobile

---

### Task 8: Final integration, regression pass, and publish-ready validation

**Files:**
- Modify only as needed based on regression findings

- [ ] **Step 1: Run the full automated suite**

Run:

```bash
npm.cmd test
npm.cmd run build
```

Expected:
- all tests pass
- production build passes

- [ ] **Step 2: Smoke-test the core user journey manually**

Run the dev server:

```bash
npm.cmd run dev -- --hostname 127.0.0.1 --port 3001
```

Verify this path:
- register/login
- complete onboarding wizard
- land in planner workbench
- switch to week 2 and week 3
- open one exercise detail page
- submit one check-in
- submit one plan adjustment
- return to dashboard and confirm planner state and revision text reflect the change

- [ ] **Step 3: Review requirements against the spec**

Checklist:
- one guided onboarding flow instead of static disconnected pages
- single planner workbench with week switching
- click-through exercise teaching details
- real check-in and adjustment persistence
- differentiated plans for different users
- better teaching content for core movements

- [ ] **Step 4: Commit the implementation**

```bash
git add .
git commit -m "feat: build interactive fitness planning workbench"
```

- [ ] **Step 5: Push to GitHub**

```bash
git push origin main
```
