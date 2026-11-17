// The `secondary` and `invert` tokens are retired: neutral never uses them. Vendored code
// that arrives with them must switch to the muted family (static surfaces and secondary text),
// `accent` (interaction states) or a tone (components, via the tone lib).
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "..", "..", "..");
const DIRS = [join(ROOT, "packages", "ds", "src"), join(ROOT, "apps", "web", "src")];
const EXTENSIONS = /\.(ts|tsx|css)$/;
const RETIRED =
  /\b(bg|text|border|ring|outline|fill|stroke|from|via|to|divide|shadow)-(secondary|invert)(-foreground)?\b|\((color:)?--(secondary|invert)(-foreground)?\)|var\(--(secondary|invert)(-foreground)?[,)]|--color-(secondary|invert)/;

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === "node_modules" ? [] : files(path);
    return EXTENSIONS.test(name) ? [path] : [];
  });
}

describe("the retired-token pattern", () => {
  it.each([
    "hover:bg-secondary",
    "bg-secondary/50",
    "bg-(--secondary)",
    "text-(color:--invert)",
    "text-(color:--secondary-foreground)",
    "background: var(--secondary, #eee)",
    "color: var(--invert-foreground)",
    "--color-secondary: var(--muted)",
  ])("flags %s", (line) => {
    expect(RETIRED.test(line)).toBe(true);
  });

  it.each([
    'variant: "invert"',
    '{ id: "invert", label: "Invert" }',
    "a secondary navigation",
    "bg-(--tone-soft)",
  ])("ignores %s", (line) => {
    expect(RETIRED.test(line)).toBe(false);
  });
});

describe("retired tokens", () => {
  it("no source file uses secondary or invert", () => {
    const found: string[] = [];
    for (const file of DIRS.flatMap(files)) {
      readFileSync(file, "utf8")
        .split("\n")
        .forEach((line, index) => {
          if (RETIRED.test(line))
            found.push(`${relative(ROOT, file)}:${index + 1}  ${line.trim()}`);
        });
    }
    expect(found).toEqual([]);
  });
});
