import { ArrowLeftIcon, ArrowRightIcon, ArrowUpRightIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-aria-components";
import { Trans, useTranslation } from "react-i18next";
import { Badge } from "@/core/badge/badge";
import { LinkButton } from "@/core/button/button";
import {
  CodeBlock,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockTitle,
} from "@/core/code-block/code-block";
import { Skeleton } from "@/core/skeleton/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/core/tabs/tabs";
import { useItemDescription, useStoryDescription, useStoryName } from "../i18n/items";
import { detailsOf, InlineMarkdown, Markdown, summaryOf } from "./markdown";
import {
  type ItemKind,
  installCommand,
  neighbors,
  packageName,
  REGISTRIES_SNIPPET,
  REPO_URL,
  type RegistryItem,
  registryDependencyLink,
  STORYBOOK_URL,
} from "./registry";
import { type DocStories, loadSource, loadStories } from "./stories";
import { StoryPreview } from "./story-preview";
import { useCategoryTitle } from "./use-categories";

function slug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function exampleId(exportName: string) {
  return `example-${slug(exportName)}`;
}

/** A story's code minus its component's name, which every story has its own of. */
function codeKey(code: string) {
  return code.replace(/^export function \w+/m, "export function");
}

function useStories(kind: ItemKind, name: string) {
  const [state, setState] = useState<{ name: string; stories: DocStories | null } | null>(null);
  useEffect(() => {
    let active = true;
    void loadStories(kind, name).then((stories) => active && setState({ name, stories }));
    return () => {
      active = false;
    };
  }, [kind, name]);
  return state?.name === name ? state : null;
}

function useSources(item: RegistryItem) {
  const [sources, setSources] = useState<{ name: string; files: string[] } | null>(null);
  useEffect(() => {
    let active = true;
    void Promise.all(item.files.map((file) => loadSource(file.path).catch(() => ""))).then(
      (files) => active && setSources({ name: item.name, files }),
    );
    return () => {
      active = false;
    };
  }, [item]);
  return sources?.name === item.name ? sources.files : null;
}

function H2({ id, children }: { id: string; children: string }) {
  return (
    <h2
      id={id}
      className="mt-12 scroll-m-20 border-b pb-2 font-heading text-xl font-semibold tracking-tight"
    >
      {children}
    </h2>
  );
}

function Step({
  index,
  title,
  children,
}: {
  index: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="relative flex flex-col gap-3 border-l pb-8 pl-8 last:pb-0">
      <span className="absolute -left-3.5 grid size-7 place-items-center rounded-full border bg-background font-mono text-xs font-medium">
        {index}
      </span>
      <h3 className="font-medium leading-7">{title}</h3>
      {children}
    </li>
  );
}

function Installation({ item }: { item: RegistryItem }) {
  const { t } = useTranslation();
  const sources = useSources(item);
  const npm = (item.dependencies ?? []).map(packageName);
  const registryDeps = item.registryDependencies ?? [];
  let step = 0;
  return (
    <Tabs defaultSelectedKey="cli" className="mt-4 gap-4">
      <TabsList variant="line" aria-label={t(($) => $.item.method)}>
        <TabsTrigger id="cli">CLI</TabsTrigger>
        <TabsTrigger id="manual">{t(($) => $.item.manual)}</TabsTrigger>
      </TabsList>
      <TabsContent id="cli">
        <ol className="ml-3.5">
          <Step index={1} title={t(($) => $.item.registerNamespace)}>
            <CodeBlock code={REGISTRIES_SNIPPET} language="json">
              <CodeBlockHeader>
                <CodeBlockTitle>components.json</CodeBlockTitle>
                <CodeBlockCopyButton className="ml-auto" />
              </CodeBlockHeader>
            </CodeBlock>
          </Step>
          <Step index={2} title={t(($) => $.item.addItem)}>
            <CodeBlock code={installCommand(item.name)} language="bash">
              <CodeBlockCopyButton alwaysVisible />
            </CodeBlock>
            <p className="text-sm text-muted-foreground">
              <Trans
                t={t}
                i18nKey={($) => (item.files.length > 1 ? $.item.filesLandMore : $.item.filesLand)}
                values={{ target: item.files[0]?.target, count: item.files.length - 1 }}
                components={{ code: <code className="font-mono" /> }}
              />
            </p>
          </Step>
        </ol>
      </TabsContent>
      <TabsContent id="manual">
        <ol className="ml-3.5">
          {npm.length > 0 && (
            <Step index={++step} title={t(($) => $.item.installNpm)}>
              <CodeBlock code={`pnpm add ${npm.join(" ")}`} language="bash">
                <CodeBlockCopyButton alwaysVisible />
              </CodeBlock>
            </Step>
          )}
          {registryDeps.length > 0 && (
            <Step index={++step} title={t(($) => $.item.addRegistry)}>
              <ul className="flex flex-wrap gap-2">
                {registryDeps.map((dependency) => {
                  const link = registryDependencyLink(dependency);
                  return (
                    <li key={dependency}>
                      {link ? (
                        <Link href={`/${link.kind}/${link.name}`}>
                          <Badge variant="outline">{dependency}</Badge>
                        </Link>
                      ) : (
                        <Badge variant="outline">{dependency}</Badge>
                      )}
                    </li>
                  );
                })}
              </ul>
            </Step>
          )}
          <Step index={++step} title={t(($) => $.item.copySource)}>
            {item.files.map((file, index) =>
              sources ? (
                <CodeBlock
                  key={file.path}
                  code={sources[index] ?? ""}
                  language={file.path.endsWith(".tsx") ? "tsx" : "ts"}
                  showLineNumbers
                >
                  <CodeBlockHeader>
                    <CodeBlockTitle>{file.target}</CodeBlockTitle>
                    <CodeBlockCopyButton className="ml-auto" />
                  </CodeBlockHeader>
                  <div className="max-h-[480px] overflow-auto rounded-b-[inherit]">
                    <CodeBlockContent />
                  </div>
                </CodeBlock>
              ) : (
                <Skeleton key={file.path} className="h-48 w-full rounded-xl" />
              ),
            )}
          </Step>
          <Step index={++step} title={t(($) => $.item.updateImports)}>
            <p className="text-sm text-muted-foreground">
              <Trans
                t={t}
                i18nKey={($) => $.item.importsNote}
                values={{ name: "<name>" }}
                components={{ code: <code className="font-mono" /> }}
              />
            </p>
          </Step>
        </ol>
      </TabsContent>
    </Tabs>
  );
}

function Pager({ kind, name }: { kind: ItemKind; name: string }) {
  const { t } = useTranslation();
  const { previous, next } = neighbors(kind, name);
  return (
    <nav
      aria-label={t(($) => $.item.pager)}
      className="mt-16 flex items-center justify-between gap-4"
    >
      {previous ? (
        <LinkButton href={`/${kind}/${previous.name}`}>
          <ArrowLeftIcon data-icon="inline-start" />
          {previous.title}
        </LinkButton>
      ) : (
        <span />
      )}
      {next && (
        <LinkButton href={`/${kind}/${next.name}`}>
          {next.title}
          <ArrowRightIcon data-icon="inline-end" />
        </LinkButton>
      )}
    </nav>
  );
}

type TocEntry = { title: string; id: string; children?: TocEntry[] };

function Toc({ entries }: { entries: TocEntry[] }) {
  const { t } = useTranslation();
  return (
    <aside className="sticky top-20 hidden h-[calc(100dvh-6rem)] w-56 shrink-0 overflow-y-auto pb-8 xl:block">
      <p className="mb-2 text-sm font-medium">{t(($) => $.item.onThisPage)}</p>
      <ul className="flex flex-col gap-1.5 text-sm">
        {entries.map((entry) => (
          <li key={entry.id}>
            <a href={`#${entry.id}`} className="text-muted-foreground hover:text-foreground">
              {entry.title}
            </a>
            {entry.children && (
              <ul className="mt-1.5 flex flex-col gap-1.5 border-s ps-3">
                {entry.children.map((child) => (
                  <li key={child.id}>
                    <a
                      href={`#${child.id}`}
                      className="block text-[0.8125rem] leading-snug text-muted-foreground hover:text-foreground"
                    >
                      {child.title}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </aside>
  );
}

export function ItemPage({ kind, item }: { kind: ItemKind; item: RegistryItem }) {
  const { t } = useTranslation();
  const category = useCategoryTitle();
  const description = useItemDescription()(item);
  const storyDescription = useStoryDescription();
  const storyName = useStoryName();
  const loaded = useStories(kind, item.name);
  const stories = loaded?.stories?.stories ?? [];
  const [first, ...rest] = stories;
  // Stories that only exist for an interaction test often render the same code
  // as an earlier one; an example shows something new.
  const shown = new Set(first ? [codeKey(first.code)] : []);
  const examples = rest.filter((story) => {
    const key = codeKey(story.code);
    if (!story.isExample || shown.has(key)) return false;
    shown.add(key);
    return true;
  });
  const details = detailsOf(description);
  const toc: TocEntry[] = [
    ...(details ? [{ title: t(($) => $.item.overview), id: "overview" }] : []),
    { title: t(($) => $.item.installation), id: "installation" },
    ...(examples.length
      ? [
          {
            title: t(($) => $.item.examples),
            id: "examples",
            children: examples.map((story) => ({
              title: storyName(story.name),
              id: exampleId(story.exportName),
            })),
          },
        ]
      : []),
    { title: t(($) => $.item.dependencies), id: "dependencies" },
  ];

  return (
    <div className="flex gap-10">
      <article className="min-w-0 flex-1 pb-12">
        <nav
          aria-label={t(($) => $.item.breadcrumb)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground"
        >
          <Link href="/docs" className="hover:text-foreground">
            {t(($) => $.nav.docs)}
          </Link>
          <span aria-hidden="true">/</span>
          <Link href={`/${kind}`} className="hover:text-foreground">
            {t(($) => $.nav[kind])}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-foreground">{item.title}</span>
        </nav>
        <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight">{item.title}</h1>
        <p className="mt-2 text-base text-pretty text-muted-foreground">
          <InlineMarkdown text={summaryOf(description)} />
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {item.categories?.[0] && kind === "components" && (
            <Badge variant="secondary">{category(item.categories[0])}</Badge>
          )}
          <Badge variant="outline">{item.meta.source}</Badge>
          <Badge variant="outline">{item.meta.license}</Badge>
          {item.meta.status !== "stable" && (
            <Badge variant="warning-light">{item.meta.status}</Badge>
          )}
          <span className="flex-1" />
          <LinkButton
            href={`${REPO_URL}/commits/main/packages/ds/src/${kind === "blocks" ? "blocks" : "core"}/${item.name}`}
            target="_blank"
            rel="noreferrer"
            variant="outline"
            size="sm"
          >
            {t(($) => $.item.changelog)}
            <ArrowUpRightIcon data-icon="inline-end" />
          </LinkButton>
          {loaded?.stories && (
            <LinkButton
              href={`${STORYBOOK_URL}?path=/docs/${loaded.stories.docsId}`}
              target="_blank"
              rel="noreferrer"
              variant="outline"
              size="sm"
            >
              Storybook
              <ArrowUpRightIcon data-icon="inline-end" />
            </LinkButton>
          )}
          <LinkButton href={`/r/${item.name}.json`} target="_blank" variant="outline" size="sm">
            Registry JSON
            <ArrowUpRightIcon data-icon="inline-end" />
          </LinkButton>
        </div>

        <div className="mt-8">
          {!loaded ? (
            <Skeleton className="h-[400px] w-full rounded-xl" />
          ) : first ? (
            <StoryPreview kind={kind} name={item.name} story={first} />
          ) : (
            <p className="text-sm text-muted-foreground">{t(($) => $.item.noPreview)}</p>
          )}
        </div>

        {details && (
          <>
            <H2 id="overview">{t(($) => $.item.overview)}</H2>
            <Markdown text={details} className="mt-4 leading-7 text-muted-foreground" />
          </>
        )}

        <H2 id="installation">{t(($) => $.item.installation)}</H2>
        <Installation item={item} />

        {examples.length > 0 && (
          <>
            <H2 id="examples">{t(($) => $.item.examples)}</H2>
            {examples.map((story) => (
              <section key={story.exportName} className="mt-8">
                <h3
                  id={exampleId(story.exportName)}
                  className="scroll-m-20 font-heading text-lg font-semibold tracking-tight"
                >
                  {storyName(story.name)}
                </h3>
                {story.description && (
                  <Markdown
                    text={storyDescription(story.description)}
                    className="mt-2 text-sm leading-6 text-muted-foreground"
                  />
                )}
                <StoryPreview kind={kind} name={item.name} story={story} className="mt-4" />
              </section>
            ))}
          </>
        )}

        <H2 id="dependencies">{t(($) => $.item.dependencies)}</H2>
        <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-medium">npm</dt>
            <dd className="mt-2 flex flex-wrap gap-1.5">
              {(item.dependencies ?? []).length === 0 && (
                <span className="text-muted-foreground">{t(($) => $.item.none)}</span>
              )}
              {(item.dependencies ?? []).map((dependency) => (
                <Badge key={dependency} variant="secondary" className="font-mono">
                  {dependency}
                </Badge>
              ))}
            </dd>
          </div>
          <div>
            <dt className="font-medium">{t(($) => $.item.registry)}</dt>
            <dd className="mt-2 flex flex-wrap gap-1.5">
              {(item.registryDependencies ?? []).length === 0 && (
                <span className="text-muted-foreground">{t(($) => $.item.none)}</span>
              )}
              {(item.registryDependencies ?? []).map((dependency) => {
                const link = registryDependencyLink(dependency);
                return link ? (
                  <Link key={dependency} href={`/${link.kind}/${link.name}`}>
                    <Badge variant="outline" className="font-mono hover:bg-accent">
                      {dependency}
                    </Badge>
                  </Link>
                ) : (
                  <Badge key={dependency} variant="outline" className="font-mono">
                    {dependency}
                  </Badge>
                );
              })}
            </dd>
          </div>
        </dl>

        <Pager kind={kind} name={item.name} />
      </article>
      <Toc entries={toc} />
    </div>
  );
}
