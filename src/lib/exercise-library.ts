import type { ExerciseMedia, TrainingEnvironment } from "./types";

export const exerciseLibrary: ExerciseMedia[] = [
  {
    id: "warmup-march",
    name: "原地高抬腿热身",
    category: "warmup",
    difficulty: "beginner",
    muscles: ["髋屈肌", "核心", "心肺"],
    environment: "both",
    equipment: [],
    imageUrl: "/media/exercises/warmup.svg",
    videoUrl: "https://www.verywellfit.com/how-to-do-marching-in-place-5092187",
    videoTitle: "Marching in Place Guide",
    steps: [
      "身体站直，双脚与髋同宽，先轻松摆臂。",
      "交替把膝盖抬到舒服高度，不需要追求越高越好。",
      "脚掌轻轻落地，逐渐把节奏带起来，持续 3 到 5 分钟。",
    ],
    cues: ["落地要轻", "上身保持直立", "呼吸保持稳定，不要憋气"],
    commonMistakes: ["上身后仰", "落地太重", "抬腿过高导致骨盆前倾"],
    alternatives: ["快走热身", "开合步", "椭圆机低强度热身"],
    contraindications: ["急性踝关节疼痛时降低抬腿高度", "如果头晕或胸闷，马上停止"],
  },
  {
    id: "bodyweight-squat",
    name: "徒手深蹲",
    category: "strength",
    difficulty: "beginner",
    muscles: ["股四头肌", "臀大肌", "核心"],
    environment: "both",
    equipment: [],
    imageUrl: "/media/exercises/strength-lower.svg",
    videoUrl: "https://www.nuffieldhealth.com/article/how-to-do-a-squat-with-perfect-form",
    videoTitle: "How to Do a Squat with Good Form",
    steps: [
      "双脚略宽于肩，脚尖自然微微外开，先站稳。",
      "像要坐到身后的椅子上一样把髋向后坐，同时膝盖顺着脚尖方向弯曲。",
      "下降到你能保持腰背稳定、膝盖不内扣的深度，再用脚掌发力站起。",
    ],
    cues: ["膝盖跟脚尖方向一致", "胸口打开，脊柱保持中立", "全程可控，不要砸下去"],
    commonMistakes: ["膝盖内扣", "塌腰或圆背", "重心跑到前脚掌，脚跟快离地", "下蹲太快，站起时借惯性"],
    alternatives: ["箱式深蹲", "臀桥", "坐椅起立"],
    contraindications: ["急性膝痛或明显肿胀时先避免深蹲模式", "髋或腰出现锐痛时暂停并评估"],
  },
  {
    id: "glute-bridge",
    name: "臀桥",
    category: "strength",
    difficulty: "beginner",
    muscles: ["臀大肌", "腘绳肌", "核心"],
    environment: "both",
    equipment: ["mat"],
    imageUrl: "/media/exercises/strength-lower.svg",
    videoUrl: "https://www.nike.com/a/how-to-do-glute-bridges",
    videoTitle: "How to Do Glute Bridges",
    steps: [
      "仰卧屈膝，双脚踩稳地面，脚跟与臀部保持舒适距离。",
      "先轻轻收紧腹部，再用臀部发力把髋抬起，直到肩、髋、膝大致成一条斜线。",
      "顶端停一秒，感受臀部发力，再慢慢落回起始位置。",
    ],
    cues: ["想象把地面向下踩开", "发力重点在臀部，不是下背", "下降也要控制，不要直接掉下去"],
    commonMistakes: ["用腰猛顶上去", "脚离臀太远导致大腿后侧抽筋", "顶端过度后仰", "膝盖左右晃动"],
    alternatives: ["弹力带臀桥", "箱式髋推", "徒手罗马尼亚硬拉"],
    contraindications: ["腰椎急性疼痛时暂停", "髋前侧被顶得很难受时先缩小动作幅度"],
  },
  {
    id: "incline-push-up",
    name: "上斜俯卧撑",
    category: "strength",
    difficulty: "beginner",
    muscles: ["胸肌", "肱三头肌", "核心"],
    environment: "both",
    equipment: ["bench"],
    imageUrl: "/media/exercises/strength-upper.svg",
    videoUrl: "https://www.inspireusafoundation.org/incline-push-up/",
    videoTitle: "Incline Push Up Tutorial",
    steps: [
      "双手放在稳定台面上，手距略宽于肩，身体从头到脚保持一条直线。",
      "屈肘下降，让胸口靠近支撑面，肘部大约朝后外侧 30 到 45 度。",
      "保持腹部收紧，把身体整体推回起始位置。",
    ],
    cues: ["身体像一块板，不要塌腰", "肩膀远离耳朵", "下降和推起速度都要可控"],
    commonMistakes: ["耸肩", "塌腰或抬臀过高", "肘部完全外张", "头先往前探"],
    alternatives: ["墙壁俯卧撑", "跪姿俯卧撑", "器械胸推"],
    contraindications: ["肩前侧疼痛明显时先暂停", "手腕急性疼痛时改用高位器械推举或拳撑变式"],
  },
  {
    id: "dumbbell-row",
    name: "哑铃划船",
    category: "strength",
    difficulty: "beginner",
    muscles: ["背阔肌", "菱形肌", "肱二头肌"],
    environment: "both",
    equipment: ["dumbbell"],
    imageUrl: "/media/exercises/strength-upper.svg",
    videoUrl: "https://www.menshealth.com/fitness/a19548311/how-to-do-a-perfect-single-arm-row/",
    videoTitle: "Single Arm Dumbbell Row Guide",
    steps: [
      "一手扶稳支撑物，髋向后折叠，背部保持平直。",
      "另一只手握住哑铃，先让肩胛轻轻后收，再把肘部朝髋部方向拉近身体。",
      "顶端停顿一下，再控制哑铃慢慢放回起始位置。",
    ],
    cues: ["先收肩胛，再拉手臂", "脖子放松，不要耸肩", "身体不要大幅扭转借力"],
    commonMistakes: ["靠甩身体把重量拉起来", "圆背", "只用手臂发力，背部没有参与", "拉到肩膀前顶"],
    alternatives: ["弹力带划船", "坐姿划船器", "高位下拉"],
    contraindications: ["急性下背痛时先减轻负荷或改成胸托划船", "肩关节拉动时出现刺痛需暂停"],
  },
  {
    id: "plank",
    name: "平板支撑",
    category: "strength",
    difficulty: "beginner",
    muscles: ["核心", "肩部稳定肌", "臀部"],
    environment: "both",
    equipment: ["mat"],
    imageUrl: "/media/exercises/core.svg",
    videoUrl: "https://www.verywellfit.com/the-plank-exercise-3120068",
    videoTitle: "Plank Exercise Guide",
    steps: [
      "前臂撑地，肘部大致放在肩膀正下方，双脚向后伸直。",
      "收紧腹部和臀部，让头、肩、髋、脚跟尽量保持一条直线。",
      "自然呼吸，坚持到动作还稳定为止，再放松结束。",
    ],
    cues: ["宁可缩短时间，也不要塌腰", "肋骨微收，臀部别翘太高", "目光看向地面前方一点点"],
    commonMistakes: ["腰部下沉", "臀部抬太高", "耸肩", "全程憋气"],
    alternatives: ["跪姿平板", "死虫式", "鸟狗式"],
    contraindications: ["肩或腕无法承重时改成死虫式", "腰背出现锐痛时停止"],
  },
  {
    id: "treadmill-walk",
    name: "跑步机快走",
    category: "cardio",
    difficulty: "beginner",
    muscles: ["心肺", "下肢"],
    environment: "gym",
    equipment: ["treadmill"],
    imageUrl: "/media/exercises/cardio.svg",
    videoUrl: "https://www.nordictrack.com/learn/proper-walking-form-on-treadmill/",
    videoTitle: "Treadmill Walking Form",
    steps: [
      "先用较低速度走 2 到 3 分钟热身。",
      "逐渐调整到能完整说短句但心率有提升的快走速度。",
      "结束前再降速 2 分钟，让呼吸慢慢回落。",
    ],
    cues: ["不要一直扶把手", "步幅自然，不用刻意跨太大", "目视前方，别低头看脚"],
    commonMistakes: ["一开始就把速度拉太高", "一直紧抓扶手", "突然停下不降速"],
    alternatives: ["户外快走", "椭圆机", "室内踏步"],
    contraindications: ["头晕、胸闷或膝踝疼痛加重时立即停止"],
  },
  {
    id: "lat-pulldown",
    name: "高位下拉",
    category: "strength",
    difficulty: "beginner",
    muscles: ["背阔肌", "肱二头肌", "肩胛稳定肌"],
    environment: "gym",
    equipment: ["lat pulldown machine"],
    imageUrl: "/media/exercises/strength-upper.svg",
    videoUrl: "https://www.nasm.org/exercise-library/lat-pulldown",
    videoTitle: "Lat Pulldown Tutorial",
    steps: [
      "坐稳并固定大腿，双手略宽于肩握住横杆。",
      "先把肩膀轻轻向下沉，再把横杆拉向上胸位置。",
      "控制回放，不要让重量把手臂突然带回去。",
    ],
    cues: ["胸口轻轻抬起", "不要拉到脖子后面", "整个动作都让肩胛保持稳定"],
    commonMistakes: ["身体后仰过多", "耸肩", "借惯性猛拉", "还原时完全放松失控"],
    alternatives: ["弹力带下拉", "哑铃划船", "坐姿划船"],
    contraindications: ["肩前侧疼痛时先减轻重量或换动作", "肘腕不适时调整握距"],
  },
  {
    id: "stretch-full-body",
    name: "全身拉伸放松",
    category: "mobility",
    difficulty: "beginner",
    muscles: ["髋部", "胸椎", "肩颈", "小腿"],
    environment: "both",
    equipment: ["mat"],
    imageUrl: "/media/exercises/mobility.svg",
    videoUrl: "https://www.verywellfit.com/stretching-exercises-for-flexibility-1231144",
    videoTitle: "Beginner Stretching Guide",
    steps: [
      "按照小腿、大腿前侧、臀部、胸部和肩颈的顺序依次放松。",
      "每个位置停留 20 到 30 秒，以轻微拉伸感为准。",
      "保持自然呼吸，不追求越痛越有效。",
    ],
    cues: ["动作缓慢", "呼气时放松一点点", "出现刺痛就立刻缩小幅度"],
    commonMistakes: ["拉到疼痛", "弹震式拉伸", "憋气"],
    alternatives: ["泡沫轴放松", "低强度瑜伽", "散步恢复"],
    contraindications: ["急性拉伤部位不要强行拉伸", "关节明显肿胀时优先休息和评估"],
  },
];

export function findExercise(id: string) {
  return exerciseLibrary.find((exercise) => exercise.id === id);
}

export function getExercisesForEnvironment(environment: TrainingEnvironment, equipment: string[]) {
  const normalizedEquipment = equipment.map((item) => item.trim().toLowerCase()).filter(Boolean);

  return exerciseLibrary.filter((exercise) => {
    const fitsEnvironment =
      environment === "both" || exercise.environment === "both" || exercise.environment === environment;

    if (!fitsEnvironment) {
      return false;
    }

    if (exercise.equipment.length === 0) {
      return true;
    }

    return exercise.equipment.every((required) => matchesEquipment(required, normalizedEquipment));
  });
}

function matchesEquipment(required: string, owned: string[]) {
  if (required === "mat" || required === "bench") {
    return true;
  }

  const synonyms: Record<string, string[]> = {
    dumbbell: ["dumbbell", "dumbbells", "哑铃"],
    treadmill: ["treadmill", "跑步机"],
    "lat pulldown machine": ["lat pulldown", "lat pulldown machine", "高位下拉", "下拉器"],
  };

  const accepted = synonyms[required] ?? [required];
  return owned.some((item) => accepted.some((alias) => item.includes(alias.toLowerCase())));
}
