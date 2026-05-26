import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

import { buildCompositionHtml } from "./exercise-demo-composition.mjs";
import { buildExerciseTeachingIllustration } from "./exercise-pose-library.mjs";
import { buildHyperframesCommand } from "./hyperframes-command.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectDir = resolve(__dirname, "..");
const workspaceRoot = resolve(projectDir, "..", "..");
const publicGeneratedDir = join(workspaceRoot, "public", "media", "exercises", "generated");
const assetDir = join(projectDir, "assets", "exercise-media");
const indexPath = join(projectDir, "index.html");

const exerciseCatalog = {
  "warmup-march": {
    name: "原地高抬腿热身",
    muscles: ["髋前侧", "核心", "心肺"],
    focus: "先把心率和节奏带起来，同时保持上身稳定和脚步轻。",
    steps: ["站稳后再开始交替抬膝", "用髋前侧主动提膝", "脚步轻落地，呼吸自然"],
    cues: ["别靠后仰甩腿", "核心轻收紧", "先稳住节奏再提速"],
    mistakes: ["上身后仰", "落地太重", "抬膝过高导致骨盆前倾"],
    caution: "踝、膝、胸闷或头晕不适时先停下来。",
  },
  "bodyweight-squat": {
    name: "徒手深蹲",
    muscles: ["股四头肌", "臀部", "核心"],
    focus: "先把髋膝配合和脚底重心做对，再谈深度。",
    steps: ["双脚站稳，脚尖微外开", "臀部向后坐，膝盖顺脚尖方向弯曲", "全脚掌发力站起"],
    cues: ["膝盖和脚尖同向", "胸口打开，脊柱中立", "全程可控，不要弹起"],
    mistakes: ["膝盖内扣", "塌腰圆背", "重心全跑到前脚掌"],
    caution: "膝或腰髋有锐痛时，先缩小幅度或停止。",
  },
  "glute-bridge": {
    name: "臀桥",
    muscles: ["臀大肌", "腿后侧", "核心"],
    focus: "把发力从下背转到臀部，让髋伸更干净。",
    steps: ["仰卧屈膝，双脚踩稳", "收紧腹部后再抬髋", "顶端停一下再受控落下"],
    cues: ["像把地面向下踩开", "发力重点在臀部", "回程也要控制"],
    mistakes: ["顶腰", "脚离臀太远", "过度后仰"],
    caution: "腰椎急性疼痛时先暂停。",
  },
  "incline-push-up": {
    name: "上斜俯卧撑",
    muscles: ["胸肌", "肱三头肌", "核心"],
    focus: "身体像一块板，先把胸肩稳定做干净。",
    steps: ["双手放稳，身体成一条斜线", "胸口靠近支撑面", "整体推回起点"],
    cues: ["别耸肩", "核心持续收紧", "推起时把支撑面推远"],
    mistakes: ["塌腰", "臀部抬太高", "肘完全外张"],
    caution: "肩前侧或手腕刺痛时，先抬高支撑面。",
  },
  "dumbbell-row": {
    name: "哑铃划船",
    muscles: ["背阔肌", "菱形肌", "肱二头肌"],
    focus: "先收肩胛，再把手肘往后拉，别只靠手臂。",
    steps: ["扶稳支撑物，髋折叠", "先后收肩胛，再把肘往髋拉", "顶端停顿后再受控放回"],
    cues: ["胸口打开", "脖子放松", "躯干别左右乱扭"],
    mistakes: ["圆背", "耸肩", "甩身体借力"],
    caution: "下背不适时先减轻重量或改支撑版本。",
  },
  "band-row": {
    name: "弹力带划船",
    muscles: ["背阔肌", "菱形肌", "后束三角肌"],
    focus: "先固定躯干，再让肩胛和背部带动拉力。",
    steps: ["固定弹力带并站稳", "先收肩胛，再把手肘向后拉", "回程受控保持张力"],
    cues: ["肩膀远离耳朵", "别后仰借力", "回程不要弹回去"],
    mistakes: ["身体后仰", "耸肩", "回放过快"],
    caution: "固定点不稳时先别继续拉。",
  },
  plank: {
    name: "平板支撑",
    muscles: ["核心", "肩部稳定肌", "臀部"],
    focus: "让核心持续收紧，而不是靠下背硬撑。",
    steps: ["肘在肩下，双脚向后伸直", "头肩髋脚跟尽量一条线", "自然呼吸并保持稳定"],
    cues: ["肋骨微收", "臀部别翘太高", "宁可时间短也别散架"],
    mistakes: ["塌腰", "臀部过高", "耸肩"],
    caution: "腰背或肩肘刺痛时立刻停。",
  },
  "treadmill-walk": {
    name: "跑步机快走",
    muscles: ["心肺", "下肢"],
    focus: "通过稳定步频和自然摆臂把心率带起来。",
    steps: ["先低速热身", "把速度提到能说短句的强度", "结束前降速缓下来"],
    cues: ["别一直扶把手", "视线看前方", "步幅自然"],
    mistakes: ["一开始就太快", "死抓扶手", "突然停下不减速"],
    caution: "胸闷、头晕或膝踝痛加重时停止。",
  },
  "step-cardio": {
    name: "台阶踏步有氧",
    muscles: ["心肺", "下肢", "核心"],
    focus: "先把踩稳和重心控制做好，再提节奏。",
    steps: ["先低节奏热身", "整脚踩稳再换脚", "结束前放慢恢复"],
    cues: ["全脚掌踩稳", "髋膝一起发力", "眼睛看前方"],
    mistakes: ["台阶太高", "踩不稳", "一直低头看脚"],
    caution: "头晕或膝踝疼痛加重时先停。",
  },
  "lat-pulldown": {
    name: "高位下拉",
    muscles: ["背阔肌", "肱二头肌", "肩胛稳定肌"],
    focus: "先沉肩，再把横杆拉向上胸，不要拉到脑后。",
    steps: ["坐稳并固定大腿", "先沉肩，再把横杆拉向上胸", "受控还原，不要猛放"],
    cues: ["胸口轻轻抬起", "别大幅后仰", "整套动作都别耸肩"],
    mistakes: ["横杆拉到脑后", "后仰太多", "靠惯性猛拉"],
    caution: "肩前侧或肘不适明显时先减重。",
  },
  "machine-chest-press": {
    name: "器械胸推",
    muscles: ["胸肌", "肱三头肌", "前三角"],
    focus: "手腕中立、肩膀下沉，让胸口把把手推出去。",
    steps: ["调好座椅，让把手对到胸口中部", "收紧肩胛和腹部后推出把手", "受控回程，不让配重反弹"],
    cues: ["别扣腕", "别耸肩", "推起时像把把手送远"],
    mistakes: ["手腕后扣", "耸肩顶重量", "座椅位置不对"],
    caution: "肩前侧刺痛时先减重或调整握法。",
  },
  "seated-cable-row": {
    name: "坐姿划船器",
    muscles: ["背阔肌", "菱形肌", "后束三角肌"],
    focus: "胸口打开，先收肩胛，再把把手拉向下肋。",
    steps: ["坐稳踩住踏板", "先收肩胛，再把肘沿身体两侧拉回", "慢慢伸回去保持张力"],
    cues: ["别圆背", "别靠前后晃借力", "回程也要受控"],
    mistakes: ["猛然后仰", "圆背前冲", "全靠手臂拉"],
    caution: "下背不适时先减重或缩小幅度。",
  },
  "goblet-squat": {
    name: "哑铃杯状深蹲",
    muscles: ["股四头肌", "臀部", "核心"],
    focus: "哑铃贴近胸前，先把膝盖轨迹和躯干稳定做好。",
    steps: ["双手托住哑铃贴近胸前", "臀部向后坐，膝盖顺脚尖方向弯曲", "全脚掌发力站起"],
    cues: ["别让重量离身", "膝盖别内扣", "先稳住再求深"],
    mistakes: ["抱铃离身", "膝盖内扣", "上身前栽"],
    caution: "腕、肘、膝髋有锐痛时先减重或停。",
  },
  "leg-press": {
    name: "腿举机推腿",
    muscles: ["股四头肌", "臀部", "腿后侧"],
    focus: "臀部和下背贴稳座椅，膝盖顺着脚尖方向发力。",
    steps: ["背部和臀部贴稳靠背", "受控屈膝让踏板靠近", "推回接近伸直时停住"],
    cues: ["别锁死膝盖", "别让臀部离座", "全程受控别弹起"],
    mistakes: ["膝盖锁死", "臀部离座", "膝盖内扣"],
    caution: "膝前侧或下背不适明显时先减重。",
  },
  "stretch-full-body": {
    name: "全身拉伸放松",
    muscles: ["髋部", "胸椎", "肩颈", "小腿"],
    focus: "用缓慢呼吸把身体放松下来，不要追求疼痛感。",
    steps: ["先上举延展", "再做轻柔侧屈", "每个位置停留并自然呼吸"],
    cues: ["动作越慢越好", "呼气时再放松一点", "有刺痛立刻缩小幅度"],
    mistakes: ["拉到疼痛", "弹震式拉伸", "塌腰耸肩"],
    caution: "关节明显肿胀或急性拉伤时先休息评估。",
  },
};

