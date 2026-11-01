/// <reference types="vite/client" />
// The pack is loose where an item isn't installed, so completeness is checked
// here, in the one place every item exists: key by key against each item's English.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import ptBR from "@/lib/i18n-pt-br/i18n-pt-br";

const modules = import.meta.glob(
  ["/src/core/*/*.tsx", "/src/blocks/*/*.tsx", "/src/hooks/*.ts", "!**/*.stories.tsx"],
  { eager: true },
) as Record<string, Record<string, unknown>>;

type Namespace = Record<string, unknown>;

const english = Object.fromEntries(
  Object.values(modules).flatMap((module) =>
    Object.entries(module)
      .filter(([name]) => /^[a-z]\w*En$/.test(name))
      .map(([name, value]) => [name.slice(0, -2), value as Namespace]),
  ),
);

// Texts that are the same in both languages.
const SAME_TEXT = new Set([
  "404",
  "403",
  "...",
  "AM",
  "PM",
  "AM/PM",
  "OK",
  "Hex",
  "Agenda",
  "Emoji",
  "d",
  "m",
  "h",
  "Marcar",
  "A",
  "D",
  "R",
  "M",
  "5",
  "EEE",
  "EEEEE",
]);

function strings(value: unknown, path: string): [string, string][] {
  if (typeof value === "string") return [[path, value]];
  if (Array.isArray(value)) return value.map((item, index) => [`${path}.${index}`, String(item)]);
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, item]) => strings(item, `${path}.${key}`));
  }
  return [];
}

describe("the pt-BR pack", () => {
  it("covers every item with text", () => {
    expect(Object.keys(ptBR).sort()).toEqual(Object.keys(english).sort());
  });

  it.each(Object.keys(english).map((namespace) => [namespace] as const))(
    "%s only has keys its item knows",
    (namespace) => {
      const pack = ptBR[namespace as keyof typeof ptBR] as Namespace;
      const sections = english[namespace] as Record<string, object>;
      for (const [section, messages] of Object.entries(pack)) {
        if (section === "functions") continue;
        expect(Object.keys(sections)).toContain(section);
        expect(Object.keys(sections[section])).toEqual(
          expect.arrayContaining(Object.keys(messages as object)),
        );
      }
    },
  );

  it("translates every plain text it leaves to fall back", () => {
    const missing = Object.entries(english).flatMap(([namespace, sections]) =>
      strings(sections, namespace).filter(([path, text]) => {
        const keys = path.split(".").slice(1);
        const translated = keys.reduce<unknown>(
          (node, key) => (node as Record<string, unknown> | undefined)?.[key],
          ptBR[namespace as keyof typeof ptBR],
        );
        return translated === undefined && !SAME_TEXT.has(text) && !path.includes(".formats.");
      }),
    );
    expect(missing).toEqual([]);
  });

  it("only imports the lib", () => {
    const dir = join(__dirname, "..", "..", "src");
    const carousel = readFileSync(
      join(dir, "core/carousel/carousel-i18n/carousel-pt-BR.ts"),
      "utf8",
    );
    expect(carousel.match(/from "([^"]+)"/g)).toEqual(['from "@/lib/i18n/i18n"']);
  });
});
