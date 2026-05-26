export function buildCompositionHtml({
  exerciseId,
  exercise,
  properImagePath = `assets/exercise-media/${exerciseId}-proper.svg`,
  mistakeImagePath = `assets/exercise-media/${exerciseId}-mistake.svg`,
  properIllustration,
  mistakeIllustration,
}) {
  const steps = exercise.steps.slice(0, 3).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  const cues = exercise.cues.slice(0, 3).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  const mistakes = exercise.mistakes.slice(0, 3).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  const properCardArt = renderPoseArt({
    variantClassName: "proper-art",
    fallbackImagePath: properImagePath,
    inlineIllustration: properIllustration,
    alt: `${exercise.name} 正确示范`,
  });
  const mistakeCardArt = renderPoseArt({
    variantClassName: "mistake-art",
    fallbackImagePath: mistakeImagePath,
    inlineIllustration: mistakeIllustration,
    alt: `${exercise.name} 常见错误`,
  });

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
        background: #0e131a;
        font-family: "Segoe UI", "Inter", "Microsoft YaHei", sans-serif;
        color: #f5f7fb;
      }
      #root {
        position: relative;
        width: 100%;
        height: 100%;
        background:
          radial-gradient(circle at top right, rgba(34, 197, 94, 0.12), transparent 24%),
          radial-gradient(circle at bottom left, rgba(239, 68, 68, 0.12), transparent 28%),
          linear-gradient(180deg, #111720 0%, #151d29 100%);
      }
      .clip { position: absolute; }
      .eyebrow {
        top: 48px;
        left: 72px;
        display: inline-flex;
        align-items: center;
        gap: 12px;
        padding: 12px 20px;
        border-radius: 999px;
        background: rgba(255,255,255,0.08);
        color: #dce7f4;
        font-size: 22px;
        font-weight: 700;
      }
      .title-block {
        top: 110px;
        left: 72px;
        width: 720px;
      }
      .title-block h1 {
        font-size: 74px;
        line-height: 1.04;
        font-weight: 800;
      }
      .title-block p {
        margin-top: 20px;
        font-size: 29px;
        line-height: 1.5;
        color: #c4d1de;
      }
      .pose-card {
        width: 420px;
        height: 720px;
        border-radius: 30px;
        overflow: hidden;
        background: rgba(255,255,255,0.06);
        border: 2px solid rgba(255,255,255,0.08);
        box-shadow: 0 28px 80px rgba(0,0,0,0.28);
      }
      .pose-card img,
      .pose-art,
      .pose-art svg {
        width: 100%;
        height: 100%;
        display: block;
      }
      .pose-card img {
        object-fit: cover;
      }
      .pose-art .title,
      .pose-art .subtitle,
      .pose-art .pill,
      .pose-art .pill-text,
      .pose-art .caption,
      .pose-art .accent-copy {
        display: none;
      }
      .pose-art .stage-figure {
        transform-origin: 50% 62%;
      }
      .pose-art .figure-highlights .highlight {
        transform-box: fill-box;
        transform-origin: center;
      }
      .pose-card-proper { left: 74px; top: 314px; }
      .pose-card-mistake { left: 532px; top: 314px; }
      .marker {
        position: absolute;
        top: 24px;
        right: 24px;
        width: 84px;
        height: 84px;
        border-radius: 999px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 46px;
        font-weight: 800;
        color: white;
        box-shadow: 0 0 24px rgba(0,0,0,0.22);
      }
      .green-marker { background: rgba(34, 197, 94, 0.9); }
      .red-marker { background: rgba(239, 68, 68, 0.92); }
      .card-label {
        position: absolute;
        left: 24px;
        bottom: 24px;
        padding: 12px 20px;
        border-radius: 999px;
        font-size: 24px;
        font-weight: 700;
        backdrop-filter: blur(12px);
      }
      .label-good { background: rgba(34, 197, 94, 0.18); color: #9ae6b4; }
      .label-bad { background: rgba(239, 68, 68, 0.18); color: #fecaca; }
      .panel {
        right: 72px;
        width: 814px;
        padding: 28px 32px;
        border-radius: 26px;
        background: rgba(255,255,255,0.06);
        border: 2px solid rgba(255,255,255,0.08);
        box-shadow: 0 24px 64px rgba(0,0,0,0.24);
      }
      .panel h2 {
        font-size: 32px;
        margin-bottom: 14px;
      }
      .panel ul,
      .panel ol {
        padding-left: 28px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        font-size: 24px;
        line-height: 1.46;
        color: #eef4fa;
      }
      .panel-top { top: 108px; min-height: 250px; }
      .panel-mid { top: 390px; min-height: 258px; }
      .panel-bottom { top: 686px; min-height: 256px; }
      .panel-tag {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 14px;
        padding: 10px 16px;
        border-radius: 999px;
        font-size: 20px;
        font-weight: 700;
      }
      .panel-tag-good {
        background: rgba(34, 197, 94, 0.16);
        color: #9ae6b4;
      }
      .panel-tag-bad {
        background: rgba(239, 68, 68, 0.16);
        color: #fecaca;
      }
      .footer-note {
        margin-top: 18px;
        padding: 16px 18px;
        border-radius: 18px;
        background: rgba(0,0,0,0.18);
        color: #e4edf7;
        font-size: 21px;
        line-height: 1.5;
      }
      .divider-copy {
        top: 282px;
        left: 74px;
        width: 878px;
        display: flex;
        justify-content: space-between;
        font-size: 24px;
        font-weight: 700;
        color: #eaf2fb;
      }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="10" data-width="1920" data-height="1080" data-explainer-scene="true" data-exercise-id="${escapeHtml(exerciseId)}">
      <div id="eyebrow" class="clip eyebrow" data-start="0" data-duration="10" data-track-index="1">站内动作讲解 · ${escapeHtml(exercise.name)}</div>
      <div id="title" class="clip title-block" data-start="0" data-duration="10" data-track-index="2">
        <h1>${escapeHtml(exercise.name)}</h1>
        <p>${escapeHtml(exercise.focus)}</p>
      </div>
      <div id="dividerCopy" class="clip divider-copy" data-start="0.2" data-duration="9.8" data-track-index="3">
        <span>先看正确示范</span>
        <span>再看常见错误</span>
      </div>

      <div id="properCard" class="clip pose-card pose-card-proper" data-start="0.3" data-duration="9.7" data-track-index="4">
        ${properCardArt}
        <div class="marker green-marker">&#10003;</div>
        <div class="card-label label-good">正确示范</div>
      </div>

      <div id="mistakeCard" class="clip pose-card pose-card-mistake" data-start="0.5" data-duration="9.5" data-track-index="5">
        ${mistakeCardArt}
        <div class="marker red-marker">&#10005;</div>
        <div class="card-label label-bad">常见错误</div>
      </div>

      <div id="panelTop" class="clip panel panel-top" data-start="0.35" data-duration="9.65" data-track-index="6">
        <div class="panel-tag panel-tag-good">正确示范</div>
        <h2>动作要领</h2>
        <ol>${steps}</ol>
      </div>

      <div id="panelMid" class="clip panel panel-mid" data-start="2.5" data-duration="7.5" data-track-index="7">
        <div class="panel-tag panel-tag-good">发力与节奏</div>
        <h2>关键提示</h2>
        <ul>${cues}</ul>
      </div>

      <div id="panelBottom" class="clip panel panel-bottom" data-start="5.2" data-duration="4.8" data-track-index="8">
        <div class="panel-tag panel-tag-bad">常见错误</div>
        <h2>先避开这些问题</h2>
        <ul>${mistakes}</ul>
        <div class="footer-note">${escapeHtml(exercise.caution)}</div>
      </div>

      <script>
        window.__timelines = window.__timelines || {};
        const tl = gsap.timeline({ paused: true });

        tl.from("#eyebrow", { y: 18, opacity: 0, duration: 0.35, ease: "power2.out" }, 0.08);
        tl.from("#title", { y: 26, opacity: 0, duration: 0.55, ease: "power3.out" }, 0.18);
        tl.from("#dividerCopy", { y: 10, opacity: 0, duration: 0.3, ease: "power2.out" }, 0.28);
        tl.from(".pose-card-proper", { x: -30, opacity: 0, duration: 0.62, ease: "expo.out" }, 0.34);
        tl.from(".pose-card-mistake", { x: -24, opacity: 0, duration: 0.62, ease: "expo.out" }, 0.56);
        tl.from("#panelTop", { x: 44, opacity: 0, duration: 0.56, ease: "power2.out" }, 0.46);
        tl.from("#panelMid", { x: 40, opacity: 0, duration: 0.52, ease: "power2.out" }, 2.58);
        tl.from("#panelBottom", { x: 40, opacity: 0, duration: 0.52, ease: "power2.out" }, 5.24);

        tl.to(".pose-card-proper", { scale: 1.03, duration: 1.1, ease: "power1.inOut" }, 1.1);
        tl.to(".pose-card-proper", { scale: 1, duration: 1.1, ease: "power1.inOut" }, 2.4);
        tl.to(".green-marker", { scale: 1.12, duration: 0.34, repeat: 1, yoyo: true, ease: "sine.inOut" }, 1.34);

        tl.to(".pose-card-mistake", { scale: 1.03, duration: 1.1, ease: "power1.inOut" }, 4.9);
        tl.to(".pose-card-mistake", { scale: 1, duration: 1.1, ease: "power1.inOut" }, 6.2);
        tl.to(".red-marker", { scale: 1.12, duration: 0.34, repeat: 1, yoyo: true, ease: "sine.inOut" }, 5.14);

        addPoseMotion(tl, ".proper-art", 0.94, {
          fromY: 24,
          toY: -18,
          fromRotate: -2,
          toRotate: 2,
        });
        addPoseMotion(tl, ".mistake-art", 4.78, {
          fromY: 18,
          toY: -28,
          fromRotate: 2,
          toRotate: -5,
        });

        tl.to("#root", { opacity: 0, duration: 0.45, ease: "power2.in" }, 9.45);

        window.__timelines["main"] = tl;

        function addPoseMotion(timeline, scope, startAt, motion) {
          timeline.fromTo(\`\${scope} .figure-guides .guide-line, \${scope} .figure-guides .guide-dash\`, {
            strokeDasharray: 420,
            strokeDashoffset: 420,
            opacity: 0.12,
          }, {
            strokeDashoffset: 0,
            opacity: 0.88,
            duration: 1,
            stagger: 0.08,
            ease: "power1.inOut",
          }, startAt);
          timeline.fromTo(\`\${scope} .figure-highlights .highlight\`, {
            opacity: 0.22,
            scale: 0.92,
            transformOrigin: "center center",
          }, {
            opacity: 0.92,
            scale: 1.05,
            duration: 0.7,
            stagger: 0.08,
            repeat: 1,
            yoyo: true,
            ease: "sine.inOut",
          }, startAt + 0.16);
          timeline.fromTo(\`\${scope} .stage-figure\`, {
            y: motion.fromY,
            rotate: motion.fromRotate,
            transformOrigin: "50% 62%",
          }, {
            y: motion.toY,
            rotate: motion.toRotate,
            duration: 1.5,
            repeat: 1,
            yoyo: true,
            ease: "sine.inOut",
          }, startAt + 0.12);
        }
      </script>
    </div>
  </body>
</html>`;
}

function renderPoseArt({ variantClassName, fallbackImagePath, inlineIllustration, alt }) {
  if (inlineIllustration) {
    return `<div class="pose-art ${variantClassName}">${stripXmlDeclaration(inlineIllustration)}</div>`;
  }

  return `<img class="${variantClassName}" src="${escapeHtml(fallbackImagePath)}" alt="${escapeHtml(alt)}" />`;
}

function stripXmlDeclaration(value) {
  return value.replace(/^\s*<\?xml[^>]*>\s*/u, "");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
