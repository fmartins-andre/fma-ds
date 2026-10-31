// Design-system gate: published code makes no network requests by itself. The
// offline guide (apps/web/src/guides/offline.md) promises that to offline-first
// apps, so a new request or hard-coded URL has to be declared here and there.
//
// Checked: every file of every published item, with comments left out, since
// they often credit a source by URL.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const UI_ROOT = join(__dirname, "..");

const REQUEST = /\bfetch\(|XMLHttpRequest|sendBeacon|new WebSocket|new EventSource/;
const URL_LITERAL = /["'`]https?:\/\/(?!www\.w3\.org\/)/;
const REMOTE_IMPORT = /\bimport\(\s*["'`]https?:/;

// Deliberate exceptions, by item. Keep the reason honest, and keep the guide in step.
const ALLOWED: Record<string, string> = {
  "emoji-picker": "loads emojibase-data from a CDN unless given `data` or `dataUrl`",
};

function withoutComments(source: string) {
  return source
    .split("\n")
    .filter((line) => !/^\s*(\/\/|\/?\*)/.test(line))
    .join("\n")
    .replace(/\s\/\/ .*$/gm, "");
}

const registry = JSON.parse(readFileSync(join(UI_ROOT, "registry.json"), "utf8")) as {
  items: { name: string; files?: { path: string }[] }[];
};
const items = registry.items.filter((item) => item.files?.length);

function requests(item: (typeof items)[number]) {
  return (item.files ?? []).flatMap(({ path }) => {
    const source = withoutComments(readFileSync(join(UI_ROOT, path), "utf8"));
    return [REQUEST, URL_LITERAL, REMOTE_IMPORT]
      .filter((pattern) => pattern.test(source))
      .map((pattern) => `${path}: ${pattern.source}`);
  });
}

describe("external requests", () => {
  it.each(items.map((item) => [item.name, item] as const))("%s", (name, item) => {
    if (name in ALLOWED) return;
    expect(requests(item)).toEqual([]);
  });

  it("every exception still makes a request", () => {
    for (const name of Object.keys(ALLOWED)) {
      const item = items.find((candidate) => candidate.name === name);
      expect(item && requests(item).length).toBeGreaterThan(0);
    }
  });
});
