import { maskitoTransform } from "@maskito/core";
import type * as React from "react";
import { createCepMaskOptions } from "./cep-mask";
import { cnpjMaskRemover, createCnpjMaskOptions } from "./cnpj-mask";
import { createCnpjOrCpfMaskOptions } from "./cnpj-or-cpf-mask";
import { cpfMaskRemover, createCpfMaskOptions } from "./cpf-mask";
import { createCreditCardMaskOptions } from "./credit-card-mask";
import {
  createDateMaskOptions,
  dateMaskFormatter,
  dateMaskRemover,
  parseIsoDateParts,
} from "./date-mask";
import { createDateRangeMaskOptions, dateRangeMaskRemover } from "./date-range-mask";
import {
  createDateTimeMaskOptions,
  dateTimeMaskFormatter,
  dateTimeMaskRemover,
} from "./date-time-mask";
import {
  createDecimalMaskOptions,
  decimalMaskFormatter,
  decimalMaskRemover,
  decimalMaskSeparators,
} from "./decimal-mask";
import { getDateOrder, getDateSeparator } from "./locale";
import { createPhoneMaskOptions, phoneMaskRemover } from "./phone-mask";
import { makeStableMaskitoOptions, type StableMaskitoOptions } from "./stable-mask";
import { createTimeMaskOptions, timeMaskRemover } from "./time-mask";

type DateParams = NonNullable<Parameters<typeof createDateMaskOptions>[0]>;
type TimeParams = NonNullable<Parameters<typeof createTimeMaskOptions>[0]>;
type DateTimeParams = NonNullable<Parameters<typeof createDateTimeMaskOptions>[0]>;
type DateRangeParams = NonNullable<Parameters<typeof createDateRangeMaskOptions>[0]>;
type DecimalParams = NonNullable<Parameters<typeof createDecimalMaskOptions>[0]>;

/** Masks that take no parameters. */
export type MaskPresetName =
  | "cpf"
  | "cnpj"
  | "cpf-cnpj"
  | "cep"
  | "phone"
  | "credit-card"
  | "date"
  | "time"
  | "date-time"
  | "date-range"
  | "decimal";

/** A preset by name, or a parameterized preset as `{ type, ...params }`. */
export type MaskSpec =
  | MaskPresetName
  | ({ type: "date" } & DateParams)
  | ({ type: "time" } & TimeParams)
  | ({ type: "date-time" } & DateTimeParams)
  | ({ type: "date-range" } & DateRangeParams)
  | ({ type: "decimal" } & DecimalParams);

/**
 * Everything an input needs to apply a mask: the Maskito options, the
 * conversions between the masked text and the raw value, and input hints.
 *
 * Raw values per preset: digits for documents, CEP, phone, credit card and
 * date ranges; ISO for date ("yyyy-mm-dd", "yyyy-mm" or "yyyy") and date-time;
 * "HH:MM" for time; a dot-decimal string ("1234.50") for decimal. Incomplete
 * dates and date-times have an empty raw value.
 */
export type ResolvedMask = {
  options: StableMaskitoOptions;
  /** Masked text → raw value. */
  unmask: (masked: string) => string;
  /** Raw (or already masked) value → masked text. */
  format: (raw: string) => string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  autoComplete?: string;
  placeholder?: string;
};

/** The letters of a date or time placeholder ("a" gives "dd/mm/aaaa"). */
export type MaskedInputLabels = {
  day: string;
  month: string;
  year: string;
  hour: string;
  minute: string;
};

/** Without these, masks keep their Brazilian formats. */
export type MaskLocaleOptions = { locale?: string; labels?: MaskedInputLabels };

const digits = (value: string) => value.replace(/\D/g, "");

function transformWith(options: StableMaskitoOptions) {
  return (raw: string) => (raw ? maskitoTransform(raw, options) : "");
}

const PT_BR_LETTERS = { day: "d", month: "m", year: "a", hour: "h", minute: "m" };

