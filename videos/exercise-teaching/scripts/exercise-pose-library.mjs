const CANVAS = { width: 1200, height: 1200 };

export function buildExerciseTeachingIllustration({ exerciseId, exercise, variant }) {
  const pose = getPoseDefinition(exerciseId, variant);
  const idPrefix = `${exerciseId}-${variant}`;
  const backgroundGradientId = `${idPrefix}-bg-gradient`;
  const glowGradientId = `${idPrefix}-glow-gradient`;
  const softShadowId = `${idPrefix}-soft-shadow`;
  const theme = variant === "proper"
    ? {
        label: "正确示范",
        accent: "#22c55e",
        accentSoft: "rgba(34, 197, 94, 0.18)",
        markerClass: "good-line",
      }
    : {
        label: "常见错误",
        accent: "#ef4444",
        accentSoft: "rgba(239, 68, 68, 0.18)",
        markerClass: "bad-line",
      };

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${CANVAS.width}" height="${CANVAS.height}" viewBox="0 0 ${CANVAS.width} ${CANVAS.height}" role="img" aria-label="${escapeHtml(exercise.name)} ${theme.label}">
  <defs>
    <linearGradient id="${backgroundGradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10141b" />
      <stop offset="100%" stop-color="#1b2330" />
    </linearGradient>
    <radialGradient id="${glowGradientId}" cx="50%" cy="42%" r="62%">
      <stop offset="0%" stop-color="${theme.accentSoft}" />
      <stop offset="100%" stop-color="rgba(255,255,255,0)" />
    </radialGradient>
    <filter id="${softShadowId}" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="20" stdDeviation="24" flood-color="rgba(0,0,0,0.28)" />
    </filter>
  </defs>
  <style>
    .title { font: 700 56px 'Segoe UI', 'Microsoft YaHei', sans-serif; fill: #f8fafc; }
    .subtitle { font: 500 26px 'Segoe UI', 'Microsoft YaHei', sans-serif; fill: #c8d4e0; }
    .pill { fill: rgba(255,255,255,0.08); stroke: rgba(255,255,255,0.12); stroke-width: 2; }
    .pill-text { font: 700 28px 'Segoe UI', 'Microsoft YaHei', sans-serif; fill: ${theme.accent}; }
    .ground { fill: rgba(255,255,255,0.06); }
    .machine { fill: rgba(88, 102, 121, 0.92); stroke: rgba(196, 211, 224, 0.2); stroke-width: 4; }
    .machine-detail { fill: rgba(153, 170, 189, 0.85); }
    .body-core { fill: rgba(232, 239, 246, 0.96); stroke: rgba(209, 222, 235, 0.95); stroke-width: 18; stroke-linecap: round; stroke-linejoin: round; }
    .body-line { stroke: rgba(232, 239, 246, 0.96); stroke-width: 44; stroke-linecap: round; stroke-linejoin: round; fill: none; }
    .joint { fill: rgba(248, 250, 252, 0.98); }
    .joint-outline { fill: none; stroke: rgba(193, 210, 226, 0.7); stroke-width: 4; }
    .highlight { fill: ${theme.accentSoft}; stroke: ${theme.accent}; stroke-width: 4; }
    .good-line { stroke: #22c55e; }
    .bad-line { stroke: #ef4444; }
    .guide-line { fill: none; stroke-width: 10; stroke-linecap: round; stroke-linejoin: round; }
    .guide-dash { fill: none; stroke: rgba(248, 250, 252, 0.7); stroke-width: 6; stroke-dasharray: 16 14; }
    .caption { font: 600 26px 'Segoe UI', 'Microsoft YaHei', sans-serif; fill: #e7eef6; }
    .accent-copy { font: 600 24px 'Segoe UI', 'Microsoft YaHei', sans-serif; fill: ${theme.accent}; }
  </style>
  <rect width="${CANVAS.width}" height="${CANVAS.height}" fill="url(#${backgroundGradientId})" />
  <rect x="36" y="36" width="${CANVAS.width - 72}" height="${CANVAS.height - 72}" rx="40" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" stroke-width="2" />
  <ellipse cx="600" cy="650" rx="320" ry="340" fill="url(#${glowGradientId})" />
  <text class="title" x="72" y="118">${escapeHtml(exercise.name)}</text>
  <text class="subtitle" x="72" y="162">${escapeHtml(exercise.muscles.join(" · "))}</text>
  <g transform="translate(72 204)">
    <rect class="pill" width="188" height="60" rx="30" />
    <text class="pill-text" x="34" y="39">${theme.label}</text>
  </g>
  <ellipse class="ground" cx="600" cy="1034" rx="230" ry="34" />
  <g class="stage-figure" filter="url(#${softShadowId})">
    <g class="figure-equipment">
      ${renderEquipment(pose.equipment)}
    </g>
    <g class="figure-highlights">
      ${renderHighlights(pose.highlights)}
    </g>
    <g class="figure-guides">
      ${renderGuideLines(pose.guideLines, theme.markerClass)}
    </g>
    <g class="figure-body">
      ${renderBody(pose.points)}
    </g>
  </g>
  <text class="caption" x="72" y="1092">${escapeHtml(pose.caption)}</text>
  <text class="accent-copy" x="72" y="1136">${escapeHtml(pose.footer)}</text>
</svg>`;
}

function renderBody(points) {
  const torsoPath = [
    `M ${points.leftShoulder.x} ${points.leftShoulder.y}`,
    `L ${points.rightShoulder.x} ${points.rightShoulder.y}`,
    `L ${points.rightHip.x} ${points.rightHip.y}`,
    `L ${points.leftHip.x} ${points.leftHip.y}`,
    "Z",
  ].join(" ");

  const lines = [
    line(points.leftShoulder, points.leftElbow),
    line(points.leftElbow, points.leftHand),
    line(points.rightShoulder, points.rightElbow),
    line(points.rightElbow, points.rightHand),
    line(points.leftHip, points.leftKnee),
    line(points.leftKnee, points.leftFoot),
    line(points.rightHip, points.rightKnee),
    line(points.rightKnee, points.rightFoot),
  ];

  const joints = [
    points.leftShoulder,
    points.rightShoulder,
    points.leftElbow,
    points.rightElbow,
    points.leftHand,
    points.rightHand,
    points.leftHip,
    points.rightHip,
    points.leftKnee,
    points.rightKnee,
    points.leftFoot,
    points.rightFoot,
  ];

  return `
    <path class="body-core" d="${torsoPath}" />
    <line class="body-line" x1="${points.neck.x}" y1="${points.neck.y}" x2="${points.pelvis.x}" y2="${points.pelvis.y}" />
    ${lines.join("")}
    <circle class="body-core" cx="${points.head.x}" cy="${points.head.y}" r="64" />
    ${joints
      .map(
        (joint) => `
      <circle class="joint" cx="${joint.x}" cy="${joint.y}" r="19" />
      <circle class="joint-outline" cx="${joint.x}" cy="${joint.y}" r="19" />`,
      )
      .join("")}
  `;
}

function line(start, end) {
  return `<line class="body-line" x1="${start.x}" y1="${start.y}" x2="${end.x}" y2="${end.y}" />`;
}

function renderHighlights(highlights) {
  return highlights
    .map(
      (item) =>
        `<ellipse class="highlight" cx="${item.cx}" cy="${item.cy}" rx="${item.rx}" ry="${item.ry}" opacity="${item.opacity ?? 1}" />`,
    )
    .join("");
}

function renderGuideLines(lines, className) {
  return lines
    .map((item) => {
      if (item.type === "curve") {
        return `<path class="guide-line ${className}" d="${item.d}" opacity="${item.opacity ?? 1}" />`;
      }

      if (item.type === "dash") {
        return `<path class="guide-dash" d="${item.d}" opacity="${item.opacity ?? 1}" />`;
      }

      return `<line class="guide-line ${className}" x1="${item.x1}" y1="${item.y1}" x2="${item.x2}" y2="${item.y2}" opacity="${item.opacity ?? 1}" />`;
    })
    .join("");
}

function renderEquipment(equipment) {
  if (!equipment || equipment.type === "none") {
    return "";
  }

  if (equipment.type === "dumbbells") {
    return equipment.hands
      .map((hand) => drawDumbbell(hand.cx, hand.cy, hand.angle ?? 0))
      .join("");
  }

  if (equipment.type === "band") {
    return `
      <circle class="machine-detail" cx="${equipment.anchor.x}" cy="${equipment.anchor.y}" r="14" />
      <path class="guide-dash" d="M ${equipment.anchor.x} ${equipment.anchor.y} L ${equipment.leftHand.x} ${equipment.leftHand.y}" />
      <path class="guide-dash" d="M ${equipment.anchor.x} ${equipment.anchor.y} L ${equipment.rightHand.x} ${equipment.rightHand.y}" />
    `;
  }

  if (equipment.type === "platform") {
    return `<path class="machine" d="${equipment.d}" />`;
  }

  if (equipment.type === "treadmill") {
    return `
      <rect class="machine" x="330" y="840" width="540" height="84" rx="30" />
      <rect class="machine" x="782" y="526" width="34" height="318" rx="17" />
      <rect class="machine-detail" x="728" y="474" width="110" height="58" rx="22" />
    `;
  }

  if (equipment.type === "step-box") {
    return `<rect class="machine" x="430" y="826" width="320" height="118" rx="28" />`;
  }

  if (equipment.type === "lat-machine") {
    return `
      <rect class="machine" x="400" y="214" width="400" height="30" rx="15" />
      <rect class="machine" x="420" y="214" width="22" height="620" rx="11" />
      <rect class="machine" x="758" y="214" width="22" height="620" rx="11" />
      <rect class="machine" x="448" y="784" width="310" height="34" rx="17" />
      <rect class="machine-detail" x="510" y="812" width="168" height="72" rx="26" />
      <line class="machine" x1="${equipment.bar.x1}" y1="${equipment.bar.y1}" x2="${equipment.bar.x2}" y2="${equipment.bar.y2}" style="stroke-width: 24; stroke-linecap: round;" />
    `;
  }

  if (equipment.type === "press-machine") {
    return `
      <rect class="machine" x="394" y="410" width="108" height="372" rx="44" />
      <rect class="machine" x="464" y="760" width="266" height="38" rx="19" />
      <rect class="machine" x="574" y="310" width="160" height="126" rx="36" />
      <line class="machine" x1="${equipment.handleLeft.x1}" y1="${equipment.handleLeft.y1}" x2="${equipment.handleLeft.x2}" y2="${equipment.handleLeft.y2}" style="stroke-width: 18; stroke-linecap: round;" />
      <line class="machine" x1="${equipment.handleRight.x1}" y1="${equipment.handleRight.y1}" x2="${equipment.handleRight.x2}" y2="${equipment.handleRight.y2}" style="stroke-width: 18; stroke-linecap: round;" />
    `;
  }

  if (equipment.type === "row-machine") {
    return `
      <rect class="machine" x="350" y="810" width="360" height="42" rx="21" />
      <rect class="machine" x="690" y="766" width="132" height="62" rx="22" />
      <line class="machine" x1="${equipment.cable.x1}" y1="${equipment.cable.y1}" x2="${equipment.cable.x2}" y2="${equipment.cable.y2}" style="stroke-width: 10; stroke-linecap: round;" />
      <line class="machine" x1="${equipment.handle.x1}" y1="${equipment.handle.y1}" x2="${equipment.handle.x2}" y2="${equipment.handle.y2}" style="stroke-width: 18; stroke-linecap: round;" />
    `;
  }

  if (equipment.type === "leg-press") {
    return `
      <path class="machine" d="M 360 864 L 860 664 L 920 742 L 432 962 Z" />
      <rect class="machine" x="314" y="702" width="160" height="220" rx="46" transform="rotate(-20 394 812)" />
      <rect class="machine-detail" x="748" y="570" width="136" height="176" rx="28" transform="rotate(-20 816 658)" />
    `;
  }

  return "";
}

function drawDumbbell(cx, cy, angle) {
  return `
    <g transform="translate(${cx} ${cy}) rotate(${angle})">
      <line class="machine" x1="-54" y1="0" x2="54" y2="0" style="stroke-width: 18; stroke-linecap: round;" />
      <rect class="machine-detail" x="-82" y="-28" width="18" height="56" rx="8" />
      <rect class="machine-detail" x="-60" y="-38" width="18" height="76" rx="8" />
      <rect class="machine-detail" x="42" y="-38" width="18" height="76" rx="8" />
      <rect class="machine-detail" x="64" y="-28" width="18" height="56" rx="8" />
    </g>
  `;
}

function getPoseDefinition(exerciseId, variant) {
  switch (exerciseId) {
    case "warmup-march":
      return standingMarchPose(variant);
    case "bodyweight-squat":
      return squatPose(variant, false);
    case "goblet-squat":
      return squatPose(variant, true);
    case "glute-bridge":
      return bridgePose(variant);
    case "incline-push-up":
      return inclinePushUpPose(variant);
    case "dumbbell-row":
      return rowPose(variant, "dumbbell");
    case "band-row":
      return rowPose(variant, "band");
    case "plank":
      return plankPose(variant);
    case "treadmill-walk":
      return walkingPose(variant, "treadmill");
    case "step-cardio":
      return walkingPose(variant, "step");
    case "lat-pulldown":
      return latPulldownPose(variant);
    case "machine-chest-press":
      return chestPressPose(variant);
    case "seated-cable-row":
      return seatedCableRowPose(variant);
    case "leg-press":
      return legPressPose(variant);
    case "stretch-full-body":
      return stretchPose(variant);
    default:
      return standingMarchPose("proper");
  }
}

function standingMarchPose(variant) {
  if (variant === "proper") {
    return {
      caption: "抬膝靠髋前侧发力，躯干保持直立。",
      footer: "保持脚步轻，先把节奏和稳定性做出来。",
      equipment: { type: "none" },
      highlights: [
        { cx: 600, cy: 364, rx: 86, ry: 132, opacity: 0.75 },
        { cx: 664, cy: 686, rx: 70, ry: 126, opacity: 0.54 },
      ],
      guideLines: [
        { type: "line", x1: 600, y1: 208, x2: 600, y2: 958, opacity: 0.66 },
        { type: "curve", d: "M 686 632 C 742 602, 772 548, 764 488", opacity: 0.72 },
      ],
      points: {
        head: pt(600, 208),
        neck: pt(600, 284),
        leftShoulder: pt(528, 324),
        rightShoulder: pt(672, 324),
        leftElbow: pt(484, 444),
        rightElbow: pt(724, 434),
        leftHand: pt(528, 566),
        rightHand: pt(676, 562),
        leftHip: pt(548, 520),
        rightHip: pt(652, 520),
        pelvis: pt(600, 520),
        leftKnee: pt(558, 746),
        rightKnee: pt(676, 632),
        leftFoot: pt(548, 958),
        rightFoot: pt(714, 860),
      },
    };
  }

  return {
    caption: "错误：上身后仰借力，膝盖抬得过高。",
    footer: "抬膝不是甩腿，别用后仰去凑幅度。",
    equipment: { type: "none" },
    highlights: [
      { cx: 602, cy: 440, rx: 128, ry: 166, opacity: 0.82 },
      { cx: 744, cy: 570, rx: 92, ry: 128, opacity: 0.54 },
    ],
    guideLines: [
      { type: "line", x1: 500, y1: 244, x2: 650, y2: 958, opacity: 0.76 },
      { type: "curve", d: "M 726 580 C 806 536, 848 470, 836 388", opacity: 0.8 },
    ],
    points: {
      head: pt(548, 232),
      neck: pt(586, 320),
      leftShoulder: pt(498, 374),
      rightShoulder: pt(648, 350),
      leftElbow: pt(470, 498),
      rightElbow: pt(706, 456),
      leftHand: pt(526, 620),
      rightHand: pt(662, 592),
      leftHip: pt(550, 544),
      rightHip: pt(646, 518),
      pelvis: pt(600, 532),
      leftKnee: pt(576, 760),
      rightKnee: pt(736, 578),
      leftFoot: pt(566, 962),
      rightFoot: pt(792, 804),
    },
  };
}

function squatPose(variant, withWeight) {
  const equipment = withWeight
    ? {
        type: "dumbbells",
        hands: [{
          cx: variant === "proper" ? 600 : 632,
          cy: variant === "proper" ? 402 : 446,
          angle: variant === "proper" ? 90 : 74,
        }],
      }
    : { type: "none" };

  if (variant === "proper") {
    return {
      caption: withWeight ? "哑铃贴近胸前，膝盖顺着脚尖方向发力。" : "臀部向后坐，膝盖和脚尖同向。",
      footer: "下蹲深度服从稳定，不要先追求更深。",
      equipment,
      highlights: [
        { cx: 560, cy: 742, rx: 92, ry: 152, opacity: 0.68 },
        { cx: 642, cy: 742, rx: 92, ry: 152, opacity: 0.68 },
        { cx: 600, cy: 516, rx: 90, ry: 98, opacity: 0.48 },
      ],
      guideLines: [
        { type: "dash", d: "M 472 882 L 520 704 L 548 550", opacity: 0.52 },
        { type: "dash", d: "M 728 882 L 682 704 L 652 550", opacity: 0.52 },
      ],
      points: {
        head: pt(600, 208),
        neck: pt(600, 284),
        leftShoulder: pt(528, 330),
        rightShoulder: pt(672, 330),
        leftElbow: withWeight ? pt(556, 398) : pt(490, 450),
        rightElbow: withWeight ? pt(644, 398) : pt(710, 450),
        leftHand: withWeight ? pt(576, 438) : pt(522, 564),
        rightHand: withWeight ? pt(624, 438) : pt(678, 564),
        leftHip: pt(548, 522),
        rightHip: pt(652, 522),
        pelvis: pt(600, 522),
        leftKnee: pt(512, 750),
        rightKnee: pt(688, 750),
        leftFoot: pt(470, 962),
        rightFoot: pt(730, 962),
      },
    };
  }

  return {
    caption: withWeight ? "错误：抱铃离身、膝盖内扣、上身前栽。" : "错误：膝盖内扣，靠塌腰和前倾硬蹲。",
    footer: "先把膝盖轨迹和躯干稳定做对，再谈深度和重量。",
    equipment,
    highlights: [
      { cx: 598, cy: 740, rx: 88, ry: 154, opacity: 0.82 },
      { cx: 576, cy: 492, rx: 132, ry: 132, opacity: 0.56 },
    ],
    guideLines: [
      { type: "line", x1: 562, y1: 348, x2: 612, y2: 958, opacity: 0.76 },
      { type: "curve", d: "M 566 762 C 592 722, 600 706, 606 696", opacity: 0.82 },
      { type: "curve", d: "M 634 758 C 616 722, 610 706, 606 696", opacity: 0.82 },
    ],
    points: {
      head: pt(556, 248),
      neck: pt(582, 330),
      leftShoulder: pt(496, 392),
      rightShoulder: pt(628, 372),
      leftElbow: withWeight ? pt(520, 476) : pt(468, 504),
      rightElbow: withWeight ? pt(670, 458) : pt(690, 486),
      leftHand: withWeight ? pt(516, 540) : pt(512, 622),
      rightHand: withWeight ? pt(710, 522) : pt(662, 624),
      leftHip: pt(564, 560),
      rightHip: pt(632, 548),
      pelvis: pt(598, 554),
      leftKnee: pt(590, 754),
      rightKnee: pt(618, 750),
      leftFoot: pt(486, 962),
      rightFoot: pt(712, 952),
    },
  };
}

function bridgePose(variant) {
  if (variant === "proper") {
    return {
      caption: "用臀部把骨盆抬起，不要靠下背去顶。",
      footer: "顶端轻停一秒，感受臀部收缩。",
      equipment: { type: "platform", d: "M 244 962 L 956 962" },
      highlights: [
        { cx: 632, cy: 612, rx: 98, ry: 84, opacity: 0.72 },
        { cx: 762, cy: 664, rx: 84, ry: 118, opacity: 0.52 },
      ],
      guideLines: [
        { type: "line", x1: 402, y1: 666, x2: 840, y2: 544, opacity: 0.74 },
      ],
      points: {
        head: pt(320, 684),
        neck: pt(384, 664),
        leftShoulder: pt(420, 640),
        rightShoulder: pt(436, 700),
        leftElbow: pt(350, 730),
        rightElbow: pt(404, 776),
        leftHand: pt(292, 812),
        rightHand: pt(344, 844),
        leftHip: pt(612, 576),
        rightHip: pt(638, 642),
        pelvis: pt(624, 610),
        leftKnee: pt(822, 660),
        rightKnee: pt(796, 718),
        leftFoot: pt(910, 892),
        rightFoot: pt(850, 916),
      },
    };
  }

  return {
    caption: "错误：腰椎过度后仰，臀部没有真正发力。",
    footer: "别为了抬更高去把动作做成顶腰。",
    equipment: { type: "platform", d: "M 244 962 L 956 962" },
    highlights: [
      { cx: 554, cy: 600, rx: 102, ry: 82, opacity: 0.8 },
      { cx: 640, cy: 540, rx: 82, ry: 66, opacity: 0.44 },
    ],
    guideLines: [
      { type: "curve", d: "M 420 664 C 548 592, 612 536, 726 526", opacity: 0.8 },
    ],
    points: {
      head: pt(320, 684),
      neck: pt(384, 664),
      leftShoulder: pt(420, 640),
      rightShoulder: pt(436, 700),
      leftElbow: pt(350, 730),
      rightElbow: pt(404, 776),
      leftHand: pt(292, 812),
      rightHand: pt(344, 844),
      leftHip: pt(588, 548),
      rightHip: pt(626, 620),
      pelvis: pt(608, 584),
      leftKnee: pt(804, 694),
      rightKnee: pt(780, 746),
      leftFoot: pt(896, 894),
      rightFoot: pt(838, 918),
    },
  };
}

function inclinePushUpPose(variant) {
  const equipment = {
    type: "platform",
    d: "M 742 382 L 1038 300 L 1062 384 L 766 468 Z",
  };

  if (variant === "proper") {
    return {
      caption: "头到脚保持一条斜线，核心稳定，胸口主动靠近支撑面。",
      footer: "推起时想象把支撑面推远。",
      equipment,
      highlights: [
        { cx: 660, cy: 514, rx: 124, ry: 88, opacity: 0.72 },
        { cx: 538, cy: 566, rx: 86, ry: 74, opacity: 0.5 },
      ],
      guideLines: [
        { type: "line", x1: 354, y1: 650, x2: 900, y2: 472, opacity: 0.74 },
      ],
      points: {
        head: pt(914, 454),
        neck: pt(858, 474),
        leftShoulder: pt(780, 486),
        rightShoulder: pt(806, 544),
        leftElbow: pt(840, 556),
        rightElbow: pt(878, 604),
        leftHand: pt(936, 498),
        rightHand: pt(960, 556),
        leftHip: pt(624, 554),
        rightHip: pt(650, 612),
        pelvis: pt(636, 584),
        leftKnee: pt(492, 632),
        rightKnee: pt(514, 692),
        leftFoot: pt(356, 710),
        rightFoot: pt(382, 764),
      },
    };
  }

  return {
    caption: "错误：塌腰、耸肩，用下背硬撑动作。",
    footer: "做不到时先把斜面调高，别让姿势散掉。",
    equipment,
    highlights: [
      { cx: 662, cy: 666, rx: 134, ry: 94, opacity: 0.84 },
      { cx: 796, cy: 510, rx: 94, ry: 78, opacity: 0.5 },
    ],
    guideLines: [
      { type: "curve", d: "M 380 766 C 560 628, 694 704, 938 526", opacity: 0.8 },
    ],
    points: {
      head: pt(900, 468),
      neck: pt(842, 488),
      leftShoulder: pt(754, 504),
      rightShoulder: pt(784, 572),
      leftElbow: pt(850, 586),
      rightElbow: pt(908, 646),
      leftHand: pt(936, 506),
      rightHand: pt(974, 574),
      leftHip: pt(660, 652),
      rightHip: pt(688, 726),
      pelvis: pt(674, 690),
      leftKnee: pt(506, 664),
      rightKnee: pt(534, 732),
      leftFoot: pt(368, 706),
      rightFoot: pt(402, 778),
    },
  };
}

function rowPose(variant, mode) {
  const equipment = mode === "dumbbell"
    ? { type: "dumbbells", hands: [{ cx: 756, cy: variant === "proper" ? 676 : 724, angle: 18 }] }
    : {
        type: "band",
        anchor: pt(994, 516),
        leftHand: pt(758, variant === "proper" ? 624 : 660),
        rightHand: pt(782, variant === "proper" ? 684 : 734),
      };

  if (variant === "proper") {
    return {
      caption: mode === "dumbbell" ? "先收肩胛，再把肘部贴着身体向后拉。" : "脊柱中立，手肘向后划，别靠后仰借力。",
      footer: "拉的时候胸口打开，脖子保持放松。",
      equipment,
      highlights: [
        { cx: 626, cy: 498, rx: 132, ry: 104, opacity: 0.72 },
        { cx: 724, cy: 648, rx: 76, ry: 78, opacity: 0.42 },
      ],
      guideLines: [
        { type: "line", x1: 446, y1: 396, x2: 886, y2: 520, opacity: 0.72 },
      ],
      points: {
        head: pt(420, 338),
        neck: pt(470, 382),
        leftShoulder: pt(516, 434),
        rightShoulder: pt(540, 492),
        leftElbow: pt(630, 492),
        rightElbow: pt(690, 566),
        leftHand: pt(722, 544),
        rightHand: pt(754, 628),
        leftHip: pt(640, 546),
        rightHip: pt(666, 606),
        pelvis: pt(652, 576),
        leftKnee: pt(764, 722),
        rightKnee: pt(804, 792),
        leftFoot: pt(892, 918),
        rightFoot: pt(938, 972),
      },
    };
  }

  return {
    caption: mode === "dumbbell" ? "错误：圆背、耸肩，只靠手臂猛拉。" : "错误：身体后仰借力，肩膀顶起来，背部失去发力。",
    footer: "先减轻重量或阻力，把肩胛控制找回来。",
    equipment,
    highlights: [
      { cx: 590, cy: 500, rx: 148, ry: 118, opacity: 0.84 },
      { cx: 742, cy: 654, rx: 92, ry: 96, opacity: 0.52 },
    ],
    guideLines: [
      { type: "curve", d: "M 468 428 C 646 362, 776 504, 930 612", opacity: 0.82 },
    ],
    points: {
      head: pt(472, 362),
      neck: pt(532, 416),
      leftShoulder: pt(594, 494),
      rightShoulder: pt(624, 566),
      leftElbow: pt(716, 560),
      rightElbow: pt(786, 656),
      leftHand: pt(782, 634),
      rightHand: pt(842, 748),
      leftHip: pt(674, 600),
      rightHip: pt(706, 676),
      pelvis: pt(690, 638),
      leftKnee: pt(782, 748),
      rightKnee: pt(836, 832),
      leftFoot: pt(906, 934),
      rightFoot: pt(964, 992),
    },
  };
}

function plankPose(variant) {
  if (variant === "proper") {
    return {
      caption: "头、肩、髋、脚跟基本成直线，腹部持续收紧。",
      footer: "宁可时间短一点，也别让姿势塌掉。",
      equipment: { type: "platform", d: "M 248 962 L 952 962" },
      highlights: [
        { cx: 598, cy: 588, rx: 196, ry: 92, opacity: 0.74 },
      ],
      guideLines: [
        { type: "line", x1: 320, y1: 652, x2: 920, y2: 618, opacity: 0.78 },
      ],
      points: {
        head: pt(916, 598),
        neck: pt(858, 606),
        leftShoulder: pt(764, 616),
        rightShoulder: pt(760, 676),
        leftElbow: pt(704, 648),
        rightElbow: pt(706, 706),
        leftHand: pt(668, 714),
        rightHand: pt(674, 770),
        leftHip: pt(610, 630),
        rightHip: pt(610, 690),
        pelvis: pt(610, 660),
        leftKnee: pt(462, 638),
        rightKnee: pt(464, 700),
        leftFoot: pt(322, 646),
        rightFoot: pt(326, 708),
      },
    };
  }

  return {
    caption: "错误：塌腰或臀部过高，核心失去张力。",
    footer: "不稳时改成跪姿或缩短保持时间。",
    equipment: { type: "platform", d: "M 248 962 L 952 962" },
    highlights: [
      { cx: 626, cy: 726, rx: 176, ry: 92, opacity: 0.84 },
    ],
    guideLines: [
      { type: "curve", d: "M 324 716 C 538 624, 692 806, 922 646", opacity: 0.8 },
    ],
    points: {
      head: pt(918, 612),
      neck: pt(856, 620),
      leftShoulder: pt(758, 626),
      rightShoulder: pt(754, 688),
      leftElbow: pt(698, 662),
      rightElbow: pt(700, 724),
      leftHand: pt(662, 730),
      rightHand: pt(666, 792),
      leftHip: pt(632, 736),
      rightHip: pt(632, 804),
      pelvis: pt(632, 770),
      leftKnee: pt(474, 694),
      rightKnee: pt(476, 760),
      leftFoot: pt(324, 664),
      rightFoot: pt(330, 730),
    },
  };
}

function walkingPose(variant, mode) {
  const equipment = mode === "treadmill" ? { type: "treadmill" } : { type: "step-box" };

  if (variant === "proper") {
    return {
      caption: mode === "treadmill" ? "快走时保持上身直立，不要一直扶把手。" : "踏步时先整脚踩稳，再换另一只脚。",
      footer: "节奏先稳，再去提高强度。",
      equipment,
      highlights: [
        { cx: 600, cy: 364, rx: 88, ry: 132, opacity: 0.7 },
        { cx: 666, cy: 724, rx: 74, ry: 126, opacity: 0.54 },
      ],
      guideLines: [
        { type: "line", x1: 600, y1: 208, x2: 600, y2: 958, opacity: 0.68 },
      ],
      points: {
        head: pt(600, 208),
        neck: pt(600, 284),
        leftShoulder: pt(528, 324),
        rightShoulder: pt(672, 324),
        leftElbow: pt(486, 446),
        rightElbow: pt(720, 430),
        leftHand: pt(534, 568),
        rightHand: mode === "treadmill" ? pt(690, 540) : pt(682, 560),
        leftHip: pt(548, 520),
        rightHip: pt(652, 520),
        pelvis: pt(600, 520),
        leftKnee: pt(558, 750),
        rightKnee: pt(680, mode === "treadmill" ? 676 : 650),
        leftFoot: pt(548, 962),
        rightFoot: pt(720, mode === "treadmill" ? 920 : 892),
      },
    };
  }

  return {
    caption: mode === "treadmill" ? "错误：身体前趴、抓扶手，步幅越来越乱。" : "错误：盯着脚看、塌腰前冲，重心不稳。",
    footer: "把速度降下来，先把步态和呼吸稳住。",
    equipment,
    highlights: [
      { cx: 586, cy: 430, rx: 124, ry: 150, opacity: 0.82 },
      { cx: 706, cy: 734, rx: 82, ry: 112, opacity: 0.5 },
    ],
    guideLines: [
      { type: "curve", d: "M 514 254 C 602 302, 622 432, 632 952", opacity: 0.78 },
    ],
    points: {
      head: pt(568, 228),
      neck: pt(590, 302),
      leftShoulder: pt(514, 350),
      rightShoulder: pt(650, 338),
      leftElbow: pt(470, 478),
      rightElbow: pt(724, 426),
      leftHand: pt(520, 602),
      rightHand: mode === "treadmill" ? pt(780, 480) : pt(688, 592),
      leftHip: pt(550, 540),
      rightHip: pt(646, 528),
      pelvis: pt(598, 534),
      leftKnee: pt(566, 760),
      rightKnee: pt(702, 676),
      leftFoot: pt(552, 962),
      rightFoot: pt(738, mode === "treadmill" ? 920 : 900),
    },
  };
}

function latPulldownPose(variant) {
  if (variant === "proper") {
    return {
      caption: "先沉肩，再把横杆拉向上胸，不要拉到脑后。",
      footer: "胸口轻轻抬起，但别大幅后仰借力。",
      equipment: {
        type: "lat-machine",
        bar: { x1: 478, y1: 386, x2: 722, y2: 386 },
      },
      highlights: [
        { cx: 600, cy: 430, rx: 138, ry: 120, opacity: 0.72 },
        { cx: 600, cy: 570, rx: 90, ry: 84, opacity: 0.42 },
      ],
      guideLines: [
        { type: "line", x1: 600, y1: 284, x2: 600, y2: 652, opacity: 0.62 },
      ],
      points: {
        head: pt(600, 230),
        neck: pt(600, 308),
        leftShoulder: pt(536, 354),
        rightShoulder: pt(664, 354),
        leftElbow: pt(506, 444),
        rightElbow: pt(694, 444),
        leftHand: pt(500, 386),
        rightHand: pt(700, 386),
        leftHip: pt(556, 530),
        rightHip: pt(644, 530),
        pelvis: pt(600, 530),
        leftKnee: pt(560, 742),
        rightKnee: pt(640, 742),
        leftFoot: pt(518, 966),
        rightFoot: pt(682, 966),
      },
    };
  }

  return {
    caption: "错误：身体后仰过多，还把横杆往脑后拉。",
    footer: "先减轻重量，恢复肩胛下沉和胸口稳定。",
    equipment: {
      type: "lat-machine",
      bar: { x1: 462, y1: 326, x2: 722, y2: 326 },
    },
    highlights: [
      { cx: 608, cy: 454, rx: 158, ry: 128, opacity: 0.82 },
      { cx: 614, cy: 318, rx: 124, ry: 88, opacity: 0.56 },
    ],
    guideLines: [
      { type: "curve", d: "M 544 246 C 552 384, 676 462, 752 560", opacity: 0.8 },
    ],
    points: {
      head: pt(564, 236),
      neck: pt(586, 320),
      leftShoulder: pt(518, 382),
      rightShoulder: pt(646, 362),
      leftElbow: pt(492, 454),
      rightElbow: pt(684, 454),
      leftHand: pt(474, 326),
      rightHand: pt(706, 326),
      leftHip: pt(568, 566),
      rightHip: pt(648, 544),
      pelvis: pt(608, 556),
      leftKnee: pt(578, 750),
      rightKnee: pt(640, 746),
      leftFoot: pt(528, 966),
      rightFoot: pt(680, 962),
    },
  };
}

function chestPressPose(variant) {
  if (variant === "proper") {
    return {
      caption: "手腕保持中立，肩膀下沉，胸口主动把把手推远。",
      footer: "回程要受控，不要让配重反弹。",
      equipment: {
        type: "press-machine",
        handleLeft: { x1: 744, y1: 456, x2: 818, y2: 420 },
        handleRight: { x1: 744, y1: 560, x2: 818, y2: 596 },
      },
      highlights: [
        { cx: 632, cy: 450, rx: 148, ry: 106, opacity: 0.72 },
        { cx: 752, cy: 504, rx: 88, ry: 70, opacity: 0.46 },
      ],
      guideLines: [
        { type: "line", x1: 650, y1: 450, x2: 810, y2: 450, opacity: 0.74 },
      ],
      points: {
        head: pt(570, 246),
        neck: pt(584, 320),
        leftShoulder: pt(550, 398),
        rightShoulder: pt(612, 430),
        leftElbow: pt(662, 438),
        rightElbow: pt(676, 534),
        leftHand: pt(756, 430),
        rightHand: pt(758, 548),
        leftHip: pt(556, 562),
        rightHip: pt(620, 594),
        pelvis: pt(588, 578),
        leftKnee: pt(520, 756),
        rightKnee: pt(640, 760),
        leftFoot: pt(474, 970),
        rightFoot: pt(672, 972),
      },
    };
  }

  return {
    caption: "错误：手腕后扣、耸肩，把压力全顶到肩前侧。",
    footer: "把座椅和握把位置调对，再开始加重。",
    equipment: {
        type: "press-machine",
        handleLeft: { x1: 724, y1: 428, x2: 818, y2: 398 },
        handleRight: { x1: 730, y1: 574, x2: 818, y2: 612 },
      },
    highlights: [
      { cx: 650, cy: 412, rx: 164, ry: 118, opacity: 0.84 },
      { cx: 758, cy: 516, rx: 102, ry: 86, opacity: 0.56 },
    ],
    guideLines: [
      { type: "curve", d: "M 622 336 C 694 338, 744 378, 804 470", opacity: 0.84 },
    ],
    points: {
      head: pt(582, 250),
      neck: pt(604, 330),
      leftShoulder: pt(586, 412),
      rightShoulder: pt(656, 450),
      leftElbow: pt(704, 450),
      rightElbow: pt(716, 568),
      leftHand: pt(744, 402),
      rightHand: pt(748, 594),
      leftHip: pt(562, 572),
      rightHip: pt(632, 608),
      pelvis: pt(598, 590),
      leftKnee: pt(524, 760),
      rightKnee: pt(644, 768),
      leftFoot: pt(474, 970),
      rightFoot: pt(676, 976),
    },
  };
}

function seatedCableRowPose(variant) {
  if (variant === "proper") {
    return {
      caption: "胸口打开，先收肩胛，再把把手拉向下肋附近。",
      footer: "回放时保持张力，不要前后乱晃借力。",
      equipment: {
        type: "row-machine",
        cable: { x1: 760, y1: 556, x2: 890, y2: 532 },
        handle: { x1: 726, y1: 560, x2: 768, y2: 560 },
      },
      highlights: [
        { cx: 604, cy: 456, rx: 140, ry: 112, opacity: 0.72 },
        { cx: 720, cy: 558, rx: 70, ry: 66, opacity: 0.46 },
      ],
      guideLines: [
        { type: "line", x1: 534, y1: 390, x2: 724, y2: 540, opacity: 0.72 },
      ],
      points: {
        head: pt(522, 272),
        neck: pt(544, 344),
        leftShoulder: pt(564, 412),
        rightShoulder: pt(622, 448),
        leftElbow: pt(662, 468),
        rightElbow: pt(706, 528),
        leftHand: pt(724, 552),
        rightHand: pt(760, 570),
        leftHip: pt(580, 578),
        rightHip: pt(642, 612),
        pelvis: pt(610, 594),
        leftKnee: pt(694, 754),
        rightKnee: pt(746, 806),
        leftFoot: pt(806, 930),
        rightFoot: pt(872, 978),
      },
    };
  }

  return {
    caption: "错误：圆背前冲或猛然后仰，全部靠惯性拉。",
    footer: "把重量降一点，先让肩胛和脊柱节奏重新对上。",
    equipment: {
      type: "row-machine",
      cable: { x1: 770, y1: 598, x2: 898, y2: 548 },
      handle: { x1: 736, y1: 600, x2: 780, y2: 600 },
    },
    highlights: [
      { cx: 614, cy: 492, rx: 156, ry: 124, opacity: 0.84 },
      { cx: 752, cy: 614, rx: 82, ry: 76, opacity: 0.52 },
    ],
    guideLines: [
      { type: "curve", d: "M 508 320 C 618 390, 674 494, 792 650", opacity: 0.82 },
    ],
    points: {
      head: pt(492, 304),
      neck: pt(526, 386),
      leftShoulder: pt(572, 468),
      rightShoulder: pt(638, 512),
      leftElbow: pt(694, 526),
      rightElbow: pt(748, 606),
      leftHand: pt(746, 618),
      rightHand: pt(792, 640),
      leftHip: pt(604, 624),
      rightHip: pt(672, 662),
      pelvis: pt(638, 644),
      leftKnee: pt(718, 770),
      rightKnee: pt(774, 828),
      leftFoot: pt(816, 932),
      rightFoot: pt(882, 986),
    },
  };
}

function legPressPose(variant) {
  if (variant === "proper") {
    return {
      caption: "臀部和下背贴稳座椅，膝盖顺着脚尖方向发力。",
      footer: "接近伸直就停，不要锁死膝盖。",
      equipment: { type: "leg-press" },
      highlights: [
        { cx: 702, cy: 630, rx: 112, ry: 152, opacity: 0.72 },
        { cx: 598, cy: 552, rx: 86, ry: 84, opacity: 0.44 },
      ],
      guideLines: [
        { type: "line", x1: 490, y1: 770, x2: 860, y2: 628, opacity: 0.76 },
      ],
      points: {
        head: pt(446, 474),
        neck: pt(492, 520),
        leftShoulder: pt(536, 570),
        rightShoulder: pt(564, 626),
        leftElbow: pt(478, 658),
        rightElbow: pt(522, 712),
        leftHand: pt(416, 738),
        rightHand: pt(456, 794),
        leftHip: pt(620, 654),
        rightHip: pt(648, 712),
        pelvis: pt(634, 684),
        leftKnee: pt(760, 700),
        rightKnee: pt(792, 754),
        leftFoot: pt(904, 640),
        rightFoot: pt(932, 694),
      },
    };
  }

  return {
    caption: "错误：膝盖锁死、臀部离座，压力顶到关节上。",
    footer: "先缩小活动范围，把贴背和膝盖轨迹守住。",
    equipment: { type: "leg-press" },
    highlights: [
      { cx: 770, cy: 724, rx: 118, ry: 144, opacity: 0.82 },
      { cx: 608, cy: 664, rx: 98, ry: 86, opacity: 0.46 },
    ],
    guideLines: [
      { type: "line", x1: 506, y1: 744, x2: 922, y2: 628, opacity: 0.78 },
      { type: "curve", d: "M 654 708 C 690 684, 726 670, 792 662", opacity: 0.72 },
    ],
    points: {
      head: pt(458, 488),
      neck: pt(506, 534),
      leftShoulder: pt(550, 586),
      rightShoulder: pt(578, 642),
      leftElbow: pt(498, 670),
      rightElbow: pt(542, 726),
      leftHand: pt(432, 748),
      rightHand: pt(470, 808),
      leftHip: pt(628, 676),
      rightHip: pt(658, 734),
      pelvis: pt(642, 706),
      leftKnee: pt(808, 688),
      rightKnee: pt(842, 742),
      leftFoot: pt(944, 618),
      rightFoot: pt(970, 674),
    },
  };
}

function stretchPose(variant) {
  if (variant === "proper") {
    return {
      caption: "上举延展后做轻柔侧屈，拉伸感觉停在可控范围内。",
      footer: "呼气时慢一点，不要弹震式猛拉。",
      equipment: { type: "none" },
      highlights: [
        { cx: 612, cy: 286, rx: 146, ry: 96, opacity: 0.62 },
        { cx: 646, cy: 496, rx: 112, ry: 168, opacity: 0.58 },
        { cx: 612, cy: 812, rx: 116, ry: 148, opacity: 0.34 },
      ],
      guideLines: [
        { type: "curve", d: "M 748 310 C 794 268, 822 212, 816 148", opacity: 0.74 },
        { type: "curve", d: "M 688 460 C 712 504, 720 558, 700 616", opacity: 0.72 },
      ],
      points: {
        head: pt(608, 200),
        neck: pt(608, 280),
        leftShoulder: pt(542, 324),
        rightShoulder: pt(670, 316),
        leftElbow: pt(520, 196),
        rightElbow: pt(726, 184),
        leftHand: pt(492, 100),
        rightHand: pt(792, 96),
        leftHip: pt(564, 528),
        rightHip: pt(658, 518),
        pelvis: pt(610, 524),
        leftKnee: pt(558, 746),
        rightKnee: pt(644, 742),
        leftFoot: pt(544, 958),
        rightFoot: pt(664, 956),
      },
    };
  }

  return {
    caption: "错误：塌腰耸肩，为了幅度把动作做成硬掰。",
    footer: "拉伸不是比赛，刺痛一出现就应该退回来。",
    equipment: { type: "none" },
    highlights: [
      { cx: 624, cy: 454, rx: 146, ry: 184, opacity: 0.78 },
      { cx: 646, cy: 312, rx: 126, ry: 92, opacity: 0.56 },
    ],
    guideLines: [
      { type: "curve", d: "M 560 334 C 620 390, 664 458, 700 628", opacity: 0.84 },
      { type: "curve", d: "M 650 352 C 694 324, 724 300, 742 248", opacity: 0.72 },
    ],
    points: {
      head: pt(598, 246),
      neck: pt(612, 334),
      leftShoulder: pt(556, 378),
      rightShoulder: pt(676, 370),
      leftElbow: pt(558, 286),
      rightElbow: pt(720, 276),
      leftHand: pt(542, 208),
      rightHand: pt(744, 224),
      leftHip: pt(590, 570),
      rightHip: pt(654, 562),
      pelvis: pt(622, 568),
      leftKnee: pt(592, 776),
      rightKnee: pt(652, 766),
      leftFoot: pt(572, 960),
      rightFoot: pt(682, 958),
    },
  };
}

function pt(x, y) {
  return { x, y };
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
