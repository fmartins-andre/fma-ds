import type { composeStories } from "@storybook/react-vite";
import type { ComponentType } from "react";
import type { ItemKind } from "./registry";

// The registry's stories double as the docs examples (portable stories), and
// their code is each story turned into a copyable component, generated at build
// time (`?snippets`, see story-snippets.ts). Lazy globs: each page loads only its own.
// Each has a translated side, built from the English stories by the same plugin.
// Client-only (pages load them in effects): `import.meta.env.SSR` drops them, and
// Storybook with them, from the server bundle, which must fit a Cloudflare Worker.
type StoryModule = Parameters<typeof composeStories>[0];

const loadStorybook = import.meta.env.SSR
  ? () => Promise.reject(new Error("Stories render on the client"))
  : () => import("@storybook/react-vite");

type Loaders<T> = Record<string, () => Promise<T>>;

const storyModules: Loaders<StoryModule> = import.meta.env.SSR
  ? {}
  : {
      ...import.meta.glob<StoryModule>("../../../../packages/ds/src/core/*/*.stories.tsx"),
      ...import.meta.glob<StoryModule>("../../../../packages/ds/src/blocks/*/*.stories.tsx"),
    };

const storyModulesPtBR: Loaders<StoryModule> = import.meta.env.SSR
  ? {}
  : {
      ...import.meta.glob<StoryModule>("../../../../packages/ds/src/core/*/*.stories.tsx", {
        query: "?lang=pt-BR",
      }),
      ...import.meta.glob<StoryModule>("../../../../packages/ds/src/blocks/*/*.stories.tsx", {
        query: "?lang=pt-BR",
      }),
    };

/** Code and JSDoc description of each story, by export name. */
type Snippets = { default: Record<string, string>; descriptions: Record<string, string> };

const snippetModules: Loaders<Snippets> = import.meta.env.SSR
  ? {}
  : {
      ...import.meta.glob<Snippets>("../../../../packages/ds/src/core/*/*.stories.tsx", {
        query: "?snippets",
      }),
      ...import.meta.glob<Snippets>("../../../../packages/ds/src/blocks/*/*.stories.tsx", {
        query: "?snippets",
      }),
    };

const snippetModulesPtBR: Loaders<Snippets> = import.meta.env.SSR
  ? {}
  : {
      ...import.meta.glob<Snippets>("../../../../packages/ds/src/core/*/*.stories.tsx", {
        query: "?snippets-pt-BR",
      }),
      ...import.meta.glob<Snippets>("../../../../packages/ds/src/blocks/*/*.stories.tsx", {
        query: "?snippets-pt-BR",
      }),
    };

const sources: Loaders<string> = import.meta.env.SSR
  ? {}
  : import.meta.glob<string>(
      [
        "../../../../packages/ds/src/core/*/*.tsx",
        "../../../../packages/ds/src/blocks/**/*.{ts,tsx}",
      ],
      { query: "?raw", import: "default" },
    );

/** "../../../../packages/ds/src/core/x/x.tsx" → "src/core/x/x.tsx", as in registry.json. */
function registryPath(key: string) {
  return key.slice(key.indexOf("packages/ds/") + "packages/ds/".length);
}

function byPath<T>(loaders: Loaders<T>) {
  return new Map(Object.entries(loaders).map(([key, load]) => [registryPath(key), load]));
}

const sourceByPath = byPath(sources);
const storiesByPath = {
  en: byPath(storyModules),
  "pt-BR": byPath(storyModulesPtBR),
};
const snippetsByPath = {
  en: byPath(snippetModules),
  "pt-BR": byPath(snippetModulesPtBR),
};

function storiesPath(kind: ItemKind, name: string) {
  return `src/${kind === "components" ? "core" : "blocks"}/${name}/${name}.stories.tsx`;
}

export function loadSource(path: string): Promise<string> {
  const load = sourceByPath.get(path);
  return load ? load() : Promise.reject(new Error(`No source for ${path}`));
}

export interface DocStory {
  /** The export name, e.g. "WithIcon". */
  exportName: string;
  name: string;
  /** Storybook's story id, e.g. "ds-badge--with-icon". */
  id: string;
  Component: ComponentType;
  /** Story-level layout, falling back to the file's. */
  layout: "centered" | "padded" | "fullscreen";
  description?: string;
  /** The story as a component to paste into a project (imports included). */
  code: string;
  /** Has its own render or args, so it shows something the first story doesn't. */
  isExample: boolean;
}

export interface DocStories {
  /** Storybook's docs id for the file, e.g. "ds-badge--docs". */
  docsId: string;
  stories: DocStory[];
}

type RawStory = {
  render?: unknown;
  args?: unknown;
  tags?: string[];
  parameters?: { layout?: DocStory["layout"]; docs?: { description?: { story?: string } } };
};

/** "SelectionBar" → "Selection Bar", as Storybook names a story without `name`. */
function storyNameFromExport(exportName: string) {
  return exportName
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
    .replace(/([a-zA-Z])(\d)/g, "$1 $2");
}

export async function loadStories(
  kind: ItemKind,
  name: string,
  locale?: string,
): Promise<DocStories | null> {
  const path = storiesPath(kind, name);
  const language = locale === "pt-BR" ? "pt-BR" : "en";
  const load = storiesByPath[language].get(path);
  const loadSnippets = snippetsByPath[language].get(path);
  if (!load || !loadSnippets) return null;
  const [module, { default: snippets, descriptions }, { composeStories }] = await Promise.all([
    load(),
    loadSnippets(),
    loadStorybook(),
  ]);
  const composed = composeStories(module) as Record<
    string,
    ComponentType & { id: string; storyName?: string; parameters?: RawStory["parameters"] }
  >;
  // A module namespace lists exports alphabetically; the snippets keep the file's order.
  const authored = Object.keys(snippets);
  const order = (exportName: string) => authored.indexOf(exportName);
  const stories: DocStory[] = Object.entries(composed)
    .sort(([a], [b]) => order(a) - order(b))
    .filter(([exportName]) => {
      const tags = (module as unknown as Record<string, RawStory>)[exportName]?.tags ?? [];
      return !tags.includes("!dev") && !tags.includes("!autodocs");
    })
    .map(([exportName, Component]) => {
      const raw = (module as unknown as Record<string, RawStory>)[exportName] ?? {};
      // Explicit parameters win over the JSDoc, as in Storybook.
      const description = raw.parameters?.docs?.description?.story ?? descriptions[exportName];
      return {
        exportName,
        name: Component.storyName ?? storyNameFromExport(exportName),
        id: Component.id,
        Component,
        layout: Component.parameters?.layout ?? "centered",
        description,
        code: snippets[exportName] ?? "",
        isExample: Boolean(raw.render || raw.args || description),
      };
    });
  const docsId = `${stories[0]?.id.split("--")[0] ?? name}--docs`;
  return { docsId, stories };
}