// "dd/mm/yyyy" → "dd/mm/aaaa": without labels, placeholders follow the pt-BR masks.
const datePlaceholder = (mode: string, separator = "/", labels = PT_BR_LETTERS) =>
  mode
    .replaceAll("d", labels.day)
    .replaceAll("m", labels.month)
    .replaceAll("y", labels.year)
    .replaceAll("/", separator);

const timePlaceholder = (mode: string, labels = PT_BR_LETTERS) =>
  mode
    .replaceAll("HH", labels.hour.repeat(2))
    .replaceAll("MM", labels.minute.repeat(2))
    .toLowerCase();

// A range's raw value is always ddmmyyyy per side, so the same range keeps the same
// raw value in every locale. Only the locale's full-date orders need reordering.
function rangeDigits(masked: string, order: string) {
  const sides = digits(masked).match(/\d{8}/g) ?? [];
  if (order === "dd/mm/yyyy" || sides.length === 0) return digits(masked);
  return sides
    .map((side) =>
      order === "mm/dd/yyyy"
        ? `${side.slice(2, 4)}${side.slice(0, 2)}${side.slice(4)}`
        : `${side.slice(6)}${side.slice(4, 6)}${side.slice(0, 4)}`,
    )
    .join("");
}

function rangeFromRaw(raw: string, order: string) {
  if (order === "dd/mm/yyyy" || !/^(\d{8}){1,2}$/.test(raw)) return raw;
  const sides = raw.match(/\d{8}/g) ?? [];
  return sides
    .map((side) =>
      order === "mm/dd/yyyy"
        ? `${side.slice(2, 4)}${side.slice(0, 2)}${side.slice(4)}`
        : `${side.slice(4)}${side.slice(2, 4)}${side.slice(0, 2)}`,
    )
    .join("");
}

function resolveDigits(
  options: StableMaskitoOptions,
  hints: Pick<ResolvedMask, "inputMode" | "autoComplete" | "placeholder">,
  unmask: (masked: string) => string = digits,
): ResolvedMask {
  return { options, unmask, format: transformWith(options), ...hints };
}

