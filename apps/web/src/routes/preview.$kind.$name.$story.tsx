import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { siteText } from "../i18n/head";
import { useMode } from "../site/mode";
import { getItem, type ItemKind } from "../site/registry";
import { type DocStory, loadStories } from "../site/stories";
import { useThemeState } from "../site/theme";

// A bare page with one story, for the docs' iframes (blocks, fullscreen stories).
export const Route = createFileRoute("/preview/$kind/$name/$story")({
  ssr: false,
  loader: ({ params }) => {
    const kind = params.kind as ItemKind;
    if ((kind !== "components" && kind !== "blocks") || !getItem(kind, params.name)) {
      throw notFound();
    }
    return { kind };
  },
  head: ({ matches }) => ({
    meta: [{ title: `${siteText(matches)(($) => $.story.preview)} · fma-ds` }],
  }),
  component: PreviewPage,
});

function PreviewPage() {
  const { t } = useTranslation();
  const { name, story: exportName } = Route.useParams();
  const { kind } = Route.useLoaderData();
  const [story, setStory] = useState<DocStory | null | undefined>(undefined);
  useMode();
  useThemeState();

  useEffect(() => {
    void loadStories(kind, name).then((stories) =>
      setStory(stories?.stories.find((s) => s.exportName === exportName) ?? null),
    );
  }, [kind, name, exportName]);

  if (story === undefined) return null;
  if (story === null) return <p className="p-6 text-sm">{t(($) => $.story.notFound)}</p>;
  const { Component } = story;
  return (
    <div
      className={cn(
        "min-h-dvh bg-background text-foreground",
        story.layout === "centered" && "flex items-center justify-center p-6",
        story.layout === "padded" && "p-6",
      )}
    >
      <Component />
    </div>
  );
}
