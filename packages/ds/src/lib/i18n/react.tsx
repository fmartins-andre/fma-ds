"use client";

import * as React from "react";
import { I18nProvider } from "react-aria-components";
import { resolveNamespace } from "./merge";
import {
  createStore,
  type FmaLocales,
  pendingFmaMessages,
  readFmaMessages,
  type StoreOptions,
} from "./store";
import type { FmaMessagesPack, FmaOverrides, NamespaceOverrides, PackNamespace } from "./types";

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
      active: readFmaMessages(store.locales, locale),
      // In English the items' own text is the language, so no fallback goes over it.
      fallback: locale === "en" ? undefined : readFmaMessages(store.locales, store.fallbackLocale),
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

/** A namespace's texts: the prop, over `overrides`, over the active language, over `english`. */
export function useFmaMessages<K extends keyof FmaNamespaces>(
  namespace: K,
  english: PackNamespace<FmaNamespaces[K]>,
  prop?: NamespaceOverrides<FmaNamespaces[K]>,
): FmaNamespaces[K] {
  const context = React.useContext(FmaI18nContext);
  type Layer = PackNamespace<FmaNamespaces[K]>;
  return resolveNamespace<FmaNamespaces[K]>(
    [english, context?.fallback?.[namespace] as Layer, context?.active?.[namespace] as Layer],
    [context?.overrides?.[namespace] as NamespaceOverrides<FmaNamespaces[K]>, prop],
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
