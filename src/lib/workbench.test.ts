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
  equipment: ["mat", "band"],
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

  it("shows day-specific adjustment details for the selected day", () => {
    const plan = generateFitnessPlan(assessment);
    const workbench = buildWorkoutWorkbench({
      plan,
      selectedWeek: 2,
      selectedDayIndex: 8,
      checkIns: [],
      revisions: [
        {
          id: "revision-1",
          userId: assessment.userId,
          planId: plan.id,
          dayIndex: 8,
          reason: "今天只有 20 分钟。",
          adjustmentType: "time_adjustment",
          message: "今天把训练压缩成热身、两个主动作和拉伸。",
          replacements: [],
          nutritionSuggestions: ["训练后补一份酸奶和香蕉。"],
          sourceMessageId: "message-1",
          createdAt: new Date().toISOString(),
        },
      ],
    });

    expect(workbench.selectedDay?.latestRevisionMessage).toContain("压缩");
    expect(workbench.selectedDay?.latestRevision?.adjustmentType).toBe("time_adjustment");
    expect(workbench.selectedDay?.latestRevision?.nutritionSuggestions[0]).toContain("酸奶");
  });
});
