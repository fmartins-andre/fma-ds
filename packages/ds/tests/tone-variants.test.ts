// Contract gate for the variant × tone standard (docs/plans/tone-variant-standard.md):
// every component that takes `variant` + `tone` offers exactly the four variants,
// reads the `--tone-*` variables, and keeps the same box across variants.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { alertVariants, alertVariantsConfig } from "../src/core/alert/alert";
import { badgeVariants, badgeVariantsConfig } from "../src/core/badge/badge";
import { bubbleVariants, bubbleVariantsConfig } from "../src/core/bubble/bubble";
import { buttonVariants, buttonVariantsConfig } from "../src/core/button/button";
import { glanceTriggerVariants, glanceTriggerVariantsConfig } from "../src/core/glance/glance";
import { iconTileVariants, iconTileVariantsConfig } from "../src/core/icon-tile/icon-tile";
import { TONES, toneVariants, VARIANTS } from "../src/lib/tone";

// Tailwind only generates the classes it finds written out in the source: a class built at
// runtime (a template literal per tone) produces no CSS and the tone silently disappears.
describe("toneVariants", () => {
  const source = readFileSync(join(import.meta.dirname, "../src/lib/tone.ts"), "utf8");

  it("writes every tone class out literally so Tailwind can scan it", () => {
    for (const tone of TONES) {
      for (const cls of toneVariants[tone].split(" ")) {
        expect(source, `${tone}: ${cls}`).toContain(`"${cls}"`);
      }
    }
  });
});

describe("Button", () => {
  it("supports exactly the four variants", () => {
    expect(Object.keys(buttonVariantsConfig.variant)).toEqual([...VARIANTS]);
  });

  it("keeps the same box in every variant", () => {
    for (const variant of VARIANTS) {
      expect(buttonVariants({ variant })).toMatch(/(^|\s)border(\s|$)/);
    }
  });

  it("applies the default tone: primary for solid, neutral otherwise", () => {
    expect(buttonVariants()).toContain(toneVariants.primary);
    expect(buttonVariants({ variant: "solid" })).toContain(toneVariants.primary);
    for (const variant of ["soft", "outline", "ghost"] as const) {
      expect(buttonVariants({ variant })).toContain(toneVariants.neutral);
    }
  });

  it("applies the requested tone", () => {
    for (const tone of TONES) {
      expect(buttonVariants({ variant: "soft", tone })).toContain(toneVariants[tone]);
    }
  });
});

describe("Badge", () => {
  it("supports exactly the four variants", () => {
    expect(Object.keys(badgeVariantsConfig.variant)).toEqual([...VARIANTS]);
  });

  it("keeps the sizes and radii", () => {
    expect(Object.keys(badgeVariantsConfig.size)).toEqual(["xs", "sm", "default", "lg", "xl"]);
    expect(Object.keys(badgeVariantsConfig.radius)).toEqual(["default", "full"]);
  });

  it("keeps the same box in every variant", () => {
    for (const variant of VARIANTS) {
      expect(badgeVariants({ variant })).toMatch(/(^|\s)border(\s|$)/);
    }
  });

  it("ghost draws the dot in the tone icon color", () => {
    expect(badgeVariants({ variant: "ghost" })).toContain("before:bg-(--tone-icon)");
  });

  it("applies the default tone: primary for solid, neutral otherwise", () => {
    expect(badgeVariants()).toContain(toneVariants.primary);
    for (const variant of ["soft", "outline", "ghost"] as const) {
      expect(badgeVariants({ variant })).toContain(toneVariants.neutral);
    }
  });

  it("applies the requested tone", () => {
    for (const tone of TONES) {
      expect(badgeVariants({ variant: "soft", tone })).toContain(toneVariants[tone]);
    }
  });
});

