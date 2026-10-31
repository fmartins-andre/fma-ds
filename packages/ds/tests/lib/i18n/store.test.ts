import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createStore,
  type FmaLoader,
  type FmaMessagesPack,
  loadFmaMessages,
  readFmaMessages,
} from "@/lib/i18n/index";

const pack = {} as FmaMessagesPack;

function deferred() {
  let resolve = () => {};
  const promise = new Promise<{ default: FmaMessagesPack }>((done) => {
    resolve = () => done({ default: pack });
  });
  const loader: FmaLoader = vi.fn(() => promise);
  return { loader, resolve };
}

function stubBrowser(languages: string[]) {
  vi.stubGlobal("document", {});
  vi.stubGlobal("navigator", { languages });
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("loadFmaMessages", () => {
  it("negotiates, then loads the pack and the fallback's once", async () => {
    const pt = vi.fn(async () => ({ default: pack }));
    const es = vi.fn(async () => ({ default: pack }));
    const locales = { "pt-BR": pt, es };
    expect(readFmaMessages(locales, "pt-BR")).toBeUndefined();
    const results = await Promise.all([
      loadFmaMessages(locales, "pt-PT", "es"),
      loadFmaMessages(locales, "pt-PT", "es"),
    ]);
    expect(results).toEqual(["pt-BR", "pt-BR"]);
    expect(pt).toHaveBeenCalledTimes(1);
    expect(es).toHaveBeenCalledTimes(1);
    expect(readFmaMessages(locales, "pt-BR")).toBe(pack);
  });

  it("accepts en with no entry", async () => {
    await expect(loadFmaMessages({}, "en")).resolves.toBe("en");
  });

  it("retries a loader that failed", async () => {
    const loader = vi
      .fn<FmaLoader>()
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValue({ default: pack });
    await expect(loadFmaMessages({ es: loader }, "es")).rejects.toThrow("offline");
    await expect(loadFmaMessages({ es: loader }, "es")).resolves.toBe("es");
  });
});

describe("createStore", () => {
  it("keeps the old locale while the pack loads, then switches at once", async () => {
    const { loader, resolve } = deferred();
    const store = createStore({ locales: { "pt-BR": loader }, detect: false });
    const seen: unknown[] = [];
    store.subscribe(() => seen.push(store.getSnapshot()));
    const change = store.setLocale("pt-BR");
    expect(store.getSnapshot()).toEqual({ locale: "en", isPending: true });
    resolve();
    await change;
    expect(seen).toEqual([
      { locale: "en", isPending: true },
      { locale: "pt-BR", isPending: false },
    ]);
  });

  it("lets the latest of two changes win", async () => {
    const slow = deferred();
    const fast = deferred();
    const store = createStore({ locales: { es: slow.loader, fr: fast.loader }, detect: false });
    const first = store.setLocale("es");
    const second = store.setLocale("fr");
    fast.resolve();
    await second;
    slow.resolve();
    await first;
    expect(store.getSnapshot()).toEqual({ locale: "fr", isPending: false });
  });

  it("clears pending when the pack fails, keeping the locale", async () => {
    const loader: FmaLoader = () => Promise.reject(new Error("offline"));
    const store = createStore({ locales: { es: loader }, detect: false });
    await expect(store.setLocale("es")).rejects.toThrow("offline");
    expect(store.getSnapshot()).toEqual({ locale: "en", isPending: false });
  });

  it("negotiates setLocale, warning when nothing matches", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const store = createStore({
      locales: { "pt-BR": pack },
      defaultLocale: "pt-BR",
      detect: false,
    });
    await store.setLocale("en-GB");
    expect(store.getSnapshot().locale).toBe("en");
    expect(warn).not.toHaveBeenCalled();
    await store.setLocale("ja");
    expect(store.getSnapshot().locale).toBe("pt-BR");
    expect(warn).toHaveBeenCalledOnce();
  });

  it("detects the browser's language over the default", () => {
    stubBrowser(["en-US"]);
    const locales = { "pt-BR": pack };
    expect(createStore({ locales, defaultLocale: "pt-BR" }).getSnapshot().locale).toBe("en");
    expect(
      createStore({ locales, defaultLocale: "pt-BR", detect: false }).getSnapshot().locale,
    ).toBe("pt-BR");
  });

  it("lets initialLocale win over detection", () => {
    stubBrowser(["en-US"]);
    const store = createStore({ locales: { "pt-BR": pack }, initialLocale: "pt-BR" });
    expect(store.getSnapshot().locale).toBe("pt-BR");
  });

  it("keeps stores apart", async () => {
    const locales = { "pt-BR": pack };
    const first = createStore({ locales, initialLocale: "pt-BR" });
    const second = createStore({ locales, initialLocale: "en" });
    await first.setLocale("en");
    await second.setLocale("pt-BR");
    expect(first.getSnapshot().locale).toBe("en");
    expect(second.getSnapshot().locale).toBe("pt-BR");
  });
});
