import { getBrowserLocales, matchLocale, negotiateLocale } from "./negotiate";
import type { FmaMessagesPack } from "./types";

// Bundlers replace process.env.NODE_ENV at build time; declared here so
// consumers without @types/node still compile.
declare const process: { env: { NODE_ENV?: string } };

export type FmaLoader = () => Promise<{ default: FmaMessagesPack }>;
/** Locale → pack or loader. "en" is always available: it's the lib's English. */
export type FmaLocales = Record<string, FmaMessagesPack | FmaLoader>;

export type StoreOptions = {
  locales: FmaLocales;
  defaultLocale?: string;
  fallbackLocale?: string;
  initialLocale?: string | readonly string[];
  detect?: boolean;
};

export type FmaI18nSnapshot = { locale: string; isPending: boolean };

export interface FmaI18nStore {
  readonly locales: FmaLocales;
  readonly available: readonly string[];
  readonly fallbackLocale: string;
  getSnapshot(): FmaI18nSnapshot;
  subscribe(listener: () => void): () => void;
  setLocale(locale: string): Promise<void>;
}

// The only module state: packs are immutable, so sharing them across server
// requests is safe. Everything per-user lives in a store.
const loading = new WeakMap<FmaLoader, Promise<FmaMessagesPack>>();
const loaded = new WeakMap<FmaLoader, FmaMessagesPack>();

function load(loader: FmaLoader) {
  let promise = loading.get(loader);
  if (!promise) {
    promise = loader().then(
      (module) => {
        loaded.set(loader, module.default);
        return module.default;
      },
      (error: unknown) => {
        loading.delete(loader);
        throw error;
      },
    );
    loading.set(loader, promise);
  }
  return promise;
}

const availableLocales = (locales: FmaLocales) => [...new Set(["en", ...Object.keys(locales)])];

/** The pack if it is an object or already loaded; undefined otherwise. */
export function readFmaMessages(locales: FmaLocales, locale: string) {
  const entry = locales[locale];
  return typeof entry === "function" ? loaded.get(entry) : entry;
}

/** The loader's promise while `locale` isn't readable yet; stable, so React `use` can take it. */
export function pendingFmaMessages(locales: FmaLocales, locale: string) {
  const entry = locales[locale];
  return typeof entry === "function" && !loaded.has(entry) ? load(entry) : undefined;
}

/** Loads the pack and its fallback once per loader; resolves the negotiated locale. */
export async function loadFmaMessages(
  locales: FmaLocales,
  requested: string | readonly string[],
  fallbackLocale = "en",
) {
  const locale = negotiateLocale(requested, availableLocales(locales), fallbackLocale);
  await Promise.all([
    pendingFmaMessages(locales, locale),
    pendingFmaMessages(locales, fallbackLocale),
  ]);
  return locale;
}

function negotiateOrWarn(requested: string | readonly string[], store: FmaI18nStore) {
  const match = matchLocale(requested, store.available);
  if (match) return match;
  if (process.env.NODE_ENV !== "production") {
    console.warn(`[fma-i18n] No locale matches ${requested}; using ${store.fallbackLocale}.`);
  }
  return store.fallbackLocale;
}

/** One per provider instance, never a singleton: that keeps server requests apart. */
export function createStore(options: StoreOptions): FmaI18nStore {
  const { locales, defaultLocale = "en", fallbackLocale = defaultLocale, initialLocale } = options;
  const available = availableLocales(locales);
  const listeners = new Set<() => void>();
  let request = 0;

  const emit = () => {
    for (const listener of listeners) listener();
  };

  const store: FmaI18nStore = {
    locales,
    available,
    fallbackLocale,
    getSnapshot: () => snapshot,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    async setLocale(requested) {
      const locale = negotiateOrWarn(requested, store);
      const current = ++request;
      if (locale === snapshot.locale && !snapshot.isPending) return;
      const ready =
        !pendingFmaMessages(locales, locale) && !pendingFmaMessages(locales, fallbackLocale);
      if (!ready) {
        snapshot = { ...snapshot, isPending: true };
        emit();
        try {
          await loadFmaMessages(locales, locale, fallbackLocale);
        } catch (error) {
          if (current === request) {
            snapshot = { ...snapshot, isPending: false };
            emit();
          }
          throw error;
        }
        // A newer request took over while this pack loaded.
        if (current !== request) return;
      }
      snapshot = { locale, isPending: false };
      emit();
    },
  };

  const detected = options.detect === false ? [] : getBrowserLocales();
  let snapshot: FmaI18nSnapshot = {
    locale:
      initialLocale !== undefined
        ? negotiateOrWarn(initialLocale, store)
        : negotiateLocale(detected, available, defaultLocale),
    isPending: false,
  };
  return store;
}
