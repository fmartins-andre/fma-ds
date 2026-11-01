import { createFileRoute } from "@tanstack/react-router";
import {
  AccessibilityIcon,
  ArrowRightIcon,
  BookOpenIcon,
  BoxesIcon,
  PaletteIcon,
  TerminalIcon,
} from "lucide-react";
import { Link } from "react-aria-components";
import { useTranslation } from "react-i18next";
import { Badge } from "@/core/badge/badge";
import { LinkButton } from "@/core/button/button";
import { CodeBlock, CodeBlockCopyButton } from "@/core/code-block/code-block";
import { useItemDescription } from "../../i18n/items";
import { plainSummaryOf } from "../../site/markdown";
import {
  BLOCKS,
  COMPONENTS,
  installCommand,
  STORYBOOK_URL,
  THEME_COUNT,
} from "../../site/registry";
import { useComponentsByCategory } from "../../site/use-categories";
import { Showcase } from "../../theme-editor/showcase";

export const Route = createFileRoute("/_site/")({
  component: Home,
});

const FEATURES = [
  { icon: AccessibilityIcon, id: "accessible" },
  { icon: TerminalIcon, id: "cli" },
  { icon: PaletteIcon, id: "themeable" },
  { icon: BookOpenIcon, id: "tested" },
] as const;

function Home() {
  const { t } = useTranslation();
  const groups = useComponentsByCategory();
  const description = useItemDescription();
  return (
    <div className="mx-auto max-w-screen-2xl px-4 md:px-6">
      <section className="flex flex-col items-center gap-4 py-16 text-center md:py-24">
        <Link href="/blocks" className="outline-none">
          <Badge variant="secondary" className="gap-1">
            {t(($) => $.home.counts, {
              components: COMPONENTS.length,
              blocks: BLOCKS.length,
              themes: THEME_COUNT,
            })}
            <ArrowRightIcon />
          </Badge>
        </Link>
        <h1 className="max-w-3xl font-heading text-4xl font-semibold tracking-tight text-balance md:text-6xl">
          {t(($) => $.brand.tagline)}
        </h1>
        <p className="max-w-2xl text-lg text-balance text-muted-foreground">
          {t(($) => $.home.lead)}
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          <LinkButton href="/docs" size="lg">
            {t(($) => $.home.getStarted)}
          </LinkButton>
          <LinkButton href="/components" size="lg" variant="outline">
            {t(($) => $.home.browseComponents)}
          </LinkButton>
          <LinkButton href="/themes" size="lg" variant="ghost">
            {t(($) => $.nav.themeEditor)}
          </LinkButton>
        </div>
        <CodeBlock className="mt-4 w-full max-w-md" code={installCommand("button")} language="bash">
          <CodeBlockCopyButton alwaysVisible />
        </CodeBlock>
      </section>

      <section
        aria-label={t(($) => $.home.showcase)}
        className="rounded-2xl border bg-muted/40 p-4 md:p-6"
      >
        <Showcase />
      </section>

      <section aria-labelledby="features" className="py-16">
        <h2 id="features" className="sr-only">
          {t(($) => $.home.features)}
        </h2>
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, id }) => (
            <li key={id} className="flex flex-col gap-2">
              <span className="grid size-9 place-items-center rounded-lg border bg-card">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <h3 className="font-medium">{t(($) => $.home[id].title)}</h3>
              <p className="text-sm text-muted-foreground">{t(($) => $.home[id].text)}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="browse" className="pb-16">
        <div className="flex flex-wrap items-end justify-between gap-2 border-b pb-3">
          <h2 id="browse" className="font-heading text-2xl font-semibold tracking-tight">
            {t(($) => $.home.browse)}
          </h2>
          <div className="flex gap-2">
            <LinkButton href="/blocks" variant="outline" size="sm">
              <BoxesIcon data-icon="inline-start" />
              {t(($) => $.nav.blocks)}
            </LinkButton>
            <LinkButton
              href={STORYBOOK_URL}
              target="_blank"
              rel="noreferrer"
              variant="outline"
              size="sm"
            >
              Storybook
            </LinkButton>
          </div>
        </div>
        <div className="mt-6 grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <div key={group.category}>
              <h3 className="text-sm font-medium">{group.title}</h3>
              <ul className="mt-2 flex flex-col gap-2">
                {group.items.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={`/components/${item.name}`}
                      className="group flex flex-col outline-none"
                    >
                      <span className="text-sm group-hover:underline group-focus-visible:underline">
                        {item.title}
                      </span>
                      <span className="line-clamp-2 text-xs text-muted-foreground">
                        {plainSummaryOf(description(item))}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
