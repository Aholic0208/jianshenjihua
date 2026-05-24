import { exerciseLibrary, findExercise } from "./exercise-library";
import { createPreviewDashboard, createPreviewPlan, previewAssessment } from "./preview";

export function createExerciseDetailView(exerciseId: string) {
  const exercise = findExercise(exerciseId) ?? exerciseLibrary[0];

  return {
    id: exercise.id,
    title: exercise.name,
    imageUrl: exercise.imageUrl,
    videoUrl: exercise.videoUrl,
    steps: exercise.steps,
    cues: exercise.cues,
    commonMistakes: exercise.commonMistakes,
    alternatives: exercise.alternatives,
    contraindications: exercise.contraindications,
    muscles: exercise.muscles,
    equipment: exercise.equipment,
  };
}

export function createCheckInView() {
  const dashboard = createPreviewDashboard();

  return {
    dayLabel: dashboard.today.label,
    focus: dashboard.today.focus,
    workoutSummary: dashboard.today.workoutItems.map((item) => item.name),
    metrics: [
      { label: "完成度", min: 0, max: 100, defaultValue: 75, suffix: "%" },
      { label: "疲劳感", min: 1, max: 5, defaultValue: 3, suffix: "/5" },
      { label: "疼痛等级", min: 0, max: 5, defaultValue: 1, suffix: "/5" },
      { label: "饥饿感", min: 1, max: 5, defaultValue: 3, suffix: "/5" },
    ],
    quickChoices: [
      "今天动作太难",
      "器械不够",
      "时间不够，只完成了一半",
      "饮食执行得不太好",
    ],
  };
}

export function createAdjustmentWorkspaceView() {
  const dashboard = createPreviewDashboard();

  return {
    suggestions: [
      "给我一个不伤膝盖的下肢替代动作",
      "把今天的训练压缩到 25 分钟",
      "帮我换成更省钱的三餐搭配",
      "我只有家里的瑜伽垫和弹力带",
    ],
    recentMessages: dashboard.adjustments.map((item) => ({
      prompt: item.prompt,
      response: item.response,
      tag: item.tag,
    })),
  };
}

export function createProfileView() {
  const plan = createPreviewPlan();

  return {
    profileCards: [
      { title: "年龄", value: `${previewAssessment.age} 岁` },
      { title: "身高", value: `${previewAssessment.heightCm} cm` },
      { title: "体重", value: `${previewAssessment.weightKg} kg` },
      { title: "目标体重", value: `${previewAssessment.targetWeightKg} kg` },
    ],
    preferences: [
      { label: "训练场景", value: "居家 + 健身房都可" },
      { label: "每周训练天数", value: `${previewAssessment.trainingDaysPerWeek} 天` },
      { label: "单次时长", value: `${previewAssessment.sessionMinutes} 分钟` },
      { label: "饮食限制", value: "不吃牛肉，花生过敏" },
    ],
    planSummary: plan.summary,
    revisionHint: "当体重、疼痛、疲劳或作息变化明显时，建议重新生成后续周计划。",
  };
}
