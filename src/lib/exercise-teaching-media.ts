type ResolveInput = {
  exerciseId: string;
  imageUrl: string;
  mistakeImageUrl?: string;
  videoUrl: string;
};

type AssetExists = (assetPath: string) => boolean;

export function resolveExerciseTeachingMedia(input: ResolveInput, assetExists: AssetExists) {
  const properSvgPath = `public/media/exercises/generated/${input.exerciseId}-proper.svg`;
  const properPngPath = `public/media/exercises/generated/${input.exerciseId}-proper.png`;
  const mistakeSvgPath = `public/media/exercises/generated/${input.exerciseId}-mistake.svg`;
  const mistakePngPath = `public/media/exercises/generated/${input.exerciseId}-mistake.png`;
  const localVideoPath = `public/media/exercises/generated/${input.exerciseId}-demo.mp4`;

  const preferredProperImagePath = assetExists(properSvgPath)
    ? properSvgPath
    : assetExists(properPngPath)
      ? properPngPath
      : null;

  const preferredMistakeImagePath = assetExists(mistakeSvgPath)
    ? mistakeSvgPath
    : assetExists(mistakePngPath)
      ? mistakePngPath
      : null;

  return {
    properImageUrl: preferredProperImagePath
      ? `/${preferredProperImagePath.replace(/^public\//, "")}`
      : input.imageUrl,
    mistakeImageUrl: preferredMistakeImagePath
      ? `/${preferredMistakeImagePath.replace(/^public\//, "")}`
      : input.mistakeImageUrl && input.mistakeImageUrl !== input.imageUrl
        ? input.mistakeImageUrl
        : null,
    localVideoUrl: assetExists(localVideoPath)
      ? `/${localVideoPath.replace(/^public\//, "")}`
      : null,
    externalVideoUrl: input.videoUrl,
  };
}
