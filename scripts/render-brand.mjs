// Rasterizes the Perpeto brand SVG sources in assets/brand into the PNG paths
// that app.json references. Run with: npm run brand:render
//
// Uses @resvg/resvg-js (self-contained, no system libraries required).
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";

const brandDir = resolve(dirname(fileURLToPath(import.meta.url)), "..", "assets", "brand");

/** @type {{ source: string; output: string; width: number }[]} */
const targets = [
  { source: "perpeto-icon.svg", output: "icon.png", width: 1024 },
  { source: "perpeto-foreground.svg", output: "android-foreground.png", width: 1024 },
  { source: "perpeto-monochrome.svg", output: "android-monochrome.png", width: 1024 },
  { source: "perpeto-splash.svg", output: "splash-lockup.png", width: 1200 },
  { source: "perpeto-mark-dark.svg", output: "mark-dark.png", width: 512 },
  { source: "perpeto-mark-light.svg", output: "mark-light.png", width: 512 },
  { source: "perpeto-icon.svg", output: "favicon.png", width: 196 },
];

for (const { source, output, width } of targets) {
  const svg = readFileSync(resolve(brandDir, source), "utf8");
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: width },
    font: { loadSystemFonts: true },
    background: "rgba(0,0,0,0)",
  });
  const png = resvg.render().asPng();
  writeFileSync(resolve(brandDir, output), png);
  console.log(`rendered ${output} (${width}px) from ${source}`);
}

console.log("Brand assets rendered.");
