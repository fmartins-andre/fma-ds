import { createRootRoute, HeadContent, Outlet, Scripts, useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getCookie, getRequestHeader } from "@tanstack/react-start/server";
import { type ReactNode, useState } from "react";
import { RouterProvider } from "react-aria-components";
import { I18nextProvider, useTranslation } from "react-i18next";
import { loadFmaMessages, negotiateLocale, parseAcceptLanguage } from "@/lib/i18n/i18n";
import { FmaI18nextProvider } from "@/lib/i18n-i18next/i18n-i18next";
import { APP_LOCALES, createI18n, fmaLocales, LOCALE_COOKIE } from "../i18n";
import { siteText } from "../i18n/head";
import { MODE_SCRIPT } from "../site/mode";
import { THEME_SCRIPT } from "../site/theme-script";
import "../styles.css";

// The cookie is the reader's choice; without it, the browser's languages decide.
const getLocale = createServerFn({ method: "GET" }).handler(() => {
  const saved = getCookie(LOCALE_COOKIE);
  const requested = parseAcceptLanguage(getRequestHeader("accept-language"));
  return negotiateLocale(saved ? [saved, ...requested] : requested, APP_LOCALES, "en");
});

export const Route = createRootRoute({
  loader: async () => {
    const locale = await getLocale();
    await loadFmaMessages(fmaLocales, locale);
    return { locale };
  },
  // The language changes in the browser; this only reads the first request's.
  staleTime: Number.POSITIVE_INFINITY,
  head: ({ loaderData }) => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "fma-ds" },
      {
        name: "description",
        content: siteText([{ loaderData }])(($) => $.brand.description),
      },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFound,
});

function NotFound() {
  const { t } = useTranslation();
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-background p-6 text-center text-foreground">
      <p className="font-mono text-sm text-muted-foreground">404</p>
      <h1 className="font-heading text-2xl font-semibold">{t(($) => $.notFound.title)}</h1>
      <a href="/" className="text-sm underline underline-offset-4">
        {t(($) => $.notFound.back)}
      </a>
    </main>
  );
}

// Static files served next to the app (Storybook build, registry JSON) and
// other sites: plain links, not router locations — the router would rewrite
// them (an absolute URL loses its origin) and handle them.
const isPlainLink = (href: string) =>
  /^\/(storybook|r)(\/|\?|$)/.test(href) || /^([a-z][a-z\d+.-]*:|\/\/)/i.test(href);

function RootComponent() {
  const router = useRouter();
  const { locale } = Route.useLoaderData();
  const [i18n] = useState(() => createI18n(locale));
  return (
    <RootDocument locale={locale}>
      <I18nextProvider i18n={i18n}>
        <FmaI18nextProvider locales={fmaLocales}>
          {/* react-aria links (LinkButton, menus, Link) navigate through TanStack Router. */}
          <RouterProvider
            navigate={(href) => {
              if (isPlainLink(href)) window.location.assign(href);
              else void router.navigate({ href });
            }}
            useHref={(href) =>
              isPlainLink(href) ? href : router.buildLocation({ href } as never).href
            }
          >
            <Outlet />
          </RouterProvider>
        </FmaI18nextProvider>
      </I18nextProvider>
    </RootDocument>
  );
}

function RootDocument({ children, locale }: Readonly<{ children: ReactNode; locale: string }>) {
  return (
    // The mode script adds `dark` before hydration.
    <html lang={locale} suppressHydrationWarning>
      <head>
        <HeadContent />
        <script dangerouslySetInnerHTML={{ __html: MODE_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
