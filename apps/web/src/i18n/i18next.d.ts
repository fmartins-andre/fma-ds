import "i18next";
import type { site } from "../site/i18n/en";
import type { themeEditor } from "../theme-editor/i18n/en";

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "site";
    resources: { site: typeof site; themeEditor: typeof themeEditor };
    enableSelector: true;
  }
}