function resolvePreset(spec: MaskSpec, { locale, labels }: MaskLocaleOptions = {}): ResolvedMask {
  const { type, ...params } = typeof spec === "string" ? { type: spec } : spec;
  const stable = makeStableMaskitoOptions;

  switch (type) {
    case "cpf":
      return resolveDigits(
        stable(createCpfMaskOptions()),
        { inputMode: "numeric", placeholder: "000.000.000-00" },
        cpfMaskRemover,
      );
    case "cnpj":
      return resolveDigits(
        stable(createCnpjMaskOptions()),
        { inputMode: "numeric", placeholder: "00.000.000/0000-00" },
        cnpjMaskRemover,
      );
    case "cpf-cnpj":
      return resolveDigits(stable(createCnpjOrCpfMaskOptions()), { inputMode: "numeric" });
    case "cep":
      return resolveDigits(stable(createCepMaskOptions()), {
        inputMode: "numeric",
        autoComplete: "postal-code",
        placeholder: "00000-000",
      });
    case "phone":
      return resolveDigits(
        stable(createPhoneMaskOptions()),
        { inputMode: "tel", autoComplete: "tel", placeholder: "(00) 00000-0000" },
        phoneMaskRemover,
      );
    case "credit-card":
      return resolveDigits(stable(createCreditCardMaskOptions()), {
        inputMode: "numeric",
        autoComplete: "cc-number",
        placeholder: "0000 0000 0000 0000",
      });
    case "date": {
      const given = params as DateParams;
      // An explicit mode wins, separator included: "mm/yy" is the card's, not the locale's.
      const dateParams =
        locale && !given.mode
          ? { ...given, mode: getDateOrder(locale), separator: getDateSeparator(locale) }
          : given;
      const mode = dateParams.mode ?? "dd/mm/yyyy";
      return {
        options: stable(createDateMaskOptions(dateParams)),
        unmask: (masked) => dateMaskRemover(masked, mode, dateParams.separator),
        format: (raw) => {
          const date = /^\d{4}(-\d{2}){0,2}$/.test(raw) ? parseIsoDateParts(raw) : undefined;
          return date ? dateMaskFormatter(date, dateParams) : dateMaskFormatter(raw, dateParams);
        },
        inputMode: "numeric",
        placeholder: datePlaceholder(mode, dateParams.separator, labels),
      };
    }
    case "time": {
      const timeParams = params as TimeParams;
      const options = stable(createTimeMaskOptions(timeParams));
      return {
        options,
        unmask: timeMaskRemover,
        format: transformWith(options),
        inputMode: "numeric",
        placeholder: timePlaceholder(timeParams.mode ?? "HH:MM", labels),
      };
    }
    case "date-time": {
      const given = params as DateTimeParams;
      const dateTimeParams =
        locale && !given.dateMode
          ? { ...given, dateMode: getDateOrder(locale), dateSeparator: getDateSeparator(locale) }
          : given;
      const dateMode = dateTimeParams.dateMode ?? "dd/mm/yyyy";
      const timeMode = dateTimeParams.timeMode ?? "HH:MM";
      return {
        options: stable(createDateTimeMaskOptions(dateTimeParams)),
        unmask: (masked) => dateTimeMaskRemover(masked, dateTimeParams),
        format: (raw) => {
          const date = /^\d{4}-\d{2}-\d{2}T/.test(raw) ? new Date(raw) : undefined;
          return dateTimeMaskFormatter(date ?? raw, dateTimeParams);
        },
        inputMode: "numeric",
        placeholder: `${datePlaceholder(dateMode, dateTimeParams.dateSeparator, labels)}, ${timePlaceholder(timeMode, labels)}`,
      };
    }
    case "date-range": {
      const given = params as DateRangeParams;
      const rangeParams =
        locale && !given.mode
          ? { ...given, mode: getDateOrder(locale), dateSeparator: getDateSeparator(locale) }
          : given;
      const order = rangeParams.mode ?? "dd/mm/yyyy";
      const placeholder = datePlaceholder(order, rangeParams.dateSeparator, labels);
      const options = stable(createDateRangeMaskOptions(rangeParams));
      const format = transformWith(options);
      return {
        options,
        unmask: (masked) => rangeDigits(dateRangeMaskRemover(masked), order),
        format: (raw) => format(rangeFromRaw(raw, order)),
        inputMode: "numeric",
        placeholder: `${placeholder} – ${placeholder}`,
      };
    }
    case "decimal": {
      const given = params as DecimalParams;
      const decimalParams = locale ? { locale, ...given } : given;
      const separators = decimalMaskSeparators(decimalParams);
      return {
        options: stable(createDecimalMaskOptions(decimalParams)),
        unmask: (masked) => decimalMaskRemover(masked, separators),
        format: (raw) => {
          if (!raw) return "";
          const number = Number(raw);
          return Number.isNaN(number)
            ? decimalMaskFormatter(raw, decimalParams)
            : decimalMaskFormatter(number, decimalParams);
        },
        inputMode: "decimal",
        placeholder: decimalMaskFormatter(0, decimalParams),
      };
    }
  }
}

/**
 * Resolves a mask preset, or wraps custom Maskito options (whose raw value is
 * the masked text itself, since there is no generic way to unmask it).
 * Creates fresh options on every call: call it once per input (`useMask` does).
 */
export function resolveMask(
  mask: MaskSpec | StableMaskitoOptions,
  options?: MaskLocaleOptions,
): ResolvedMask {
  if (typeof mask === "string" || "type" in mask) return resolvePreset(mask, options);
  return { options: mask, unmask: (masked) => masked, format: transformWith(mask) };
}
