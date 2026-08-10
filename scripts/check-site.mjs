import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, resolve } from "node:path";

const root = resolve("_site");
const failures = [];

if (!existsSync(join(root, "index.html"))) {
  failures.push("Missing _site/index.html");
}

function walk(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

function internalTarget(url) {
  const clean = url.split("#")[0].split("?")[0];
  if (!clean || !clean.startsWith("/") || clean.startsWith("//")) return null;
  if (extname(clean)) return join(root, clean);
  return join(root, clean, "index.html");
}

if (existsSync(root)) {
  for (const file of walk(root).filter((path) => path.endsWith(".html"))) {
    const html = readFileSync(file, "utf8");
    const matches = html.matchAll(/(?:href|src)=["']([^"']+)["']/g);
    for (const match of matches) {
      const target = internalTarget(match[1]);
      if (target && !existsSync(target)) {
        failures.push(`${file.replace(`${root}/`, "")}: missing ${match[1]}`);
      }
    }
    if (/<img\b(?![^>]*\balt=)[^>]*>/i.test(html)) {
      failures.push(`${file.replace(`${root}/`, "")}: image without alt text`);
    }
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("KUSARIUM site checks passed.");
