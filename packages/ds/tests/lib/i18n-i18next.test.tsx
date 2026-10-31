// @vitest-environment happy-dom
import { readFileSync } from "node:fs";
import { join } from "node:path";
import i18next, { type i18n as I18next } from "i18next";
import { act, Suspense } from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { I18nextProvider, useTranslation } from "react-i18next";
import { afterEach, describe, expect, it, vi } from "vitest";
import { type FmaLoader, type FmaLocales, useFmaLocale, useFmaMessages } from "@/lib/i18n/i18n";
import { changeLanguage, FmaI18nextProvider } from "@/lib/i18n-i18next/i18n-i18next";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const carouselEn = { labels: { next: "Next slide", previous: "Previous slide" } };
const ptBR = { carousel: { labels: { next: "Próximo" } } };
const locales = { "pt-BR": ptBR };

async function createI18n(lng: string, fallbackLng: string | string[] | false = "en") {
  const i18n = i18next.createInstance();
  await i18n.init({
    lng,
    fallbackLng,
    resources: {
      en: { translation: { title: "Title" } },
      fr: { translation: { title: "Titre" } },
      pt: { translation: { title: "Título (pt)" } },
      "pt-BR": { translation: { title: "Título" } },
    },
  });
  return i18n;
}

let controls: ReturnType<typeof useFmaLocale>;

function Probe() {
  const { t } = useTranslation();
  const { labels } = useFmaMessages("carousel", carouselEn);
  controls = useFmaLocale();
  return (
    <p>
      {t("title")}|{labels.next}
    </p>
  );
}

function Tree({ i18n, locales: packs }: { i18n: I18next; locales: FmaLocales }) {
  return (
    <I18nextProvider i18n={i18n}>
      <FmaI18nextProvider locales={packs}>
        <Probe />
      </FmaI18nextProvider>
    </I18nextProvider>
  );
}

let root: Root | undefined;

async function render(node: React.ReactNode) {
  const container = document.createElement("div");
  await act(async () => {
    root = createRoot(container);
    root.render(<Suspense fallback="loading">{node}</Suspense>);
  });
  return container;
}

function deferredLoader() {
  let resolve = () => {};
  const promise = new Promise<{ default: typeof ptBR }>((done) => {
    resolve = () => done({ default: ptBR });
  });
  const loader: FmaLoader = vi.fn(() => promise);
  return { loader, resolve: () => resolve() };
}

// Reading a loader's pack in the commit after it resolves takes more than one tick.
const settle = () => act(() => new Promise((resolve) => setTimeout(resolve)));

afterEach(async () => {
  await act(async () => root?.unmount());
  root = undefined;
  controls = null;
});

