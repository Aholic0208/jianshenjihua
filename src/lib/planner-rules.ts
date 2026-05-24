import type { AssessmentInput, Sex } from "./types";

export type GoalTrack = "fat_loss" | "muscle_gain" | "body_shape" | "posture";
export type LowerBodyPrimary = "squat_dominant" | "hip_dominant";

const GOAL_KEYWORDS: Array<{ track: GoalTrack; terms: string[] }> = [
  { track: "fat_loss", terms: ["减脂", "减重", "fat", "lose weight", "lean"] },
  { track: "muscle_gain", terms: ["增肌", "力量", "muscle", "strength", "grow"] },
  { track: "posture", terms: ["体态", "姿势", "posture", "mobility", "僵硬"] },
  { track: "body_shape", terms: ["塑形", "线条", "shape", "toning"] },
];

export function chooseGoalTrack(goalText: string): GoalTrack {
  const text = goalText.toLowerCase();

  for (const group of GOAL_KEYWORDS) {
    if (group.terms.some((term) => text.includes(term))) {
      return group.track;
    }
  }

  return "fat_loss";
}

export function chooseLowerBodyPrimary(injuries: string[]): LowerBodyPrimary {
  const text = injuries.join(" ").toLowerCase();
  if (["膝", "knee", "髌", "patella"].some((term) => text.includes(term))) {
    return "hip_dominant";
  }

  return "squat_dominant";
}

export function deriveCalorieAdjustment(input: { wantsWeightLoss: boolean; sex: Sex }) {
  if (!input.wantsWeightLoss) {
    return 100;
  }

  return input.sex === "female" ? -400 : -500;
}

export function buildWeekEmphasis(input: {
  goalTrack: GoalTrack;
  lowerBodyPrimary: LowerBodyPrimary;
  experience: AssessmentInput["experience"];
}) {
  const lowerBodyCue = input.lowerBodyPrimary === "hip_dominant" ? "臀后链控制" : "深蹲模式练习";
  const base = input.goalTrack === "muscle_gain"
    ? ["力量动作质量", "组数渐进", lowerBodyCue]
    : input.goalTrack === "posture"
      ? ["核心稳定", "肩髋活动度", lowerBodyCue]
      : input.goalTrack === "body_shape"
        ? ["线条塑形", "训练密度", lowerBodyCue]
        : ["稳定热量缺口", "步数与恢复", lowerBodyCue];

  if (input.experience === "beginner") {
    return [
      ["动作学习", "恢复感知", base[2]],
      ["规律出勤", base[0], base[2]],
      ["增加挑战", base[0], base[1]],
      ["巩固习惯", "复盘反馈", base[1]],
    ];
  }

  return [
    ["动作效率", base[0], base[2]],
    ["负荷稳定", base[0], base[1]],
    ["提高密度", base[0], base[1]],
    ["巩固表现", "恢复安排", base[1]],
  ];
}
