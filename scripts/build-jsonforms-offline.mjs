import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const entryFile = resolve(repoRoot, "jsonforms/src/main.jsx");
const outDir = resolve(repoRoot, "jsonforms/offline");

const result = await build({
  entryPoints: [entryFile],
  bundle: true,
  platform: "browser",
  format: "iife",
  jsx: "automatic",
  target: ["es2018"],
  outfile: resolve(outDir, "bundle.js"),
  write: false,
  loader: {
    ".json": "json"
  },
  define: {
    "process.env.NODE_ENV": '"production"'
  },
  minify: true,
  logLevel: "info"
});

const jsOutput = result.outputFiles.find((file) => file.path.endsWith(".js"));
const cssOutput = result.outputFiles.find((file) => file.path.endsWith(".css"));

if (!jsOutput) {
  throw new Error("Offline build failed: missing bundled JavaScript output.");
}

const jsCode = jsOutput.text;
const cssCode = cssOutput ? cssOutput.text : "";

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>JSON Forms Offline</title>
    <style>${cssCode}</style>
  </head>
  <body>
    <div id="root"></div>
    <script>${jsCode}</script>
  </body>
</html>
`;

await mkdir(outDir, { recursive: true });
await writeFile(resolve(outDir, "index.html"), html, "utf8");

console.log("Created offline bundle:", resolve(outDir, "index.html"));