describe("IconTile", () => {
  it("supports exactly the four variants (no elevated or frame)", () => {
    expect(Object.keys(iconTileVariantsConfig.variant)).toEqual([...VARIANTS]);
  });

  it("keeps the same footprint in every variant", () => {
    for (const variant of VARIANTS) {
      const classes = iconTileVariants({ variant });
      expect(classes).toContain("size-(--icon-tile-size)");
      expect(classes).toMatch(/(^|\s)border(\s|$)/);
      expect(iconTileVariantsConfig.variant[variant]).not.toMatch(/size-|p-|after:/);
    }
  });

  it("ghost only paints the icon in the tone icon color", () => {
    expect(iconTileVariantsConfig.variant.ghost).toBe("text-(color:--tone-icon)");
  });

  it("defaults to outline and neutral", () => {
    expect(iconTileVariants()).toContain(iconTileVariantsConfig.variant.outline);
    expect(iconTileVariants()).toContain(toneVariants.neutral);
  });

  it("applies the default tone: primary for solid, neutral otherwise", () => {
    expect(iconTileVariants({ variant: "solid" })).toContain(toneVariants.primary);
    for (const variant of ["soft", "outline", "ghost"] as const) {
      expect(iconTileVariants({ variant })).toContain(toneVariants.neutral);
    }
  });

  it("applies the requested tone", () => {
    for (const tone of TONES) {
      expect(iconTileVariants({ variant: "soft", tone })).toContain(toneVariants[tone]);
    }
  });
});

describe("Glance", () => {
  it("supports solid, soft and outline on the trigger", () => {
    expect(Object.keys(glanceTriggerVariantsConfig.variant)).toEqual(["solid", "soft", "outline"]);
  });

  it("keeps the same box in every variant", () => {
    for (const variant of ["solid", "soft", "outline"] as const) {
      expect(glanceTriggerVariants({ variant })).toMatch(/(^|\s)border(\s|$)/);
    }
  });

  it("solid draws the label at 78% of the tone foreground", () => {
    expect(glanceTriggerVariantsConfig.variant.solid).toContain("var(--tone-foreground)_78%");
  });

  it("defaults to outline and neutral", () => {
    expect(glanceTriggerVariants()).toContain(glanceTriggerVariantsConfig.variant.outline);
    expect(glanceTriggerVariants()).toContain(toneVariants.neutral);
  });

  it("applies the default tone: primary for solid, neutral otherwise", () => {
    expect(glanceTriggerVariants({ variant: "solid" })).toContain(toneVariants.primary);
    for (const variant of ["soft", "outline"] as const) {
      expect(glanceTriggerVariants({ variant })).toContain(toneVariants.neutral);
    }
  });

  it("applies the requested tone", () => {
    for (const tone of TONES) {
      expect(glanceTriggerVariants({ variant: "soft", tone })).toContain(toneVariants[tone]);
    }
  });
});

describe("Alert", () => {
  const ALERT_VARIANTS = ["solid", "soft", "outline"] as const;

  it("supports solid, soft and outline", () => {
    expect(Object.keys(alertVariantsConfig.variant)).toEqual([...ALERT_VARIANTS]);
  });

  it("keeps the same box in every variant", () => {
    for (const variant of ALERT_VARIANTS) {
      expect(alertVariants({ variant })).toMatch(/(^|\s)border(\s|$)/);
    }
  });

  it("solid draws the description at 78% of the tone foreground and rings in it", () => {
    expect(alertVariantsConfig.variant.solid).toContain("var(--tone-foreground)_78%");
    expect(alertVariantsConfig.variant.solid).toContain("[--ring:var(--tone-foreground)]");
  });

  it("soft is only the soft surface: no border color and no gradient layer", () => {
    expect(alertVariantsConfig.variant.soft).toContain("bg-(--tone-soft)");
    expect(alertVariantsConfig.variant.soft).not.toMatch(/border-|from-|bg-linear/);
  });

  it("outline draws the border in the tone line and the title in the tone text", () => {
    expect(alertVariantsConfig.variant.outline).toContain("border-(--tone-line)");
    expect(alertVariantsConfig.variant.outline).toContain("bg-background");
    expect(alertVariantsConfig.variant.outline).toContain(
      "[&_[data-slot=alert-title]]:text-(color:--tone-text)",
    );
  });

  it("soft and outline paint the icon in the tone icon color", () => {
    for (const variant of ["soft", "outline"] as const) {
      expect(alertVariantsConfig.variant[variant]).toContain("[&>svg]:text-(color:--tone-icon)");
    }
  });

  it("defaults to outline and neutral", () => {
    expect(alertVariants()).toContain(alertVariantsConfig.variant.outline);
    expect(alertVariants()).toContain(toneVariants.neutral);
  });

  it("applies the default tone: primary for solid, neutral otherwise", () => {
    expect(alertVariants({ variant: "solid" })).toContain(toneVariants.primary);
    for (const variant of ["soft", "outline"] as const) {
      expect(alertVariants({ variant })).toContain(toneVariants.neutral);
    }
  });

  it("applies the requested tone", () => {
    for (const tone of TONES) {
      expect(alertVariants({ variant: "soft", tone })).toContain(toneVariants[tone]);
    }
  });
});

