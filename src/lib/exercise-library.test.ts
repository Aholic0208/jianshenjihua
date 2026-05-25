import { describe, expect, it } from "vitest";

import { exerciseLibrary } from "./exercise-library";

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
});
