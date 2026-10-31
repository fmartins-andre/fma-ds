import { afterEach, describe, expect, it, vi } from "vitest";
import { currency, date, number, plural } from "@/lib/i18n/index";

afterEach(() => vi.restoreAllMocks());

describe("plural", () => {
  const forms = { "=0": "Nenhuma", one: "1 item", other: "2 itens" };

  it("prefers an exact form", () => expect(plural("pt-BR", 0, forms)).toBe("Nenhuma"));
  it("uses the locale's category", () => expect(plural("pt-BR", 1, forms)).toBe("1 item"));
  it("falls back to other", () => expect(plural("en", 2, { one: "a", other: "b" })).toBe("b"));
});

describe("number, currency and date", () => {
  it("formats by locale", () => {
    expect(number("pt-BR", 1234.5)).toBe("1.234,5");
    expect(currency("pt-BR", -50, "BRL")).toBe(
      new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(-50),
    );
    expect(date("en-US", Date.UTC(2026, 9, 29), { timeZone: "UTC" })).toBe("10/29/2026");
  });

  it("reuses the Intl instance for the same locale and options", () => {
    const spy = vi.spyOn(Intl, "NumberFormat");
    number("fr", 1, { maximumFractionDigits: 1 });
    number("fr", 2, { maximumFractionDigits: 1 });
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
