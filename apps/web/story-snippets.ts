import { readFileSync, statSync } from "node:fs";
import { basename, dirname } from "node:path";
import type { Plugin } from "vite";
import {
  formatSnippets,
  storyDescriptions,
  storySnippets,
} from "../../packages/ds/scripts/story-snippets.ts";

// The docs examples' code: each story of a stories file as a component a reader
// can paste into their project (see packages/ds/scripts/story-snippets.ts).
// Generated at build time, since it parses and formats with Node tools, and
// imported by the pages as `<file>.stories.tsx?snippets`, along with each
// story's JSDoc description (`descriptions`), which Storybook's own build reads.

const QUERY = "?snippets";
const PREFIX = "\0story-snippets:";

type StoryDocs = { snippets: Record<string, string>; descriptions: Record<string, string> };

const cache = new Map<string, { mtime: number; docs: StoryDocs }>();

/** The formatted snippets of a stories file and its JSDoc descriptions, cached until it changes. */
function readStoryDocs(path: string): StoryDocs {
  const mtime = statSync(path).mtimeMs;
  const hit = cache.get(path);
  if (hit?.mtime === mtime) return hit.docs;
  // src/core/<name>/<name>.stories.tsx or src/blocks/<name>/<name>.stories.tsx
  const name = basename(dirname(path));
  const kind = basename(dirname(dirname(path))) === "blocks" ? "blocks" : "core";
  const file = readFileSync(path, "utf8");
  const docs = {
    snippets: formatSnippets(storySnippets(file, name, kind)),
    descriptions: storyDescriptions(file),
  };
  cache.set(path, { mtime, docs });
  return docs;
}

/** The formatted snippets of a stories file, by export name. */
export function readStorySnippets(path: string) {
  return readStoryDocs(path).snippets;
}

export function storySnippetsPlugin(): Plugin {
  return {
    name: "fma-ds:story-snippets",
    enforce: "pre",
    async resolveId(source, importer) {
      if (!source.endsWith(QUERY)) return null;
      const resolved = await this.resolve(source.slice(0, -QUERY.length), importer, {
        skipSelf: true,
      });
      // A virtual id, so no other plugin compiles it as the TSX it names.
      return resolved && `${PREFIX}${resolved.id}`;
    },
    load(id) {
      if (!id.startsWith(PREFIX)) return null;
      const path = id.slice(PREFIX.length);
      this.addWatchFile(path);
      const { snippets, descriptions } = readStoryDocs(path);
      return [
        `export default ${JSON.stringify(snippets)};`,
        `export const descriptions = ${JSON.stringify(descriptions)};`,
      ].join("\n");
    },
  };
}
