import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
  }) => React.createElement("a", { href, ...props }, children),
}));

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("notFound");
  },
}));

describe("ExerciseDetailPage", () => {
  it("does not render a duplicate play button in the hero header when local video exists", async () => {
    (globalThis as typeof globalThis & { React?: typeof React }).React = React;
    const { default: ExerciseDetailPage } = await import("./page");
    const element = await ExerciseDetailPage({
      params: Promise.resolve({ exerciseId: "dumbbell-row" }),
      searchParams: Promise.resolve({ week: "2", day: "9" }),
    });
    const markup = renderToStaticMarkup(element);

    expect(markup).not.toContain("播放站内讲解视频");
    expect(markup).toContain("视频演示");
    expect(markup).toContain("dumbbell-row-demo.mp4");
  });
});
