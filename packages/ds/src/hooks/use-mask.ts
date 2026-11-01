"use client";

import { useMaskito } from "@maskito/react";
import * as React from "react";
import { InputContext, useSlottedContext } from "react-aria-components";
import { type DictionaryNamespace, useFmaLocale, useFmaMessages } from "@/lib/i18n/i18n";
import {
  type MaskedInputLabels,
  type MaskSpec,
  type ResolvedMask,
  resolveMask,
} from "@/lib/input-masks/presets";
import type { StableMaskitoOptions } from "@/lib/input-masks/stable-mask";

type MaskedInputConfig = { labels: MaskedInputLabels };

declare global {
  interface FmaNamespaces {
    maskedInput: MaskedInputConfig;
  }
}

export const maskedInputEn: DictionaryNamespace<MaskedInputConfig> = {
  labels: { day: "d", month: "m", year: "y", hour: "h", minute: "m" },
};

type UseMaskOptions = {
  /** A preset name, a parameterized preset (`{ type: "decimal", prefix: "R$ " }`) or custom options. */
  mask: MaskSpec | StableMaskitoOptions;
  /** Controlled value, raw or masked. Inside a react-aria `TextField` the field's value is used. */
  value?: string;
  /** Initial value, raw or masked. */
  defaultValue?: string;
  /** Called when the raw value changes, with the masked text alongside. */
  onValueChange?: (raw: string, masked: string) => void;
};

type MaskState = {
  masked: string;
  raw: string;
  external: string | undefined;
  locale: string | undefined;
};

// Parameterized presets are compared by value, so an inline `{ type, ...params }`
// object doesn't recreate the mask (and drop Maskito's state) on every render.
function maskKey(mask: MaskSpec | StableMaskitoOptions) {
  return typeof mask === "string" || "type" in mask ? JSON.stringify(mask) : mask;
}

/**
 * Applies a Maskito mask to any input: spread `inputProps` onto `Input`,
 * `InputGroupInput` or a native `<input>`.
 *
 * The hook owns the masked text and renders it as a controlled value. An
 * external `value` only rewrites the input when it differs from what the
 * input last produced, so a parent can store the raw value and feed it back
 * without breaking Maskito's placeholder or caret.
 */
function useMask({ mask, value, defaultValue, onValueChange }: UseMaskOptions) {
  // Without a provider there's no locale, and masks stay Brazilian.
  const locale = useFmaLocale()?.locale;
  const { labels } = useFmaMessages("maskedInput", maskedInputEn);
  const key = maskKey(mask);
  // biome-ignore lint/correctness/useExhaustiveDependencies: `key` stands for `mask` by value
  const resolved: ResolvedMask = React.useMemo(
    () => resolveMask(mask, locale ? { locale, labels } : undefined),
    [key, locale, labels],
  );

  // Inside a TextField the value arrives through InputContext, not props.
  const contextValue = useSlottedContext(InputContext)?.value;
  const external = value ?? (typeof contextValue === "string" ? contextValue : undefined);

  const [state, setState] = React.useState<MaskState>(() => {
    const masked = resolved.format(external ?? defaultValue ?? "");
    return { masked, raw: resolved.unmask(masked), external, locale };
  });

  // Sync from an external value during render (not in an effect), so the
  // input never paints the stale text. Echoes of our own output are ignored.
  let current = state;
  if (locale !== state.locale) {
    // A new locale redraws the text from the raw value, which doesn't change.
    current = { ...current, masked: resolved.format(state.raw), locale };
    setState(current);
  }
  if (external !== current.external) {
    current = { ...current, external };
    if (external !== undefined && external !== current.masked && external !== current.raw) {
      const masked = resolved.format(external);
      current = { masked, raw: resolved.unmask(masked), external, locale };
    }
    setState(current);
  }

  const ref = useMaskito({ options: resolved.options });

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const masked = event.target.value;
    const raw = resolved.unmask(masked);
    setState((prev) => ({ ...prev, masked, raw }));
    if (raw !== current.raw) onValueChange?.(raw, masked);
  };

  return {
    /** Props for the input element (the ref must reach the DOM input). */
    inputProps: {
      ref,
      value: current.masked,
      onChange,
      inputMode: resolved.inputMode,
      autoComplete: resolved.autoComplete,
      placeholder: resolved.placeholder,
    },
    /** The unmasked value; see `resolveMask` for each preset's format. */
    rawValue: current.raw,
    maskedValue: current.masked,
  };
}

export type { UseMaskOptions };
export { useMask };
