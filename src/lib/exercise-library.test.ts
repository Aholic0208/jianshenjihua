import { describe, expect, it } from "vitest";

import { exerciseLibrary, getExercisesForEnvironment } from "./exercise-library";

describe("exercise library teaching quality", () => {
  it("keeps core strength exercises rich enough for teaching", () => {
    const squat = exerciseLibrary.find((item) => item.id === "bodyweight-squat");

    expect(squat?.steps.length).toBeGreaterThanOrEqual(3);
    expect(squat?.commonMistakes.length).toBeGreaterThanOrEqual(3);
    expect(squat?.contraindications.length).toBeGreaterThan(0);
  });

  it("keeps warm-up march detailed enough for a teaching page", () => {
    const warmup = exerciseLibrary.find((item) => item.id === "warmup-march");

    expect(warmup?.steps.length).toBeGreaterThanOrEqual(3);
    expect(warmup?.cues.length).toBeGreaterThanOrEqual(3);
    expect(warmup?.commonMistakes.length).toBeGreaterThanOrEqual(3);
  });

  it("includes gym-only strength options when users mention machines", () => {
    const gymExercises = getExercisesForEnvironment("gym", ["机器", "一体化机器", "哑铃", "高位下拉"]);
    const gymIds = gymExercises.map((item) => item.id);

    expect(gymIds).toContain("lat-pulldown");
    expect(gymIds).toContain("machine-chest-press");
    expect(gymIds).toContain("seated-cable-row");
    expect(gymIds).toContain("goblet-squat");
  });

  it("does not offer gym-only machine movements in the home pool", () => {
    const homeExercises = getExercisesForEnvironment("home", ["机器", "一体化机器", "哑铃", "高位下拉"]);
    const homeIds = homeExercises.map((item) => item.id);

    expect(homeIds).not.toContain("lat-pulldown");
    expect(homeIds).not.toContain("machine-chest-press");
    expect(homeIds).not.toContain("seated-cable-row");
    expect(homeIds).not.toContain("goblet-squat");
  });
});
