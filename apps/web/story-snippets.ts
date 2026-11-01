import { readFileSync, statSync } from "node:fs";
import { basename, dirname } from "node:path";
import type { Plugin } from "vite";
import {
  formatSnippets,
  storyDescriptions,
  storySnippets,
} from "../../packages/ds/scripts/story-snippets.ts";
import { translateStory } from "../../packages/ds/scripts/story-text.ts";
import textEn from "./src/site/i18n/story-text-en.json" with { type: "json" };
import textPtBR from "./src/site/i18n/story-text-pt-BR.json" with { type: "json" };

// The docs examples' code: each story of a stories file as a component a reader
// can paste into their project (see packages/ds/scripts/story-snippets.ts).
// Generated at build time, since it parses and formats with Node tools, and
// imported by the pages as `<file>.stories.tsx?snippets`, along with each
// story's JSDoc description (`descriptions`), which Storybook's own build reads.
//
// A story's file doesn't change with the language: Storybook and its tests read it as it is.
// The pages read `?lang=<locale>` and `?snippets-<locale>`, the same file with its text
// translated, so the preview and the code a reader copies always match. Most stories are in
// English and a few in Portuguese, so each language has its own dictionary
// (see packages/ds/scripts/story-text.ts).

const TEXT: Record<string, Record<string, string>> = { en: textEn, "pt-BR": textPtBR };
const LOCALES = Object.keys(TEXT);

const QUERY = "?snippets-";
const PREFIX = "\0story-snippets:";
const STORY_QUERY = /\.stories\.tsx\?lang=([\w-]+)$/;

type StoryDocs = { snippets: Record<string, string>; descriptions: Record<string, string> };

const cache = new Map<string, { mtime: number; docs: StoryDocs }>();

/** The formatted snippets of a stories file and its JSDoc descriptions, cached until it changes. */
function readStoryDocs(path: string, locale: string): StoryDocs {
  const mtime = statSync(path).mtimeMs;
  const key = `${path}:${locale}`;
  const hit = cache.get(key);
  if (hit?.mtime === mtime) return hit.docs;
  // src/core/<name>/<name>.stories.tsx or src/blocks/<name>/<name>.stories.tsx
  const name = basename(dirname(path));
  const kind = basename(dirname(dirname(path))) === "blocks" ? "blocks" : "core";
  const file = readFileSync(path, "utf8");
  const docs = {
    snippets: formatSnippets(storySnippets(translateStory(file, TEXT[locale] ?? {}), name, kind)),
    descriptions: storyDescriptions(file),
  };
  cache.set(key, { mtime, docs });
  return docs;
}

/** The formatted snippets of a stories file, by export name. */
export function readStorySnippets(path: string) {
  return readStoryDocs(path, "en").snippets;
}

export function storySnippetsPlugin(): Plugin {
  return {
    name: "fma-ds:story-snippets",
    enforce: "pre",
    async resolveId(source, importer) {
      const locale = LOCALES.find((name) => source.endsWith(`${QUERY}${name}`));
      if (!locale) return null;
      const file = source.slice(0, -`${QUERY}${locale}`.length);
      const resolved = await this.resolve(file, importer, { skipSelf: true });
      // A virtual id, so no other plugin compiles it as the TSX it names.
      return resolved && `${PREFIX}${locale}:${resolved.id}`;
    },
    load(id) {
      if (!id.startsWith(PREFIX)) return null;
      const [locale = "en", ...rest] = id.slice(PREFIX.length).split(":");
      const path = rest.join(":");
      this.addWatchFile(path);
      const { snippets, descriptions } = readStoryDocs(path, locale);
      return [
        `export default ${JSON.stringify(snippets)};`,
        `export const descriptions = ${JSON.stringify(descriptions)};`,
      ].join("\n");
    },
    transform(code, id) {
      const locale = id.match(STORY_QUERY)?.[1];
      return locale ? { code: translateStory(code, TEXT[locale] ?? {}), map: null } : null;
    },
  };
}
