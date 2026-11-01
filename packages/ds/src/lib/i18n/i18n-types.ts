/** A namespace as components consume it: sections like `labels`, `formats`, `functions`. */
export type NamespaceConfig = Record<string, object>;

/** In a dictionary, `functions` is a factory over the merged sibling sections. */
export type DictionaryNamespace<C extends NamespaceConfig> = {
  [K in keyof C]: K extends "functions" ? (sections: Omit<C, "functions">) => C[K] : C[K];
};

/** What a component's `i18n` prop and the provider's `overrides` take. */
export type NamespaceOverrides<C extends NamespaceConfig> = { [K in keyof C]?: Partial<C[K]> };

declare global {
  /** One entry per installed item with text, added by the item's own file. */
  interface FmaNamespaces {}
}

/** A namespace in a language pack: anything left out falls back, functions included. */
export type PackNamespace<C extends NamespaceConfig> = {
  [K in keyof C]?: K extends "functions"
    ? (sections: Omit<C, "functions">) => Partial<C[K]>
    : Partial<C[K]>;
};

/** What an item that isn't installed looks like to a pack: it has no types to offer. */
export type LooseMessages = { [key: string]: LooseMessage };

type LooseMessage =
  | string
  | readonly string[]
  | LooseMessages
  | undefined
  // biome-ignore lint/suspicious/noExplicitAny: an item that isn't installed has no types to offer
  | ((...args: any[]) => LooseMessage);

/** A language pack. It brings every item's texts, whichever are installed. */
export type FmaMessagesPack = {
  [K in keyof FmaNamespaces]?: PackNamespace<FmaNamespaces[K]>;
} & { [namespace: string]: LooseMessages | undefined };

export type FmaOverrides = {
  [K in keyof FmaNamespaces]?: NamespaceOverrides<FmaNamespaces[K]>;
};

/** A namespace of a language pack: checked when the item is installed, loose when it isn't. */
export type FmaNamespaceMessages<K extends string> = K extends keyof FmaNamespaces
  ? PackNamespace<FmaNamespaces[K]>
  : LooseMessages;

export function defineFmaNamespace<K extends string>(
  _namespace: K,
  messages: FmaNamespaceMessages<K>,
) {
  return messages;
}
