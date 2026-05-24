import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const serverDir = join(process.cwd(), ".next", "server");
const chunksDir = join(serverDir, "chunks");

if (!existsSync(serverDir) || !existsSync(chunksDir)) {
  process.exit(0);
}

mkdirSync(serverDir, { recursive: true });

const copied = [];

for (const entry of readdirSync(chunksDir)) {
  if (!entry.endsWith(".js")) {
    continue;
  }

  const source = join(chunksDir, entry);
  if (!statSync(source).isFile()) {
    continue;
  }

  const target = join(serverDir, entry);
  copyFileSync(source, target);
  copied.push(entry);
}

if (copied.length > 0) {
  console.log(`[postbuild] mirrored ${copied.length} server chunk files for next start compatibility`);
}
