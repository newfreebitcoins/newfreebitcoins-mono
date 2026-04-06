import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendRoot = path.resolve(__dirname, "..");
const entryPoint = path.resolve(
  frontendRoot,
  "client",
  "scripts",
  "pages",
  "donate.js"
);
const outdir = path.resolve(frontendRoot, "client", "scripts", "generated");

await mkdir(outdir, { recursive: true });

await build({
  entryPoints: [entryPoint],
  outfile: path.resolve(outdir, "donate.bundle.js"),
  bundle: true,
  format: "esm",
  platform: "browser",
  target: "es2022",
  loader: {
    ".json": "json",
    ".wasm": "file"
  },
  assetNames: "[name]",
  sourcemap: false,
  logLevel: "info"
});
