import { describe, expect, it } from "vitest";

import { resolveExerciseTeachingMedia } from "./exercise-teaching-media";

describe("exercise teaching media", () => {
  it("prefers generated images and a local rendered demo video when they exist", () => {
    const media = resolveExerciseTeachingMedia(
      {
        exerciseId: "dumbbell-row",
        imageUrl: "/media/exercises/strength-upper.svg",
        mistakeImageUrl: "/media/exercises/strength-upper.svg",
        videoUrl: "https://example.com/external-video",
      },
      (assetPath) =>
        assetPath === "public/media/exercises/generated/dumbbell-row-proper.png"
        || assetPath === "public/media/exercises/generated/dumbbell-row-demo.mp4",
    );

    expect(media.properImageUrl).toBe("/media/exercises/generated/dumbbell-row-proper.png");
    expect(media.mistakeImageUrl).toBeNull();
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
});
