import { createFileRoute, notFound } from "@tanstack/react-router";
import { localeOf, siteText } from "../../../i18n/head";
import { GuidePage, getGuide } from "../../../site/guide";
import { plainSummaryOf } from "../../../site/markdown";

export const Route = createFileRoute("/_site/_docs/docs_/$slug")({
  loader: ({ params }) => {
    const guide = getGuide(params.slug);
    if (!guide) throw notFound();
    return guide;
  },
  head: ({ loaderData, matches }) => {
    const guide = loaderData && getGuide(loaderData.slug, localeOf(matches));
    if (!guide) return { meta: [] };
    const title = siteText(matches)(($) => $.guides[guide.slug as keyof typeof $.guides], {
      defaultValue: guide.title,
    });
    return {
      meta: [
        { title: `${title} · fma-ds` },
        { name: "description", content: plainSummaryOf(guide.text) },
      ],
    };
  },
  component: GuideRoute,
});

function GuideRoute() {
  const guide = Route.useLoaderData();
  return <GuidePage key={guide.slug} slug={guide.slug} />;
}
