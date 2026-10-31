// @vitest-environment happy-dom
import { act, Suspense } from "react";
import { useLocale } from "react-aria-components";
import { createRoot, hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  FmaI18nProvider,
  type FmaLoader,
  type FmaLocales,
  type FmaMessagesPack,
  loadFmaMessages,
  useFmaLocale,
  useFmaMessages,
} from "@/lib/i18n/index";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const carouselEn = { labels: { next: "Next slide", previous: "Previous slide" } };
const ptBR = { carousel: { labels: { next: "Próximo" } } } satisfies FmaMessagesPack;
const locales = { "pt-BR": ptBR };

let controls: ReturnType<typeof useFmaLocale>;

function Probe() {
  const { labels } = useFmaMessages("carousel", carouselEn);
  controls = useFmaLocale();
  return <p>{labels.next}</p>;
}

function Prop() {
  const { labels } = useFmaMessages("carousel", carouselEn, { labels: { next: "prop" } });
  return <p>{labels.next}</p>;
}

function Previous() {
  return <p>{useFmaMessages("carousel", carouselEn).labels.previous}</p>;
}

function AriaLocale() {
  return <p>{useLocale().locale}</p>;
}

let seen: string[] = [];

function Recorder() {
  const { labels } = useFmaMessages("carousel", carouselEn);
  const state = useFmaLocale();
  seen.push(`${state?.locale} ${state?.isPending} ${labels.next}`);
  return null;
}

let root: Root | undefined;
let host: HTMLElement;

async function mount(element: React.ReactNode) {
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  await act(async () => root?.render(element));
}

afterEach(async () => {
  await act(async () => root?.unmount());
  root = undefined;
  document.body.replaceChildren();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("without a provider", () => {
  it("renders English and has no controls", async () => {
    await mount(<Probe />);
    expect(host.textContent).toBe("Next slide");
    expect(controls).toBeNull();
  });
});

describe("precedence", () => {
  it("prop over overrides over the dictionary", async () => {
    const overrides = { carousel: { labels: { next: "override" } } };
    await mount(
      <FmaI18nProvider locale="pt-BR" locales={locales} overrides={overrides}>
        <Probe />
        <Prop />
      </FmaI18nProvider>,
    );
    expect(host.textContent).toBe("overrideprop");
  });

  it("fills what a pack lacks from English", async () => {
    await mount(
      <FmaI18nProvider locale="pt-BR" locales={locales}>
        <Previous />
      </FmaI18nProvider>,
    );
    expect(host.textContent).toBe("Previous slide");
  });

  it("doesn't let the fallback show through English", async () => {
    await mount(
      <FmaI18nProvider locale="en" defaultLocale="pt-BR" locales={locales}>
        <Probe />
      </FmaI18nProvider>,
    );
    expect(host.textContent).toBe("Next slide");
  });
});

describe("server rendering", () => {
  it("keeps concurrent languages apart", async () => {
    const render = async (initialLocale: string) =>
      renderToString(
        <FmaI18nProvider initialLocale={initialLocale} locales={locales}>
          <Probe />
        </FmaI18nProvider>,
      );
    const [pt, english] = await Promise.all([render("pt-BR"), render("en")]);
    expect(pt).toContain("Próximo");
    expect(english).toContain("Next slide");
  });

  it("hydrates the server's language over the browser's", async () => {
    const app = (
      <FmaI18nProvider initialLocale="pt-BR" locales={locales}>
        <Probe />
      </FmaI18nProvider>
    );
    const html = renderToString(app);
    vi.stubGlobal("navigator", { ...navigator, languages: ["en"] });
    host = document.createElement("div");
    host.innerHTML = html;
    document.body.append(host);
    const onRecoverableError = vi.fn();
    await act(async () => {
      root = hydrateRoot(host, app, { onRecoverableError });
    });
    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(host.textContent).toBe("Próximo");
  });
});

describe("controlled", () => {
  it("wins over the rest, and setLocale only asks", async () => {
    const onLocaleChange = vi.fn();
    const app = (locale: string) => (
      <FmaI18nProvider
        locale={locale}
        initialLocale="pt-BR"
        locales={locales}
        onLocaleChange={onLocaleChange}
      >
        <Probe />
      </FmaI18nProvider>
    );
    await mount(app("en"));
    expect(host.textContent).toBe("Next slide");
    await act(async () => controls?.setLocale("pt-BR"));
    expect(onLocaleChange).toHaveBeenCalledWith("pt-BR");
    expect(host.textContent).toBe("Next slide");
    await act(async () => root?.render(app("pt-BR")));
    expect(host.textContent).toBe("Próximo");
  });

  it("negotiates the prop, falling back with a warning", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    await mount(
      <FmaI18nProvider locale="pt" locales={locales}>
        <Probe />
      </FmaI18nProvider>,
    );
    expect(controls?.locale).toBe("pt-BR");
    expect(warn).not.toHaveBeenCalled();
    await act(async () => root?.unmount());
    await mount(
      <FmaI18nProvider locale="xx" locales={locales}>
        <Probe />
      </FmaI18nProvider>,
    );
    expect(controls?.locale).toBe("en");
    expect(warn).toHaveBeenCalled();
  });
});

describe("packs behind a loader", () => {
  const lazy = (): FmaLocales => {
    const loader: FmaLoader = async () => ({ default: ptBR });
    return { "pt-BR": loader };
  };

  it("suspends until the first pack loads", async () => {
    await mount(
      <Suspense fallback="loading">
        <FmaI18nProvider locale="pt-BR" locales={lazy()}>
          <Probe />
        </FmaI18nProvider>
      </Suspense>,
    );
    expect(host.textContent).toBe("Próximo");
  });

  it("doesn't suspend after loadFmaMessages", async () => {
    const loaded = lazy();
    await loadFmaMessages(loaded, "pt-BR");
    const html = renderToString(
      <FmaI18nProvider locale="pt-BR" locales={loaded}>
        <Probe />
      </FmaI18nProvider>,
    );
    expect(html).toContain("Próximo");
  });

  it("switches at once, keeping the old text while it loads", async () => {
    let finish = () => {};
    const loader: FmaLoader = () =>
      new Promise((resolve) => {
        finish = () => resolve({ default: ptBR });
      });
    seen = [];
    const onLocaleChange = vi.fn();
    await mount(
      <FmaI18nProvider locales={{ "pt-BR": loader }} detect={false} onLocaleChange={onLocaleChange}>
        <Probe />
        <Recorder />
      </FmaI18nProvider>,
    );
    await act(async () => controls?.setLocale("pt-BR"));
    expect(controls?.isPending).toBe(true);
    expect(host.textContent).toBe("Next slide");
    expect(onLocaleChange).not.toHaveBeenCalled();
    await act(async () => finish());
    expect(host.textContent).toBe("Próximo");
    expect(onLocaleChange).toHaveBeenCalledWith("pt-BR");
    expect(seen).toEqual(["en false Next slide", "en true Next slide", "pt-BR false Próximo"]);
  });
});

describe("react-aria", () => {
  it("follows the provider", async () => {
    await mount(
      <FmaI18nProvider locale="pt-BR" locales={locales}>
        <AriaLocale />
      </FmaI18nProvider>,
    );
    expect(host.textContent).toBe("pt-BR");
  });
});
