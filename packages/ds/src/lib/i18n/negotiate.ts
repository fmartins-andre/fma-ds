function parse(locale: string) {
  try {
    const { language, script } = new Intl.Locale(locale);
    return { language, script };
  } catch {
    return undefined;
  }
}

function matchOne(requested: string, available: readonly string[]) {
  const target = parse(requested);
  if (!target) return undefined;
  const lower = requested.toLowerCase();
  const exact = available.find((locale) => locale.toLowerCase() === lower);
  if (exact) return exact;
  const candidates = available.filter((locale) => parse(locale)?.language === target.language);
  return (
    candidates.find((locale) => target.script && parse(locale)?.script === target.script) ??
    candidates.find((locale) => locale.toLowerCase() === target.language) ??
    candidates[0]
  );
}

/** Exact, then language + script, then language, then any region of the language. */
export function matchLocale(requested: string | readonly string[], available: readonly string[]) {
  for (const locale of typeof requested === "string" ? [requested] : requested) {
    const match = matchOne(locale, available);
    if (match) return match;
  }
  return undefined;
}

export function negotiateLocale(
  requested: string | readonly string[],
  available: readonly string[],
  fallback: string,
) {
  return matchLocale(requested, available) ?? fallback;
}

/** The locales of an Accept-Language header, by quality, without `*`. */
export function parseAcceptLanguage(header: string | null | undefined) {
  if (!header) return [];
  return header
    .split(",")
    .map((part) => {
      const [tag = "", ...params] = part.trim().split(";");
      const quality = params.find((param) => param.trim().startsWith("q="));
      return { tag: tag.trim(), q: quality ? Number(quality.trim().slice(2)) : 1 };
    })
    .filter(({ tag, q }) => tag !== "*" && q > 0 && parse(tag) !== undefined)
    .sort((a, b) => b.q - a.q)
    .map(({ tag }) => tag);
}

/** Empty on the server, where `navigator` exists too and names the machine's language. */
export function getBrowserLocales(): string[] {
  return typeof document === "undefined" ? [] : [...navigator.languages];
}
