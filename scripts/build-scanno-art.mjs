// Builds the web-ready SCANNO case-study images from the marketing renders the owner supplied.
// Run: node scripts/build-scanno-art.mjs "<folder with the masters>"   (outputs are committed)
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = process.argv[2];
if (!source) throw new Error("Pass the folder that holds the SCANNO masters");
const target = path.join(root, "apps/web/public/work/scanno");

const MASTERS = {
  team: "Scanno Team.png",
  report: "inspectation report.png",
  inspection: "inside the center3.png",
  arrival: "inside the center.png",
  analysis: "inspectation.png",
};

await mkdir(target, { recursive: true });
for (const [name, file] of Object.entries(MASTERS)) {
  // Two widths: the page picks one with srcset, so a phone never downloads the large file.
  for (const [suffix, width, quality] of [["", 1600, 74], ["-sm", 800, 72]]) {
    const info = await sharp(path.join(source, file)).resize({ width, withoutEnlargement: true }).webp({ quality }).toFile(path.join(target, `${name}${suffix}.webp`));
    console.log(`${name}${suffix}.webp ${info.width}x${info.height} ${Math.round(info.size / 1024)} KB`);
  }
}
