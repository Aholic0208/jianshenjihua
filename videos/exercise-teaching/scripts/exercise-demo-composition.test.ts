import { describe, expect, it } from "vitest";

import { buildCompositionHtml } from "./exercise-demo-composition.mjs";

describe("buildCompositionHtml", () => {
  it("renders a moving robot demo scene with red muscle highlights for stretch-full-body", () => {
    const html = buildCompositionHtml({
      exerciseId: "stretch-full-body",
      exercise: {
        name: "全身拉伸放松",
        focus: "用缓慢呼吸把身体放松下来，不要追求疼痛感。",
        steps: ["从脚踝开始", "双臂上举延展", "左右侧屈放松"],
        cues: ["呼气时放松一点", "动作越慢越好", "有刺痛就停下"],
        mistakes: ["拉到疼痛", "弹震式拉伸", "憋气"],
        caution: "关节明显肿胀时优先休息和评估。",
      },
    });

    expect(html).toContain('data-robot-stage="true"');
    expect(html).toContain('data-motion-profile="mobility-flow"');
    expect(html).toContain('class="hotspot hotspot-primary"');
    expect(html).toContain('class="robot-figure"');
    expect(html).toContain("tl.to(\"#pose-arms\"");
    expect(html).toContain("tl.to(\"#hotspot-primary\"");
    expect(html).toContain('id="motion-arc-left"');
    expect(html).toContain('class="motion-path motion-path-primary"');
    expect(html).toContain('id="highlight-shoulders"');
    expect(html).toContain('class="highlight-shell highlight-shell-primary"');
    expect(html).toContain('attr: { cx: 360, cy: 246');
    expect(html).toContain('attr: { cx: 300, cy: 314');
    expect(html).toContain("tl.to(\"#highlight-shoulders\"");
  });
});
