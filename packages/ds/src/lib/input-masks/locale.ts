// What a locale says about numbers and dates, read from Intl. Masks use these
// only when given a locale: without one they keep their Brazilian formats.

export type NumberSeparators = { decimal: string; thousand: string };

export function getNumberSeparators(locale: string): NumberSeparators {
  const parts = new Intl.NumberFormat(locale).formatToParts(1234567.8);
  return {
    decimal: parts.find((part) => part.type === "decimal")?.value ?? ".",
    thousand: parts.find((part) => part.type === "group")?.value ?? "",
  };
}

const dateParts = (locale: string) => new Intl.DateTimeFormat(locale).formatToParts(new Date(0));

export type LocaleDateOrder = "dd/mm/yyyy" | "mm/dd/yyyy" | "yyyy/mm/dd";

export function getDateOrder(locale: string): LocaleDateOrder {
  const order = dateParts(locale)
    .map((part) => part.type)
    .filter((type) => type === "day" || type === "month" || type === "year");
  if (order[0] === "year") return "yyyy/mm/dd";
  return order[0] === "month" ? "mm/dd/yyyy" : "dd/mm/yyyy";
}

export function getDateSeparator(locale: string): string {
  const literal = dateParts(locale).find((part) => part.type === "literal");
  return literal?.value.trim().charAt(0) || "/";
}
