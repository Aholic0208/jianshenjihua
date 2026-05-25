import type { NutritionDay, PlanFaqEntry, PlanProfile, ProgramTemplate } from "./types";

function createProteinFaqs(nutrition: NutritionDay): PlanFaqEntry[] {
  return [
    {
      id: "protein-powder-why",
      category: "nutrition",
      question: "为什么要吃蛋白粉？",
      answer: `当你一天要吃到大约 ${nutrition.proteinGrams} 克蛋白质时，蛋白粉的价值主要是方便补足，不是因为它比正常食物更“神”。如果你用鸡蛋、奶、肉、豆制品已经能稳定吃够，也可以完全不靠它。`,
    },
    {
      id: "protein-powder-required",
      category: "nutrition",
      question: "蛋白粉是不是必须？",
      answer: "不是必须。增肌、减脂、重组都先看每天总蛋白和总热量是否到位。蛋白粉只是便携、好计算、准备成本低，适合忙、胃口小、训练后不方便吃正餐的人。",
    },
    {
      id: "protein-powder-timing",
      category: "nutrition",
      question: "蛋白粉应该怎么吃、什么时候吃？",
      answer:
        "先把它当成补蛋白的一餐或半餐，不要当成“必须训练后立刻喝”的仪式。训练前后都可以，关键是你当天总量吃够。实操上先看一勺能提供多少蛋白，按你当天还差的量去补；多数人用水或奶冲一勺，能补到一餐 20-30 克左右蛋白就够用了。对新手来说，比纠结“黄金窗口”更重要的是把每餐分配得更平均，训练后 1-2 小时内能接上正餐或奶昔就够用。",
    },
    {
      id: "protein-powder-types",
      category: "nutrition",
      question: "乳清、酪蛋白、植物蛋白怎么选？",
      answer: "大多数新手先选乳清就够了，通常更方便、口感和性价比也更友好。酪蛋白更适合饱腹感需求高、想把加餐拖得更久的人。乳糖不耐、纯素或不吃奶制品，再考虑大豆或豌豆这类植物蛋白，核心仍然是看你能不能长期坚持喝、并把总蛋白补够。",
    },
  ];
}

function createProgressFaqs(
  profile: PlanProfile,
  program: ProgramTemplate,
): PlanFaqEntry[] {
  const entries: PlanFaqEntry[] = [];

  if (profile.primaryGoal === "lean_gain_strength" && program.cardioMinutesPerWeek > 0) {
    entries.push({
      id: "why-cardio-while-gaining",
      category: "cardio",
      question: "为什么分化训练里还有有氧？",
      answer: `有氧不是来抢增肌进度的，而是帮你保留基本心肺、恢复能力和日常活动容量。你这周这点大约 ${program.cardioMinutesPerWeek} 分钟的安排，更像“配套维护”而不是主课: 剂量够用就行，目的是让你上楼不喘、组间恢复更稳，也别因为完全不动把体能短板拖住力量训练。`,
    });
  }

  if (program.splitStyle !== "full_body") {
    entries.push({
      id: "why-not-all-out-every-day",
      category: "recovery",
      question: "为什么不安排我天天练到废？",
      answer:
        "真正能长期长肌肉、长力量的，不是天天把自己练垮，而是让训练量刚好落在你能恢复、能重复推进的范围里。每次都练到废，常见结果是动作变形、下一次训练掉质量、总训练量反而做不上去。计划里留恢复余地，是为了让你这周后半段和下周还能继续加重量、加次数，而不是第一天很猛，后面全在硬扛。",
    });
  }

  return entries;
}

function createSharedFaqs(): PlanFaqEntry[] {
  return [
    {
      id: "soreness-not-required",
      category: "misconception",
      question: "没酸是不是白练了？",
      answer: "不是。酸痛更多说明你对刺激还不熟，或者最近动作、节奏、训练量变了。判断有没有练到，更该看动作质量、目标肌群是否有参与感、训练记录有没有逐步推进，而不是只看第二天酸不酸。",
    },
    {
      id: "recovery-days-purpose",
      category: "recovery",
      question: "为什么计划里会有休息或轻松日？",
      answer: "新手进步不只是靠练，还靠恢复把刺激变成适应。休息日能帮你把疲劳降下来，让下一次力量训练更稳、动作更像样，也更容易长期坚持。",
    },
  ];
}

function createEnvironmentFaq(profile: PlanProfile, program: ProgramTemplate): PlanFaqEntry {
  const answerByEnvironment: Record<PlanProfile["environmentBias"], string> = {
    gym: "健身房计划和居家计划会不同，因为器械、负重递增空间和动作选择范围不一样。你现在偏健身房场景，计划会更敢用器械和自由重量去做稳定加重；如果搬到家里，同样目标也会改成更依赖单侧训练、节奏控制和动作组合来把刺激补回来。",
    home: "健身房计划和居家计划会不同，因为居家常见限制不是“不能练”，而是负重和器械选择更少。你当前更偏居家，计划会优先保留最有效、最容易执行的动作，再用节奏、停顿、单侧训练和循环安排提高强度；如果换到健身房，就能把更多精细的器械和递增负重放进来。",
    mixed: "健身房计划和居家计划会不同，因为两种环境各有最值钱的训练内容。你现在是混合场景，计划会把更需要负重和稳定器械的内容放在健身房，把补量、有氧或轻器械日留给家里，而不是简单把同一套动作复制两遍。",
  };

  return {
    id: "environment-plan-difference",
    category: "equipment",
    question: "为什么健身房计划和居家计划会不同？",
    answer: `${answerByEnvironment[profile.environmentBias]} 这也是为什么你当前这套 ${program.splitStyle === "full_body" ? "全身" : "分化"} 结构会跟别人的模板不一样。`,
  };
}

