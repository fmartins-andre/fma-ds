import { createFileRoute } from "@tanstack/react-router";
import { ArrowRightIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { LinkButton } from "@/core/button/button";
import { Skeleton } from "@/core/skeleton/skeleton";
import { siteText } from "../../../i18n/head";
import { useItemDescription } from "../../../i18n/items";
import { InlineMarkdown, summaryOf } from "../../../site/markdown";
import { BLOCKS, type RegistryItem } from "../../../site/registry";
import { loadStories } from "../../../site/stories";
import { previewPath } from "../../../site/story-preview";

export const Route = createFileRoute("/_site/_docs/blocks/")({
  head: ({ matches }) => ({
    meta: [{ title: `${siteText(matches)(($) => $.nav.blocks)} · fma-ds` }],
  }),
  component: BlocksIndex,
});

function BlockCard({ item }: { item: RegistryItem }) {
  const { t } = useTranslation();
  const description = useItemDescription();
  const [story, setStory] = useState<string | null>(null);
  useEffect(() => {
    void loadStories("blocks", item.name).then((stories) =>
      setStory(stories?.stories[0]?.exportName ?? null),
    );
  }, [item.name]);
  return (
    <section aria-labelledby={`block-${item.name}`} className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div className="max-w-3xl">
          <h2
            id={`block-${item.name}`}
            className="font-heading text-xl font-semibold tracking-tight"
          >
            {item.title}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            <InlineMarkdown text={summaryOf(description(item))} />
          </p>
        </div>
        <LinkButton href={`/blocks/${item.name}`} variant="outline" size="sm">
          {t(($) => $.lists.viewBlock)}
          <ArrowRightIcon data-icon="inline-end" />
        </LinkButton>
      </div>
      {story ? (
        <iframe
          title={t(($) => $.lists.preview, { title: item.title })}
          src={previewPath("blocks", item.name, story)}
          className="h-[560px] w-full rounded-xl border bg-background"
          loading="lazy"
        />
      ) : (
        <Skeleton className="h-[560px] w-full rounded-xl" />
      )}
    </section>
  );
}

function BlocksIndex() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-12 pb-12">
      <div>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          {t(($) => $.nav.blocks)}
        </h1>
        <p className="mt-2 max-w-2xl text-base text-muted-foreground">
          <Trans
            t={t}
            i18nKey={($) => $.lists.blocksLead}
            values={{ block: "<block>" }}
            components={{ code: <code className="font-mono text-sm" /> }}
          />
        </p>
      </div>
      {BLOCKS.map((item) => (
        <BlockCard key={item.name} item={item} />
      ))}
    </div>
  );
}
