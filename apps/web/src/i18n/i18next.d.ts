import "i18next";
import type { site } from "../site/i18n/en";
import type { themeEditor } from "../theme-editor/i18n/en";
import type { showcase } from "../theme-editor/i18n/showcase-en";

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "site";
    resources: { site: typeof site; themeEditor: typeof themeEditor; showcase: typeof showcase };
    enableSelector: true;
  }
}
