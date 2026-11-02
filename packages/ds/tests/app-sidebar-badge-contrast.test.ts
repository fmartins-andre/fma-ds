// A sidebar can be as strong as the primary color, so a badge can't lean on the page's tokens:
// every variant has to read on the sidebar of every theme.
import { describe, expect, it } from "vitest";
import {
  VARIANT_BADGE,
  VARIANT_DOT,
  VARIANT_MENU_BADGE,
} from "@/blocks/app-sidebar/nav-item-status";
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
  const ratio = (text = "", surface = "") =>
    contrastRatio(tokens[text] ?? "", tokens[surface] ?? "");

  it.each(["outlined", "contained"] as const)("%s text reads on its surface", (variant) => {
    const classes = VARIANT_BADGE[variant];
    expect(ratio(token(classes, "text"), token(classes, "bg"))).toBeGreaterThan(CONTRAST_AA);
  });

  // `text` has no surface: it follows the item, so it reads like the item's own title does.
  it("text reads on the sidebar and on a hovered item", () => {
    expect(ratio("sidebar-foreground", "sidebar")).toBeGreaterThan(CONTRAST_AA);
    expect(ratio("sidebar-accent-foreground", "sidebar-accent")).toBeGreaterThan(CONTRAST_AA_LARGE);
  });

  // A menu opens on the popover, far from the sidebar's colors.
  it.each(["outlined", "contained"] as const)("%s text reads in a menu", (variant) => {
    const classes = VARIANT_MENU_BADGE[variant];
    expect(ratio(token(classes, "text"), token(classes, "bg"))).toBeGreaterThan(CONTRAST_AA);
  });

  it("text reads in a menu", () => {
    expect(ratio(token(VARIANT_MENU_BADGE.text, "text"), "popover")).toBeGreaterThan(CONTRAST_AA);
  });

  it.each(Object.entries(VARIANT_DOT))(
    "%s dot stands out from the sidebar",
    (_variant, classes) => {
      expect(ratio(token(classes, "ring"), "sidebar")).toBeGreaterThan(CONTRAST_AA_LARGE);
    },
  );
});
