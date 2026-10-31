import type { MaskitoOptions } from "@maskito/core";
import { maskitoTransform } from "@maskito/core";
import type { MaskitoNumberParams } from "@maskito/kit";
import { maskitoNumber, maskitoStringifyNumber } from "@maskito/kit";
import { useMemo } from "react";
import { getNumberSeparators, type NumberSeparators } from "./locale";
import { makeStableMaskitoOptions, type StableMaskitoOptions } from "./stable-mask";

export function decimalMaskRemover(
  value: string | null | undefined,
  separators?: NumberSeparators,
): string {
  const decimal = separators?.decimal ?? ",";
  if (!value) return "";
  return [...value]
    .filter((char) => /\d/.test(char) || char === decimal)
    .join("")
    .replace(decimal, ".");
}

type DecimalMaskOptionsProps = Partial<
  Pick<
    MaskitoNumberParams,
    | "min"
    | "max"
    | "minimumFractionDigits"
    | "maximumFractionDigits"
    | "prefix"
    | "postfix"
    | "decimalSeparator"
    | "thousandSeparator"
  >
> & {
  /** Takes the separators from here; explicit separators still win. */
  locale?: string;
};

const defaultOptions: MaskitoNumberParams = {
  decimalSeparator: ",",
  thousandSeparator: ".",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
};

function resolveOptions({ locale, ...options }: DecimalMaskOptionsProps = {}): MaskitoNumberParams {
  const separators = locale ? getNumberSeparators(locale) : undefined;
  return {
    ...defaultOptions,
    ...(separators && {
      decimalSeparator: separators.decimal,
      thousandSeparator: separators.thousand,
    }),
    ...options,
  };
}

/** The separators a decimal mask with these options uses, for `decimalMaskRemover`. */
export function decimalMaskSeparators(options?: DecimalMaskOptionsProps): NumberSeparators {
  const { decimalSeparator, thousandSeparator } = resolveOptions(options);
  return { decimal: decimalSeparator ?? ",", thousand: thousandSeparator ?? "." };
}

export const createDecimalMaskOptions: (options?: DecimalMaskOptionsProps) => MaskitoOptions = (
  options,
) => {
  return maskitoNumber(resolveOptions(options));
};

export function useCreateDecimalMaskOptions(
  options?: DecimalMaskOptionsProps,
): StableMaskitoOptions {
  return useMemo(() => makeStableMaskitoOptions(createDecimalMaskOptions(options)), [options]);
}

export function decimalMaskFormatter(
  value: string | number | null | undefined,
  options?: DecimalMaskOptionsProps,
): string {
  const validOptions = resolveOptions(options);

  switch (typeof value) {
    case "string":
      return maskitoTransform(value, maskitoNumber(validOptions));

    case "number":
    case "bigint":
      return maskitoStringifyNumber(value, validOptions);

    default:
      return "";
  }
}
