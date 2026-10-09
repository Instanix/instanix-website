// Gives apps/web a self-contained node_modules after it has been built.
//
// Why: in this pnpm workspace, apps/web/node_modules is a set of links into the
// repository root. Hosts that publish only the app folder (Hostinger's Node.js
// hosting does) end up with dangling links and fail with "Cannot find module 'next'".
// `pnpm deploy` produces a real, production-only dependency tree for the app, and
// this script swaps it in.
//
// Run from the repository root or from apps/web, AFTER `next build`. It is meant
// for the host's build step, not for local development: afterwards the app folder
// has production dependencies only.
import { execFileSync } from "node:child_process";
import { existsSync, renameSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const app = path.join(root, "apps", "web");
const staging = path.join(root, ".deploy-web");

if (!existsSync(path.join(app, ".next"))) {
  throw new Error("apps/web/.next is missing: build the site before making it self-contained");
}

rmSync(staging, { recursive: true, force: true });
execFileSync("pnpm", ["--filter", "@ix/web", "deploy", "--legacy", "--prod", staging], {
  cwd: root,
  stdio: "inherit",
  shell: process.platform === "win32",
});

if (!existsSync(path.join(staging, "node_modules", "next", "package.json"))) {
  throw new Error("The self-contained dependency tree does not contain next");
}

rmSync(path.join(app, "node_modules"), { recursive: true, force: true });
renameSync(path.join(staging, "node_modules"), path.join(app, "node_modules"));
rmSync(staging, { recursive: true, force: true });

console.warn("apps/web/node_modules is now self-contained (production dependencies only)");
