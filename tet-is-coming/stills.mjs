import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "path";
const root = process.cwd();
const frames = process.argv.slice(2).map(Number);
const SC = Number(process.env.SC || 0.5);
const serveUrl = await bundle({ entryPoint: path.join(root, "src/index.ts") });
const opts = { serveUrl, browserExecutable: "/usr/bin/google-chrome", chromiumOptions: { gl: "angle" } };
const comp = await selectComposition({ ...opts, id: "TetIsComing" });
for (const f of frames) {
  await renderStill({ ...opts, composition: comp, frame: f, output: path.join(root, `out/stills/f${String(f).padStart(4, "0")}.png`), scale: SC });
  console.log("done", f);
}
if (process.env.THUMB) {
  const th = await selectComposition({ ...opts, id: "Thumb" });
  await renderStill({ ...opts, composition: th, output: path.join(root, "out/thumb.png"), scale: 1 });
  console.log("thumb");
}
