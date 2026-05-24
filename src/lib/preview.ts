import { generateFitnessPlan, proposePlanAdjustment } from "./fitness";
import type { AssessmentInput, FitnessPlan, PlanAdjustment, PlanDay, WorkoutItem } from "./types";

export interface PreviewDashboard {
  user: {
    name: string;
    age: number;
    heightCm: number;
    weightKg: number;
    goal: string;
    environment: string;
  };
  safety: {
    title: string;
    description: string;
    bullets: string[];
  };
  onboarding: {
    title: string;
    fields: Array<{ label: string; value: string }>;
    followUpQuestions: string[];
    bodyImages: Array<{ label: string; imageUrl: string }>;
  };
  weekCards: Array<{
    week: number;
    title: string;
    goal: string;
    completionLabel: string;
  }>;
  today: {
    label: string;
    focus: string;
    workoutItems: WorkoutItem[];
    checkInPrompt: string;
  };
  nutrition: {
    summary: string;
    meals: string[];
    swaps: string[];
  };
  exerciseSpotlight: {
    title: string;
    imageUrl: string;
    videoUrl: string;
    videoLabel: string;
    cues: string[];
    mistakes: string[];
    alternatives: string[];
  };
  adjustments: Array<{
    prompt: string;
    response: string;
    tag: PlanAdjustment["type"];
  }>;
  quickActions: Array<{
    title: string;
    description: string;
  }>;
}

export const previewAssessment: AssessmentInput = {
  userId: "preview-user",
  age: 29,
  sex: "female",
  heightCm: 168,
  weightKg: 70,
  targetWeightKg: 62,
  goalText: "减脂塑形，增强核心稳定，改善久坐导致的肩颈紧张",
  goalKinds: ["fat_loss", "body_shape", "posture"],
  experience: "beginner",
  trainingDaysPerWeek: 4,
  sessionMinutes: 45,
  trainingEnvironment: "both",
  equipment: ["瑜伽垫", "哑铃"],
  injuries: [],
  chronicConditions: [],
  dietaryRestrictions: ["不吃牛肉"],
  allergies: ["花生"],
  sleepHours: 7,
  foodBudget: "normal",
  uploadedImages: [
    {
      id: "current-photo",
      kind: "current",
      url: "/media/demo/current-shape.svg",
      aiSummary: "腹部和臀腿减脂优先，同时需要注意胸椎伸展和肩颈放松。",
    },
    {
      id: "target-photo",
      kind: "target",
      url: "/media/demo/target-shape.svg",
      aiSummary: "目标偏向紧致线条和更稳定的站姿，不追求极端低体脂。",
    },
  ],
};

export function createPreviewPlan() {
  return generateFitnessPlan(previewAssessment);
}

export function createPreviewDashboard(): PreviewDashboard {
  const plan = createPreviewPlan();
  const today = getPlanDay(plan, 3);
  const spotlight = today.workoutItems[1] ?? today.workoutItems[0];
  const adjustmentSamples = [
    "今天深蹲膝盖痛，能不能换一个动作？",
    "我吃不了鸡胸肉，能换别的吗？",
    "昨晚没睡好，今天感觉很累。",
  ];

  return {
    user: {
      name: "林然",
      age: previewAssessment.age,
      heightCm: previewAssessment.heightCm,
      weightKg: previewAssessment.weightKg,
      goal: previewAssessment.goalText,
      environment: "居家 + 健身房都可",
    },
    safety: {
      title: "安全边界",
      description: "软件先按普通新手的安全强度生成，再根据打卡反馈逐步调整。",
      bullets: plan.safety.messages,
    },
    onboarding: {
      title: "首次建档问卷",
      fields: [
        { label: "年龄", value: `${previewAssessment.age} 岁` },
        { label: "身高 / 体重", value: `${previewAssessment.heightCm} cm / ${previewAssessment.weightKg} kg` },
        { label: "目标", value: previewAssessment.goalText },
        { label: "训练场景", value: "家中、健身房都可以" },
        { label: "饮食限制", value: "不吃牛肉，花生过敏" },
      ],
      followUpQuestions: [
        "你通常一周能稳定训练几天？",
        "家里是否有哑铃、瑜伽垫或弹力带？",
        "最近是否出现过膝盖、腰背或肩颈疼痛？",
      ],
      bodyImages: [
        { label: "当前状态", imageUrl: "/media/demo/current-shape.svg" },
        { label: "目标参考", imageUrl: "/media/demo/target-shape.svg" },
      ],
    },
    weekCards: plan.weeks.map((week, index) => ({
      week: week.week,
      title: week.title,
      goal: week.goal,
      completionLabel: index === 0 ? "72%" : index === 1 ? "48%" : index === 2 ? "16%" : "待开始",
    })),
    today: {
      label: today.label,
      focus: today.focus,
      workoutItems: today.workoutItems,
      checkInPrompt: today.checkInPrompt,
    },
    nutrition: {
      summary: `今日目标 ${today.nutrition.calorieTarget} kcal，蛋白质 ${today.nutrition.proteinGrams} g，饮水 ${today.nutrition.waterLiters} L。`,
      meals: today.nutrition.meals,
      swaps: today.nutrition.swaps,
    },
    exerciseSpotlight: {
      title: spotlight.name,
      imageUrl: spotlight.media.imageUrl,
      videoUrl: spotlight.media.videoUrl,
      videoLabel: "打开标准动作视频演示",
      cues: spotlight.media.cues,
      mistakes: spotlight.media.commonMistakes,
      alternatives: spotlight.media.alternatives,
    },
    adjustments: adjustmentSamples.map((prompt) => {
      const adjustment = proposePlanAdjustment(plan, prompt);
      return {
        prompt,
        response: adjustment.message,
        tag: adjustment.type,
      };
    }),
    quickActions: [
      {
        title: "重新生成下一周",
        description: "根据本周打卡和疲劳感，自动调整训练量与动作难度。",
      },
      {
        title: "替换今天的动作",
        description: "针对疼痛、器械不足或不会做的动作，立即切换更合适版本。",
      },
      {
        title: "换一套饮食建议",
        description: "保留热量和蛋白质目标，只替换成更容易执行的食物组合。",
      },
    ],
  };
}

function getPlanDay(plan: FitnessPlan, dayIndex: number): PlanDay {
  return plan.days.find((day) => day.dayIndex === dayIndex) ?? plan.days[0]!;
}
