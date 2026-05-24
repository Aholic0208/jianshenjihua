import { describe, expect, it } from "vitest";

import { buildDashboardHref, buildExerciseHref, resolveDashboardSelection } from "./dashboard-routing";

describe("dashboard routing", () => {
  it("derives the current week from the selected day when week is missing", () => {
    expect(
      resolveDashboardSelection({
        dayIndex: "15",
      }),
    ).toEqual({
      week: 3,
      day: 15,
    });
  });

  it("builds dashboard links with encoded notices", () => {
    expect(
      buildDashboardHref(
        {
          week: 4,
          day: 22,
        },
        {
          error: "请先告诉系统你遇到了什么问题。",
        },
      ),
    ).toBe(
      "/dashboard?week=4&day=22&error=%E8%AF%B7%E5%85%88%E5%91%8A%E8%AF%89%E7%B3%BB%E7%BB%9F%E4%BD%A0%E9%81%87%E5%88%B0%E4%BA%86%E4%BB%80%E4%B9%88%E9%97%AE%E9%A2%98%E3%80%82",
    );
  });

  it("preserves the current dashboard selection in exercise detail links", () => {
    expect(
      buildExerciseHref("bodyweight-squat", {
        week: 2,
        day: 9,
      }),
    ).toBe("/dashboard/exercises/bodyweight-squat?week=2&day=9");
  });
});