describe("Bubble", () => {
  const BUBBLE_VARIANTS = ["solid", "soft", "outline"] as const;

  it("supports solid, soft and outline", () => {
    expect(Object.keys(bubbleVariantsConfig.variant)).toEqual([...BUBBLE_VARIANTS]);
  });

  it("soft is only the soft surface in the foreground color, with no border color", () => {
    expect(bubbleVariantsConfig.variant.soft).toContain("bg-(--tone-soft)");
    expect(bubbleVariantsConfig.variant.soft).toContain("text-foreground");
    expect(bubbleVariantsConfig.variant.soft).not.toMatch(/border-/);
  });

  it("outline draws the border in the tone line and the content in the tone text", () => {
    expect(bubbleVariantsConfig.variant.outline).toContain("border-(--tone-line)");
    expect(bubbleVariantsConfig.variant.outline).toContain("bg-background");
    expect(bubbleVariantsConfig.variant.outline).toContain("text-(color:--tone-text)");
  });

  it("hover on interactive content follows the tone lib", () => {
    const hover = "[&>[data-slot=bubble-content]:is(button,a):hover]:";
    expect(bubbleVariantsConfig.variant.solid).toContain(
      `${hover}bg-[color-mix(in_oklab,var(--tone)_85%,var(--background))]`,
    );
    expect(bubbleVariantsConfig.variant.soft).toContain(`${hover}bg-(--tone-soft-hover)`);
    expect(bubbleVariantsConfig.variant.outline).toContain(`${hover}bg-(--tone-hover)`);
    for (const variant of BUBBLE_VARIANTS) {
      expect(bubbleVariantsConfig.variant[variant]).not.toMatch(/accent|secondary|invert/);
    }
  });

  it("defaults to solid and primary", () => {
    expect(bubbleVariants()).toContain(bubbleVariantsConfig.variant.solid);
    expect(bubbleVariants()).toContain(toneVariants.primary);
  });

  it("applies the default tone: primary for solid, neutral otherwise", () => {
    for (const variant of ["soft", "outline"] as const) {
      expect(bubbleVariants({ variant })).toContain(toneVariants.neutral);
    }
  });

  it("applies the requested tone", () => {
    for (const tone of TONES) {
      expect(bubbleVariants({ variant: "soft", tone })).toContain(toneVariants[tone]);
    }
  });
});

