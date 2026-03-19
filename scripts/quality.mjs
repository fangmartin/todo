import { promises as fs } from "node:fs";
import path from "node:path";

const ROOT_DIR = process.cwd();
const WRITE_MODE = process.argv.includes("--write");
const IGNORED_DIRS = new Set([".git", ".next", "node_modules"]);
const TARGET_EXTENSIONS = new Set([".css", ".json", ".md", ".ts", ".tsx"]);

async function walk(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (IGNORED_DIRS.has(entry.name)) {
      continue;
    }

    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
      continue;
    }

    if (TARGET_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }

  return files.sort();
}

function normalize(content, filePath) {
  let nextContent = content.replace(/\r\n/g, "\n");

  if (!filePath.endsWith(".md")) {
    nextContent = nextContent
      .split("\n")
      .map((line) => line.replace(/[ \t]+$/u, ""))
      .join("\n");
  }

  nextContent = nextContent.replace(/\n*$/u, "\n");

  return nextContent;
}

async function main() {
  const files = await walk(ROOT_DIR);
  const changedFiles = [];

  for (const filePath of files) {
    const original = await fs.readFile(filePath, "utf8");
    const normalized = normalize(original, filePath);

    if (original === normalized) {
      continue;
    }

    const relativePath = path.relative(ROOT_DIR, filePath);
    changedFiles.push(relativePath);

    if (WRITE_MODE) {
      await fs.writeFile(filePath, normalized, "utf8");
    }
  }

  if (changedFiles.length === 0) {
    console.log(
      WRITE_MODE
        ? "Formatting baseline already satisfied."
        : "Formatting baseline check passed.",
    );
    return;
  }

  if (WRITE_MODE) {
    console.log(`Normalized ${changedFiles.length} file(s):`);
    for (const filePath of changedFiles) {
      console.log(`- ${filePath}`);
    }
    return;
  }

  console.error("Formatting baseline check failed for:");
  for (const filePath of changedFiles) {
    console.error(`- ${filePath}`);
  }
  console.error("Run `npm run format` to normalize the repo-local baseline.");
  process.exitCode = 1;
}

await main();