describe("FmaI18nextProvider", () => {
  it("follows the language i18next starts in", async () => {
    const container = await render(<Tree i18n={await createI18n("pt-BR")} locales={locales} />);
    expect(container.textContent).toBe("Título|Próximo");
  });

  it("takes the instance by prop too", async () => {
    const i18n = await createI18n("pt-BR");
    const container = await render(
      <I18nextProvider i18n={i18n}>
        <FmaI18nextProvider i18n={await createI18n("en")} locales={locales}>
          <p>{<Label />}</p>
        </FmaI18nextProvider>
      </I18nextProvider>,
    );
    expect(container.textContent).toBe("Next slide");
  });

  it("negotiates i18next's language against the packs", async () => {
    const container = await render(<Tree i18n={await createI18n("pt")} locales={locales} />);
    expect(container.textContent).toBe("Título (pt)|Próximo");
  });

  it("takes the components' fallback from fallbackLng", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const container = await render(
      <Tree i18n={await createI18n("fr", ["pt-BR"])} locales={locales} />,
    );
    expect(container.textContent).toBe("Titre|Próximo");
    warn.mockRestore();
  });

  it.each([[false], ["de"], ["dev"]] as const)(
    "uses English when fallbackLng is %s",
    async (fallbackLng) => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      const container = await render(
        <Tree i18n={await createI18n("fr", fallbackLng)} locales={locales} />,
      );
      expect(container.textContent).toBe("Titre|Next slide");
      warn.mockRestore();
    },
  );

  it("never leaves two languages on screen with changeLanguage", async () => {
    const { loader, resolve } = deferredLoader();
    const i18n = await createI18n("en");
    const container = await render(<Tree i18n={i18n} locales={{ "pt-BR": loader }} />);
    // Observers run after the task, as a paint would: a commit that a layout effect
    // replaces in the same task never reaches the screen.
    const painted: (string | null)[] = [];
    const observer = new MutationObserver(() => painted.push(container.textContent));
    observer.observe(container, { characterData: true, childList: true, subtree: true });

    let done: Promise<void> | undefined;
    await act(async () => {
      done = changeLanguage(i18n, "pt-BR", { "pt-BR": loader });
    });
    expect(container.textContent).toBe("Title|Next slide");
    await act(async () => {
      resolve();
      await done;
    });

    observer.disconnect();
    expect(container.textContent).toBe("Título|Próximo");
    expect(painted).not.toContain("Título|Next slide");
  });

  it("loads the pack in parallel when i18next changes on its own", async () => {
    const { loader, resolve } = deferredLoader();
    const i18n = await createI18n("en");
    const container = await render(<Tree i18n={i18n} locales={{ "pt-BR": loader }} />);

    const languageChanged = vi.fn(() => expect(loader).toHaveBeenCalled());
    i18n.on("languageChanged", languageChanged);
    await act(async () => void (await i18n.changeLanguage("pt-BR")));

    expect(languageChanged).toHaveBeenCalledOnce();
    expect(controls?.isPending).toBe(true);
    expect(container.textContent).toBe("Título|Next slide");

    await act(async () => resolve());
    await settle();
    expect(controls?.isPending).toBe(false);
    expect(container.textContent).toBe("Título|Próximo");
  });

  it("leaves a language without a pack to the fallback", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const i18n = await createI18n("pt-BR");
    const container = await render(<Tree i18n={i18n} locales={locales} />);
    await act(async () => void (await i18n.changeLanguage("fr")));
    expect(container.textContent).toContain("Next slide");
    warn.mockRestore();
  });

  it("ignores a pack that fails to preload, so the store reports it", async () => {
    const failed = vi.fn(() => Promise.reject(new Error("offline")));
    const i18n = await createI18n("en");
    await render(<Tree i18n={i18n} locales={{ "pt-BR": failed }} />);
    const unhandled = vi.fn();
    process.on("unhandledRejection", unhandled);
    i18n.emit("languageChanging", "pt-BR");
    await settle();
    process.off("unhandledRejection", unhandled);
    expect(failed).toHaveBeenCalled();
    expect(unhandled).not.toHaveBeenCalled();
  });

  it("switches i18next from useFmaLocale", async () => {
    const i18n = await createI18n("en");
    const container = await render(<Tree i18n={i18n} locales={locales} />);
    await act(async () => {
      controls?.setLocale("pt-BR");
    });
    await settle();
    expect(i18n.resolvedLanguage).toBe("pt-BR");
    expect(container.textContent).toBe("Título|Próximo");
  });

  it("stops listening on unmount", async () => {
    const { loader } = deferredLoader();
    const i18n = await createI18n("en");
    await render(<Tree i18n={i18n} locales={{ "pt-BR": loader }} />);
    await act(async () => root?.unmount());
    root = undefined;
    i18n.emit("languageChanging", "pt-BR");
    expect(loader).not.toHaveBeenCalled();
  });

  it("keeps simultaneous server renders apart", async () => {
    const [pt, en] = await Promise.all([createI18n("pt-BR"), createI18n("en")]);
    const html = await Promise.all(
      [pt, en, pt, en].map(async (i18n) => renderToString(<Tree i18n={i18n} locales={locales} />)),
    );
    expect(html.map((text) => text.replace(/<[^>]+>/g, "").replace("<!-- -->", ""))).toEqual([
      "Título|Próximo",
      "Title|Next slide",
      "Título|Próximo",
      "Title|Next slide",
    ]);
  });

  it("imports no component", () => {
    const source = readFileSync(
      join(import.meta.dirname, "../../src/lib/i18n-i18next/i18n-i18next.tsx"),
    );
    const imports = [...source.toString().matchAll(/from "([^"]+)"/g)].map(([, from]) => from);
    expect(imports.sort()).toEqual(["@/lib/i18n/i18n", "i18next", "react", "react-i18next"]);
  });
});

function Label() {
  return useFmaMessages("carousel", carouselEn).labels.next;
}
