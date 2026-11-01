import type { Preview } from "@storybook/react-vite";
import { createElement } from "react";
import { configure } from "storybook/test";
import { FmaI18nProvider } from "../src/lib/i18n/i18n";
import ptBR from "../src/lib/i18n-pt-br/i18n-pt-br";
import { applyTheme, clearTheme, loadThemeFonts } from "../src/lib/theme/index";
import { getTheme, THEMES } from "../src/themes/index";
import "../src/styles.css";

// waitFor and findBy give up after 1 s by default, shorter than a dialog's exit animation
// takes when the whole suite runs in parallel on a busy machine.
configure({ asyncUtilTimeout: 5000 });

// styles.css defines dark mode as `@custom-variant dark (&:is(.dark *))` — a
// single binary toggle on <html>. The decorator flips that class and, for any
// curated theme other than "default" (which is styles.css itself), sets the
// theme's variables inline on <html> so every story renders in it.
function withTheme(
  Story: () => unknown,
  context: { globals: { theme?: "light" | "dark"; themePreset?: string } },
) {
  const mode = context.globals.theme ?? "light";
  const root = document.documentElement;
  root.classList.toggle("dark", mode === "dark");
  const preset = getTheme(context.globals.themePreset ?? "default");
  if (!preset || preset.name === "default") {
    clearTheme(root);
  } else {
    applyTheme(root, preset, mode);
    loadThemeFonts(preset);
  }
  return Story();
}

// Off by default: with a provider, masks would follow its locale instead of
// staying Brazilian, and stories show the no-provider behavior.
function withLocale(Story: () => unknown, context: { globals: { locale?: string } }) {
  const { locale } = context.globals;
  if (!locale || locale === "none") return Story();
  const props = { locale, locales: { "pt-BR": ptBR }, children: null };
  return createElement(FmaI18nProvider, props, Story() as React.ReactNode);
}

const preview: Preview = {
  decorators: [withTheme as never, withLocale as never],
  globalTypes: {
    locale: {
      description: "Puts the items in a language through FmaI18nProvider",
      toolbar: {
        icon: "globe",
        items: [
          { value: "none", title: "No provider" },
          { value: "en", title: "English" },
          { value: "pt-BR", title: "Português" },
        ],
      },
    },
    theme: {
      description: "Light/dark mode (toggles the `dark` class from src/styles.css)",
      toolbar: {
        icon: "mirror",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
      },
    },
    themePreset: {
      description: "Curated theme from src/themes (published as @fma-ds/theme-<name>)",
      toolbar: {
        icon: "paintbrush",
        dynamicTitle: true,
        items: THEMES.map((theme) => ({ value: theme.name, title: theme.title })),
      },
    },
  },
  initialGlobals: {
    theme: "light",
    themePreset: "default",
  },
  parameters: {
    layout: "centered",
    a11y: {
      // "error" would fail `test:storybook` on a11y violations; "todo" surfaces
      // them in the panel without failing the run.
      test: "todo",
    },
    options: {
      storySort: {
        order: ["design", "ds"],
      },
    },
  },
};

export default preview;
