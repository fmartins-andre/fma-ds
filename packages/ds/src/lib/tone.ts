export const TONES = [
  "brand",
  "primary",
  "neutral",
  "success",
  "warning",
  "info",
  "destructive",
] as const;
export type Tone = (typeof TONES)[number];

export const VARIANTS = ["solid", "soft", "outline", "ghost"] as const;
export type Variant = (typeof VARIANTS)[number];

/** `solid` reads as the main action (primary); the quieter variants stay neutral. */
export function defaultTone(variant: Variant): Tone {
  return variant === "solid" ? "primary" : "neutral";
}

// Every class is written out in full, per tone: Tailwind only generates the classes it finds
// literally in the source, so building them in a loop or a template literal would produce no
// CSS. Colored tones: soft = the tone over --background (--tone-soft-mix, 10% light / 18%
// dark), soft hover = 1.8 × that, line = 38% / 45%, icon = the tone toward its -text by
// --tone-icon-mix. Tailwind arbitrary values write spaces as underscores.
// The literal percentages (10%, 18%, 38, 45, 42%, 1.8) are pinned against `TONE_MIX` by
// tests/lib/tone.test.ts (lib/theme is unpublished, so this file can't import it); classes must
// stay literal for Tailwind (the tone-literal gate is a proxy for generation).
// Neutral follows the same recipe on its own tokens, with one exception: the outline border is
// --border, so a neutral outline matches the inputs (the 38% / 45% mix would be much darker).
const neutral = [
  "[--tone:var(--neutral)]",
  "[--tone-foreground:var(--neutral-foreground)]",
  "[--tone-soft:color-mix(in_oklab,var(--neutral)_var(--tone-soft-mix,10%),var(--background))]",
  "dark:[--tone-soft:color-mix(in_oklab,var(--neutral)_var(--tone-soft-mix,18%),var(--background))]",
  "[--tone-soft-hover:color-mix(in_oklab,var(--neutral)_calc(var(--tone-soft-mix,10%)_*_1.8),var(--background))]",
  "dark:[--tone-soft-hover:color-mix(in_oklab,var(--neutral)_calc(var(--tone-soft-mix,18%)_*_1.8),var(--background))]",
  "[--tone-line:var(--border)]",
  "[--tone-hover:var(--tone-soft)]",
  "[--tone-text:var(--neutral-text)]",
  "[--tone-icon:color-mix(in_oklab,var(--neutral),var(--neutral-text)_var(--tone-icon-mix,42%))]",
].join(" ");

/**
 * Class strings that map a tone to the `--tone-*` variables the variant recipes read.
 * Dark values come from the `dark:` variant.
 */
