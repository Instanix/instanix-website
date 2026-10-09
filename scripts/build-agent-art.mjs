// Builds web-ready agent art from the transparent master renders in "Mascots team/".
// Run: pnpm agent-art   (outputs are committed; re-run only when the masters change)
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "Mascots team");
const targets = ["apps/web/public/agents", "apps/command/public/agents"].map((p) => path.join(root, p));

const MASTERS = {
  zeus: "ZEUS IX-001.png",
  athena: "ATHENA IX-002.png",
  hephaestus: "HEPHAESTUS IX-003.png",
  poseidon: "POSEIDON IX-004.png",
  ares: "ARES IX-005.png",
  hermes: "HERMES IX-006.png",
  apollo: "APOLLO IX-007.png",
  midas: "IX-008 Midas.png",
  themis: "IX-009 THEMIS.png",
  atlas: "IX-010.png",
  oracle: "IX-011.png",
  hestia: "IX-012.png",
};

/** Share of the trimmed figure's height that makes a head-and-chest bust. */
const BUST_RATIO = 0.42;

for (const dir of targets) await mkdir(dir, { recursive: true });

for (const [key, file] of Object.entries(MASTERS)) {
  // Masters differ in canvas size and padding, so crop to the figure first.
  const { data, info } = await sharp(path.join(source, file)).trim().png().toBuffer({ resolveWithObject: true });
  const side = Math.round(Math.min(info.width, info.height * BUST_RATIO));

  const full = await sharp(data).resize({ height: 900 }).webp({ quality: 84, alphaQuality: 90 }).toBuffer();
  const bust = await sharp(data)
    .extract({ left: Math.round((info.width - side) / 2), top: 0, width: side, height: side })
    .resize(320, 320)
    .webp({ quality: 84, alphaQuality: 90 })
    .toBuffer();

  for (const dir of targets) {
    await sharp(full).toFile(path.join(dir, `${key}.webp`));
    await sharp(bust).toFile(path.join(dir, `${key}-bust.webp`));
  }
  console.warn(`${key}: full ${(full.length / 1024).toFixed(0)} KB, bust ${(bust.length / 1024).toFixed(0)} KB`);
}

// Founder photos for the About page (sources kept with the brand assets).
const founderOut = path.join(root, "apps/web/public/founder");
await mkdir(founderOut, { recursive: true });
for (const [file, name] of [
  ["amir-with-zeus.webp", "with-zeus"],
  ["amir-portrait.webp", "portrait"],
  ["amir-profile.webp", "profile"],
  ["amir-art.png", "art"],
]) {
  await sharp(path.join(root, "IX-LOGO", "founder", file))
    .resize({ width: 900, withoutEnlargement: true })
    .webp({ quality: 84 })
    .toFile(path.join(founderOut, `${name}.webp`));
}

// Home page cover: the team key visual in front of the skyline.
const cover = await sharp(path.join(source, "IX TEAM CITY COVER.webp"))
  .resize({ width: 1920, withoutEnlargement: true })
  .webp({ quality: 80 })
  .toBuffer({ resolveWithObject: true });
await sharp(cover.data).toFile(path.join(root, "apps/web/public/hero-cover.webp"));
console.warn(`cover: ${cover.info.width}x${cover.info.height}, ${(cover.data.length / 1024).toFixed(0)} KB`);
