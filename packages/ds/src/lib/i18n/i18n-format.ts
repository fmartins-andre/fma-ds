type PluralForms = { other: string } & Partial<Record<Intl.LDMLPluralRule, string>> & {
    [exact: `=${number}`]: string;
  };

function cached<F>(cache: Map<string, F>, key: string, create: () => F) {
  const existing = cache.get(key);
  if (existing) return existing;
  const created = create();
  cache.set(key, created);
  return created;
}

const pluralRules = new Map<string, Intl.PluralRules>();
const numberFormats = new Map<string, Intl.NumberFormat>();
const dateFormats = new Map<string, Intl.DateTimeFormat>();

/** `=N` forms win over the locale's plural category, which falls back to `other`. */
export function plural(locale: string, n: number, forms: PluralForms) {
  const exact = forms[`=${n}`];
  if (exact !== undefined) return exact;
  const rules = cached(pluralRules, locale, () => new Intl.PluralRules(locale));
  return forms[rules.select(n)] ?? forms.other;
}

export function number(locale: string, value: number, options?: Intl.NumberFormatOptions) {
  const key = `${locale}|${JSON.stringify(options)}`;
  return cached(numberFormats, key, () => new Intl.NumberFormat(locale, options)).format(value);
}

export function currency(
  locale: string,
  value: number,
  currencyCode: string,
  options?: Intl.NumberFormatOptions,
) {
  return number(locale, value, { ...options, style: "currency", currency: currencyCode });
}

export function date(locale: string, value: Date | number, options?: Intl.DateTimeFormatOptions) {
  const key = `${locale}|${JSON.stringify(options)}`;
  return cached(dateFormats, key, () => new Intl.DateTimeFormat(locale, options)).format(value);
}
