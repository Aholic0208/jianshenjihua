import { existsSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { exerciseLibrary } from "./exercise-library";
import { resolveExerciseTeachingMedia } from "./exercise-teaching-media";

describe("exercise teaching media", () => {
  it("prefers generated svg images and a local rendered demo video when they exist", () => {
    const media = resolveExerciseTeachingMedia(
      {
        exerciseId: "dumbbell-row",
        imageUrl: "/media/exercises/strength-upper.svg",
        mistakeImageUrl: "/media/exercises/strength-upper.svg",
        videoUrl: "https://example.com/external-video",
      },
      (assetPath) =>
        assetPath === "public/media/exercises/generated/dumbbell-row-proper.svg"
        || assetPath === "public/media/exercises/generated/dumbbell-row-mistake.svg"
        || assetPath === "public/media/exercises/generated/dumbbell-row-demo.mp4",
    );

    expect(media.properImageUrl).toBe("/media/exercises/generated/dumbbell-row-proper.svg");
    expect(media.mistakeImageUrl).toBe("/media/exercises/generated/dumbbell-row-mistake.svg");
    expect(media.localVideoUrl).toBe("/media/exercises/generated/dumbbell-row-demo.mp4");
    expect(media.externalVideoUrl).toBe("https://example.com/external-video");
  });

  it("falls back to external media when generated assets are missing", () => {
    const media = resolveExerciseTeachingMedia(
      {
        exerciseId: "plank",
        imageUrl: "/media/exercises/core.svg",
        mistakeImageUrl: "/media/exercises/core.svg",
        videoUrl: "https://example.com/plank-video",
      },
      () => false,
    );

    expect(media.properImageUrl).toBe("/media/exercises/core.svg");
    expect(media.mistakeImageUrl).toBeNull();
    expect(media.localVideoUrl).toBeNull();
    expect(media.externalVideoUrl).toBe("https://example.com/plank-video");
  });

  it("ships a local proper image, mistake image, and dynamic demo video for every exercise in the library", () => {
    const missing = exerciseLibrary
      .map((exercise) => exercise.id)
      .flatMap((exerciseId) => {
        const generatedDir = join(process.cwd(), "public", "media", "exercises", "generated");
        const properExists =
          existsSync(join(generatedDir, `${exerciseId}-proper.svg`))
          || existsSync(join(generatedDir, `${exerciseId}-proper.png`));
        const mistakeExists =
          existsSync(join(generatedDir, `${exerciseId}-mistake.svg`))
          || existsSync(join(generatedDir, `${exerciseId}-mistake.png`));
        const demoExists = existsSync(join(generatedDir, `${exerciseId}-demo.mp4`));

        return [
          ...(properExists ? [] : [`${exerciseId}:proper`]),
          ...(mistakeExists ? [] : [`${exerciseId}:mistake`]),
          ...(demoExists ? [] : [`${exerciseId}:demo`]),
        ];
      });

    expect(missing).toEqual([]);
  });
});
