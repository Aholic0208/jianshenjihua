import { describe, expect, it } from "vitest";

import { buildHyperframesCommand } from "./hyperframes-command.mjs";

describe("buildHyperframesCommand", () => {
  it("uses cmd.exe on Windows to invoke HyperFrames through npx", () => {
    const command = buildHyperframesCommand(["render", "--output", "final.mp4"], "win32", "cmd.exe");

    expect(command.file).toBe("cmd.exe");
    expect(command.args.slice(0, 3)).toEqual(["/d", "/s", "/c"]);
    expect(command.args[3]).toContain("npx hyperframes render --output final.mp4");
  });

  it("uses npx directly on non-Windows platforms", () => {
    const command = buildHyperframesCommand(["lint"], "linux", "/bin/sh");

    expect(command).toEqual({
      file: "npx",
      args: ["hyperframes", "lint"],
    });
  });
});
