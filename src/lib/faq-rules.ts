import type { NutritionDay, PlanFaqEntry, PlanProfile, ProgramTemplate } from "./types";

export function buildFaqEntries(input: {
  goalText: string;
  profile: PlanProfile;
  program: ProgramTemplate;
  nutrition: NutritionDay;
}): PlanFaqEntry[] {
  const shared: PlanFaqEntry[] = [
    {
      id: "soreness-not-required",
      category: "misconception",
      question: "没酸是不是白练了？",
      answer: "不是。是否进步要看动作质量、完成度和长期负荷变化，不是看第二天有多酸。",
    },
  ];

  if (input.profile.primaryGoal === "lean_gain_strength") {
    return [
      {
        id: "protein-powder-why",
        category: "nutrition",
        question: "蛋白粉是不是必须，什么时候吃？",
        answer: "不是必须。它只是更方便补足每日蛋白的工具。总蛋白更重要，训练前后吃只是方便恢复。",
      },
      {
        id: "why-split",
        category: "training",
        question: "为什么这周用三分化或改良分化？",
        answer: "因为你当前目标偏增肌增力，训练频率和场景条件足够，分化能让重点肌群拿到更完整的训练量。",
      },
      ...shared,
    ];
  }

  if (input.profile.primaryGoal === "fat_loss_preserve_muscle") {
    return [
      {
        id: "why-lift-while-losing-fat",
        category: "training",
        question: "为什么减脂也要练力量？",
        answer: "因为减脂期保留力量训练更有利于维持瘦体重、改善线条和长期代谢表现。",
      },
      {
        id: "cardio-not-everything",
        category: "cardio",
        question: "为什么不是只让我做有氧？",
        answer: "只做有氧容易把减脂做成体重下降但肌肉也跟着掉。你的计划会把有氧和抗阻一起安排。",
      },
      ...shared,
    ];
  }

  return [
    {
      id: "why-recomp",
      category: "training",
      question: "为什么我的计划不是纯减脂，也不是纯增肌？",
      answer: "因为你更适合走重组路线：优先提高力量、增加肌肉刺激，同时把体脂慢慢压下来。",
    },
    {
      id: "home-equipment-still-works",
      category: "equipment",
      question: "在家练为什么也有效？",
      answer: "有效刺激不只来自大器械，还来自足够接近力竭、动作质量、单侧训练和节奏控制。",
    },
    ...shared,
  ];
}
