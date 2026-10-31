import { createFileRoute, notFound } from "@tanstack/react-router";
import { GuidePage, getGuide } from "../../../site/guide";
import { plainSummaryOf } from "../../../site/markdown";

export const Route = createFileRoute("/_site/_docs/docs_/$slug")({
  loader: ({ params }) => {
    const guide = getGuide(params.slug);
    if (!guide) throw notFound();
    return guide;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} · fma-ds` },
          { name: "description", content: plainSummaryOf(loaderData.text) },
        ]
      : [],
  }),
  component: GuideRoute,
});

function GuideRoute() {
  const guide = Route.useLoaderData();
  return <GuidePage key={guide.slug} title={guide.title} text={guide.text} />;
}
