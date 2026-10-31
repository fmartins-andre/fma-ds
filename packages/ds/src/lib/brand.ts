// Class strings for the theme's second identity color (`brand`) on surfaces and
// decoration, to pass through cn(). Identity only: never for hover, focus,
// selection or status, where the color would read as a state.

/** A solid brand surface. The ring follows the text so focus stays visible on it. */
export const brandSurface = "bg-brand text-brand-foreground [--ring:var(--brand-foreground)]";

/** A primary → brand gradient fill, for bands, panels and thin accents. */
export const brandGradient = "bg-linear-to-r from-primary to-brand";

/**
 * A primary → brand gradient border (1px; widen with border-2). It paints the
 * background too, so set the surface underneath with `--brand-border-fill`
 * (defaults to the card color) instead of a bg-* class.
 */
export const brandGradientBorder =
  "border border-transparent [background:linear-gradient(var(--brand-border-fill,var(--card)),var(--brand-border-fill,var(--card)))_padding-box,linear-gradient(to_right,var(--primary),var(--brand))_border-box]";

/** A soft brand glow. It replaces the element's shadow-* (both are box-shadow). */
export const brandGlow = "shadow-[0_0_24px_-4px_color-mix(in_oklch,var(--brand)_55%,transparent)]";

/**
 * A wrapper whose 1px edge is a spinning primary → brand gradient, for something
 * in progress (an AI step). Give the child its own background and a radius 1px
 * smaller than the wrapper's. Static with reduced motion; one on screen at a time.
 */
export const brandSpinningBorder =
  "relative isolate overflow-hidden p-px before:absolute before:top-1/2 before:left-1/2 before:-z-10 before:aspect-square before:w-[200%] before:-translate-1/2 before:bg-[conic-gradient(var(--primary),var(--brand),var(--primary))] motion-safe:before:animate-spin motion-safe:before:[animation-duration:3s]";
