// Storybook gate: story descriptions never name a document tag as raw HTML.
//
// Storybook's docs render a story's JSDoc as markdown, raw HTML included, so a
// bare `<html>` in a comment becomes a React `html` element. React 19 hoists it
// onto the page's real <html>, and the docs page's event dispatch then loops
// forever (a column resize froze the page). Name the tag in a code span.
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const UI_ROOT = join(__dirname, "..");
const SRC_DIR = join(UI_ROOT, "src");

function storyFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return storyFiles(path);
    return entry.name.endsWith(".stories.tsx") ? [path] : [];
  });
}

// A document tag outside a code span, opening or closing.
const RAW_DOCUMENT_TAG = /<\/?(html|head|body)\b[^>]*>/;

function rawDocumentTags(source: string): string[] {
  const comments = source.match(/\/\*\*[\s\S]*?\*\//g) ?? [];
  return comments.flatMap((comment) => {
    const prose = comment.replace(/`[^`\n]*`/g, "");
    const match = prose.match(RAW_DOCUMENT_TAG);
    return match ? [match[0]] : [];
  });
}

describe("story docs", () => {
  for (const file of storyFiles(SRC_DIR)) {
    it(`${relative(UI_ROOT, file)} names document tags in code spans`, () => {
      expect(rawDocumentTags(readFileSync(file, "utf8"))).toEqual([]);
    });
  }
});
