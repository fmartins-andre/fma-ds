import { readFileSync, statSync } from "node:fs";
import { basename, dirname } from "node:path";
import type { Plugin } from "vite";
import {
  formatSnippets,
  storyDescriptions,
  storySnippets,
} from "../../packages/ds/scripts/story-snippets.ts";
import { translateStory } from "../../packages/ds/scripts/story-text.ts";
import textPtBR from "./src/site/i18n/story-text-pt-BR.json" with { type: "json" };

// The docs examples' code: each story of a stories file as a component a reader
// can paste into their project (see packages/ds/scripts/story-snippets.ts).
// Generated at build time, since it parses and formats with Node tools, and
// imported by the pages as `<file>.stories.tsx?snippets`, along with each
// story's JSDoc description (`descriptions`), which Storybook's own build reads.
//
// The stories stay in English, and so do Storybook and their tests. `?lang=pt-BR` gives the
// pages the same file with its text translated, and `?snippets-pt-BR` its code, so the
// preview and the code a reader copies always match (see packages/ds/scripts/story-text.ts).

const QUERY = "?snippets";
const QUERY_PT_BR = "?snippets-pt-BR";
const PREFIX = "\0story-snippets:";
const PREFIX_PT_BR = "\0story-snippets-pt-BR:";
const STORY_PT_BR = ".stories.tsx?lang=pt-BR";

type StoryDocs = { snippets: Record<string, string>; descriptions: Record<string, string> };

const cache = new Map<string, { mtime: number; docs: StoryDocs }>();

/** The formatted snippets of a stories file and its JSDoc descriptions, cached until it changes. */
function readStoryDocs(path: string, translate = (file: string) => file): StoryDocs {
  const mtime = statSync(path).mtimeMs;
  const key = `${path}:${translate.name}`;
  const hit = cache.get(key);
  if (hit?.mtime === mtime) return hit.docs;
  // src/core/<name>/<name>.stories.tsx or src/blocks/<name>/<name>.stories.tsx
  const name = basename(dirname(path));
  const kind = basename(dirname(dirname(path))) === "blocks" ? "blocks" : "core";
  const file = readFileSync(path, "utf8");
  const docs = {
    snippets: formatSnippets(storySnippets(translate(file), name, kind)),
    descriptions: storyDescriptions(file),
  };
  cache.set(key, { mtime, docs });
  return docs;
}

const toPtBR = (file: string) => translateStory(file, textPtBR);

/** The formatted snippets of a stories file, by export name. */
export function readStorySnippets(path: string) {
  return readStoryDocs(path).snippets;
}

export function storySnippetsPlugin(): Plugin {
  return {
    name: "fma-ds:story-snippets",
    enforce: "pre",
    async resolveId(source, importer) {
      const query = [QUERY, QUERY_PT_BR].find((suffix) => source.endsWith(suffix));
      if (!query) return null;
      const resolved = await this.resolve(source.slice(0, -query.length), importer, {
        skipSelf: true,
      });
      // A virtual id, so no other plugin compiles it as the TSX it names.
      return resolved && `${query === QUERY ? PREFIX : PREFIX_PT_BR}${resolved.id}`;
    },
    load(id) {
      const translated = id.startsWith(PREFIX_PT_BR);
      if (!translated && !id.startsWith(PREFIX)) return null;
      const path = id.slice((translated ? PREFIX_PT_BR : PREFIX).length);
      this.addWatchFile(path);
      const { snippets, descriptions } = readStoryDocs(path, translated ? toPtBR : undefined);
      return [
        `export default ${JSON.stringify(snippets)};`,
        `export const descriptions = ${JSON.stringify(descriptions)};`,
      ].join("\n");
    },
    transform(code, id) {
      return id.endsWith(STORY_PT_BR) ? { code: toPtBR(code), map: null } : null;
    },
  };
}
