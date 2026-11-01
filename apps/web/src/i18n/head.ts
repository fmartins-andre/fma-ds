import { plainSummaryOf } from "../site/markdown";
import { createI18n } from ".";
import { itemDescription } from "./items";

// Only reads: getFixedT never changes this instance's language.
const texts = createI18n("en");

type Matches = readonly { loaderData?: unknown }[];

/** The language the root route's loader chose: head functions run outside React. */
export function localeOf(matches: Matches) {
  return (matches[0]?.loaderData as { locale?: string } | undefined)?.locale ?? "en";
}

export function siteText(matches: Matches) {
  return texts.getFixedT(localeOf(matches), "site");
}

export function itemMeta(
  matches: Matches,
  item: { name: string; title: string; description: string },
) {
  return [
    { title: `${item.title} · fma-ds` },
    {
      name: "description",
      content: plainSummaryOf(itemDescription(localeOf(matches), item)),
    },
  ];
}
