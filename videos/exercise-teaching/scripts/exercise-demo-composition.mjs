const MOTION_PRESETS = {
  "warmup-march": {
    motionProfile: "march-rhythm",
    title: "节奏示范",
    legend: "红色高亮 = 当前主要发力区域",
    hotspots: [
      { id: "hotspot-primary", className: "hotspot hotspot-primary", cx: 360, cy: 314, rx: 64, ry: 86 },
      { id: "hotspot-secondary", className: "hotspot hotspot-secondary", cx: 320, cy: 522, rx: 54, ry: 110 },
      { id: "hotspot-tertiary", className: "hotspot hotspot-tertiary", cx: 400, cy: 522, rx: 54, ry: 110 },
    ],
  },
  "bodyweight-squat": {
    motionProfile: "squat-drive",
    title: "下肢发力示范",
    legend: "红色高亮 = 重点驱动的腿臀区域",
    hotspots: [
      { id: "hotspot-primary", className: "hotspot hotspot-primary", cx: 360, cy: 510, rx: 88, ry: 126 },
      { id: "hotspot-secondary", className: "hotspot hotspot-secondary", cx: 360, cy: 378, rx: 62, ry: 74 },
    ],
  },
  "glute-bridge": {
    motionProfile: "bridge-drive",
    title: "臀桥发力示范",
    legend: "红色高亮 = 重点驱动的臀腿后侧",
    hotspots: [
      { id: "hotspot-primary", className: "hotspot hotspot-primary", cx: 360, cy: 430, rx: 90, ry: 76 },
      { id: "hotspot-secondary", className: "hotspot hotspot-secondary", cx: 440, cy: 520, rx: 70, ry: 104 },
    ],
  },
  "incline-push-up": {
    motionProfile: "press-line",
    title: "推举路径示范",
    legend: "红色高亮 = 胸肩与核心稳定区域",
    hotspots: [
      { id: "hotspot-primary", className: "hotspot hotspot-primary", cx: 360, cy: 286, rx: 96, ry: 74 },
      { id: "hotspot-secondary", className: "hotspot hotspot-secondary", cx: 360, cy: 390, rx: 64, ry: 84 },
    ],
  },
  "dumbbell-row": {
    motionProfile: "row-squeeze",
    title: "划船路径示范",
    legend: "红色高亮 = 背部收紧和后链稳定区域",
    hotspots: [
      { id: "hotspot-primary", className: "hotspot hotspot-primary", cx: 360, cy: 310, rx: 102, ry: 92 },
      { id: "hotspot-secondary", className: "hotspot hotspot-secondary", cx: 420, cy: 448, rx: 70, ry: 82 },
    ],
  },
  "band-row": {
    motionProfile: "row-squeeze",
    title: "划船路径示范",
    legend: "红色高亮 = 背部收紧和后链稳定区域",
    hotspots: [
      { id: "hotspot-primary", className: "hotspot hotspot-primary", cx: 360, cy: 310, rx: 102, ry: 92 },
      { id: "hotspot-secondary", className: "hotspot hotspot-secondary", cx: 420, cy: 448, rx: 70, ry: 82 },
    ],
  },
  plank: {
    motionProfile: "brace-hold",
    title: "核心稳定示范",
    legend: "红色高亮 = 需要持续收紧的核心链条",
    hotspots: [
      { id: "hotspot-primary", className: "hotspot hotspot-primary", cx: 360, cy: 360, rx: 92, ry: 122 },
      { id: "hotspot-secondary", className: "hotspot hotspot-secondary", cx: 360, cy: 500, rx: 72, ry: 108 },
    ],
  },
  "treadmill-walk": {
    motionProfile: "march-rhythm",
    title: "步频示范",
    legend: "红色高亮 = 主要参与的髋腿驱动区域",
    hotspots: [
      { id: "hotspot-primary", className: "hotspot hotspot-primary", cx: 360, cy: 314, rx: 64, ry: 86 },
      { id: "hotspot-secondary", className: "hotspot hotspot-secondary", cx: 320, cy: 522, rx: 54, ry: 110 },
      { id: "hotspot-tertiary", className: "hotspot hotspot-tertiary", cx: 400, cy: 522, rx: 54, ry: 110 },
    ],
  },
  "step-cardio": {
    motionProfile: "march-rhythm",
    title: "踏步节奏示范",
    legend: "红色高亮 = 主要参与的髋腿驱动区域",
    hotspots: [
      { id: "hotspot-primary", className: "hotspot hotspot-primary", cx: 360, cy: 314, rx: 64, ry: 86 },
      { id: "hotspot-secondary", className: "hotspot hotspot-secondary", cx: 320, cy: 522, rx: 54, ry: 110 },
      { id: "hotspot-tertiary", className: "hotspot hotspot-tertiary", cx: 400, cy: 522, rx: 54, ry: 110 },
    ],
  },
  "lat-pulldown": {
    motionProfile: "pull-down",
    title: "下拉路径示范",
    legend: "红色高亮 = 背阔与中背发力区域",
    hotspots: [
      { id: "hotspot-primary", className: "hotspot hotspot-primary", cx: 360, cy: 302, rx: 104, ry: 96 },
      { id: "hotspot-secondary", className: "hotspot hotspot-secondary", cx: 360, cy: 402, rx: 72, ry: 86 },
    ],
  },
  "stretch-full-body": {
    motionProfile: "mobility-flow",
    title: "放松路径示范",
    legend: "红色高亮 = 当前重点拉伸或发力区域",
    hotspots: [
      { id: "hotspot-primary", className: "hotspot hotspot-primary", cx: 360, cy: 246, rx: 128, ry: 98 },
      { id: "hotspot-secondary", className: "hotspot hotspot-secondary", cx: 360, cy: 406, rx: 82, ry: 100 },
      { id: "hotspot-tertiary", className: "hotspot hotspot-tertiary", cx: 360, cy: 548, rx: 108, ry: 126 },
    ],
    highlightShells: [
      { id: "highlight-shoulders", className: "highlight-shell highlight-shell-primary", cx: 360, cy: 226, rx: 140, ry: 54 },
      { id: "highlight-core", className: "highlight-shell highlight-shell-secondary", cx: 360, cy: 368, rx: 96, ry: 134 },
      { id: "highlight-lower", className: "highlight-shell highlight-shell-tertiary", cx: 360, cy: 546, rx: 118, ry: 138 },
    ],
    motionPaths: [
      { id: "motion-arc-left", className: "motion-path motion-path-primary", d: "M 292 258 C 246 220, 224 158, 236 102" },
      { id: "motion-arc-right", className: "motion-path motion-path-primary", d: "M 428 258 C 474 220, 496 158, 484 102" },
      { id: "motion-sway", className: "motion-path motion-path-secondary", d: "M 278 334 C 324 294, 396 294, 442 334" },
    ],
  },
};

