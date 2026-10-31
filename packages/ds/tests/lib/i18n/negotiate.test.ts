import { describe, expect, it, vi } from "vitest";
import { getBrowserLocales, negotiateLocale, parseAcceptLanguage } from "@/lib/i18n/index";

describe("negotiateLocale", () => {
  const available = ["pt-BR", "en"];

  it.each([
    ["pt-BR", "pt-BR"],
    ["pt-PT", "pt-BR"],
    ["pt", "pt-BR"],
    ["PT-br", "pt-BR"],
    ["es-AR", "en"],
  ])("%s → %s", (requested, expected) => {
    expect(negotiateLocale(requested, available, "en")).toBe(expected);
  });

  it("walks the requested list in order", () => {
    expect(negotiateLocale(["es", "en-GB"], available, "pt-BR")).toBe("en");
  });

  it("prefers the same script", () => {
    expect(negotiateLocale("sr-Latn-RS", ["sr-Latn", "sr"], "en")).toBe("sr-Latn");
  });

  it("uses the fallback without a match, or with an invalid tag", () => {
    expect(negotiateLocale("es", ["pt-BR"], "pt-BR")).toBe("pt-BR");
    expect(negotiateLocale("not a locale", available, "en")).toBe("en");
  });
});

describe("parseAcceptLanguage", () => {
  it("orders by quality and drops the wildcard", () => {
    expect(parseAcceptLanguage("en-US,en;q=0.9,pt-BR;q=0.95,*;q=0.1")).toEqual([
      "en-US",
      "pt-BR",
      "en",
    ]);
  });

  it.each([[null], [""], ["@@@"]])("gives nothing for %j", (header) => {
    expect(parseAcceptLanguage(header)).toEqual([]);
  });
});

describe("getBrowserLocales", () => {
  it("ignores the server's navigator", () => {
    vi.stubGlobal("navigator", { languages: ["en-US"] });
    expect(getBrowserLocales()).toEqual([]);
    vi.unstubAllGlobals();
  });
});
