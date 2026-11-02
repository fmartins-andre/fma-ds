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
function token(classes: string, prefix: "bg" | "text" | "ring" | "border") {
  const match = classes.match(new RegExp(`(?:^|\\s)${prefix}-([a-z-]+)`));
  if (!match?.[1]) throw new Error(`No ${prefix} class in "${classes}"`);
  return match[1];
}

// The label is what has to read. The pill only has to show on the sidebar: on a saturated one, a
// strong 3:1 pill would give up the white text and the theme's own hue.
const PRIMARY_SURFACE_MINIMUM = 1.4;

describe.each(modes)("app-sidebar badges on %s", (_name, tokens) => {
  const ratio = (text = "", surface = "") =>
    contrastRatio(tokens[text] ?? "", tokens[surface] ?? "");

  it.each(["outline", "primary", "invert"] as const)("%s text reads on its surface", (variant) => {
    const classes = VARIANT_BADGE[variant];
    expect(ratio(token(classes, "text"), token(classes, "bg"))).toBeGreaterThan(CONTRAST_AA);
  });

  it("outline border stands out from the sidebar", () => {
    const classes = VARIANT_BADGE.outline;
    expect(ratio(token(classes, "border"), "sidebar")).toBeGreaterThan(CONTRAST_AA_LARGE);
  });

  it("primary surface shows on the sidebar", () => {
    const classes = VARIANT_BADGE.primary;
    expect(ratio(token(classes, "bg"), "sidebar")).toBeGreaterThan(PRIMARY_SURFACE_MINIMUM);
  });

  it("outline border stands out in a menu", () => {
    const classes = VARIANT_MENU_BADGE.outline;
    expect(ratio(token(classes, "border"), "popover")).toBeGreaterThan(CONTRAST_AA_LARGE);
  });

  // `ghost` has no surface: it follows the item, so it reads like the item's own title does.
  it("ghost reads on the sidebar and on a hovered item", () => {
    expect(ratio("sidebar-foreground", "sidebar")).toBeGreaterThan(CONTRAST_AA);
    expect(ratio("sidebar-accent-foreground", "sidebar-accent")).toBeGreaterThan(CONTRAST_AA_LARGE);
  });

  // A menu opens on the popover, far from the sidebar's colors.
  it.each(["outline", "primary", "invert"] as const)("%s text reads in a menu", (variant) => {
    const classes = VARIANT_MENU_BADGE[variant];
    expect(ratio(token(classes, "text"), token(classes, "bg"))).toBeGreaterThan(CONTRAST_AA);
  });

  it("ghost reads in a menu", () => {
    expect(ratio(token(VARIANT_MENU_BADGE.ghost, "text"), "popover")).toBeGreaterThan(CONTRAST_AA);
  });

  it.each(Object.entries(VARIANT_DOT))(
    "%s dot stands out from the sidebar",
    (_variant, classes) => {
      expect(ratio(token(classes, "ring"), "sidebar")).toBeGreaterThan(CONTRAST_AA_LARGE);
    },
  );
});
