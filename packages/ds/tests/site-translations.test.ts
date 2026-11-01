// The site's content has a Portuguese side kept by hand: every item needs a description,
// and a guide can only differ from the English one in its prose, not in its code.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { storyTexts, translateStory } from "../scripts/story-text";

const web = join(import.meta.dirname, "../../../apps/web/src");
const read = (path: string) => readFileSync(join(web, path), "utf8");

type Item = { name: string; type: string; description: string };
const { items } = JSON.parse(
  readFileSync(join(import.meta.dirname, "../registry.json"), "utf8"),
) as { items: Item[] };
const translated = JSON.parse(read("site/i18n/items-pt-BR.json")) as Record<string, string>;

const documented = items.filter((item) => item.type !== "registry:theme");
const codeSpans = (text: string) => [...new Set(text.match(/`[^`]+`/g) ?? [])].sort();
const fences = (text: string) => text.match(/```[\s\S]*?```/g) ?? [];
const headings = (text: string) => text.match(/^## /gm)?.length ?? 0;

describe("item descriptions in pt-BR", () => {
  it.each(documented.map((item) => [item.name, item] as const))("%s", (name, item) => {
    expect(translated[name], "add it to items-pt-BR.json").toBeTruthy();
    expect(codeSpans(translated[name] ?? "")).toEqual(
      expect.arrayContaining(codeSpans(item.description)),
    );
  });

  it("has no item the registry lost", () => {
    const names = new Set(documented.map((item) => item.name));
    expect(Object.keys(translated).filter((name) => !names.has(name))).toEqual([]);
  });
});

describe("guides in pt-BR", () => {
  const guides = readdirSync(join(web, "guides")).filter((file) => file.endsWith(".md"));

  it.each(guides)("%s", (file) => {
    expect(existsSync(join(web, "guides/pt-BR", file)), "translate the guide").toBe(true);
    const english = read(`guides/${file}`);
    const portuguese = read(`guides/pt-BR/${file}`);
    expect(fences(portuguese)).toEqual(fences(english));
    expect(headings(portuguese)).toBe(headings(english));
    expect(portuguese.match(/\{\{[^}]+\}\}/g)).toEqual(english.match(/\{\{[^}]+\}\}/g));
  });
});

describe("story text in pt-BR", () => {
  const text = JSON.parse(read("site/i18n/story-text-pt-BR.json")) as Record<string, string>;
  const src = join(import.meta.dirname, "../src");
  const stories = ["core", "blocks"].flatMap((kind) =>
    readdirSync(join(src, kind))
      .map((name) => join(src, kind, name, `${name}.stories.tsx`))
      .filter(existsSync),
  );
  const sources = stories.map((path) => [path, readFileSync(path, "utf8")] as const);
  const texts = new Set(sources.flatMap(([, source]) => storyTexts(source)));

  it.each(sources)("%s has every text in story-text-pt-BR.json", (_, source) => {
    expect(storyTexts(source).filter((key) => text[key] === undefined)).toEqual([]);
  });

  it.each(sources)("%s still parses once translated", (_, source) => {
    expect(() => storyTexts(translateStory(source, text))).not.toThrow();
  });

  it("has no text the stories lost", () => {
    expect(Object.keys(text).filter((key) => !texts.has(key))).toEqual([]);
  });
});
