import { describe, expect, it } from "vitest";
import { resolveNamespace } from "@/lib/i18n/index";

type Config = {
  labels: { today: string; next: string };
  functions: { title: (date: string) => string };
};

const en = {
  labels: { today: "Today", next: "Next" },
  functions: ({ labels }: Pick<Config, "labels">) => ({
    title: (date: string) => `${labels.today}, ${date}`,
  }),
};
const ptBR = {
  labels: { today: "Hoje" },
  functions: ({ labels }: Pick<Config, "labels">) => ({
    title: (date: string) => `${date} (${labels.today})`,
  }),
};

describe("resolveNamespace", () => {
  it("merges partial sections key by key", () => {
    const { labels } = resolveNamespace<Config>([en, ptBR], [{ labels: { next: "Avançar" } }]);
    expect(labels).toEqual({ today: "Hoje", next: "Avançar" });
  });

  it("runs the strongest factory over the overridden labels", () => {
    const { functions } = resolveNamespace<Config>([en, ptBR], [{ labels: { today: "Agora" } }]);
    expect(functions.title("1/1")).toBe("1/1 (Agora)");
  });

  it("lets explicit functions win over the factory", () => {
    const title = () => "fixed";
    const { functions } = resolveNamespace<Config>([en, ptBR], [{ functions: { title } }]);
    expect(functions.title).toBe(title);
  });

  it("lets a pack bring only some functions", () => {
    type Two = { labels: { a: string }; functions: { one: () => string; two: () => string } };
    const english = {
      labels: { a: "a" },
      functions: () => ({ one: () => "one", two: () => "two" }),
    };
    const pack = { functions: () => ({ one: () => "um" }) };
    const { functions } = resolveNamespace<Two>([english, pack]);
    expect(functions.one()).toBe("um");
    expect(functions.two()).toBe("two");
  });

  it("skips missing layers", () => {
    const { labels } = resolveNamespace<Config>([en, { labels: { next: "Weiter" } }, undefined]);
    expect(labels).toEqual({ today: "Today", next: "Weiter" });
  });

  it("gives the same object for the same layers", () => {
    const overrides = { labels: { next: "Avançar" } };
    expect(resolveNamespace<Config>([en, ptBR], [overrides])).toBe(
      resolveNamespace<Config>([en, ptBR], [overrides]),
    );
  });

  it("tells a dictionary layer from an override in the same position", () => {
    const layer = { labels: { next: "X" } };
    const asDictionary = resolveNamespace<Config>([en, layer], []);
    const asOverride = resolveNamespace<Config>([en], [layer]);
    expect(asDictionary).not.toBe(asOverride);
  });
});
