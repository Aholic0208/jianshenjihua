import { copyFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

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
    focus: "把心率慢慢带起来，同时保持身体立直和脚步轻。",
    steps: [
      "下巴微收，肋骨叠在骨盆上方，先让身体站稳。",
      "交替提膝到接近髋部的舒服高度，配合对侧手臂摆动。",
      "前脚掌轻触地面后再平稳落下，全程呼吸顺畅。",
    ],
    cues: [
      "主动用髋前侧把膝盖提起，不要靠后仰甩腿。",
      "核心轻轻收紧，上身像被向上提着一样保持直立。",
      "先做稳，再逐渐提节奏，不用一开始就追求很快。",
    ],
    mistakes: ["上身后仰", "落地太重", "抬腿过高导致骨盆前倾"],
    caution: "如果踝关节疼痛、胸闷或头晕，先立即停下。",
  },
  "bodyweight-squat": {
    name: "徒手深蹲",
    focus: "先把坐髋、膝盖方向和脚底重心控制住。",
    steps: [
      "双脚略宽于肩，脚尖自然微微外开，站稳后再开始下蹲。",
      "像坐向身后椅子一样把髋向后坐，膝盖顺着脚尖方向弯曲。",
      "下降到腰背还能稳定的深度，再用脚掌发力站起。",
    ],
    cues: [
      "想象脚底把地面轻轻踩开，膝盖保持和脚尖同向。",
      "胸口保持打开，脊柱中立，不要塌腰也不要弓背。",
      "站起时先让臀部和大腿一起发力，不要借惯性弹起来。",
    ],
    mistakes: ["膝盖内扣", "塌腰或圆背", "重心跑到前脚掌"],
    caution: "膝盖或腰髋出现锐痛时，不要继续加深幅度。",
  },
  "glute-bridge": {
    name: "臀桥",
    focus: "把发力从下背转到臀部，让髋伸展更干净。",
    steps: [
      "仰卧屈膝，双脚踩稳地面，脚跟与臀部保持舒适距离。",
      "先轻轻收紧腹部，再用臀部发力把髋抬起。",
      "顶端停一秒，感受臀部收紧，再慢慢落回地面。",
    ],
    cues: [
      "想象脚掌把地面向下踩开，臀部主动向上推。",
      "顶端时肋骨别外翻，避免用腰去顶。",
      "下降过程也要控制，别直接掉下去。",
    ],
    mistakes: ["用腰猛顶", "脚离臀太远", "顶端过度后仰"],
    caution: "如果腰椎急性疼痛，先暂停这个动作。",
  },
  "incline-push-up": {
    name: "上斜俯卧撑",
    focus: "保持整条身体像一块板，别让肩和腰代偿。",
    steps: [
      "双手放在稳定台面上，手距略宽于肩，身体从头到脚保持一条直线。",
      "屈肘下降，让胸口靠近支撑面，肘部大约朝后外侧 30 到 45 度。",
      "腹部收紧，把身体整体推回起始位置。",
    ],
    cues: [
      "下压时先把肩膀远离耳朵，别耸肩。",
      "核心要一直收紧，避免塌腰或屁股翘太高。",
      "推起时想象把支撑面推远，而不是只用手臂乱顶。",
    ],
    mistakes: ["耸肩", "塌腰或抬臀过高", "肘部完全外张"],
    caution: "肩前侧或手腕有明显刺痛时先停。",
  },
  "dumbbell-row": {
    name: "哑铃划船",
    focus: "先收肩胛，再拉手肘，让背部真正参与。",
    steps: [
      "一手扶稳支撑物，髋向后折叠，背部保持平直。",
      "另一只手握住哑铃，先轻轻后收肩胛，再把手肘朝髋部方向拉近身体。",
      "顶端停顿一下，再控制哑铃慢慢放回起始位置。",
    ],
    cues: [
      "先让肩胛向后下方收紧，再开始拉手臂。",
      "脖子保持放松，肩膀不要耸到耳边。",
      "身体稳定住，不要靠扭腰或甩身体借力。",
    ],
    mistakes: ["圆背", "靠甩身体提重量", "只用手臂发力"],
    caution: "急性下背痛时先减轻负荷，必要时改成胸托版本。",
  },
  "band-row": {
    name: "弹力带划船",
    focus: "拉的时候先稳定身体，再让肩胛和背部带动动作。",
    steps: [
      "把弹力带固定在稳定位置，双手握住后先站稳或坐稳。",
      "收紧腹部，先后收肩胛，再把手肘沿身体两侧向后拉。",
      "顶端停一秒，再慢慢送回起始位置。",
    ],
    cues: [
      "肩膀远离耳朵，拉的时候胸口保持展开。",
      "回程也要控制，不要让弹力带突然弹回去。",
      "全程先稳定核心，再去拉手臂。",
    ],
    mistakes: ["身体后仰借力", "耸肩", "回放太快失去张力"],
    caution: "固定点不稳时不要继续拉，先确认安全。",
  },
  plank: {
    name: "平板支撑",
    focus: "让核心和臀部共同稳定身体，别用腰硬撑。",
    steps: [
      "前臂撑地，肘部放在肩下方，双脚向后伸直。",
      "收紧腹部和臀部，让头、肩、髋、脚跟尽量成一直线。",
      "保持自然呼吸，坚持到动作还能稳定为止。",
    ],
    cues: [
      "想象肋骨往里收，腰不要往下掉。",
      "屁股不要翘太高，保持身体像平板一样稳定。",
      "宁可时间短一点，也不要姿势越来越散。",
    ],
    mistakes: ["腰部下沉", "臀部抬太高", "耸肩"],
    caution: "腰背或肩腕出现锐痛时立刻停下。",
  },
  "treadmill-walk": {
    name: "跑步机快走",
    focus: "通过稳定步频和自然摆臂把心率抬起来。",
    steps: [
      "先用较低速度走 2 到 3 分钟热身。",
      "逐渐调整到能说短句但心率明显提高的快走速度。",
      "结束前再降速 2 分钟，让呼吸慢慢回落。",
    ],
    cues: [
      "目视前方，肩膀放松，不要一直低头看脚。",
      "摆臂自然，别死死抓着扶手。",
      "步幅自然，不需要刻意迈得很大。",
    ],
    mistakes: ["一开始就速度过快", "一直抓扶手", "突然停下不降速"],
    caution: "头晕、胸闷或膝踝不适加重时立即停止。",
  },
  "step-cardio": {
    name: "台阶踏步有氧",
    focus: "先稳住脚步和重心，再把节奏和心率带起来。",
    steps: [
      "选择稳定的低台阶或矮凳，先用较慢节奏上下踏步热身。",
      "上台阶时让整只脚踩稳，再换另一只脚跟上；下台阶时同样稳稳落地。",
      "逐渐提速，但始终保持上身直立、呼吸顺畅，结束前再慢下来。",
    ],
    cues: [
      "全脚掌踩稳再换脚，不要只用前脚掌点一下就急着起步。",
      "髋和膝一起发力，身体向上而不是向前扑。",
      "眼睛看前方，手臂自然配合摆动，不要一直低头找脚。",
    ],
    mistakes: ["台阶过高导致动作变形", "速度过快踩不稳", "一直低头看脚影响节奏"],
    caution: "如果头晕或膝踝疼痛加剧，先立刻停下来。",
  },
  "lat-pulldown": {
    name: "高位下拉",
    focus: "先沉肩，再拉肘，避免用身体后仰去拽重量。",
    steps: [
      "坐稳并固定大腿，双手略宽于肩握住横杆。",
      "先把肩膀轻轻向下沉，再把横杆拉向上胸位置。",
      "控制回放，不要让重量把手臂突然带回去。",
    ],
    cues: [
      "胸口轻轻抬起，但不要大幅后仰借力。",
      "想象手肘向下向后走，而不是只想着手往下拉。",
      "整个动作都让肩胛保持稳定，不要耸肩。",
    ],
    mistakes: ["身体后仰过多", "耸肩", "借惯性猛拉"],
    caution: "肩前侧或肘腕不适明显时，先减轻重量或停下。",
  },
  "stretch-full-body": {
    name: "全身拉伸放松",
    focus: "用缓慢呼吸把身体放松下来，不要追求疼痛感。",
    steps: [
      "按小腿、大腿前侧、臀部、胸部和肩颈的顺序依次放松。",
      "每个位置停留 20 到 30 秒，以轻微拉伸感为准。",
      "保持自然呼吸，慢慢让肌肉放松下来。",
    ],
    cues: [
      "呼气时放松一点点，不要突然弹震。",
      "动作越慢越好，别急着切换下一个部位。",
      "只要有刺痛，就立刻缩小幅度或停下。",
    ],
    mistakes: ["拉到疼痛", "弹震式拉伸", "憋气"],
    caution: "急性拉伤或关节肿胀时，不要强行拉伸。",
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

  const properSource = resolveImageSource(exerciseId, "proper");
  const localAssetName = `${exerciseId}-proper${properSource.ext}`;
  const localAssetPath = join(assetDir, localAssetName);
  copyFileSync(properSource.sourcePath, localAssetPath);

  writeFileSync(indexPath, buildCompositionHtml({
    exerciseId,
    exercise,
    imagePath: `assets/exercise-media/${localAssetName}`,
  }));

  runHyperframes(["lint"], projectDir);
  runHyperframes(["validate"], projectDir);
  runHyperframes(["inspect"], projectDir, { allowFailure: true });
  runHyperframes(
    [
      "render",
      "--output",
      join(publicGeneratedDir, `${exerciseId}-demo.mp4`),
      "--quality",
      "draft",
    ],
    projectDir,
  );
}

