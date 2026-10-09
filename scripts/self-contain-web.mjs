// Gives apps/web its own, self-contained node_modules before it is built.
//
// Why: in this pnpm workspace, apps/web/node_modules is a set of links into the
// repository root. The host (Hostinger's Node.js hosting) runs the site as a Next.js
// standalone server, which Next assembles at build time from files inside the app
// folder. With linked dependencies that bundle comes out without `next` and the server
// fails with "Cannot find module 'next'". `pnpm deploy` produces a real dependency
// tree for the app, and this script swaps it in so the build can trace it.
//
// It runs before `next build`. It is meant for the host's build step, not for local
// development.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, renameSync, rmSync } from "node:fs";
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

// Use the same pnpm that is running this build. A bare "pnpm" on the host's PATH can be an
// older release with different `deploy` options than the version pinned in package.json.
function pnpm(args) {
  const shell = process.platform === "win32";
  const pinned = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8")).packageManager;
  const running = process.env.npm_execpath;
  // Tried in order until one works: the pnpm running this script, corepack's pinned pnpm,
  // then the pinned version fetched with npx.
  const candidates = [
    ...(running && /\.[cm]?js$/.test(running) ? [[process.execPath, [running, ...args], false]] : []),
    ["corepack", ["pnpm", ...args], shell],
    ["npx", ["--yes", pinned, ...args], shell],
  ];
  let lastError;
  for (const [command, commandArgs, useShell] of candidates) {
    try {
      execFileSync(command, commandArgs, { cwd: root, stdio: "inherit", shell: useShell });
      return;
    } catch (error) {
      lastError = error;
      console.warn(`self-contain: "${command}" could not run pnpm deploy, trying the next option`);
    }
  }
  throw lastError;
}

rmSync(staging, { recursive: true, force: true });
// A flat (hoisted) tree with no links: the host dereferences links when it copies the standalone
// server, which breaks pnpm's default linked layout ("Cannot find module '@swc/helpers'").
pnpm(["--filter", "@ix/web", "deploy", "--legacy", "--config.node-linker=hoisted", staging]);

if (!existsSync(path.join(staging, "node_modules", "next", "package.json"))) {
  throw new Error("The self-contained dependency tree does not contain next");
}

rmSync(path.join(app, "node_modules"), { recursive: true, force: true });
renameSync(path.join(staging, "node_modules"), path.join(app, "node_modules"));
rmSync(staging, { recursive: true, force: true });

console.warn("apps/web/node_modules is now self-contained");
