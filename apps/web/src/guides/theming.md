A theme is a set of CSS variables in `:root` (light) and `.dark` (dark): colors, radius, fonts, spacing and shadows. Components never hard-code a color or derive one from another; they read these variables, so changing a theme restyles everything at once.

## Install a theme

Every curated theme is a registry item. Installing one writes its variables into your stylesheet, replacing the ones there:

```bash
npx shadcn@latest add @fma-ds/theme-<name>
```

Theme fonts come along as `@fontsource` packages. Every theme has both palettes; see [Dark mode](/docs/dark-mode) for switching between them.

## The tokens

Colors come in pairs: a surface and the text that goes on it.

| Tokens | For |
| --- | --- |
| `background`, `foreground` | The page and its text |
| `card`, `popover` (+ `-foreground`) | Raised surfaces |
| `primary` | The main color: main actions, selection, focus |
| `brand` | A second identity color, for announcements and labels, never for status |
| `neutral` | The neutral tone: quiet actions, neutral badges and the hover of neutral controls |
| `success`, `warning`, `info`, `destructive` | Status |
| `muted`, `muted-foreground` | Quiet static surfaces (zebra rows, footers, skeletons) and secondary text. Never hover, focus or selection |
| `accent`, `accent-foreground` | The highlighted item in a collection: menu, listbox, calendar, table row |
| `border`, `input`, `ring` | Lines; field borders (the same value as `border` unless you change it) and, by `--input-mix`, the field fill; the focus ring |
| `sidebar-*` | The sidebar's own palette |

Each tone (`primary`, `brand`, `neutral` and the four statuses) has three tokens:

- `--<tone>`: the color itself, for fills, borders and icons.
- `--<tone>-foreground`: text on the solid color. On a saturated color it is usually the page background, but a light yellow `warning` can take dark text instead.
- `--<tone>-text`: text in the tone, on the page or on the soft tint. It is the tone moved toward `--foreground` until it is readable.

`--neutral` starts as the muted text color, with `--background` as its `-foreground` and `--foreground` as its `-text`. Its soft tint and hover are mixed from it like any other tone, so they follow your background in every theme. One difference: a neutral outline uses `--border`, so it matches the inputs. See [Tones and variants](/docs/tones) for how components use them.

`bg-neutral` and `text-neutral` are the theme token. Tailwind's `neutral-50` to `neutral-950` are a separate, fixed palette that ignores your theme: fma-ds components never use it, or any other fixed gray (`gray`, `zinc`, `slate`, `stone`). DaisyUI also defines `--color-neutral`; if you use both, whichever stylesheet loads last wins.

### Settings

| Setting | Variable | Default |
| --- | --- | --- |
| Radius | `--radius` | per theme |
| Fonts | `--font-sans`, `--font-serif`, `--font-mono`, `--font-heading` | Tailwind's |
| Spacing | `--spacing` | `0.25rem` |
| Letter spacing | `--tracking-normal` | `0` |
| Shadows | `--shadow-*` | per theme |
| Icon mix | `--tone-icon-mix` | `42%`: how far icons and dots move from the tone toward its `-text` |
| Soft mix | `--tone-soft-mix` | `10%` light, `18%` dark: the strength of soft tints |
| Input mix | `--input-mix` | `0%` light, `30%` dark: the share of `--input` in the field fill (`bg-input-background`) |

## Customize it

The theme editor at [/themes](/themes) is the easiest way. Load a curated theme or import your own (a shadcn `styles.css`, a tweakcn theme or a theme item URL), then edit the colors of each mode, the fonts, radius, spacing, shadows and tone mixes, with the components previewed live. Every color pair shows its contrast and fails below the minimum. Next to each `-text` token, **Derive from tone** recalculates it after you change the tone. Export the result as a registry item to install with `shadcn add`, or as CSS to paste.

When you import a theme that lacks fma-ds tokens, such as one from tweakcn, the missing status colors come from the default theme, the neutral tone starts at the muted text, and the editor derives the `-text` tokens and the icon mix so that they pass the contrast check.

You can also edit the variables by hand. Change the tone and its `-text` together, in both modes:

```css
:root {
  --primary: oklch(0.55 0.2 260);
  --primary-foreground: oklch(0.98 0 0);
  --primary-text: oklch(0.45 0.18 260);
}
.dark {
  --primary: oklch(0.7 0.15 260);
  --primary-foreground: oklch(0.15 0 0);
  --primary-text: oklch(0.8 0.1 260);
}
```

Keep these contrast minimums, which the curated themes meet:

- 4.5:1 for body text, including `-text` on the page and on the soft tint.
- 3:1 for every solid color with its `-foreground`, and for icons and borders against the page.

## Coming from shadcn

fma-ds themes use the shadcn token names and add `brand`, `neutral`, the statuses and the `-text` tokens. They don't define `--secondary` or `--invert`. A stock shadcn theme lacks the fma-ds tokens, so fma-ds components need an fma-ds theme, or a theme imported into the editor and exported again. An official shadcn component that uses `bg-secondary` needs that token added to your theme, or a switch to the muted family or a tone. Official components also hover neutral controls with `bg-muted`; in fma-ds, `muted` is static, so give them the neutral tone (`toneVariants.neutral` with `hover:bg-(--tone-hover)`).
