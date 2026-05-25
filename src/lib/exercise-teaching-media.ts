type ResolveInput = {
  exerciseId: string;
  imageUrl: string;
  mistakeImageUrl?: string;
  videoUrl: string;
};

type AssetExists = (assetPath: string) => boolean;

export function resolveExerciseTeachingMedia(input: ResolveInput, assetExists: AssetExists) {
  const properImagePath = `public/media/exercises/generated/${input.exerciseId}-proper.png`;
  const mistakeImagePath = `public/media/exercises/generated/${input.exerciseId}-mistake.png`;
  const localVideoPath = `public/media/exercises/generated/${input.exerciseId}-demo.mp4`;

  return {
    properImageUrl: assetExists(properImagePath)
      ? `/${properImagePath.replace(/^public\//, "")}`
      : input.imageUrl,
    mistakeImageUrl: assetExists(mistakeImagePath)
      ? `/${mistakeImagePath.replace(/^public\//, "")}`
      : input.mistakeImageUrl && input.mistakeImageUrl !== input.imageUrl
        ? input.mistakeImageUrl
        : null,
    localVideoUrl: assetExists(localVideoPath)
      ? `/${localVideoPath.replace(/^public\//, "")}`
      : null,
    externalVideoUrl: input.videoUrl,
  };
}
