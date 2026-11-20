// Imports themes from what people paste or upload into the editor: a shadcn
// styles.css (ours, tweakcn's, ui.shadcn.com/themes'), a shadcn registry theme
// item (e.g. https://tweakcn.com/r/themes/<id>.json), or one of our theme JSONs.

import { z } from "zod";
import { toOklch } from "./color";
import { checkContrast, TONE_MIX } from "./contrast";
import {
  COLOR_TOKENS,
  type Theme,
  type ThemeColors,
  type ThemeMode,
  ThemeSchema,
  type ThemeShadow,
  ThemeShadowSchema,
} from "./schema";
import { deriveToneText, TEXT_TONES } from "./tone-text";

export interface CssVarBlocks {
  /** Variables from `:root` blocks, without the leading "--". */
  light: Record<string, string>;
  /** Variables from `.dark` blocks, without the leading "--". */
  dark: Record<string, string>;
}

/**
 * Collects the custom properties declared in `:root` and `.dark` rules, at any
 * nesting depth (tweakcn's Tailwind v3 output wraps them in `@layer base`).
 */
export function parseCssVars(css: string): CssVarBlocks {
  const result: CssVarBlocks = { light: {}, dark: {} };
  const code = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const stack: string[] = [];
  let buffer = "";
  for (const char of code) {
    if (char === "{") {
      stack.push(buffer.trim());
      buffer = "";
    } else if (char === "}") {
      collect(stack.at(-1), buffer, result);
      stack.pop();
      buffer = "";
    } else if (char === ";") {
      collect(stack.at(-1), buffer, result);
      buffer = "";
    } else {
      buffer += char;
    }
  }
  return result;
}

function collect(selector: string | undefined, declaration: string, result: CssVarBlocks) {
  const target = selector === ":root" ? result.light : selector === ".dark" ? result.dark : null;
  const match = /^\s*--([\w-]+)\s*:\s*([\s\S]+?)\s*$/.exec(declaration);
  if (target && match?.[1] && match[2]) target[match[1]] = match[2];
}

// `-foreground` is text on the solid color in every tone. Sources without our status tokens get
// info/success/warning from the fallback with `-foreground` = the mode's background; their own
// `destructive-foreground` (already text on the solid color) is kept. The `-text` tokens are
// derived once the colors are complete.
const STATUS_TOKENS = ["info", "success", "warning"] as const;

function colorsFrom(
  vars: Record<string, string>,
  fallback: ThemeColors,
  mode: ThemeMode,
): ThemeColors {
  const ours = "info" in vars;
  const colors = { ...fallback };
  for (const token of COLOR_TOKENS) {
    const value = vars[token];
    if (value !== undefined) colors[token] = toOklch(value);
  }
  if (!ours) {
    for (const token of STATUS_TOKENS) {
      colors[token] = fallback[token];
      colors[`${token}-foreground`] = colors.background;
    }
    if (vars["destructive-foreground"] === undefined) {
      colors["destructive-foreground"] = colors.background;
    }
  }
  // No second identity color (other tools' themes, or ours before brand): brand = primary.
  if (vars.brand === undefined) {
    colors.brand = colors.primary;
    colors["brand-foreground"] = colors["primary-foreground"];
  }
  // No neutral tone (other tools' themes, or ours before it): the muted text, as before.
  if (vars.neutral === undefined) {
    colors.neutral = colors["muted-foreground"];
    colors["neutral-foreground"] = colors.background;
    colors["neutral-text"] = colors.foreground;
  }
  for (const tone of TEXT_TONES) {
    if (vars[`${tone}-text`] === undefined)
      colors[`${tone}-text`] = deriveToneText(colors, tone, mode);
  }
  return colors;
}

function shadowFrom(
  vars: Record<string, string>,
  fallback: Record<string, string>,
): ThemeShadow | undefined {
  const get = (...names: string[]) => {
    for (const name of names) {
      const value = vars[name] ?? fallback[name];
      if (value !== undefined) return value;
    }
    return undefined;
  };
  const color = get("shadow-color");
  if (color === undefined) return undefined;
  return {
    color: toOklch(color),
    opacity: Number.parseFloat(get("shadow-opacity") ?? "0.1") || 0,
    blur: get("shadow-blur") ?? "3px",
    spread: get("shadow-spread") ?? "0px",
    offsetX: get("shadow-offset-x", "shadow-x") ?? "0px",
    offsetY: get("shadow-offset-y", "shadow-y") ?? "1px",
  };
}

export interface ThemeIdentity {
  name: string;
  title: string;
  description?: string;
}

/**
 * Builds a theme from parsed variables, taking anything missing from `base`
 * (dark falls back to the light value, then to base.dark, like tweakcn).
 */
