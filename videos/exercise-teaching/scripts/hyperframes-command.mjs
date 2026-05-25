export function buildHyperframesCommand(args, platform = process.platform, comspec = process.env.ComSpec ?? "cmd.exe") {
  if (platform === "win32") {
    return {
      file: comspec,
      args: ["/d", "/s", "/c", `npx hyperframes ${args.map(quoteWindowsArg).join(" ")}`],
    };
  }

  return {
    file: "npx",
    args: ["hyperframes", ...args],
  };
}

function quoteWindowsArg(value) {
  if (/[\s"]/u.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}
