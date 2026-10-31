import { createFileRoute, notFound } from "@tanstack/react-router";
import { ItemPage } from "../../../site/item-page";
import { plainSummaryOf } from "../../../site/markdown";
import { getItem } from "../../../site/registry";

export const Route = createFileRoute("/_site/_docs/components/$name")({
  loader: ({ params }) => {
    const item = getItem("components", params.name);
    if (!item) throw notFound();
    return item;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} · fma-ds` },
          { name: "description", content: plainSummaryOf(loaderData.description) },
        ]
      : [],
  }),
  component: ComponentPage,
});

function ComponentPage() {
  const item = Route.useLoaderData();
  return <ItemPage key={item.name} kind="components" item={item} />;
}