const requestedExercises = process.argv.slice(2);
const exerciseIds = requestedExercises.length > 0 ? requestedExercises : Object.keys(exerciseCatalog);

mkdirSync(assetDir, { recursive: true });
mkdirSync(publicGeneratedDir, { recursive: true });

for (const exerciseId of exerciseIds) {
  const exercise = exerciseCatalog[exerciseId];
  if (!exercise) {
    throw new Error(`Unknown exercise id: ${exerciseId}`);
  }

  const properSvg = buildExerciseTeachingIllustration({
    exerciseId,
    exercise,
    variant: "proper",
  });
  const mistakeSvg = buildExerciseTeachingIllustration({
    exerciseId,
    exercise,
    variant: "mistake",
  });

  const publicProperPath = join(publicGeneratedDir, `${exerciseId}-proper.svg`);
  const publicMistakePath = join(publicGeneratedDir, `${exerciseId}-mistake.svg`);
  const assetProperPath = join(assetDir, `${exerciseId}-proper.svg`);
  const assetMistakePath = join(assetDir, `${exerciseId}-mistake.svg`);

  writeFileSync(publicProperPath, properSvg);
  writeFileSync(publicMistakePath, mistakeSvg);
  writeFileSync(assetProperPath, properSvg);
  writeFileSync(assetMistakePath, mistakeSvg);

  writeFileSync(
    indexPath,
    buildCompositionHtml({
      exerciseId,
      exercise,
      properImagePath: `assets/exercise-media/${exerciseId}-proper.svg`,
      mistakeImagePath: `assets/exercise-media/${exerciseId}-mistake.svg`,
      properIllustration: properSvg,
      mistakeIllustration: mistakeSvg,
    }),
  );

  runHyperframes(["lint"], projectDir);
  runHyperframes(["validate"], projectDir);
  runHyperframes(["inspect"], projectDir, { allowFailure: true });
  runHyperframes(
    ["render", "--output", join(publicGeneratedDir, `${exerciseId}-demo.mp4`)],
    projectDir,
  );
}

function runHyperframes(args, cwd, options = {}) {
  const env = {
    ...process.env,
    Path: [
      join(workspaceRoot, "node_modules", "ffmpeg-static"),
      join(workspaceRoot, "node_modules", "ffprobe-static", "bin", "win32", "x64"),
      process.env.Path ?? "",
    ].join(";"),
  };
  const command = buildHyperframesCommand(args);

  try {
    execFileSync(command.file, command.args, {
      cwd,
      env,
      stdio: "inherit",
    });
    return true;
  } catch (error) {
    if (!options.allowFailure) {
      throw error;
    }

    console.warn(`[hyperframes] ${args.join(" ")} exited non-zero in this environment; continuing.`);
    return false;
  }
}
