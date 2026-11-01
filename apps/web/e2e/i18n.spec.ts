import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";

async function open(page: Page, path: string) {
  await page.goto(path, { waitUntil: "networkidle" });
}

/** Pages full of story iframes: the network takes too long to go idle, so wait for the content. */
const visit = (page: Page, path: string) => page.goto(path, { waitUntil: "domcontentloaded" });

const nav = (page: Page, name: string) => page.getByRole("navigation", { name });

test.describe("Portuguese browser", () => {
  test.use({ locale: "pt-BR" });

  test("the server renders Portuguese and hydrates it", async ({ page, request }) => {
    const html = await (await request.get("/", { headers: { "accept-language": "pt-BR" } })).text();
    expect(html).toContain('<html lang="pt-BR"');
    expect(html).toContain("Documentação");

    await open(page, "/");
    await expect(nav(page, "Principal").getByRole("link", { name: "Temas" })).toBeVisible();
  });

  test("the selector switches the site and the items, and a reload keeps it", async ({ page }) => {
    await open(page, "/components/carousel");
    await expect(page.getByRole("link", { name: "Documentação" }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Próximo slide" }).first()).toBeVisible();

    await page.getByRole("button", { name: /Idioma/ }).click();
    await page.getByRole("option", { name: "English" }).click();

    await expect(page.getByRole("navigation", { name: "Main" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Next slide" }).first()).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");

    await page.reload({ waitUntil: "networkidle" });
    await expect(page.getByRole("navigation", { name: "Main" })).toBeVisible();
  });

  test("the theme editor is in Portuguese", async ({ page }) => {
    await open(page, "/themes");
    await expect(page.getByRole("heading", { level: 1, name: "Temas" })).toBeAttached();
    await expect(page.getByRole("tab", { name: "Cores" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Primária" })).toBeVisible();
    await page.getByRole("button", { name: "Exportar" }).click();
    await expect(page.getByRole("dialog", { name: "Exportar tema" })).toBeVisible();
  });
});

test.describe("Portuguese content", () => {
  test.use({ locale: "pt-BR" });

  test("guides, the introduction and page titles follow the language", async ({ page }) => {
    await open(page, "/docs/routing");
    await expect(page.getByRole("heading", { level: 1, name: "Roteamento" })).toBeVisible();
    await expect(page).toHaveTitle("Roteamento · fma-ds");

    await open(page, "/docs");
    await expect(page.getByRole("heading", { name: "Feito sobre React Aria" })).toBeVisible();

    await page.getByRole("button", { name: /Idioma/ }).click();
    await page.getByRole("option", { name: "English" }).click();
    await expect(page.getByRole("heading", { name: "Built on React Aria" })).toBeVisible();
    await expect(page).toHaveTitle("Introduction · fma-ds");
  });

  test("item pages show translated descriptions", async ({ page }) => {
    await open(page, "/components/badge");
    const main = page.getByRole("main");
    await expect(main.getByText("Um rótulo pequeno para status").first()).toBeVisible();
    await expect(main.getByText("Status neutro: inativo")).toBeVisible();
    await expect(page).toHaveTitle("Badge · fma-ds");
  });

  test("stories follow the site's language", async ({ page }) => {
    await open(page, "/components/calendar");
    await expect(
      page.getByRole("main").getByRole("button", { name: "Anterior" }).first(),
    ).toBeVisible();

    await visit(page, "/blocks/event-calendar");
    const frame = page.frameLocator('iframe[title^="Prévia"]').first();
    await expect(frame.getByText(/de março de 2026/).first()).toBeVisible({ timeout: 20_000 });
  });

  test("the theme editor's demos are in Portuguese", async ({ page }) => {
    await open(page, "/themes");
    await expect(page.getByText("Crie uma conta")).toBeVisible();
    await page.getByRole("tab", { name: "Tipografia" }).last().click();
    await expect(page.getByRole("heading", { name: "Sem serifa" })).toBeVisible();
  });
});

test("placeholders in translated markup stay as text", async ({ page }) => {
  await visit(page, "/blocks");
  await expect(page.getByRole("main").getByText("components/fma-ds/<block>/")).toBeVisible();
});

test.describe("English browser", () => {
  test.use({ locale: "en-US" });

  test("stays in English, and the selector loads the pack on demand", async ({ page }) => {
    await open(page, "/components/carousel");
    await expect(page.getByRole("button", { name: "Next slide" }).first()).toBeVisible();

    const selector = page.getByRole("button", { name: /Language/ });
    await expect(selector).not.toContainText("English");
    await selector.click();
    await expect(page.getByRole("option", { name: "English" })).toContainText("English");
    await page.getByRole("option", { name: "Português" }).click();

    await expect(page.getByRole("button", { name: "Próximo slide" }).first()).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
  });
});
