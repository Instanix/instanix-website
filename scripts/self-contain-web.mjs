// Gives apps/web a self-contained node_modules after it has been built.
//
// Why: in this pnpm workspace, apps/web/node_modules is a set of links into the
// repository root. Hosts that publish only the app folder (Hostinger's Node.js
// hosting does) end up with dangling links and fail with "Cannot find module 'next'".
// `pnpm deploy` produces a real, production-only dependency tree for the app, and
// this script swaps it in.
//
// It runs after `next build`. It is meant for the host's build step, not for local
// development: afterwards the app folder has production dependencies only.
import { execFileSync } from "node:child_process";
import { existsSync, renameSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// With --on-host-only this is a no-op everywhere except the host's build, so the normal
// `build` script can call it. The host is recognized by its build path (Hostinger builds
// under .../hbuilds/...) or by IX_SELF_CONTAIN=1 for any other host that needs it.
const onHost = process.env.IX_SELF_CONTAIN === "1" || root.split(path.sep).includes("hbuilds");
if (process.argv.includes("--on-host-only") && !onHost) {
  process.exit(0);
}

const app = path.join(root, "apps", "web");
const staging = path.join(root, ".deploy-web");

if (!existsSync(path.join(app, ".next"))) {
  throw new Error("apps/web/.next is missing: build the site before making it self-contained");
}

// Use the same pnpm that is running this build. A bare "pnpm" on the host's PATH can be an
// older release with different `deploy` options than the version pinned in package.json.
function pnpm(args) {
  const running = process.env.npm_execpath;
  if (running && /\.[cm]?js$/.test(running)) {
    execFileSync(process.execPath, [running, ...args], { cwd: root, stdio: "inherit" });
  } else {
    execFileSync("pnpm", args, { cwd: root, stdio: "inherit", shell: process.platform === "win32" });
  }
}

rmSync(staging, { recursive: true, force: true });
pnpm(["--filter", "@ix/web", "deploy", "--legacy", "--prod", staging]);

if (!existsSync(path.join(staging, "node_modules", "next", "package.json"))) {
  throw new Error("The self-contained dependency tree does not contain next");
}

rmSync(path.join(app, "node_modules"), { recursive: true, force: true });
renameSync(path.join(staging, "node_modules"), path.join(app, "node_modules"));
rmSync(staging, { recursive: true, force: true });

console.warn("apps/web/node_modules is now self-contained (production dependencies only)");
