import type { Decorator } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { I18nProvider } from "react-aria-components";
import { useFmaLocale } from "../src/lib/i18n/i18n";

/** The provider's language where there is one (the site, the toolbar), `fallback` elsewhere. */
export function useStoryLocale(fallback: string) {
  return useFmaLocale()?.locale ?? fallback;
}

function PinnedLocale({ locale, children }: { locale: string; children: ReactNode }) {
  return <I18nProvider locale={useStoryLocale(locale)}>{children}</I18nProvider>;
}

/** Keeps a story's labels and assertions off the browser's language, without beating a provider. */
export function pinLocale(locale: string): Decorator {
  return (Story) => (
    <PinnedLocale locale={locale}>
      <Story />
    </PinnedLocale>
  );
}
