// Published code reads theme tokens, never Tailwind's fixed gray palettes: `neutral-100` or
// `zinc-500` ignore the theme's background and hue (on a cream or tinted page they read as
// dirty gray, and the steps can land lighter than the page or under 3:1). The neutral tone is
// `--neutral` (`bg-neutral`, `text-neutral`) and its recipe in src/lib/tone.ts; static surfaces
// are the muted family. Colored palettes (`blue-600`) stay allowed for identity colors such as
// file-type's format colors. See AGENTS.md, rule 9.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "..");
const DIRS = ["core", "blocks", "lib", "hooks"].map((dir) => join(ROOT, "src", dir));
const EXTENSIONS = /\.(ts|tsx|css)$/;
const FIXED_GRAY =
  /\b(bg|text|border|ring|outline|fill|stroke|from|via|to|divide|shadow|placeholder|decoration|caret|accent)-(neutral|gray|zinc|slate|stone)-\d{2,3}\b|--color-(neutral|gray|zinc|slate|stone)-\d{2,3}\b/;

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return files(path);
    return EXTENSIONS.test(name) ? [path] : [];
  });
}

describe("the fixed-palette pattern", () => {
  it.each([
    "text-zinc-500",
    "hover:bg-neutral-100",
    "dark:border-gray-800",
    "bg-slate-50/50",
    "ring-stone-950",
    "fill-(--color-neutral-200)",
    "var(--color-zinc-500)",
  ])("flags %s", (line) => {
    expect(FIXED_GRAY.test(line)).toBe(true);
  });

  it.each([
    "bg-neutral",
    "text-neutral-foreground",
    "text-(color:--neutral-text)",
    "bg-blue-600",
    "tone: neutral-solid",
    '"neutral"',
  ])("ignores %s", (line) => {
    expect(FIXED_GRAY.test(line)).toBe(false);
  });
});

describe("fixed gray palettes", () => {
  it("no published source uses neutral, gray, zinc, slate or stone steps", () => {
    const found: string[] = [];
    for (const file of DIRS.flatMap(files)) {
      readFileSync(file, "utf8")
        .split("\n")
        .forEach((line, index) => {
          if (FIXED_GRAY.test(line))
            found.push(`${relative(ROOT, file)}:${index + 1}  ${line.trim()}`);
        });
    }
    expect(found).toEqual([]);
  });
});
