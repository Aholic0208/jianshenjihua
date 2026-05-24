import { describe, expect, it } from "vitest";

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
