// Design-system gate: every text in a registry item can reach the i18n provider.
//
// Checked: src/core, src/blocks and src/hooks, without stories. A file that takes
// `i18n`, `labels` or `messages` reads the provider, a namespace belongs to a real
// item, a file that reads the provider is a client component (a hook can't run in
// a server one), and no fixed English sits in the markup.
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const UI_ROOT = join(__dirname, "..");
const SOURCE_DIRS = ["core", "blocks", "hooks"].map((dir) => join(UI_ROOT, "src", dir));

// A part that only forwards its parent's texts, or a text that isn't language.
const NO_PROVIDER: Record<string, string> = {};

const FIXED_ENGLISH = [
  /aria-label="[A-Z]/,
  /\btitle="[A-Z]/,
  /placeholder="[A-Z]/,
  /sr-only">[A-Z]/,
  /\b\w+ = "[A-Z][a-z]+[^"]*",\n/,
];

// Deliberate exceptions, keyed by file (relative to packages/ds). Keep the reason honest.
const ALLOWED_ENGLISH: Record<string, string> = {};

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return /\.tsx?$/.test(entry.name) && !entry.name.includes(".stories.") ? [path] : [];
  });
}

const files = SOURCE_DIRS.flatMap(sourceFiles).map((path) => ({
  path: relative(UI_ROOT, path),
  source: readFileSync(path, "utf8"),
}));

const camelCase = (name: string) =>
  name.replace(/-([a-z])/g, (_match, letter: string) => letter.toUpperCase());

const items = new Set(
  SOURCE_DIRS.flatMap((dir) =>
    readdirSync(dir, { withFileTypes: true }).map((entry) =>
      camelCase(entry.name.replace(/\.tsx?$/, "").replace(/\.meta\.json$/, "")),
    ),
  ),
);

const declared = files.flatMap(({ source }) =>
  [...source.matchAll(/interface FmaNamespaces \{\n\s+(\w+):/g)].map((match) => match[1]),
);

describe("i18n coverage", () => {
  const readers = files.filter(({ source }) => source.includes("useFmaMessages("));

  it.each(
    files
      .filter(({ source }) => /^\s+(i18n|labels|messages)\?: /m.test(source))
      .map(({ path, source }) => [path, source] as const),
  )("%s reads the provider", (path, source) => {
    if (path in NO_PROVIDER) return;
    expect(source).toContain("useFmaMessages(");
  });

  it.each(readers.map(({ path, source }) => [path, source] as const))(
    "%s is a client component",
    (_path, source) => {
      expect(source.trimStart().startsWith('"use client"')).toBe(true);
    },
  );

  it.each(declared.map((namespace) => [namespace] as const))("%s is an item", (namespace) => {
    expect([...items]).toContain(namespace);
  });

  it("every namespace read is declared", () => {
    const read = readers.flatMap(({ source }) =>
      [...source.matchAll(/useFmaMessages\(\s*"(\w+)"/g)].map((match) => match[1]),
    );
    expect(read.filter((namespace) => !declared.includes(namespace))).toEqual([]);
  });

  it.each(files.map(({ path, source }) => [path, source] as const))(
    "%s has no fixed English",
    (path, source) => {
      if (path in ALLOWED_ENGLISH) return;
      const code = source
        .split("\n")
        .filter((line) => !/^\s*(\/\/|\/?\*)/.test(line))
        .join("\n");
      expect(FIXED_ENGLISH.filter((pattern) => pattern.test(code))).toEqual([]);
    },
  );
});
