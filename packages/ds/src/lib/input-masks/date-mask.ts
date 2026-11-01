import type { MaskitoOptions } from "@maskito/core";
import { maskitoTransform } from "@maskito/core";
import type { MaskitoDateParams } from "@maskito/kit";
import { maskitoDate, maskitoStringifyDate, maskitoWithPlaceholder } from "@maskito/kit";
import { useMemo } from "react";
import typeHelper from "@/lib/type-helper";
import { makeStableMaskitoOptions, type StableMaskitoOptions } from "./stable-mask";

const PLACEHOLDER_BY_MODE = {
  "dd/mm/yyyy": "__/__/____",
  "mm/dd/yyyy": "__/__/____",
  "yyyy/mm/dd": "____/__/__",
  "mm/yyyy": "__/____",
  // Card expiry. The two-digit year is read as 20yy.
  "mm/yy": "__/__",
  yyyy: "____",
} as const;

export type DateMaskMode = keyof typeof PLACEHOLDER_BY_MODE;

export function dateMaskRemover(
  value: string | null | undefined,
  mode: DateMaskMode = "dd/mm/yyyy",
  separator = "/",
): string {
  if (!value?.length) return "";

  const fields = mode.split("/");
  const pattern = fields.map((field) => `(\\d{${field.length}})`).join(`\\${separator}`);
  const match = value.trim().match(new RegExp(`^${pattern}$`));
  if (!match) return "";

  const part = (field: string) => (fields.includes(field) ? match[fields.indexOf(field) + 1] : "");
  // A two-digit year only exists in "mm/yy", the card expiry.
  const year = part("yyyy") || `20${part("yy")}`;
  return [year, part("mm"), part("dd")].filter(Boolean).join("-");
}

type DateMaskOptionsProps = Partial<Pick<MaskitoDateParams, "min" | "max">> & {
  mode?: DateMaskMode;
  separator?: string;
};

const defaultOptions = {
  mode: "dd/mm/yyyy",
  separator: "/",
} satisfies Partial<MaskitoDateParams>;

export const createDateMaskOptions: (options?: DateMaskOptionsProps) => MaskitoOptions = (
  options,
) => {
  const mode: DateMaskMode = options?.mode ?? "dd/mm/yyyy";
  const validOptions: MaskitoDateParams = {
    ...defaultOptions,
    ...options,
    mode,
  };
  const generatedOptions = maskitoDate(validOptions);
  const { plugins: datePlaceholderPlugins, ...datePlaceholderOptions } = maskitoWithPlaceholder(
    PLACEHOLDER_BY_MODE[mode].replaceAll("/", validOptions.separator ?? "/"),
    true,
  );

  return {
    ...generatedOptions,
    plugins: [...datePlaceholderPlugins, ...(generatedOptions.plugins ?? [])],
    preprocessors: [
      ...datePlaceholderOptions.preprocessors,
      ...(generatedOptions.preprocessors ?? []),
    ],
    postprocessors: [
      ...(generatedOptions.postprocessors ?? []),
      ...datePlaceholderOptions.postprocessors,
    ],
  };
};

export function useCreateDateMaskOptions(options?: DateMaskOptionsProps): StableMaskitoOptions {
  return useMemo(() => makeStableMaskitoOptions(createDateMaskOptions(options)), [options]);
}

export function dateMaskFormatter(
  value: string | Date | null | undefined,
  options?: DateMaskOptionsProps,
): string {
  const mode: DateMaskMode = options?.mode ?? "dd/mm/yyyy";
  const narrowOptions: DateMaskOptionsProps = { ...options, mode };

  switch (true) {
    case typeHelper.isString(value):
      return maskitoTransform(value, createDateMaskOptions(narrowOptions));

    case typeHelper.isDate(value):
      return maskitoStringifyDate(value, {
        ...defaultOptions,
        ...narrowOptions,
      });

    default:
      return "";
  }
}

// `dateMaskRemover`'s output is an ISO-ish string ("yyyy-mm-dd", "yyyy-mm",
// or "yyyy" depending on mode; "mm/yy" also yields "yyyy-mm").
// `new Date(iso)` parses date-only ISO
// strings as UTC, which can shift by a day once rendered in local time —
// split and construct locally instead.
export function parseIsoDateParts(iso: string): Date | undefined {
  if (!iso) return undefined;
  const [yyyy, mm, dd] = iso.split("-").map(Number);
  if (Number.isNaN(yyyy)) return undefined;
  return new Date(yyyy, (mm || 1) - 1, dd || 1);
}