function createSplitFaq(program: ProgramTemplate): PlanFaqEntry | null {
  if (program.splitStyle === "push_pull_legs") {
    return {
      id: "why-ppl",
      category: "training",
      question: "三分化或推拉腿为什么适合我现在这个阶段？",
      answer: "推拉腿更适合已经能稳定每周练较多天、并且愿意系统增肌增力的人。这样安排能把胸肩三头、背二头、腿臀核心拆开，单次训练更聚焦，也更容易在一周内给主要肌群足够训练量，而不是每次都匆匆忙忙全练一遍。",
    };
  }

  if (program.splitStyle === "modified_split") {
    return {
      id: "why-modified-split",
      category: "training",
      question: "为什么我用的是改良分化，不是标准三分化？",
      answer: "改良分化通常给想更系统训练、但恢复和时间又没有到高频三分化水平的人。它比纯全身训练更聚焦，又比经典三分化更留恢复余地，适合想兼顾线条、力量和执行稳定性的阶段。",
    };
  }

  if (program.splitStyle === "upper_lower") {
    return {
      id: "why-upper-lower",
      category: "training",
      question: "为什么这里用上下肢分化？",
      answer: "上下肢分化常见于每周能练 4 天左右的人。它比全身训练更容易把训练量铺开，又不像高频三分化那样要求很强恢复，属于很多新手和回归训练者都比较好落地的结构。",
    };
  }

  return null;
}

function createGoalFaqs(profile: PlanProfile, program: ProgramTemplate): PlanFaqEntry[] {
  if (profile.primaryGoal === "lean_gain_strength") {
    return [
      {
        id: "why-small-surplus",
        category: "nutrition",
        question: "为什么不是让我疯狂多吃，长得更快？",
        answer: "因为你现在更需要的是稳定增重和训练进步，不是用体脂快速堆体重。小幅热量盈余通常更利于把增长更多地放在肌肉和力量上，也更容易观察到底是训练没跟上，还是吃得太猛了。",
      },
      createSplitFaq(program),
    ].filter((item): item is PlanFaqEntry => Boolean(item));
  }

  if (profile.primaryGoal === "fat_loss_preserve_muscle") {
    return [
      {
        id: "why-lift-while-losing-fat",
        category: "training",
        question: "为什么减脂也要练力量？",
        answer: "因为减脂不是只让体重下降，而是尽量把脂肪减掉、把肌肉留住。力量训练能告诉身体“这些肌肉还要用”，这样更有机会保住线条、基础力量和代谢表现，而不是瘦下来却变得更软、更没劲。",
      },
      {
        id: "cardio-not-everything",
        category: "cardio",
        question: "为什么不是只让我做有氧？",
        answer: `有氧当然有用，尤其你这周安排了大约 ${program.cardioMinutesPerWeek} 分钟，但只靠有氧很容易把减脂做成“体重掉了、肌肉也掉了”。所以计划会把有氧当作热量消耗和心肺支持，把力量训练当作保肌肉、保线条的主线。`,
      },
    ];
  }

  return [
    {
      id: "why-recomp",
      category: "training",
      question: "为什么我的计划不是纯减脂，也不是纯增肌？",
      answer: "因为你现在更适合先走重组路线: 优先把力量练起来、把训练质量做稳定，同时把饮食控制在维持或轻微缺口附近。这样更适合那些体重不一定很高、但想让线条更紧、体脂慢慢下去、肌肉一点点长起来的新手。",
    },
    {
      id: "why-moderate-cardio",
      category: "cardio",
      question: "为什么有氧不是越多越好？",
      answer: "重组阶段需要兼顾恢复和力量进步。有氧太多会挤占恢复、食欲和训练状态，所以通常保留中等剂量，用来支持心肺和日常消耗，而不是把主线变成拼命刷卡路里。",
    },
  ];
}

export function buildFaqEntries(input: {
  goalText: string;
  profile: PlanProfile;
  program: ProgramTemplate;
  nutrition: NutritionDay;
}): PlanFaqEntry[] {
  const entries: PlanFaqEntry[] = [];
  const needsProteinFaq =
    input.profile.primaryGoal !== "fat_loss_preserve_muscle" ||
    input.nutrition.proteinGrams >= 110;

  entries.push(...createSharedFaqs());

  if (needsProteinFaq) {
    entries.push(...createProteinFaqs(input.nutrition));
  }

  entries.push(...createGoalFaqs(input.profile, input.program));
  entries.push(...createProgressFaqs(input.profile, input.program));
  entries.push(createEnvironmentFaq(input.profile, input.program));

  const splitFaq = createSplitFaq(input.program);
  if (splitFaq && !entries.some((item) => item.id === splitFaq.id)) {
    entries.push(splitFaq);
  }

  return entries;
}
