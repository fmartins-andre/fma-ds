import type { NamespaceConfig, NamespaceOverrides, PackNamespace } from "./i18n-types";

type Layer = Record<string, unknown> | undefined;
type Factory = (sections: Record<string, object>) => object;

// A trie over the layers' identities: the same layers give the same object, so
// components that read a namespace don't get new labels on every render.
type MemoNode = { next: WeakMap<object, MemoNode>; result?: object };
const memoRoot: MemoNode = { next: new WeakMap() };
const SKIPPED = {};
const BOUNDARY = {};

function memoNode(keys: readonly object[]) {
  let node = memoRoot;
  for (const key of keys) {
    let child = node.next.get(key);
    if (!child) {
      child = { next: new WeakMap() };
      node.next.set(key, child);
    }
    node = child;
  }
  return node;
}

function merge(dictionaries: readonly Layer[], overrides: readonly Layer[]) {
  const sections: Record<string, object> = {};
  for (const layer of [...dictionaries, ...overrides]) {
    for (const [name, section] of Object.entries(layer ?? {})) {
      if (name !== "functions") sections[name] = { ...sections[name], ...(section as object) };
    }
  }
  // Factories run on the merged sections, so an override of a label reaches the
  // functions built from it. All of them run, weakest first: a pack may bring only
  // some functions, and the rest fall through.
  const factories = dictionaries.flatMap((layer) => (layer?.functions as Factory) ?? []);
  const plain = overrides.map((layer) => layer?.functions as object | undefined);
  if (factories.length === 0 && !plain.some(Boolean)) return sections;
  const built = factories.map((factory) => factory(sections));
  return { ...sections, functions: Object.assign({}, ...built, ...plain) };
}

/** Layers go from weakest to strongest; `undefined` layers are skipped. */
export function resolveNamespace<C extends NamespaceConfig>(
  dictionaries: readonly (PackNamespace<C> | undefined)[],
  overrides: readonly (NamespaceOverrides<C> | undefined)[] = [],
): C {
  const node = memoNode([
    ...dictionaries.map((layer) => layer ?? SKIPPED),
    BOUNDARY,
    ...overrides.map((layer) => layer ?? SKIPPED),
  ]);
  node.result ??= merge(dictionaries as readonly Layer[], overrides as readonly Layer[]);
  return node.result as C;
}
