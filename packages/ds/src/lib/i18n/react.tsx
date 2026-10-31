"use client";

import * as React from "react";
import { I18nProvider } from "react-aria-components";
import { resolveNamespace } from "./merge";
import { en } from "./messages/en";
import {
  createStore,
  type FmaLocales,
  pendingFmaMessages,
  readFmaMessages,
  type StoreOptions,
} from "./store";
import type {
  DeepPartial,
  DictionaryNamespace,
  FmaMessages,
  FmaMessagesPack,
  FmaNamespaces,
  FmaOverrides,
  NamespaceConfig,
  NamespaceOverrides,
} from "./types";

type FmaLocaleControls = {
  locale: string;
  locales: readonly string[];
  isPending: boolean;
  setLocale: (locale: string) => void;
};

type FmaI18nContextValue = FmaLocaleControls & {
  active?: FmaMessagesPack;
  fallback?: FmaMessagesPack;
  overrides?: FmaOverrides;
};

const FmaI18nContext = React.createContext<FmaI18nContextValue | null>(null);

const NO_LOCALES: FmaLocales = {};

export type FmaI18nProviderProps = Partial<StoreOptions> & {
  children: React.ReactNode;
  /** Controlled: wins over everything; `setLocale` only calls `onLocaleChange`. */
  locale?: string;
  overrides?: FmaOverrides;
  onLocaleChange?: (locale: string) => void;
};

/** English is a pack like any other here, so the fallback can't show through it. */
function readPack(locales: FmaLocales, locale: string) {
  return readFmaMessages(locales, locale) ?? (locale === "en" ? en : undefined);
}

/** Puts every registry item in one language. Optional: without it, items render English. */
export function FmaI18nProvider({
  children,
  locale: controlled,
  locales = NO_LOCALES,
  overrides,
  onLocaleChange,
  defaultLocale,
  fallbackLocale,
  initialLocale,
  detect,
}: FmaI18nProviderProps) {
  const [store] = React.useState(() =>
    createStore({
      locales,
      defaultLocale,
      fallbackLocale,
      initialLocale: controlled ?? initialLocale,
      detect,
    }),
  );
  const { locale, isPending } = React.useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot,
  );

  for (const needed of [locale, store.fallbackLocale]) {
    const pending = pendingFmaMessages(store.locales, needed);
    if (pending) React.use(pending);
  }

  // A layout effect, so a pack that is already loaded switches before paint.
  React.useLayoutEffect(() => {
    if (controlled !== undefined) void store.setLocale(controlled);
  }, [store, controlled]);

  const isControlled = controlled !== undefined;
  const setLocale = React.useCallback(
    (next: string) => {
      if (isControlled) onLocaleChange?.(next);
      else void store.setLocale(next).then(() => onLocaleChange?.(store.getSnapshot().locale));
    },
    [store, isControlled, onLocaleChange],
  );

  const value = React.useMemo<FmaI18nContextValue>(
    () => ({
      locale,
      locales: store.available,
      isPending,
      setLocale,
      active: readPack(store.locales, locale),
      fallback: readPack(store.locales, store.fallbackLocale),
      overrides,
    }),
    [store, locale, isPending, setLocale, overrides],
  );

  return (
    <FmaI18nContext.Provider value={value}>
      <I18nProvider locale={locale}>{children}</I18nProvider>
    </FmaI18nContext.Provider>
  );
}

/** A namespace's texts: the prop, over `overrides`, over the active language, over English. */
export function useFmaMessages<K extends keyof FmaNamespaces>(
  namespace: K,
  prop?: NamespaceOverrides<FmaNamespaces[K]>,
): FmaNamespaces[K] {
  const context = React.useContext(FmaI18nContext);
  type Config = FmaNamespaces[K] & NamespaceConfig;
  type Layer = DeepPartial<DictionaryNamespace<Config>>;
  const english = en[namespace] as FmaMessages[K];
  return resolveNamespace<Config>(
    [english, context?.fallback?.[namespace], context?.active?.[namespace]] as Layer[],
    [context?.overrides?.[namespace], prop] as NamespaceOverrides<Config>[],
  );
}

/** The language and its switch, for a selector; `null` without a provider. */
export function useFmaLocale(): FmaLocaleControls | null {
  const context = React.useContext(FmaI18nContext);
  return React.useMemo(
    () =>
      context && {
        locale: context.locale,
        locales: context.locales,
        isPending: context.isPending,
        setLocale: context.setLocale,
      },
    [context],
  );
}