// Per recipe: the box keeps `border` in every variant, only outline sets a border color
// (`--tone-line`), and each variant paints from the specific --tone-* variable it needs.
describe("variant recipes", () => {
  type Recipe = {
    name: string;
    config: Record<string, string>;
    box: (variant: string) => string;
    uses: Record<string, string[]>;
  };
  const recipes: Recipe[] = [
    {
      name: "Button",
      config: buttonVariantsConfig.variant,
      box: (variant) => buttonVariants({ variant: variant as "solid" }),
      uses: {
        solid: ["bg-(--tone)", "text-(color:--tone-foreground)"],
        soft: ["bg-(--tone-soft)", "text-(color:--tone-text)", "hover:bg-(--tone-soft-hover)"],
        outline: ["border-(--tone-line)", "text-(color:--tone-text)", "hover:bg-(--tone-hover)"],
        ghost: ["text-(color:--tone-text)", "hover:bg-(--tone-hover)"],
      },
    },
    {
      name: "Badge",
      config: badgeVariantsConfig.variant,
      box: (variant) => badgeVariants({ variant: variant as "solid" }),
      uses: {
        solid: ["bg-(--tone)", "text-(color:--tone-foreground)"],
        soft: ["bg-(--tone-soft)", "text-(color:--tone-text)"],
        outline: ["border-(--tone-line)", "text-(color:--tone-text)"],
        ghost: ["before:bg-(--tone-icon)"],
      },
    },
    {
      name: "IconTile",
      config: iconTileVariantsConfig.variant,
      box: (variant) => iconTileVariants({ variant: variant as "solid" }),
      uses: {
        solid: ["bg-(--tone)", "text-(color:--tone-foreground)"],
        soft: ["bg-(--tone-soft)", "text-(color:--tone-icon)"],
        outline: ["border-(--tone-line)", "text-(color:--tone-icon)"],
        ghost: ["text-(color:--tone-icon)"],
      },
    },
    {
      name: "Glance",
      config: glanceTriggerVariantsConfig.variant,
      box: (variant) => glanceTriggerVariants({ variant: variant as "solid" }),
      uses: {
        solid: ["bg-(--tone)", "text-(color:--tone-foreground)", "var(--tone-foreground)_78%"],
        soft: [
          "bg-(--tone-soft)",
          "hover:bg-(--tone-soft-hover)",
          "[&>svg]:text-(color:--tone-icon)",
        ],
        outline: [
          "border-(--tone-line)",
          "hover:bg-(--tone-hover)",
          "[&>svg]:text-(color:--tone-icon)",
        ],
      },
    },
    {
      name: "Alert",
      config: alertVariantsConfig.variant,
      box: (variant) => alertVariants({ variant: variant as "solid" }),
      uses: {
        solid: ["bg-(--tone)", "text-(color:--tone-foreground)", "var(--tone-foreground)_78%"],
        soft: ["bg-(--tone-soft)", "[&>svg]:text-(color:--tone-icon)"],
        outline: ["border-(--tone-line)", "[&>svg]:text-(color:--tone-icon)"],
      },
    },
    {
      name: "Bubble",
      config: bubbleVariantsConfig.variant,
      box: (variant) => bubbleVariants({ variant: variant as "solid" }),
      uses: {
        solid: ["bg-(--tone)", "text-(color:--tone-foreground)"],
        soft: ["bg-(--tone-soft)", "bubble-content]:text-foreground", "bg-(--tone-soft-hover)"],
        outline: ["border-(--tone-line)", "text-(color:--tone-text)", "bg-(--tone-hover)"],
      },
    },
  ];

  for (const { name, config, box, uses } of recipes) {
    describe(name, () => {
      it.each(Object.keys(config))("%s paints from its own --tone-* variables", (variant) => {
        for (const cls of uses[variant] ?? []) expect(config[variant]).toContain(cls);
        expect(uses[variant], `no expectations for ${variant}`).toBeDefined();
      });

      it.each(Object.keys(config))("%s keeps the border box", (variant) => {
        // Bubble draws its border on the content slot, so only the others carry `border`.
        if (name !== "Bubble") expect(box(variant)).toMatch(/(^|\s)border(\s|$)/);
      });

      it.each(Object.keys(config).filter((v) => v !== "outline"))(
        "%s sets no border color (only outline does)",
        (variant) => {
          expect(config[variant]).not.toMatch(/border-\(/);
        },
      );
    });
  }
});
