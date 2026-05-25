import type { AssessmentInput, PlanProfile } from "./types";

function calculateBmi(input: Pick<AssessmentInput, "weightKg" | "heightCm">) {
  return input.weightKg / ((input.heightCm / 100) ** 2);
}

function readEnvironmentBias(input: AssessmentInput): PlanProfile["environmentBias"] {
  if (input.trainingEnvironment === "both") {
    return "mixed";
  }

  return input.trainingEnvironment;
}

export function classifyPlanProfile(input: AssessmentInput): PlanProfile {
  const goalText = input.goalText.toLowerCase();
  const bmi = calculateBmi(input);
  const environmentBias = readEnvironmentBias(input);
  const wantsGain =
    /增肌|变壮|力量|muscle|strength|bulk|gain/.test(goalText) &&
    (bmi < 22 || (input.targetWeightKg ?? input.weightKg) > input.weightKg);
  const wantsRecomp =
    /降体脂|体脂|线条|塑形|recomp|recomposition|增肌减脂|更紧致/.test(goalText) &&
    bmi < 27;

  if (wantsGain) {
    return {
      primaryGoal: "lean_gain_strength",
      environmentBias,
      trainingPriority: "strength_hypertrophy",
      cardioPriority: "low",
      calorieStrategy: "small_surplus",
    };
  }

  if (wantsRecomp) {
    return {
      primaryGoal: "recomposition",
      environmentBias,
      trainingPriority: "hypertrophy",
      cardioPriority: "moderate",
      calorieStrategy: "maintenance_or_small_deficit",
    };
  }

  return {
    primaryGoal: "fat_loss_preserve_muscle",
    environmentBias,
    trainingPriority: "adherence",
    cardioPriority: "high",
    calorieStrategy: "deficit",
  };
}
