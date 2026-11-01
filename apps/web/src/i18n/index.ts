import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import { site } from "../site/i18n/en";
import { sitePtBR } from "../site/i18n/pt-BR";
import { themeEditor } from "../theme-editor/i18n/en";
import { themeEditorPtBR } from "../theme-editor/i18n/pt-BR";
import { showcase } from "../theme-editor/i18n/showcase-en";
import { showcasePtBR } from "../theme-editor/i18n/showcase-pt-BR";

export const APP_LOCALES = ["en", "pt-BR"];
export const LOCALE_COOKIE = "fma-ds-locale";

/** Outside any component: the provider reads it once. */
export const fmaLocales = { "pt-BR": () => import("@/lib/i18n-pt-br/i18n-pt-br") };

/** One per server request and one in the browser, so requests never share a language. */
export function createI18n(lng: string) {
  const i18n = i18next.createInstance();
  void i18n.use(initReactI18next).init({
    lng,
    fallbackLng: "en",
    supportedLngs: APP_LOCALES,
    defaultNS: "site",
    resources: {
      en: { site, themeEditor, showcase },
      "pt-BR": { site: sitePtBR, themeEditor: themeEditorPtBR, showcase: showcasePtBR },
    },
    // Resources are in the bundle, so the first render already has them.
    initAsync: false,
    // React escapes what it renders.
    interpolation: { escapeValue: false },
  });
  return i18n;
}
