"use client";

import type { i18n as I18next } from "i18next";
import * as React from "react";
import { useTranslation } from "react-i18next";
import {
  FmaI18nProvider,
  type FmaI18nProviderProps,
  type FmaLocales,
  loadFmaMessages,
  matchLocale,
} from "@/lib/i18n/i18n";

export type FmaI18nextProviderProps = Pick<
  FmaI18nProviderProps,
  "children" | "overrides" | "fallback"
> & {
  /** Keep it outside the component: the provider reads it once. */
  locales: FmaLocales;
  /** Defaults to the instance in the `I18nextProvider` above. */
  i18n?: I18next;
};

/** `fallbackLng` as one of the packs; i18next's default, `dev`, never is. */
function fallbackLocale({ options: { fallbackLng } }: I18next, locales: FmaLocales) {
  const fallback = Array.isArray(fallbackLng) ? fallbackLng[0] : fallbackLng;
  if (typeof fallback !== "string") return "en";
  return matchLocale(fallback, ["en", ...Object.keys(locales)]) ?? "en";
}

/** Loads the pack first, then switches i18next: components and app change in the same commit. */
export async function changeLanguage(i18n: I18next, lng: string, locales: FmaLocales) {
  await loadFmaMessages(locales, lng, fallbackLocale(i18n, locales));
  await i18n.changeLanguage(lng);
}

/** Keeps every registry item in i18next's language, which also does the detection. */
export function FmaI18nextProvider({
  children,
  locales,
  overrides,
  fallback,
  i18n: instance,
}: FmaI18nextProviderProps) {
  const { i18n } = useTranslation(undefined, { i18n: instance });

  React.useEffect(() => {
    // A failure here reaches the provider, which loads the pack again when the language changes.
    const preload = (lng?: string) => {
      if (lng) loadFmaMessages(locales, lng, fallbackLocale(i18n, locales)).catch(() => {});
    };
    i18n.on("languageChanging", preload);
    return () => i18n.off("languageChanging", preload);
  }, [i18n, locales]);

  const onLocaleChange = React.useCallback(
    (locale: string) => void changeLanguage(i18n, locale, locales),
    [i18n, locales],
  );

  return (
    <FmaI18nProvider
      locale={i18n.resolvedLanguage ?? i18n.language}
      locales={locales}
      fallbackLocale={fallbackLocale(i18n, locales)}
      detect={false}
      overrides={overrides}
      fallback={fallback}
      onLocaleChange={onLocaleChange}
    >
      {children}
    </FmaI18nProvider>
  );
}
