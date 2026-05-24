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