const DEFAULT_PRESET = {
  motionProfile: "mobility-flow",
  title: "动作路径示范",
  legend: "红色高亮 = 当前重点发力区域",
  hotspots: [
    { id: "hotspot-primary", className: "hotspot hotspot-primary", cx: 360, cy: 310, rx: 96, ry: 86 },
    { id: "hotspot-secondary", className: "hotspot hotspot-secondary", cx: 360, cy: 474, rx: 78, ry: 108 },
  ],
  highlightShells: [],
  motionPaths: [],
};

export function buildCompositionHtml({ exerciseId, exercise, imagePath = "" }) {
  const preset = MOTION_PRESETS[exerciseId] ?? DEFAULT_PRESET;
  const steps = exercise.steps.slice(0, 3).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  const cues = exercise.cues.slice(0, 3).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  const mistakes = exercise.mistakes.slice(0, 3).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  const referenceBlock = imagePath
    ? `<div class="reference-card">
        <div class="reference-copy">姿势参考</div>
        <img src="${escapeHtml(imagePath)}" alt="${escapeHtml(exercise.name)} 静态姿势参考" crossorigin="anonymous" />
      </div>`
    : "";

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
        background: #f2f6f4;
        font-family: "Segoe UI", "Inter", "Microsoft YaHei", sans-serif;
        color: #17231d;
      }
      #root {
        position: relative;
        width: 100%;
        height: 100%;
        background:
          radial-gradient(circle at top right, rgba(59, 130, 246, 0.14), transparent 28%),
          radial-gradient(circle at bottom left, rgba(16, 185, 129, 0.12), transparent 32%),
          linear-gradient(180deg, #f6f8f7 0%, #edf3f0 100%);
      }
      .clip { position: absolute; }
      .eyebrow {
        top: 56px;
        left: 72px;
        display: inline-flex;
        align-items: center;
        gap: 14px;
        padding: 12px 22px;
        border-radius: 999px;
        background: rgba(20, 152, 106, 0.14);
        color: #156a4a;
        font-size: 22px;
        font-weight: 700;
      }
      .title-block {
        top: 122px;
        left: 72px;
        width: 760px;
        display: flex;
        flex-direction: column;
        gap: 18px;
      }
      .title-block h1 {
        font-size: 76px;
        line-height: 1.02;
        font-weight: 800;
      }
      .title-block p {
        font-size: 28px;
        line-height: 1.46;
        color: #42544a;
      }
      .legend-chip {
        top: 254px;
        left: 72px;
        display: inline-flex;
        align-items: center;
        gap: 12px;
        padding: 14px 20px;
        border-radius: 18px;
        background: rgba(255, 255, 255, 0.86);
        box-shadow: 0 18px 40px rgba(22, 33, 29, 0.08);
        font-size: 21px;
        color: #4f5d57;
      }
      .legend-dot {
        width: 14px;
        height: 14px;
        border-radius: 999px;
        background: #ff5858;
        box-shadow: 0 0 18px rgba(255, 88, 88, 0.65);
      }
      .robot-stage-shell {
        top: 328px;
        left: 72px;
        width: 856px;
        height: 664px;
        border-radius: 34px;
        padding: 24px;
        background: rgba(255, 255, 255, 0.92);
        box-shadow: 0 28px 80px rgba(22, 33, 29, 0.12);
      }
      .robot-stage {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
        border-radius: 28px;
        background:
          linear-gradient(180deg, rgba(14, 116, 144, 0.12), rgba(14, 116, 144, 0.02)),
          linear-gradient(180deg, rgba(11, 18, 32, 0.96), rgba(22, 34, 48, 0.98));
      }
      .robot-stage::before {
        content: "";
        position: absolute;
        inset: 28px;
        border-radius: 24px;
        border: 1px solid rgba(148, 163, 184, 0.2);
      }
      .robot-stage::after {
        content: "";
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 116px;
        background: linear-gradient(180deg, rgba(4, 12, 25, 0), rgba(4, 12, 25, 0.62));
      }
      .stage-grid {
        position: absolute;
        inset: 0;
        background-image:
          linear-gradient(rgba(148, 163, 184, 0.08) 1px, transparent 1px),
          linear-gradient(90deg, rgba(148, 163, 184, 0.08) 1px, transparent 1px);
        background-size: 56px 56px;
        mask-image: linear-gradient(180deg, rgba(255,255,255,0.78), rgba(255,255,255,0.18));
      }
      .robot-label {
        position: absolute;
        top: 24px;
        left: 26px;
        display: inline-flex;
        align-items: center;
        gap: 12px;
        padding: 10px 16px;
        border-radius: 16px;
        background: rgba(9, 14, 24, 0.82);
        color: #f3f7fa;
        font-size: 20px;
      }
      .robot-stage svg {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        overflow: visible;
      }
      .robot-figure {
        filter: drop-shadow(0 24px 44px rgba(12, 18, 32, 0.32));
      }
      .robot-shell {
        fill: rgba(218, 236, 248, 0.96);
        stroke: rgba(175, 225, 255, 0.65);
        stroke-width: 4;
      }
      .robot-core {
        fill: rgba(123, 216, 255, 0.14);
        stroke: rgba(125, 219, 255, 0.9);
        stroke-width: 3;
      }
      .robot-joint {
        fill: rgba(231, 245, 255, 0.95);
        stroke: rgba(140, 216, 255, 0.72);
        stroke-width: 3;
      }
      .joint-glow {
        fill: rgba(107, 204, 255, 0.2);
      }
      .hotspot {
        fill: rgba(255, 78, 78, 0.78);
        stroke: rgba(255, 205, 205, 0.55);
        stroke-width: 2;
        filter: blur(10px);
        opacity: 0.42;
      }
      .hotspot-secondary {
        fill: rgba(255, 102, 102, 0.54);
      }
      .hotspot-tertiary {
        fill: rgba(255, 132, 132, 0.38);
      }
      .highlight-shell,
      .motion-path {
        fill: none;
        opacity: 0.18;
        transform-origin: center center;
      }
      .highlight-shell {
        stroke-width: 4;
        stroke-linecap: round;
        filter: drop-shadow(0 0 18px rgba(255, 132, 132, 0.24));
      }
      .highlight-shell-primary {
        stroke: rgba(255, 196, 196, 0.92);
      }
      .highlight-shell-secondary {
        stroke: rgba(255, 176, 176, 0.82);
        stroke-dasharray: 10 12;
      }
      .highlight-shell-tertiary {
        stroke: rgba(255, 160, 160, 0.72);
        stroke-dasharray: 12 14;
      }
      .motion-path {
        stroke-width: 7;
        stroke-linecap: round;
        stroke-linejoin: round;
        stroke-dasharray: 26 18;
        filter: drop-shadow(0 0 14px rgba(123, 216, 255, 0.24));
      }
      .motion-path-primary {
        stroke: rgba(123, 216, 255, 0.9);
      }
      .motion-path-secondary {
        stroke: rgba(255, 202, 114, 0.78);
      }
      #pose-arms,
      #pose-body,
      #pose-torso-shell,
      #pose-arm-left,
      #pose-arm-right,
      #pose-leg-left,
      #pose-leg-right,
      #pose-forearm-left,
      #pose-forearm-right,
      #pose-shin-left,
      #pose-shin-right {
        transform-box: fill-box;
      }
      #pose-body,
      #pose-torso-shell {
        transform-origin: center center;
      }
      #pose-arms {
        transform-origin: center top;
      }
      #pose-arm-left,
      #pose-arm-right,
      #pose-leg-left,
      #pose-leg-right,
      #pose-forearm-left,
      #pose-forearm-right,
      #pose-shin-left,
      #pose-shin-right {
        transform-origin: center top;
      }
      .panel {
        right: 72px;
        width: 856px;
        padding: 30px 34px;
        border-radius: 26px;
        background: rgba(255, 255, 255, 0.94);
        box-shadow: 0 22px 64px rgba(22, 33, 29, 0.1);
      }
      .panel h2 {
        font-size: 32px;
        margin-bottom: 16px;
      }
      .panel ol,
      .panel ul {
        padding-left: 28px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        font-size: 24px;
        line-height: 1.45;
        color: #35453d;
      }
      .panel-top { top: 104px; min-height: 274px; }
      .panel-mid { top: 410px; min-height: 234px; border: 2px solid rgba(15, 118, 110, 0.14); }
      .panel-bottom { top: 676px; min-height: 316px; border: 2px solid rgba(239, 68, 68, 0.14); }
      .panel-tag {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 14px;
        padding: 10px 16px;
        border-radius: 999px;
        background: #fff4f4;
        color: #b42318;
        font-size: 20px;
        font-weight: 700;
      }
      .footer-note {
        position: absolute;
        left: 34px;
        right: 34px;
        bottom: 26px;
        padding: 16px 20px;
        border-radius: 18px;
        background: rgba(12, 18, 32, 0.88);
        color: #f4f8fb;
        font-size: 20px;
        line-height: 1.5;
      }
      .reference-card {
        position: absolute;
        right: 28px;
        bottom: 28px;
        width: 148px;
        padding: 10px;
        border-radius: 18px;
        background: rgba(255,255,255,0.88);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(255,255,255,0.18);
      }
      .reference-copy {
        margin-bottom: 8px;
        color: #23333d;
        font-size: 16px;
        font-weight: 700;
      }
      .reference-card img {
        width: 100%;
        height: 118px;
        object-fit: contain;
        border-radius: 12px;
        background: rgba(255,255,255,0.92);
      }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="10" data-width="1920" data-height="1080">
      <div id="eyebrow" class="clip eyebrow" data-start="0" data-duration="10" data-track-index="1">站内动作讲解 · ${escapeHtml(exercise.name)}</div>
      <div id="title" class="clip title-block" data-start="0" data-duration="10" data-track-index="2">
        <h1>${escapeHtml(exercise.name)}</h1>
        <p>${escapeHtml(exercise.focus)}</p>
      </div>
      <div id="legend" class="clip legend-chip" data-start="0.2" data-duration="9.8" data-track-index="3">
        <span class="legend-dot"></span>
        <span>${escapeHtml(preset.legend)}</span>
      </div>

      <div id="stageShell" class="clip robot-stage-shell" data-start="0.3" data-duration="9.7" data-track-index="4">
        <div class="robot-stage" data-robot-stage="true" data-motion-profile="${escapeHtml(preset.motionProfile)}">
          <div class="stage-grid"></div>
          <div class="robot-label">${escapeHtml(preset.title)}</div>
          <svg class="robot-figure" viewBox="0 0 720 720" aria-label="${escapeHtml(exercise.name)} 动作路径机器人演示" role="img">
            <defs>
              <radialGradient id="platformGlow" cx="50%" cy="50%" r="56%">
                <stop offset="0%" stop-color="rgba(107, 204, 255, 0.52)" />
                <stop offset="100%" stop-color="rgba(107, 204, 255, 0)" />
              </radialGradient>
            </defs>

            <ellipse cx="360" cy="644" rx="154" ry="34" fill="url(#platformGlow)" opacity="0.65"></ellipse>
            ${buildMotionPaths(preset.motionPaths)}
            ${buildHotspots(preset.hotspots)}
            ${buildHighlightShells(preset.highlightShells)}

            <g id="pose-body">
              <g id="pose-arms">
                <g id="pose-arm-left" transform="translate(274 220)">
                  <ellipse class="joint-glow" cx="0" cy="0" rx="24" ry="24"></ellipse>
                  <circle class="robot-joint" cx="0" cy="0" r="14"></circle>
                  <rect class="robot-shell" x="-15" y="0" width="30" height="126" rx="15"></rect>
                  <g id="pose-forearm-left" transform="translate(0 112)">
                    <ellipse class="joint-glow" cx="0" cy="0" rx="22" ry="22"></ellipse>
                    <circle class="robot-joint" cx="0" cy="0" r="13"></circle>
                    <rect class="robot-shell" x="-13" y="0" width="26" height="118" rx="13"></rect>
                  </g>
                </g>
                <g id="pose-arm-right" transform="translate(446 220)">
                  <ellipse class="joint-glow" cx="0" cy="0" rx="24" ry="24"></ellipse>
                  <circle class="robot-joint" cx="0" cy="0" r="14"></circle>
                  <rect class="robot-shell" x="-15" y="0" width="30" height="126" rx="15"></rect>
                  <g id="pose-forearm-right" transform="translate(0 112)">
                    <ellipse class="joint-glow" cx="0" cy="0" rx="22" ry="22"></ellipse>
                    <circle class="robot-joint" cx="0" cy="0" r="13"></circle>
                    <rect class="robot-shell" x="-13" y="0" width="26" height="118" rx="13"></rect>
                  </g>
                </g>
              </g>

              <circle id="pose-head" class="robot-shell" cx="360" cy="136" r="48"></circle>
              <rect id="pose-neck" class="robot-core" x="340" y="178" width="40" height="34" rx="20"></rect>
              <ellipse id="pose-shoulder-band" class="robot-core" cx="360" cy="222" rx="102" ry="30"></ellipse>
              <rect id="pose-torso-shell" class="robot-shell" x="292" y="222" width="136" height="212" rx="54"></rect>
              <rect id="pose-torso-core" class="robot-core" x="328" y="266" width="64" height="132" rx="32"></rect>
              <ellipse id="pose-pelvis" class="robot-shell" cx="360" cy="446" rx="86" ry="38"></ellipse>

              <g id="pose-leg-left" transform="translate(328 452)">
                <ellipse class="joint-glow" cx="0" cy="0" rx="24" ry="24"></ellipse>
                <circle class="robot-joint" cx="0" cy="0" r="14"></circle>
                <rect class="robot-shell" x="-17" y="0" width="34" height="156" rx="17"></rect>
                <g id="pose-shin-left" transform="translate(0 138)">
                  <ellipse class="joint-glow" cx="0" cy="0" rx="22" ry="22"></ellipse>
                  <circle class="robot-joint" cx="0" cy="0" r="13"></circle>
                  <rect class="robot-shell" x="-15" y="0" width="30" height="130" rx="15"></rect>
                  <ellipse class="robot-core" cx="0" cy="138" rx="34" ry="12"></ellipse>
                </g>
              </g>

              <g id="pose-leg-right" transform="translate(392 452)">
                <ellipse class="joint-glow" cx="0" cy="0" rx="24" ry="24"></ellipse>
                <circle class="robot-joint" cx="0" cy="0" r="14"></circle>
                <rect class="robot-shell" x="-17" y="0" width="34" height="156" rx="17"></rect>
                <g id="pose-shin-right" transform="translate(0 138)">
                  <ellipse class="joint-glow" cx="0" cy="0" rx="22" ry="22"></ellipse>
                  <circle class="robot-joint" cx="0" cy="0" r="13"></circle>
                  <rect class="robot-shell" x="-15" y="0" width="30" height="130" rx="15"></rect>
                  <ellipse class="robot-core" cx="0" cy="138" rx="34" ry="12"></ellipse>
                </g>
              </g>
            </g>
          </svg>
          ${referenceBlock}
        </div>
      </div>

      <div id="panelTop" class="clip panel panel-top" data-start="0.4" data-duration="9.6" data-track-index="5">
        <h2>动作要领</h2>
        <ol>${steps}</ol>
      </div>
      <div id="panelMid" class="clip panel panel-mid" data-start="1.8" data-duration="8.2" data-track-index="6">
        <h2>发力提醒</h2>
        <ul>${cues}</ul>
      </div>
      <div id="panelBottom" class="clip panel panel-bottom" data-start="4.2" data-duration="5.8" data-track-index="7">
        <div class="panel-tag">新手最容易错的地方</div>
        <ul>${mistakes}</ul>
        <div class="footer-note">${escapeHtml(exercise.caution)}</div>
      </div>

      <script>
        window.__timelines = window.__timelines || {};
        const tl = gsap.timeline({ paused: true });
        tl.from("#eyebrow", { y: 20, opacity: 0, duration: 0.45, ease: "power2.out" }, 0.12);
        tl.from("#title", { y: 28, opacity: 0, duration: 0.55, ease: "power3.out" }, 0.22);
        tl.from("#legend", { y: 16, opacity: 0, duration: 0.42, ease: "power2.out" }, 0.36);
        tl.from("#stageShell", { x: -34, opacity: 0, duration: 0.72, ease: "expo.out" }, 0.32);
        tl.from("#panelTop", { x: 44, opacity: 0, duration: 0.62, ease: "power2.out" }, 0.48);
        tl.from("#panelMid", { x: 40, opacity: 0, duration: 0.58, ease: "power2.out" }, 1.86);
        tl.from("#panelBottom", { x: 40, opacity: 0, duration: 0.58, ease: "power2.out" }, 4.26);

        ${buildMotionTimeline(preset.motionProfile)}

        tl.to("#root", { opacity: 0, duration: 0.5, ease: "power2.in" }, 9.45);
        window.__timelines["main"] = tl;
      </script>
    </div>
  </body>
