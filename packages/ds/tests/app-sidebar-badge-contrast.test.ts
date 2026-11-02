// A sidebar can be as strong as the primary color, so a badge can't lean on the page's tokens:
// every tone has to read on the sidebar of every theme.
import { describe, expect, it } from "vitest";
import { TONE_BADGE, TONE_DOT, TONE_MENU_BADGE } from "@/blocks/app-sidebar/nav-item-status";
import { CONTRAST_AA, CONTRAST_AA_LARGE, contrastRatio } from "@/lib/color-contrast";
import { THEMES } from "@/themes";

type Tokens = Record<string, string>;

const modes = THEMES.flatMap((theme) => [
  [`${theme.name} light`, theme.light as Tokens] as const,
  [`${theme.name} dark`, theme.dark as Tokens] as const,
]);

/** The token behind a class, like `bg-sidebar` => `sidebar`, ignoring alpha and variants. */
function token(classes: string, prefix: "bg" | "text" | "ring") {
  const match = classes.match(new RegExp(`(?:^|\\s)${prefix}-([a-z-]+)`));
  if (!match?.[1]) throw new Error(`No ${prefix} class in "${classes}"`);
  return match[1];
}

describe.each(modes)("app-sidebar badges on %s", (_name, tokens) => {
  it.each(Object.entries(TONE_BADGE))("%s text reads on its surface", (_tone, classes) => {
    const surface = tokens[token(classes, "bg")] ?? "";
    expect(contrastRatio(tokens[token(classes, "text")] ?? "", surface)).toBeGreaterThan(
      CONTRAST_AA,
    );
  });

  // A menu opens on the popover, far from the sidebar's colors.
  it.each(Object.entries(TONE_MENU_BADGE))("%s text reads in a menu", (_tone, classes) => {
    const surface = tokens[token(classes, "bg")] ?? "";
    expect(contrastRatio(tokens[token(classes, "text")] ?? "", surface)).toBeGreaterThan(
      CONTRAST_AA,
    );
  });

  it.each(Object.entries(TONE_DOT))("%s dot stands out from the sidebar", (_tone, classes) => {
    const ring = tokens[token(classes, "ring")] ?? "";
    expect(contrastRatio(ring, tokens.sidebar ?? "")).toBeGreaterThan(CONTRAST_AA_LARGE);
  });
});
