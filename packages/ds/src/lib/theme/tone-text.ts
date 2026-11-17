// The initial value of an in-tone text token (`--X-text`): half the tone, half `--foreground`,
// nudged in lightness only until it reads on the page and on the soft surfaces of its tone.

import { contrastRatio, mixColors, toOklch } from "./color";
import { type TextTone, TONE_MIX, toneTextSurfaces } from "./contrast";
import type { ThemeColors, ThemeMode } from "./schema";

export { TEXT_TONES, type TextTone } from "./contrast";

const STEP = 0.005;

/** Replaces the L of an "oklch(L C H)" string, keeping the 3-decimal format. */
function withLightness(value: string, lightness: number): string {
  const match = /^oklch\(\s*[\d.]+\s+([\d.]+)\s+([\d.]+)\s*\)$/.exec(value);
  if (!match) return value;
  const l = Math.min(1, Math.max(0, lightness));
  return toOklch(`oklch(${l} ${match[1]} ${match[2]})`);
}

function lightnessOf(value: string): number {
  return Number(/^oklch\(\s*([\d.]+)/.exec(value)?.[1] ?? 0.5);
}

/**
 * Derives the initial `--X-text` of `tone` for `mode`, on soft surfaces of the share `soft` (the
 * theme's softMix; default `TONE_MIX.soft`). When no lightness passes the contrast gate
 * (see `toneTextSurfaces`), it returns the last attempt without signaling; callers (the importer
 * and the editor button) accept it, and the contrast check is what surfaces the failure.
 */
export function deriveToneText(
  colors: ThemeColors,
  tone: TextTone,
  mode: ThemeMode,
  soft?: number,
): string {
  const surfaces = toneTextSurfaces(colors, tone, mode, soft);
  const passes = (text: string) =>
    surfaces.every((surface) => contrastRatio(surface.value, text) >= surface.minimum);
  const direction = lightnessOf(toOklch(colors.background)) > 0.5 ? -1 : 1;
  let text = mixColors(colors[tone], colors.foreground, TONE_MIX.text);
  // Bounded: L only ranges over 0–1, so at most 1/STEP moves.
  for (let guard = 0; !passes(text) && guard < 1 / STEP; guard++) {
    text = withLightness(text, lightnessOf(text) + direction * STEP);
  }
  return text;
}
