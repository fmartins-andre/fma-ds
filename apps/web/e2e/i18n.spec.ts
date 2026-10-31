import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";

async function open(page: Page, path: string) {
  await page.goto(path, { waitUntil: "networkidle" });
}

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

test("placeholders in translated markup stay as text", async ({ page }) => {
  await open(page, "/blocks");
  await expect(page.getByRole("main").getByText("components/fma-ds/<block>/")).toBeVisible();
});

test.describe("English browser", () => {
  test.use({ locale: "en-US" });

  test("stays in English, and the selector loads the pack on demand", async ({ page }) => {
    await open(page, "/components/carousel");
    await expect(page.getByRole("button", { name: "Next slide" }).first()).toBeVisible();

    await page.getByRole("button", { name: /Language/ }).click();
    await page.getByRole("option", { name: "Português" }).click();

    await expect(page.getByRole("button", { name: "Próximo slide" }).first()).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
  });
});
