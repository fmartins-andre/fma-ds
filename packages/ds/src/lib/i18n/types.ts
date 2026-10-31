export type DeepPartial<T> = T extends (...args: never[]) => unknown
  ? T
  : T extends object
    ? { [K in keyof T]?: DeepPartial<T[K]> }
    : T;

/** A namespace as components consume it: sections like `labels`, `formats`, `functions`. */
export type NamespaceConfig = Record<string, object>;

/** In a dictionary, `functions` is a factory over the merged sibling sections. */
export type DictionaryNamespace<C extends NamespaceConfig> = {
  [K in keyof C]: K extends "functions" ? (sections: Omit<C, "functions">) => C[K] : C[K];
};

/** What a component's `i18n` prop and the provider's `overrides` take. */
export type NamespaceOverrides<C extends NamespaceConfig> = { [K in keyof C]?: Partial<C[K]> };

/** One entry per registry item with text, added by each `messages/<namespace>.ts`. */
// biome-ignore lint/suspicious/noEmptyInterface: filled by declaration merging
export interface FmaNamespaces {}

export type FmaMessages = {
  [K in keyof FmaNamespaces]: DictionaryNamespace<FmaNamespaces[K]>;
};

/** A language pack. Namespaces may be missing: they fall back, so an old pack still works. */
export type FmaMessagesPack = {
  [K in keyof FmaNamespaces]?: DeepPartial<FmaMessages[K]>;
};

export type FmaOverrides = {
  [K in keyof FmaNamespaces]?: NamespaceOverrides<FmaNamespaces[K]>;
};

export function defineFmaMessages<const T extends FmaMessagesPack>(messages: T): T {
  return messages;
}
