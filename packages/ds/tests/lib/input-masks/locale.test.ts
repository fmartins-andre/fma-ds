import { describe, expect, it } from "vitest";
import { decimalMaskRemover } from "@/lib/input-masks/decimal-mask";
import { getDateOrder, getDateSeparator, getNumberSeparators } from "@/lib/input-masks/locale";
import { resolveMask } from "@/lib/input-masks/presets";

const en = { day: "d", month: "m", year: "y", hour: "h", minute: "m" };

describe("what a locale says", () => {
  it("gives the number separators", () => {
    expect(getNumberSeparators("pt-BR")).toEqual({ decimal: ",", thousand: "." });
    expect(getNumberSeparators("en")).toEqual({ decimal: ".", thousand: "," });
  });

  it.each([
    ["en-US", "mm/dd/yyyy"],
    ["en-GB", "dd/mm/yyyy"],
    ["pt-BR", "dd/mm/yyyy"],
    ["ja", "yyyy/mm/dd"],
  ])("%s dates are %s", (locale, order) => {
    expect(getDateOrder(locale)).toBe(order);
  });

  it("gives the date separator", () => {
    expect(getDateSeparator("pt-BR")).toBe("/");
    expect(getDateSeparator("de")).toBe(".");
  });
});

describe("decimalMaskRemover", () => {
  it("keeps today's behavior without separators", () => {
    expect(decimalMaskRemover("1.234,50")).toBe("1234.50");
  });

  it("reads the given separators", () => {
    expect(decimalMaskRemover("1,234.50", { decimal: ".", thousand: "," })).toBe("1234.50");
  });
});

describe("resolveMask with a locale", () => {
  it("formats decimals and reads them back", () => {
    const mask = resolveMask({ type: "decimal" }, { locale: "en" });
    expect(mask.format("1234.5")).toBe("1,234.50");
    expect(mask.unmask("1,234.50")).toBe("1234.50");
  });

  it("lets an explicit separator win", () => {
    const mask = resolveMask(
      { type: "decimal", decimalSeparator: ",", thousandSeparator: "." },
      { locale: "en" },
    );
    expect(mask.format("1234.5")).toBe("1.234,50");
  });

  it("orders dates and keeps the raw value ISO", () => {
    const mask = resolveMask("date", { locale: "en-US", labels: en });
    expect(mask.placeholder).toBe("mm/dd/yyyy");
    expect(mask.format("2026-10-29")).toBe("10/29/2026");
    expect(mask.unmask("10/29/2026")).toBe("2026-10-29");
  });

  it("uses the locale's date separator", () => {
    const mask = resolveMask("date", { locale: "de", labels: en });
    expect(mask.format("2026-10-29")).toBe("29.10.2026");
    expect(mask.unmask("29.10.2026")).toBe("2026-10-29");
  });

  it("keeps an explicit mode, like the card expiry", () => {
    const mask = resolveMask({ type: "date", mode: "mm/yy" }, { locale: "de" });
    expect(mask.format("2028-10")).toBe("10/28");
  });

  it("keeps a date-time raw value through the locale", () => {
    const mask = resolveMask("date-time", { locale: "en-US", labels: en });
    expect(mask.placeholder).toBe("mm/dd/yyyy, hh:mm");
    const raw = mask.unmask("10/29/2026, 14:30");
    expect(mask.format(raw)).toBe("10/29/2026, 14:30");
    expect(raw).toBe(resolveMask("date-time").unmask("29/10/2026, 14:30"));
  });

  it("keeps a range's raw value the same in every locale", () => {
    const brazilian = resolveMask("date-range");
    const american = resolveMask("date-range", { locale: "en-US", labels: en });
    const japanese = resolveMask("date-range", { locale: "ja", labels: en });
    const raw = brazilian.unmask("29/10/2026 – 05/11/2026");
    expect(american.unmask("10/29/2026 – 11/05/2026")).toBe(raw);
    expect(japanese.unmask("2026/10/29 – 2026/11/05")).toBe(raw);
    // Maskito's range separator has non-breaking spaces.
    const plain = (text: string) => text.replace(/\s/g, " ");
    expect(plain(american.format(raw))).toBe("10/29/2026 – 11/05/2026");
    expect(plain(japanese.format(raw))).toBe("2026/10/29 – 2026/11/05");
  });

  it.each([
    ["cpf", "12345678901"],
    ["cnpj", "12345678000195"],
    ["cep", "01310100"],
    ["phone", "11987654321"],
    ["credit-card", "4111111111111111"],
  ] as const)("leaves %s alone", (mask, raw) => {
    expect(resolveMask(mask, { locale: "en" }).format(raw)).toBe(resolveMask(mask).format(raw));
  });

  it("stays Brazilian without options", () => {
    expect(resolveMask("date").placeholder).toBe("dd/mm/aaaa");
    expect(resolveMask({ type: "decimal" }).format("1234.5")).toBe("1.234,50");
  });
});