export const toneVariants: Record<Tone, string> = {
  brand: [
    "[--tone:var(--brand)]",
    "[--tone-foreground:var(--brand-foreground)]",
    "[--tone-soft:color-mix(in_oklab,var(--brand)_var(--tone-soft-mix,10%),var(--background))]",
    "dark:[--tone-soft:color-mix(in_oklab,var(--brand)_var(--tone-soft-mix,18%),var(--background))]",
    "[--tone-soft-hover:color-mix(in_oklab,var(--brand)_calc(var(--tone-soft-mix,10%)_*_1.8),var(--background))]",
    "dark:[--tone-soft-hover:color-mix(in_oklab,var(--brand)_calc(var(--tone-soft-mix,18%)_*_1.8),var(--background))]",
    "[--tone-line:color-mix(in_oklab,var(--brand)_38%,var(--background))]",
    "dark:[--tone-line:color-mix(in_oklab,var(--brand)_45%,var(--background))]",
    "[--tone-hover:var(--tone-soft)]",
    "[--tone-text:var(--brand-text)]",
    "[--tone-icon:color-mix(in_oklab,var(--brand),var(--brand-text)_var(--tone-icon-mix,42%))]",
  ].join(" "),
  primary: [
    "[--tone:var(--primary)]",
    "[--tone-foreground:var(--primary-foreground)]",
    "[--tone-soft:color-mix(in_oklab,var(--primary)_var(--tone-soft-mix,10%),var(--background))]",
    "dark:[--tone-soft:color-mix(in_oklab,var(--primary)_var(--tone-soft-mix,18%),var(--background))]",
    "[--tone-soft-hover:color-mix(in_oklab,var(--primary)_calc(var(--tone-soft-mix,10%)_*_1.8),var(--background))]",
    "dark:[--tone-soft-hover:color-mix(in_oklab,var(--primary)_calc(var(--tone-soft-mix,18%)_*_1.8),var(--background))]",
    "[--tone-line:color-mix(in_oklab,var(--primary)_38%,var(--background))]",
    "dark:[--tone-line:color-mix(in_oklab,var(--primary)_45%,var(--background))]",
    "[--tone-hover:var(--tone-soft)]",
    "[--tone-text:var(--primary-text)]",
    "[--tone-icon:color-mix(in_oklab,var(--primary),var(--primary-text)_var(--tone-icon-mix,42%))]",
  ].join(" "),
  neutral,
  success: [
    "[--tone:var(--success)]",
    "[--tone-foreground:var(--success-foreground)]",
    "[--tone-soft:color-mix(in_oklab,var(--success)_var(--tone-soft-mix,10%),var(--background))]",
    "dark:[--tone-soft:color-mix(in_oklab,var(--success)_var(--tone-soft-mix,18%),var(--background))]",
    "[--tone-soft-hover:color-mix(in_oklab,var(--success)_calc(var(--tone-soft-mix,10%)_*_1.8),var(--background))]",
    "dark:[--tone-soft-hover:color-mix(in_oklab,var(--success)_calc(var(--tone-soft-mix,18%)_*_1.8),var(--background))]",
    "[--tone-line:color-mix(in_oklab,var(--success)_38%,var(--background))]",
    "dark:[--tone-line:color-mix(in_oklab,var(--success)_45%,var(--background))]",
    "[--tone-hover:var(--tone-soft)]",
    "[--tone-text:var(--success-text)]",
    "[--tone-icon:color-mix(in_oklab,var(--success),var(--success-text)_var(--tone-icon-mix,42%))]",
  ].join(" "),
  warning: [
    "[--tone:var(--warning)]",
    "[--tone-foreground:var(--warning-foreground)]",
    "[--tone-soft:color-mix(in_oklab,var(--warning)_var(--tone-soft-mix,10%),var(--background))]",
    "dark:[--tone-soft:color-mix(in_oklab,var(--warning)_var(--tone-soft-mix,18%),var(--background))]",
    "[--tone-soft-hover:color-mix(in_oklab,var(--warning)_calc(var(--tone-soft-mix,10%)_*_1.8),var(--background))]",
    "dark:[--tone-soft-hover:color-mix(in_oklab,var(--warning)_calc(var(--tone-soft-mix,18%)_*_1.8),var(--background))]",
    "[--tone-line:color-mix(in_oklab,var(--warning)_38%,var(--background))]",
    "dark:[--tone-line:color-mix(in_oklab,var(--warning)_45%,var(--background))]",
    "[--tone-hover:var(--tone-soft)]",
    "[--tone-text:var(--warning-text)]",
    "[--tone-icon:color-mix(in_oklab,var(--warning),var(--warning-text)_var(--tone-icon-mix,42%))]",
  ].join(" "),
  info: [
    "[--tone:var(--info)]",
    "[--tone-foreground:var(--info-foreground)]",
    "[--tone-soft:color-mix(in_oklab,var(--info)_var(--tone-soft-mix,10%),var(--background))]",
    "dark:[--tone-soft:color-mix(in_oklab,var(--info)_var(--tone-soft-mix,18%),var(--background))]",
    "[--tone-soft-hover:color-mix(in_oklab,var(--info)_calc(var(--tone-soft-mix,10%)_*_1.8),var(--background))]",
    "dark:[--tone-soft-hover:color-mix(in_oklab,var(--info)_calc(var(--tone-soft-mix,18%)_*_1.8),var(--background))]",
    "[--tone-line:color-mix(in_oklab,var(--info)_38%,var(--background))]",
    "dark:[--tone-line:color-mix(in_oklab,var(--info)_45%,var(--background))]",
    "[--tone-hover:var(--tone-soft)]",
    "[--tone-text:var(--info-text)]",
    "[--tone-icon:color-mix(in_oklab,var(--info),var(--info-text)_var(--tone-icon-mix,42%))]",
  ].join(" "),
  destructive: [
    "[--tone:var(--destructive)]",
    "[--tone-foreground:var(--destructive-foreground)]",
    "[--tone-soft:color-mix(in_oklab,var(--destructive)_var(--tone-soft-mix,10%),var(--background))]",
    "dark:[--tone-soft:color-mix(in_oklab,var(--destructive)_var(--tone-soft-mix,18%),var(--background))]",
    "[--tone-soft-hover:color-mix(in_oklab,var(--destructive)_calc(var(--tone-soft-mix,10%)_*_1.8),var(--background))]",
    "dark:[--tone-soft-hover:color-mix(in_oklab,var(--destructive)_calc(var(--tone-soft-mix,18%)_*_1.8),var(--background))]",
    "[--tone-line:color-mix(in_oklab,var(--destructive)_38%,var(--background))]",
    "dark:[--tone-line:color-mix(in_oklab,var(--destructive)_45%,var(--background))]",
    "[--tone-hover:var(--tone-soft)]",
    "[--tone-text:var(--destructive-text)]",
    "[--tone-icon:color-mix(in_oklab,var(--destructive),var(--destructive-text)_var(--tone-icon-mix,42%))]",
  ].join(" "),
};
