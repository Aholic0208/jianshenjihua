import { describe, expect, it } from "vitest";

import { buildCompositionHtml } from "./exercise-demo-composition.mjs";

describe("buildCompositionHtml", () => {
  it("renders a stable proper-vs-mistake explainer scene for stretch-full-body", () => {
    const html = buildCompositionHtml({
      exerciseId: "stretch-full-body",
      exercise: {
        name: "全身拉伸放松",
        focus: "用缓慢呼吸把身体放松下来，不要追求疼痛感。",
        steps: ["先上举延展", "再做轻柔侧屈", "每个位置停留并自然呼吸"],
        cues: ["动作越慢越好", "呼气时再放松一点", "有刺痛立刻缩小幅度"],
        mistakes: ["拉到疼痛", "弹震式拉伸", "耸肩塌腰"],
        caution: "关节明显肿胀时优先休息和评估。",
      },
    });

    expect(html).toContain('data-explainer-scene="true"');
    expect(html).toContain('data-exercise-id="stretch-full-body"');
    expect(html).toContain('class="clip pose-card pose-card-proper"');
    expect(html).toContain('class="clip pose-card pose-card-mistake"');
    expect(html).toContain("正确示范");
    expect(html).toContain("常见错误");
    expect(html).toContain("green-marker");
    expect(html).toContain("red-marker");
    expect(html).toContain('tl.to(".pose-card-proper"');
    expect(html).toContain('tl.to(".pose-card-mistake"');
    expect(html).toContain('addPoseMotion(tl, ".proper-art"');
    expect(html).toContain('addPoseMotion(tl, ".mistake-art"');
    expect(html).not.toContain('data-robot-stage="true"');
  });
});
