import { describe, expect, it } from "vitest";

import {
  createAdjustmentWorkspaceView,
  createCheckInView,
  createExerciseDetailView,
  createProfileView,
} from "./dashboard-view";
import { createPreviewDashboard } from "./preview";

describe("preview dashboard model", () => {
  it("creates onboarding, plan, and adjustment sections from a generated plan", () => {
    const dashboard = createPreviewDashboard();

    expect(dashboard.user.name).toBeTruthy();
    expect(dashboard.user.goal).toContain("减脂");
    expect(dashboard.today.workoutItems.length).toBeGreaterThan(0);
    expect(dashboard.weekCards).toHaveLength(4);
    expect(dashboard.exerciseSpotlight.videoLabel).toContain("视频");
    expect(dashboard.adjustments.length).toBeGreaterThan(0);
  });

  it("surfaces safety guidance and quick actions for the UI", () => {
    const dashboard = createPreviewDashboard();

    expect(dashboard.safety.title).toContain("安全");
    expect(dashboard.quickActions.some((item) => item.title.includes("重新生成"))).toBe(true);
    expect(dashboard.nutrition.summary).toContain("蛋白质");
  });
});

describe("dashboard route view models", () => {
  it("creates an exercise detail view with cues, mistakes, and alternatives", () => {
    const view = createExerciseDetailView("bodyweight-squat");

    expect(view.title).toContain("深蹲");
    expect(view.cues.length).toBeGreaterThan(0);
    expect(view.commonMistakes.length).toBeGreaterThan(0);
    expect(view.alternatives.some((item) => item.includes("臀桥"))).toBe(true);
  });

  it("creates a check-in view with today summary and scoring fields", () => {
    const view = createCheckInView();

    expect(view.dayLabel).toContain("第");
    expect(view.metrics.map((item) => item.label)).toContain("疲劳感");
    expect(view.quickChoices).toContain("今天动作太难");
  });

  it("creates an adjustment workspace with prompts and recent conversations", () => {
    const view = createAdjustmentWorkspaceView();

    expect(view.suggestions.length).toBeGreaterThan(2);
    expect(view.recentMessages[0]?.response).toContain("建议");
  });

  it("creates a profile view with body data and plan settings", () => {
    const view = createProfileView();

    expect(view.profileCards.some((card) => card.title.includes("身高"))).toBe(true);
    expect(view.preferences.some((item) => item.label.includes("训练场景"))).toBe(true);
  });
});
