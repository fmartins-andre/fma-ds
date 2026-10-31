import { createFileRoute } from "@tanstack/react-router";
import { siteText } from "../../i18n/head";
import { ThemeEditor } from "../../theme-editor/editor";

export const Route = createFileRoute("/_site/themes")({
  // A purely client-side tool: it reads localStorage and styles <html>.
  ssr: false,
  validateSearch: (search: Record<string, unknown>): { preset?: string } =>
    typeof search.preset === "string" ? { preset: search.preset } : {},
  head: ({ matches }) => ({
    meta: [{ title: `${siteText(matches)(($) => $.nav.themes)} · fma-ds` }],
  }),
  component: ThemesPage,
});

function ThemesPage() {
  const { preset } = Route.useSearch();
  return <ThemeEditor preset={preset} />;
}