function resolveImageSource(exerciseId, kind) {
  const generatedName = `${exerciseId}-${kind}.png`;
  const generatedPath = join(publicGeneratedDir, generatedName);
  if (existsSync(generatedPath)) {
    return { sourcePath: generatedPath, ext: ".png" };
  }

  const fallbackMap = {
    "warmup-march": "warmup.svg",
    "bodyweight-squat": "strength-lower.svg",
    "glute-bridge": "strength-lower.svg",
    "incline-push-up": "strength-upper.svg",
    "dumbbell-row": "strength-upper.svg",
    "band-row": "strength-upper.svg",
    plank: "core.svg",
    "treadmill-walk": "cardio.svg",
    "step-cardio": "cardio.svg",
    "lat-pulldown": "strength-upper.svg",
    "stretch-full-body": "mobility.svg",
  };
  const fallback = fallbackMap[exerciseId];
  if (!fallback) {
    throw new Error(`No fallback image configured for ${exerciseId}`);
  }

  return {
    sourcePath: join(workspaceRoot, "public", "media", "exercises", fallback),
    ext: ".svg",
  };
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

    console.warn(`[hyperframes] ${args.join(" ")} exited non-zero in this environment; continuing with render.`);
    return false;
  }
}

function buildCompositionHtml({ exerciseId, exercise, imagePath }) {
  const steps = exercise.steps.slice(0, 3).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  const cues = exercise.cues.slice(0, 3).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  const mistakes = exercise.mistakes.slice(0, 3).map((item) => `<li>${escapeHtml(item)}</li>`).join("");

  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body {
        width: 1920px;
        height: 1080px;
        overflow: hidden;
        background: #f4f7f5;
        font-family: "Segoe UI", "Roboto", "Inter", sans-serif;
        color: #16211d;
      }
      #root {
        position: relative;
        width: 100%;
        height: 100%;
        background:
          radial-gradient(circle at top right, rgba(37, 99, 235, 0.12), transparent 28%),
          linear-gradient(180deg, #f4f7f5 0%, #eef4f2 100%);
      }
      .clip { position: absolute; }
      .eyebrow {
        top: 64px;
        left: 72px;
        display: inline-flex;
        align-items: center;
        gap: 14px;
        padding: 12px 20px;
        border-radius: 999px;
        background: #e9f5ef;
        color: #1c6b4b;
        font-size: 22px;
        font-weight: 700;
        letter-spacing: 0;
      }
      .title-block {
        top: 132px;
        left: 72px;
        width: 760px;
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
      .title-block h1 {
        font-size: 74px;
        line-height: 1.05;
        font-weight: 800;
      }
      .title-block p {
        font-size: 28px;
        line-height: 1.5;
        color: #44544d;
      }
      .hero-card {
        top: 298px;
        left: 72px;
        width: 760px;
        height: 690px;
        padding: 36px;
        border-radius: 32px;
        background: rgba(255,255,255,0.96);
        box-shadow: 0 28px 80px rgba(22, 33, 29, 0.12);
      }
      .hero-card img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
      .panel {
        right: 72px;
        width: 944px;
        padding: 34px 38px;
        border-radius: 28px;
        background: rgba(255,255,255,0.96);
        box-shadow: 0 22px 64px rgba(22, 33, 29, 0.1);
      }
      .panel h2 {
        font-size: 34px;
        margin-bottom: 18px;
      }
      .panel ol,
      .panel ul {
        padding-left: 28px;
        display: flex;
        flex-direction: column;
        gap: 14px;
        font-size: 26px;
        line-height: 1.45;
        color: #33413b;
      }
      .panel-steps { top: 152px; height: 286px; }
      .panel-cues { top: 470px; height: 252px; border: 2px solid rgba(28, 107, 75, 0.14); }
      .panel-mistakes { top: 754px; height: 234px; border: 2px solid rgba(183, 110, 31, 0.18); }
      .panel-mistakes ul {
        gap: 10px;
        font-size: 24px;
        line-height: 1.35;
      }
      .mistake-tag {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 14px;
        padding: 10px 16px;
        border-radius: 999px;
        background: #fff6ea;
        color: #9a5b16;
        font-size: 22px;
        font-weight: 700;
      }
      .footer-note {
        left: 72px;
        bottom: 34px;
        width: 1776px;
        padding: 20px 28px;
        border-radius: 22px;
        background: rgba(22, 33, 29, 0.92);
        color: #ffffff;
        font-size: 26px;
        line-height: 1.45;
      }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="10" data-width="1920" data-height="1080">
      <div id="eyebrow" class="clip eyebrow" data-start="0" data-duration="10" data-track-index="1">站内讲解视频 · ${escapeHtml(exercise.name)}</div>
      <div id="title" class="clip title-block" data-start="0" data-duration="10" data-track-index="2">
        <h1>${escapeHtml(exercise.name)}</h1>
        <p>${escapeHtml(exercise.focus)}</p>
      </div>
      <div id="hero" class="clip hero-card" data-start="0.2" data-duration="9.8" data-track-index="3">
        <img src="${imagePath}" alt="${escapeHtml(exercise.name)} 标准动作示意" crossorigin="anonymous" />
      </div>
      <div id="steps" class="clip panel panel-steps" data-start="0.5" data-duration="9.5" data-track-index="4">
        <h2>动作要领</h2>
        <ol>${steps}</ol>
      </div>
      <div id="cues" class="clip panel panel-cues" data-start="2.3" data-duration="7.7" data-track-index="5">
        <h2>发力技巧</h2>
        <ul>${cues}</ul>
      </div>
      <div id="mistakes" class="clip panel panel-mistakes" data-start="5.1" data-duration="4.9" data-track-index="6">
        <div class="mistake-tag">新手最容易错的地方</div>
        <ul>${mistakes}</ul>
      </div>
      <div id="footer" class="clip footer-note" data-start="7.3" data-duration="2.7" data-track-index="7">${escapeHtml(exercise.caution)}</div>
    </div>

    <script>
      window.__timelines = window.__timelines || {};
      const tl = gsap.timeline({ paused: true });
      tl.from("#eyebrow", { y: 24, opacity: 0, duration: 0.55, ease: "power3.out" }, 0.15);
      tl.from("#title", { y: 40, opacity: 0, duration: 0.7, ease: "expo.out" }, 0.28);
      tl.from("#hero", { x: -42, opacity: 0, duration: 0.85, ease: "power3.out" }, 0.45);
      tl.from("#steps", { x: 54, opacity: 0, duration: 0.7, ease: "power2.out" }, 0.6);
      tl.from("#cues", { x: 42, opacity: 0, duration: 0.62, ease: "power3.out" }, 2.35);
      tl.from("#mistakes", { x: 40, opacity: 0, duration: 0.58, ease: "expo.out" }, 5.15);
      tl.from("#footer", { y: 26, opacity: 0, duration: 0.5, ease: "power2.out" }, 7.35);
      tl.to("#root", { opacity: 0, duration: 0.45, ease: "power2.in" }, 9.45);
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");
}
