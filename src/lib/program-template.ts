import { EVIDENCE_RULES } from "./evidence-rules";
import type { AssessmentInput, PlanProfile, ProgramTemplate } from "./types";

function buildLeanGainTemplate(input: AssessmentInput): ProgramTemplate {
  const weeklyStructure = input.trainingDaysPerWeek >= 5
    ? ["push", "pull", "legs", "cardio_recovery", "upper_accessory"]
    : ["upper", "lower", "push", "pull"];

  return {
    splitStyle: input.trainingDaysPerWeek >= 5 ? "push_pull_legs" : "upper_lower",
    weeklyStructure,
    cardioMinutesPerWeek: EVIDENCE_RULES.cardio.recoveryMinutes,
  };
}

function buildFatLossTemplate(input: AssessmentInput): ProgramTemplate {
  const trainingDays = Math.max(3, Math.min(5, input.trainingDaysPerWeek));
  const weeklyStructure = trainingDays >= 4
    ? ["full_body", "cardio_home", "full_body", "full_body"]
    : ["full_body", "cardio_home", "full_body"];

  return {
    splitStyle: "full_body",
    weeklyStructure,
    cardioMinutesPerWeek: EVIDENCE_RULES.cardio.weightLossSupportMinutes,
  };
}

function buildRecompTemplate(): ProgramTemplate {
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

  return buildRecompTemplate();
}