export function themeFromCssVars(
  { light, dark }: CssVarBlocks,
  base: Theme,
  identity: ThemeIdentity,
  shared: Record<string, string> = {},
): Theme {
  const all = { ...shared, ...light };
  // A stack that only points at another variable (styles.css's
  // `--font-heading: var(--font-sans)`) is the default, not a font choice.
  const font = (key: keyof Theme["fonts"]) => {
    const value = all[`font-${key}`];
    return value === undefined || value.startsWith("var(") ? base.fonts[key] : value;
  };
  const tracking = all["tracking-normal"] ?? all["letter-spacing"];
  const lightShadow = shadowFrom(light, shared);
  const darkShadow = shadowFrom(dark, { ...shared, ...light });
  const theme = ThemeSchema.parse({
    ...identity,
    description: identity.description ?? base.description,
    source: "original",
    tags: [],
    fonts: {
      sans: font("sans"),
      serif: font("serif"),
      mono: font("mono"),
      heading: font("heading"),
    },
    radius: all.radius ?? base.radius,
    spacing: all.spacing ?? base.spacing,
    // 0 / "normal" is no tracking, i.e. leave it unset like the default theme.
    letterSpacing:
      tracking === undefined
        ? base.letterSpacing
        : tracking === "normal" || Number.parseFloat(tracking) === 0
          ? undefined
          : tracking,
    iconMix: all["tone-icon-mix"] ?? base.iconMix,
    softMix:
      light["tone-soft-mix"] === undefined && dark["tone-soft-mix"] === undefined
        ? base.softMix
        : {
            light: light["tone-soft-mix"] ?? dark["tone-soft-mix"],
            dark: dark["tone-soft-mix"] ?? light["tone-soft-mix"],
          },
    inputMix:
      light["input-mix"] === undefined && dark["input-mix"] === undefined
        ? base.inputMix
        : {
            light: light["input-mix"] ?? dark["input-mix"],
            dark: dark["input-mix"] ?? light["input-mix"],
          },
    shadow:
      lightShadow || darkShadow
        ? {
            light: lightShadow ?? darkShadow,
            dark: darkShadow ?? lightShadow,
          }
        : base.shadow,
    light: colorsFrom(light, base.light, "light"),
    dark: colorsFrom({ ...light, ...dark }, base.dark, "dark"),
  });
  if (all["tone-icon-mix"] !== undefined) return theme;
  const iconMix = iconMixFor(theme);
  return iconMix === undefined ? theme : { ...theme, iconMix };
}

const ICON_MIX_DEFAULT = Math.round(TONE_MIX.icon * 100);

/**
 * Sources without `tone-icon-mix` (tweakcn, ui.shadcn.com) get the smallest share, from the shared
 * default up, at which every icon and dot reads on both modes; undefined when the default does.
 */
function iconMixFor(theme: Theme): `${number}%` | undefined {
  const fails = (mix: number) =>
    (["light", "dark"] as const).some((mode) =>
      checkContrast({ ...theme, iconMix: `${mix}%` }, mode).some(
        (pair) => pair.foreground.startsWith("icon(") && !pair.passes,
      ),
    );
  if (!fails(ICON_MIX_DEFAULT)) return undefined;
  for (let mix = ICON_MIX_DEFAULT + 1; mix < 100; mix++) if (!fails(mix)) return `${mix}%`;
  return "100%";
}

/** A theme from CSS text, JSON text (our theme or a shadcn registry item), or throws. */
export function parseThemeInput(input: string, base: Theme, identity: ThemeIdentity): Theme {
  const text = input.trim();
  if (text.startsWith("{")) {
    const json: unknown = JSON.parse(text);
    const ours = ThemeSchema.safeParse(json);
    if (ours.success) return ours.data;
    if (isRegistryTheme(json)) {
      const theme = themeFromCssVars(
        { light: json.cssVars.light ?? {}, dark: json.cssVars.dark ?? {} },
        base,
        {
          // Our own items are "theme-<name>"; the theme itself is "<name>".
          name: json.name?.replace(/^theme-/, "") ?? identity.name,
          title: json.title ?? identity.title,
          description: json.description ?? identity.description,
        },
        json.cssVars.theme ?? {},
      );
      // Our items carry what cssVars can't: provenance and the shadow recipe.
      const meta = RegistryMetaSchema.safeParse(json.meta);
      if (!meta.success) return theme;
      return ThemeSchema.parse({
        ...theme,
        ...meta.data,
        shadow: meta.data.shadow ?? theme.shadow,
      });
    }
    throw new Error("JSON is neither a theme nor a shadcn registry item with cssVars.");
  }
  const vars = parseCssVars(text);
  if (Object.keys(vars.light).length === 0 && Object.keys(vars.dark).length === 0) {
    throw new Error("No CSS variables found in :root or .dark.");
  }
  return themeFromCssVars(vars, base, identity);
}

const RegistryMetaSchema = z.object({
  source: ThemeSchema.shape.source.optional(),
  origin: z.string().optional(),
  tags: z.array(z.string()).optional(),
  shadow: z.object({ light: ThemeShadowSchema, dark: ThemeShadowSchema }).optional(),
});

interface RegistryTheme {
  meta?: unknown;
  name?: string;
  title?: string;
  description?: string;
  cssVars: {
    theme?: Record<string, string>;
    light?: Record<string, string>;
    dark?: Record<string, string>;
  };
}

function isRegistryTheme(json: unknown): json is RegistryTheme {
  return (
    typeof json === "object" &&
    json !== null &&
    "cssVars" in json &&
    typeof json.cssVars === "object"
  );
}
