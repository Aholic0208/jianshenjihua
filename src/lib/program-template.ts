import { EVIDENCE_RULES } from "./evidence-rules";
import type { AssessmentInput, PlanProfile, ProgramTemplate } from "./types";

function clampTrainingDays(days: number) {
  return Math.max(3, Math.min(5, days));
}

function buildLeanGainTemplate(input: AssessmentInput): ProgramTemplate {
  const trainingDays = clampTrainingDays(input.trainingDaysPerWeek);

  if (input.trainingEnvironment === "gym") {
    return {
      splitStyle: trainingDays >= 5 ? "push_pull_legs" : "upper_lower",
      weeklyStructure: trainingDays >= 5
        ? ["push_gym", "pull_gym", "legs_gym", "cardio_recovery", "upper_accessory_gym"]
        : ["upper_gym", "lower_gym", "upper_gym", "lower_gym"],
      cardioMinutesPerWeek: EVIDENCE_RULES.cardio.recoveryMinutes,
    };
  }

  if (input.trainingEnvironment === "home") {
    return {
      splitStyle: "upper_lower",
      weeklyStructure: trainingDays >= 5
        ? ["upper_home", "lower_home", "cardio_home", "upper_home", "lower_home"]
        : ["upper_home", "lower_home", "upper_home", "cardio_home"],
      cardioMinutesPerWeek: EVIDENCE_RULES.cardio.recoveryMinutes,
    };
  }

  return {
    splitStyle: trainingDays >= 5 ? "push_pull_legs" : "modified_split",
    weeklyStructure: trainingDays >= 5
      ? ["push_gym", "upper_home", "pull_gym", "cardio_home", "legs_gym"]
      : ["upper_gym", "lower_home", "pull_gym", "cardio_home"],
    cardioMinutesPerWeek: EVIDENCE_RULES.cardio.recoveryMinutes,
  };
}

function buildFatLossTemplate(input: AssessmentInput): ProgramTemplate {
  const trainingDays = clampTrainingDays(input.trainingDaysPerWeek);

  if (input.trainingEnvironment === "gym") {
    return {
      splitStyle: "full_body",
      weeklyStructure: trainingDays >= 5
        ? ["full_body_gym", "cardio_recovery", "full_body_gym", "full_body_gym", "cardio_recovery"]
        : ["full_body_gym", "cardio_recovery", "full_body_gym", "full_body_gym"],
      cardioMinutesPerWeek: EVIDENCE_RULES.cardio.weightLossSupportMinutes,
    };
  }

  if (input.trainingEnvironment === "home") {
    return {
      splitStyle: "full_body",
      weeklyStructure: trainingDays >= 5
        ? ["full_body_home", "cardio_home", "full_body_home", "full_body_home", "cardio_home"]
        : ["full_body_home", "cardio_home", "full_body_home", "full_body_home"],
      cardioMinutesPerWeek: EVIDENCE_RULES.cardio.weightLossSupportMinutes,
    };
  }

  return {
    splitStyle: "full_body",
    weeklyStructure: trainingDays >= 5
      ? ["full_body_gym", "cardio_home", "full_body_home", "full_body_gym", "cardio_home"]
      : ["full_body_gym", "cardio_home", "full_body_home", "full_body_gym"],
    cardioMinutesPerWeek: EVIDENCE_RULES.cardio.weightLossSupportMinutes,
  };
}

function buildRecompTemplate(input: AssessmentInput): ProgramTemplate {
  if (input.trainingEnvironment === "gym") {
    return {
      splitStyle: "upper_lower",
      weeklyStructure: ["upper_gym", "lower_gym", "cardio_recovery", "upper_gym", "lower_gym"],
      cardioMinutesPerWeek: 120,
    };
  }

  if (input.trainingEnvironment === "home") {
    return {
      splitStyle: "upper_lower",
      weeklyStructure: ["upper_home", "lower_home", "cardio_home", "upper_home", "lower_home"],
      cardioMinutesPerWeek: 120,
    };
  }

  return {
    splitStyle: "modified_split",
    weeklyStructure: ["upper_gym", "lower_home", "cardio_home", "upper_home", "lower_gym"],
    cardioMinutesPerWeek: 120,
  };
}

export function buildProgramTemplate(
  input: AssessmentInput,
  profile: PlanProfile,
): ProgramTemplate {
  if (profile.primaryGoal === "lean_gain_strength") {
    return buildLeanGainTemplate(input);
  }

  if (profile.primaryGoal === "fat_loss_preserve_muscle") {
    return buildFatLossTemplate(input);
  }

  return buildRecompTemplate(input);
}