</html>`;
}

function buildHotspots(hotspots) {
  return hotspots
    .map(
      (item) =>
        `<ellipse id="${escapeHtml(item.id)}" class="${escapeHtml(item.className)}" cx="${item.cx}" cy="${item.cy}" rx="${item.rx}" ry="${item.ry}"></ellipse>`,
    )
    .join("");
}

function buildHighlightShells(highlightShells = []) {
  return highlightShells
    .map(
      (item) =>
        `<ellipse id="${escapeHtml(item.id)}" class="${escapeHtml(item.className)}" cx="${item.cx}" cy="${item.cy}" rx="${item.rx}" ry="${item.ry}"></ellipse>`,
    )
    .join("");
}

function buildMotionPaths(motionPaths = []) {
  return motionPaths
    .map(
      (item) =>
        `<path id="${escapeHtml(item.id)}" class="${escapeHtml(item.className)}" d="${escapeHtml(item.d)}"></path>`,
    )
    .join("");
}

function buildMotionTimeline(motionProfile) {
  switch (motionProfile) {
    case "mobility-flow":
      return `
        tl.to(["#motion-arc-left", "#motion-arc-right"], { opacity: 0.72, duration: 0.34, ease: "sine.out" }, 0.82);
        tl.to(["#motion-arc-left", "#motion-arc-right"], { strokeDashoffset: -44, duration: 1.08, ease: "none" }, 0.84);
        tl.to("#pose-arms", { y: -30, duration: 0.34, ease: "sine.out" }, 0.88);
        tl.to("#pose-arm-left", { rotation: -94, duration: 1.02, ease: "power2.out" }, 0.88);
        tl.to("#pose-arm-right", { rotation: 94, duration: 1.02, ease: "power2.out" }, 0.88);
        tl.to("#pose-forearm-left", { rotation: -24, duration: 0.94, ease: "power2.out" }, 0.94);
        tl.to("#pose-forearm-right", { rotation: 24, duration: 0.94, ease: "power2.out" }, 0.94);
        tl.to("#pose-body", { y: -20, scaleY: 1.04, duration: 0.9, ease: "sine.out" }, 0.92);
        tl.to("#pose-torso-shell", { scaleY: 1.06, duration: 0.9, ease: "sine.out" }, 0.92);
        tl.to("#pose-head", { y: -8, duration: 0.9, ease: "sine.out" }, 0.92);
        tl.to("#hotspot-primary", { opacity: 0.96, scale: 1.18, duration: 0.58, repeat: 2, yoyo: true, ease: "sine.inOut" }, 1.02);
        tl.to("#highlight-shoulders", { opacity: 0.82, scale: 1.04, duration: 0.58, repeat: 2, yoyo: true, ease: "sine.inOut" }, 1.02);
        tl.to("#hotspot-primary", { attr: { cx: 360, cy: 246, rx: 132, ry: 102 }, duration: 0.46, ease: "sine.out" }, 1.06);
        tl.to("#hotspot-secondary", { opacity: 0.7, scale: 1.08, duration: 0.64, repeat: 1, yoyo: true, ease: "sine.inOut" }, 1.56);
        tl.to("#highlight-core", { opacity: 0.62, scale: 1.02, duration: 0.64, repeat: 1, yoyo: true, ease: "sine.inOut" }, 1.56);
        tl.to("#motion-sway", { opacity: 0.44, duration: 0.34, ease: "sine.out" }, 2.08);
        tl.to("#motion-sway", { strokeDashoffset: -36, duration: 1.04, ease: "none" }, 2.1);
        tl.to("#pose-body", { rotation: -13, x: -34, duration: 0.86, ease: "power1.inOut" }, 2.18);
        tl.to("#pose-torso-shell", { rotation: -6, duration: 0.86, ease: "power1.inOut" }, 2.18);
        tl.to("#pose-leg-left", { x: -12, duration: 0.86, ease: "power1.inOut" }, 2.18);
        tl.to("#pose-leg-right", { x: -4, duration: 0.86, ease: "power1.inOut" }, 2.18);
        tl.to("#hotspot-primary", { attr: { cx: 300, cy: 314, rx: 100, ry: 88 }, duration: 0.74, ease: "power1.inOut" }, 2.22);
        tl.to("#highlight-shoulders", { attr: { cx: 312, cy: 248, rx: 126, ry: 52 }, duration: 0.74, ease: "power1.inOut" }, 2.22);
        tl.to("#pose-body", { rotation: 0, x: 0, duration: 0.58, ease: "power1.inOut" }, 3.14);
        tl.to("#pose-torso-shell", { rotation: 0, duration: 0.58, ease: "power1.inOut" }, 3.14);
        tl.to("#pose-leg-left", { x: 0, duration: 0.58, ease: "power1.inOut" }, 3.14);
        tl.to("#pose-leg-right", { x: 0, duration: 0.58, ease: "power1.inOut" }, 3.14);
        tl.to("#hotspot-primary", { attr: { cx: 360, cy: 252, rx: 124, ry: 98 }, duration: 0.58, ease: "power1.inOut" }, 3.14);
        tl.to("#highlight-shoulders", { attr: { cx: 360, cy: 228, rx: 140, ry: 54 }, duration: 0.58, ease: "power1.inOut" }, 3.14);
        tl.to("#pose-body", { rotation: 13, x: 34, duration: 0.86, ease: "power1.inOut" }, 3.84);
        tl.to("#pose-torso-shell", { rotation: 6, duration: 0.86, ease: "power1.inOut" }, 3.84);
        tl.to("#pose-leg-left", { x: 4, duration: 0.86, ease: "power1.inOut" }, 3.84);
        tl.to("#pose-leg-right", { x: 12, duration: 0.86, ease: "power1.inOut" }, 3.84);
        tl.to("#hotspot-primary", { attr: { cx: 420, cy: 314, rx: 100, ry: 88 }, duration: 0.74, ease: "power1.inOut" }, 3.88);
        tl.to("#highlight-shoulders", { attr: { cx: 408, cy: 248, rx: 126, ry: 52 }, duration: 0.74, ease: "power1.inOut" }, 3.88);
        tl.to("#pose-body", { rotation: 0, x: 0, duration: 0.58, ease: "power1.inOut" }, 4.78);
        tl.to("#pose-torso-shell", { rotation: 0, duration: 0.58, ease: "power1.inOut" }, 4.78);
        tl.to("#pose-leg-left", { x: 0, duration: 0.58, ease: "power1.inOut" }, 4.78);
        tl.to("#pose-leg-right", { x: 0, duration: 0.58, ease: "power1.inOut" }, 4.78);
        tl.to("#hotspot-primary", { attr: { cx: 360, cy: 252, rx: 124, ry: 98 }, duration: 0.58, ease: "power1.inOut" }, 4.78);
        tl.to("#highlight-shoulders", { attr: { cx: 360, cy: 228, rx: 140, ry: 54 }, duration: 0.58, ease: "power1.inOut" }, 4.78);
        tl.to("#hotspot-secondary", { opacity: 0.82, scale: 1.1, duration: 0.56, repeat: 1, yoyo: true, ease: "sine.inOut" }, 5.32);
        tl.to("#highlight-core", { opacity: 0.72, scale: 1.04, duration: 0.56, repeat: 1, yoyo: true, ease: "sine.inOut" }, 5.32);
        tl.to("#pose-torso-shell", { scaleY: 1.08, y: -14, duration: 0.58, ease: "sine.inOut" }, 5.36);
        tl.to("#pose-body", { y: -26, duration: 0.58, ease: "sine.inOut" }, 5.36);
        tl.to("#hotspot-secondary", { attr: { cx: 360, cy: 382, rx: 90, ry: 112 }, duration: 0.56, ease: "sine.inOut" }, 5.4);
        tl.to("#pose-torso-shell", { scaleY: 1.02, y: -6, duration: 0.64, ease: "sine.inOut" }, 6.04);
        tl.to("#pose-body", { y: -10, duration: 0.64, ease: "sine.inOut" }, 6.04);
        tl.to("#hotspot-tertiary", { opacity: 0.68, scale: 1.08, duration: 0.62, repeat: 1, yoyo: true, ease: "sine.inOut" }, 6.72);
        tl.to("#highlight-lower", { opacity: 0.56, scale: 1.03, duration: 0.62, repeat: 1, yoyo: true, ease: "sine.inOut" }, 6.72);
        tl.to("#hotspot-tertiary", { attr: { cx: 360, cy: 560, rx: 118, ry: 138 }, duration: 0.62, ease: "sine.inOut" }, 6.76);
        tl.to(["#motion-arc-left", "#motion-arc-right", "#motion-sway"], { opacity: 0.14, duration: 0.5, ease: "power1.out" }, 7.18);
        tl.to("#pose-arms", { y: 0, duration: 0.72, ease: "power2.inOut" }, 7.72);
        tl.to("#pose-arm-left", { rotation: 0, duration: 0.8, ease: "power2.inOut" }, 7.72);
        tl.to("#pose-arm-right", { rotation: 0, duration: 0.8, ease: "power2.inOut" }, 7.72);
        tl.to("#pose-forearm-left", { rotation: 0, duration: 0.72, ease: "power2.inOut" }, 7.72);
        tl.to("#pose-forearm-right", { rotation: 0, duration: 0.72, ease: "power2.inOut" }, 7.72);
        tl.to("#pose-body", { rotation: 0, x: 0, y: 0, scaleY: 1, duration: 0.82, ease: "power2.inOut" }, 7.72);
        tl.to("#pose-torso-shell", { rotation: 0, y: 0, scaleY: 1, duration: 0.82, ease: "power2.inOut" }, 7.72);
        tl.to("#pose-head", { y: 0, duration: 0.72, ease: "power2.inOut" }, 7.72);
        tl.to(["#highlight-shoulders", "#highlight-core", "#highlight-lower"], { opacity: 0.18, scale: 1, duration: 0.72, ease: "power2.out" }, 7.82);
      `;
    case "squat-drive":
      return `
        tl.to("#pose-body", { y: 30, scaleY: 0.96, duration: 0.86, ease: "power1.inOut" }, 0.92);
        tl.to("#pose-torso-shell", { rotation: 8, duration: 0.86, ease: "power1.inOut" }, 0.92);
        tl.to("#pose-leg-left", { rotation: 22, duration: 0.86, ease: "power1.inOut" }, 0.92);
        tl.to("#pose-leg-right", { rotation: -22, duration: 0.86, ease: "power1.inOut" }, 0.92);
        tl.to("#pose-shin-left", { rotation: -20, duration: 0.86, ease: "power1.inOut" }, 0.92);
        tl.to("#pose-shin-right", { rotation: 20, duration: 0.86, ease: "power1.inOut" }, 0.92);
        tl.to("#hotspot-primary", { opacity: 0.96, scale: 1.14, repeat: 4, yoyo: true, duration: 0.7, ease: "sine.inOut" }, 1.08);
        tl.to("#hotspot-secondary", { opacity: 0.74, scale: 1.08, repeat: 4, yoyo: true, duration: 0.76, ease: "sine.inOut" }, 1.12);
        tl.to("#pose-body", { y: 0, scaleY: 1, duration: 0.74, ease: "power2.out" }, 2.24);
        tl.to("#pose-torso-shell", { rotation: 0, duration: 0.74, ease: "power2.out" }, 2.24);
        tl.to("#pose-leg-left", { rotation: 0, duration: 0.74, ease: "power2.out" }, 2.24);
        tl.to("#pose-leg-right", { rotation: 0, duration: 0.74, ease: "power2.out" }, 2.24);
        tl.to("#pose-shin-left", { rotation: 0, duration: 0.74, ease: "power2.out" }, 2.24);
        tl.to("#pose-shin-right", { rotation: 0, duration: 0.74, ease: "power2.out" }, 2.24);
        tl.to("#pose-body", { y: 18, duration: 0.72, ease: "power1.inOut" }, 4.38);
        tl.to("#pose-leg-left", { rotation: 12, duration: 0.72, ease: "power1.inOut" }, 4.38);
        tl.to("#pose-leg-right", { rotation: -12, duration: 0.72, ease: "power1.inOut" }, 4.38);
        tl.to("#pose-body", { y: 0, duration: 0.66, ease: "power2.out" }, 5.22);
        tl.to("#pose-leg-left", { rotation: 0, duration: 0.66, ease: "power2.out" }, 5.22);
        tl.to("#pose-leg-right", { rotation: 0, duration: 0.66, ease: "power2.out" }, 5.22);
      `;
    case "bridge-drive":
      return `
        tl.to("#pose-body", { rotation: -90, x: -40, y: 164, duration: 0.01 }, 0.8);
        tl.to("#pose-arms", { rotation: -84, x: -110, y: 158, duration: 0.01 }, 0.8);
        tl.to("#pose-leg-left", { rotation: 72, x: 46, y: 138, duration: 0.01 }, 0.8);
        tl.to("#pose-leg-right", { rotation: 72, x: -46, y: 138, duration: 0.01 }, 0.8);
        tl.to("#pose-shin-left", { rotation: -70, duration: 0.01 }, 0.8);
        tl.to("#pose-shin-right", { rotation: 70, duration: 0.01 }, 0.8);
        tl.to("#pose-body", { y: 108, duration: 0.94, ease: "power2.out" }, 1.08);
        tl.to("#hotspot-primary", { opacity: 0.96, scale: 1.16, repeat: 4, yoyo: true, duration: 0.74, ease: "sine.inOut" }, 1.16);
        tl.to("#hotspot-secondary", { opacity: 0.76, scale: 1.08, repeat: 4, yoyo: true, duration: 0.78, ease: "sine.inOut" }, 1.2);
        tl.to("#pose-body", { y: 164, duration: 0.9, ease: "power1.inOut" }, 2.46);
        tl.to("#pose-body", { y: 118, duration: 0.84, ease: "power2.out" }, 4.18);
        tl.to("#pose-body", { y: 164, duration: 0.86, ease: "power1.inOut" }, 5.36);
      `;
    case "press-line":
      return `
        tl.to("#pose-body", { rotation: 58, x: 18, y: 116, duration: 0.01 }, 0.74);
        tl.to("#pose-arms", { rotation: 18, x: 76, y: 124, duration: 0.01 }, 0.74);
        tl.to("#pose-leg-left", { rotation: 12, x: -18, y: 74, duration: 0.01 }, 0.74);
        tl.to("#pose-leg-right", { rotation: -12, x: 18, y: 74, duration: 0.01 }, 0.74);
        tl.to("#pose-arms", { x: 48, duration: 0.9, ease: "power2.out" }, 1.08);
        tl.to("#pose-body", { x: 8, duration: 0.9, ease: "power2.out" }, 1.08);
        tl.to("#hotspot-primary", { opacity: 0.92, scale: 1.14, repeat: 4, yoyo: true, duration: 0.68, ease: "sine.inOut" }, 1.1);
        tl.to("#hotspot-secondary", { opacity: 0.72, scale: 1.08, repeat: 4, yoyo: true, duration: 0.76, ease: "sine.inOut" }, 1.14);
        tl.to("#pose-arms", { x: 78, duration: 0.88, ease: "power1.inOut" }, 2.38);
        tl.to("#pose-body", { x: 18, duration: 0.88, ease: "power1.inOut" }, 2.38);
        tl.to("#pose-arms", { x: 54, duration: 0.86, ease: "power2.out" }, 4.06);
        tl.to("#pose-body", { x: 10, duration: 0.86, ease: "power2.out" }, 4.06);
      `;
    case "row-squeeze":
      return `
        tl.to("#pose-body", { rotation: 18, x: -10, y: 18, duration: 0.01 }, 0.78);
        tl.to("#pose-arm-left", { rotation: -22, duration: 0.01 }, 0.78);
        tl.to("#pose-arm-right", { rotation: 22, duration: 0.01 }, 0.78);
        tl.to("#pose-forearm-left", { rotation: -16, duration: 0.01 }, 0.78);
        tl.to("#pose-forearm-right", { rotation: 16, duration: 0.01 }, 0.78);
        tl.to("#pose-arm-right", { rotation: 56, x: -18, duration: 0.82, ease: "power2.out" }, 1.06);
        tl.to("#pose-forearm-right", { rotation: 38, duration: 0.82, ease: "power2.out" }, 1.06);
        tl.to("#hotspot-primary", { opacity: 0.94, scale: 1.12, repeat: 4, yoyo: true, duration: 0.68, ease: "sine.inOut" }, 1.08);
        tl.to("#hotspot-secondary", { opacity: 0.72, scale: 1.08, repeat: 4, yoyo: true, duration: 0.76, ease: "sine.inOut" }, 1.12);
        tl.to("#pose-arm-right", { rotation: 24, x: 0, duration: 0.82, ease: "power1.inOut" }, 2.28);
        tl.to("#pose-forearm-right", { rotation: 16, duration: 0.82, ease: "power1.inOut" }, 2.28);
        tl.to("#pose-arm-right", { rotation: 52, x: -14, duration: 0.8, ease: "power2.out" }, 4.02);
        tl.to("#pose-forearm-right", { rotation: 34, duration: 0.8, ease: "power2.out" }, 4.02);
        tl.to("#pose-arm-right", { rotation: 24, x: 0, duration: 0.78, ease: "power1.inOut" }, 5.22);
        tl.to("#pose-forearm-right", { rotation: 16, duration: 0.78, ease: "power1.inOut" }, 5.22);
      `;
    case "brace-hold":
      return `
        tl.to("#pose-body", { rotation: 72, x: 10, y: 110, duration: 0.01 }, 0.74);
        tl.to("#pose-arms", { rotation: -76, x: -122, y: 120, duration: 0.01 }, 0.74);
        tl.to("#pose-leg-left", { rotation: 6, x: 4, y: 72, duration: 0.01 }, 0.74);
        tl.to("#pose-leg-right", { rotation: -6, x: -4, y: 72, duration: 0.01 }, 0.74);
        tl.to("#pose-body", { y: 104, duration: 0.72, ease: "sine.inOut", repeat: 6, yoyo: true }, 1.02);
        tl.to("#hotspot-primary", { opacity: 0.9, scale: 1.1, duration: 0.66, repeat: 6, yoyo: true, ease: "sine.inOut" }, 1.04);
        tl.to("#hotspot-secondary", { opacity: 0.72, scale: 1.08, duration: 0.74, repeat: 6, yoyo: true, ease: "sine.inOut" }, 1.08);
      `;
    case "pull-down":
      return `
        tl.to("#pose-arm-left", { rotation: -62, duration: 0.01 }, 0.7);
        tl.to("#pose-arm-right", { rotation: 62, duration: 0.01 }, 0.7);
        tl.to("#pose-forearm-left", { rotation: -22, duration: 0.01 }, 0.7);
        tl.to("#pose-forearm-right", { rotation: 22, duration: 0.01 }, 0.7);
        tl.to("#pose-arm-left", { rotation: -26, duration: 0.88, ease: "power2.out" }, 1.02);
        tl.to("#pose-arm-right", { rotation: 26, duration: 0.88, ease: "power2.out" }, 1.02);
        tl.to("#pose-forearm-left", { rotation: 14, duration: 0.88, ease: "power2.out" }, 1.02);
        tl.to("#pose-forearm-right", { rotation: -14, duration: 0.88, ease: "power2.out" }, 1.02);
        tl.to("#hotspot-primary", { opacity: 0.94, scale: 1.12, repeat: 4, yoyo: true, duration: 0.68, ease: "sine.inOut" }, 1.04);
        tl.to("#hotspot-secondary", { opacity: 0.74, scale: 1.08, repeat: 4, yoyo: true, duration: 0.74, ease: "sine.inOut" }, 1.08);
        tl.to("#pose-arm-left", { rotation: -62, duration: 0.92, ease: "power1.inOut" }, 2.46);
        tl.to("#pose-arm-right", { rotation: 62, duration: 0.92, ease: "power1.inOut" }, 2.46);
        tl.to("#pose-forearm-left", { rotation: -22, duration: 0.92, ease: "power1.inOut" }, 2.46);
        tl.to("#pose-forearm-right", { rotation: 22, duration: 0.92, ease: "power1.inOut" }, 2.46);
      `;
    case "march-rhythm":
    default:
      return `
        tl.to("#pose-arm-left", { rotation: -26, duration: 0.54, ease: "power1.inOut" }, 0.92);
        tl.to("#pose-arm-right", { rotation: 28, duration: 0.54, ease: "power1.inOut" }, 0.92);
        tl.to("#pose-leg-left", { rotation: 16, duration: 0.54, ease: "power1.inOut" }, 0.92);
        tl.to("#pose-leg-right", { rotation: -16, duration: 0.54, ease: "power1.inOut" }, 0.92);
        tl.to("#pose-shin-left", { rotation: -12, duration: 0.54, ease: "power1.inOut" }, 0.92);
        tl.to("#pose-shin-right", { rotation: 12, duration: 0.54, ease: "power1.inOut" }, 0.92);
        tl.to("#hotspot-primary", { opacity: 0.9, scale: 1.1, repeat: 6, yoyo: true, duration: 0.46, ease: "sine.inOut" }, 1.02);
        tl.to("#hotspot-secondary", { opacity: 0.72, scale: 1.08, repeat: 6, yoyo: true, duration: 0.48, ease: "sine.inOut" }, 1.02);
        tl.to("#hotspot-tertiary", { opacity: 0.72, scale: 1.08, repeat: 6, yoyo: true, duration: 0.48, ease: "sine.inOut" }, 1.18);
        tl.to("#pose-arm-left", { rotation: 28, duration: 0.54, ease: "power1.inOut" }, 1.52);
        tl.to("#pose-arm-right", { rotation: -26, duration: 0.54, ease: "power1.inOut" }, 1.52);
        tl.to("#pose-leg-left", { rotation: -16, duration: 0.54, ease: "power1.inOut" }, 1.52);
        tl.to("#pose-leg-right", { rotation: 16, duration: 0.54, ease: "power1.inOut" }, 1.52);
        tl.to("#pose-shin-left", { rotation: 12, duration: 0.54, ease: "power1.inOut" }, 1.52);
        tl.to("#pose-shin-right", { rotation: -12, duration: 0.54, ease: "power1.inOut" }, 1.52);
        tl.to("#pose-arm-left", { rotation: -26, duration: 0.54, ease: "power1.inOut" }, 2.12);
        tl.to("#pose-arm-right", { rotation: 28, duration: 0.54, ease: "power1.inOut" }, 2.12);
        tl.to("#pose-leg-left", { rotation: 16, duration: 0.54, ease: "power1.inOut" }, 2.12);
        tl.to("#pose-leg-right", { rotation: -16, duration: 0.54, ease: "power1.inOut" }, 2.12);
        tl.to("#pose-shin-left", { rotation: -12, duration: 0.54, ease: "power1.inOut" }, 2.12);
        tl.to("#pose-shin-right", { rotation: 12, duration: 0.54, ease: "power1.inOut" }, 2.12);
      `;
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
