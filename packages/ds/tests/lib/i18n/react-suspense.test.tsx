// @vitest-environment happy-dom
import { act, lazy, type ReactNode, Suspense } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FmaI18nProvider, type FmaLoader, useFmaMessages } from "@/lib/i18n/i18n";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const carouselEn = { labels: { next: "Next slide", previous: "Previous slide" } };
const ptBR = { carousel: { labels: { next: "Próximo" } } };

const later = <T,>(value: T) => new Promise<T>((resolve) => setTimeout(() => resolve(value), 10));
// React holds a fallback on screen for a while before it reveals the content.
const settle = () => act(() => new Promise((resolve) => setTimeout(resolve, 400)));

function Text() {
  return <p>{useFmaMessages("carousel", carouselEn).labels.next}</p>;
}

function InlineLoader({ load }: { load: FmaLoader }) {
  return (
    <FmaI18nProvider locale="pt-BR" locales={{ "pt-BR": () => load() }}>
      <Text />
    </FmaI18nProvider>
  );
}

let root: Root | undefined;

async function render(node: ReactNode) {
  const container = document.createElement("div");
  await act(async () => {
    root = createRoot(container);
    root.render(node);
  });
  return container;
}

afterEach(async () => {
  await act(async () => root?.unmount());
  root = undefined;
});

describe("FmaI18nProvider while a pack loads", () => {
  it("loads a loader written inline once", async () => {
    const load = vi.fn(() => later({ default: ptBR }));
    const container = await render(<InlineLoader load={load} />);
    await settle();
    expect(container.textContent).toBe("Próximo");
    expect(load).toHaveBeenCalledOnce();
  });

  it("shows its fallback, not the one above it", async () => {
    const locales = { "pt-BR": () => later({ default: ptBR }) };
    const container = await render(
      <Suspense fallback="above">
        <FmaI18nProvider locale="pt-BR" locales={locales} fallback="loading">
          <Text />
        </FmaI18nProvider>
      </Suspense>,
    );
    expect(container.textContent).toBe("loading");
    await settle();
    expect(container.textContent).toBe("Próximo");
  });

  it("catches what suspends inside it unless a closer boundary does", async () => {
    const Page = lazy(() => later({ default: Text }));
    const container = await render(
      <FmaI18nProvider fallback="loading">
        <Page />
      </FmaI18nProvider>,
    );
    expect(container.textContent).toBe("loading");
    await settle();
    expect(container.textContent).toBe("Next slide");
  });
});
