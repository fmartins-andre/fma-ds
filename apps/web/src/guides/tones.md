Colored components share two props: `variant` picks the surface and `tone` picks the color. Every tone works in every variant a component supports, so `<Badge variant="soft" tone="success">` and `<Alert variant="soft" tone="success">` read as the same status.

## Variants and tones

| `variant` | Looks like | Hover |
| --- | --- | --- |
| `solid` | Filled with the tone, text in the tone's `-foreground` | 85% of the tone |
| `soft` | A light tint of the tone, no border, text in the tone | A stronger tint |
| `outline` | A border in the tone over the page background, text in the tone | The soft tint |
| `ghost` | No surface, text in the tone | The soft tint |

`tone` is one of `brand`, `primary`, `neutral`, `success`, `warning`, `info` or `destructive`. When you leave it out, it is `primary` for `solid` and `neutral` for the other variants, so `<Button variant="outline">` stays neutral.

| Component | Variants | Default |
| --- | --- | --- |
| Button, LinkButton | solid, soft, outline, ghost | solid / primary |
| Badge | solid, soft, outline, ghost | solid / primary |
| IconTile | solid, soft, outline, ghost | outline / neutral |
| Alert | solid, soft, outline | outline / neutral |
| Glance | solid, soft, outline | outline / neutral |
| Bubble | solid, soft, outline | solid / primary |

A ghost Badge is a colored dot before plain text, and a ghost IconTile is just the icon, at the tile's size. Switching variants never changes a component's size, so you can swap them on hover or selection without moving the layout.

The colors come from your theme: each tone has its color, a `-foreground` for text on the solid color and a `-text` for text in the tone. See [Themes](/docs/theming) for the tokens and how to adjust them.

## Choosing one

- **Main action**: `solid`, in `primary`. One per area.
- **Other actions**: `outline` or `ghost`, neutral. `soft` with `tone="primary"` for a second action of the same family.
- **Destructive action**: `solid` with `tone="destructive"` in a confirmation; `ghost` or `outline` with the same tone when it sits among other actions.
- **Status** (badges, alerts): `soft` in the status tone. Ghost badges for dense lists and select items.
- **Brand**: the theme's second identity color, for announcements and labels like "New" or "Pro", never for status.

## Coming from the old variants

The old variant names are gone, with no aliases. Updating a component means updating its call sites:

| Before | Now |
| --- | --- |
| `variant="default"` | `variant="solid"`, or leave it out |
| Button `secondary` | `variant="soft"`, with `tone="primary"` for an action of the same family |
| Button `destructive` | `variant="solid" tone="destructive"` |
| Button or Badge `link` | `variant="ghost" tone="primary"` |
| Badge `secondary`, `muted` | `variant="soft"` |
| Badge `muted-outline` | `variant="outline"` |
| Badge `success`, `info`… | `tone="success"`, `tone="info"`… |
| Badge `success-light`… | `variant="soft" tone="success"`… |
| Badge `success-outline`… | `variant="outline" tone="success"`… |
| Badge `success-dot`… | `variant="ghost" tone="success"`… |
| Alert `default` | leave `variant` out (outline) |
| Alert `success`, `warning`, `info`, `destructive` | `variant="soft"` with that tone |
| Alert `brand` | `variant="solid" tone="brand"` |
| Alert or Badge `invert` | `variant="solid" tone="neutral"` |
| IconTile `soft` | `variant="soft" tone="primary"` (plain `soft` is now neutral) |
| IconTile `className="text-success"`, `bg-*` | `tone="success"` |
| IconTile `elevated`, `frame` | `outline` or `soft` |
| Glance `tone="default"` | leave `tone` out |
| Bubble `secondary`, `muted` | `variant="soft" tone="neutral"` |
| Bubble `tinted` | `variant="soft" tone="primary"` |
| Bubble `destructive` | `variant="soft" tone="destructive"` |

Update your theme together with the components (see [Updating items](/docs/updating)): the new variants read tokens that older themes don't have. The neutral tone now has its own tokens (`--neutral`, `--neutral-foreground`, `--neutral-text`); its soft tint and hovers no longer use `--muted`.

## Your own components

Install `@fma-ds/tone` to give your components the same API. `toneVariants[tone]` sets the `--tone-*` CSS variables, and your variant classes read them:

```tsx
import { cn } from "cn";
import { defaultTone, type Tone, toneVariants, type Variant } from "@/lib/fma-ds/tone";

const surface: Record<Variant, string> = {
  solid:
    "bg-(--tone) text-(color:--tone-foreground) hover:bg-[color-mix(in_oklab,var(--tone)_85%,var(--background))]",
  soft: "bg-(--tone-soft) text-(color:--tone-text) hover:bg-(--tone-soft-hover)",
  outline: "border-(--tone-line) text-(color:--tone-text) hover:bg-(--tone-hover)",
  ghost: "text-(color:--tone-text) hover:bg-(--tone-hover)",
};

export function Chip({
  variant = "soft",
  tone,
  className,
  ...props
}: React.ComponentProps<"span"> & { variant?: Variant; tone?: Tone }) {
  return (
    <span
      className={cn(
        "border border-transparent",
        surface[variant],
        toneVariants[tone ?? defaultTone(variant)],
        className,
      )}
      {...props}
    />
  );
}
```

Keep the transparent border on every variant, so the size doesn't change. `--tone-icon` colors icons and dots.
