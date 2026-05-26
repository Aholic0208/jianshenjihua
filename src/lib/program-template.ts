import { EVIDENCE_RULES } from "./evidence-rules";
import type { AssessmentInput, PlanProfile, ProgramTemplate } from "./types";

function clampTrainingDays(days: number) {
  return Math.max(3, Math.min(5, days));
}

function hasGymForwardEquipment(equipment: string[]) {
  return equipment.some((item) =>
    /(machine|pulldown|cable|smith|barbell|bench|rack|treadmill|机器|器械|一体化|高位下拉|跑步机)/i.test(item),
  );
}

function wantsThreeWaySplitPreference(goalText: string) {
  return /(三分化|推拉腿|ppl|push[\s/-]*pull[\s/-]*legs|split)/i.test(goalText);
}

function canUseLeanGainThreeWaySplit(input: AssessmentInput, trainingDays: number) {
  if (trainingDays < 4 || input.experience === "beginner") {
    return false;
  }

  if (input.trainingEnvironment === "gym") {
    return true;
  }

  return input.trainingEnvironment === "both" && hasGymForwardEquipment(input.equipment);
}

function canUseRecompThreeWaySplit(input: AssessmentInput, trainingDays: number) {
  if (trainingDays < 4 || input.experience === "beginner") {
    return false;
  }

  if (!wantsThreeWaySplitPreference(input.goalText)) {
    return false;
  }

  if (input.trainingEnvironment === "gym") {
    return true;
  }

  return input.trainingEnvironment === "both" && hasGymForwardEquipment(input.equipment);
}

function buildLeanGainTemplate(input: AssessmentInput): ProgramTemplate {
  const trainingDays = clampTrainingDays(input.trainingDaysPerWeek);
  const useThreeWaySplit = canUseLeanGainThreeWaySplit(input, trainingDays);

  if (input.trainingEnvironment === "gym") {
    return {
      splitStyle: useThreeWaySplit ? "push_pull_legs" : "upper_lower",
      weeklyStructure: useThreeWaySplit
        ? trainingDays >= 5
          ? ["push_gym", "pull_gym", "quad_focus_gym", "upper_accessory_gym", "posterior_chain_gym"]
          : ["push_gym", "pull_gym", "quad_focus_gym", "posterior_chain_gym"]
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
    splitStyle: "modified_split",
    weeklyStructure: useThreeWaySplit
      ? trainingDays >= 5
        ? ["push_gym", "lower_home", "pull_gym", "upper_home", "posterior_chain_gym"]
        : ["push_gym", "lower_home", "pull_gym", "upper_home"]
      : trainingDays >= 5
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
  const trainingDays = clampTrainingDays(input.trainingDaysPerWeek);
  const useThreeWaySplit = canUseRecompThreeWaySplit(input, trainingDays);

  if (input.trainingEnvironment === "gym") {
    return {
      splitStyle: useThreeWaySplit ? "push_pull_legs" : "upper_lower",
      weeklyStructure: useThreeWaySplit
        ? trainingDays >= 5
          ? ["push_gym", "pull_gym", "legs_gym", "upper_accessory_gym", "cardio_recovery"]
          : ["push_gym", "pull_gym", "legs_gym", "upper_accessory_gym"]
        : ["upper_gym", "lower_gym", "cardio_recovery", "upper_gym", "lower_gym"],
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
    splitStyle: useThreeWaySplit ? "push_pull_legs" : "modified_split",
    weeklyStructure: useThreeWaySplit
      ? trainingDays >= 5
        ? ["push_gym", "pull_gym", "legs_gym", "upper_home", "cardio_home"]
        : ["push_gym", "pull_gym", "legs_gym", "upper_home"]
      : trainingDays >= 5
        ? ["upper_gym", "lower_home", "cardio_home", "pull_gym", "upper_home"]
        : ["upper_gym", "lower_home", "cardio_home", "upper_home"],
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
