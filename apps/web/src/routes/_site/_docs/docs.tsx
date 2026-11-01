import { createFileRoute } from "@tanstack/react-router";
import { Trans, useTranslation } from "react-i18next";
import { LinkButton } from "@/core/button/button";
import {
  CodeBlock,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockTitle,
} from "@/core/code-block/code-block";
import { siteText } from "../../../i18n/head";
import {
  BLOCKS,
  COMPONENTS,
  installCommand,
  LLMS_FULL_TXT_URL,
  LLMS_TXT_URL,
  REGISTRIES_SNIPPET,
  REGISTRY_INDEX_URL,
  REPO_URL,
  STORYBOOK_URL,
  THEME_COUNT,
} from "../../../site/registry";

export const Route = createFileRoute("/_site/_docs/docs")({
  head: ({ matches }) => ({
    meta: [{ title: `${siteText(matches)(($) => $.nav.introduction)} · fma-ds` }],
  }),
  component: DocsIntroduction,
});

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

function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-4 leading-7 text-foreground/90">{children}</p>;
}

function C({ children }: { children?: React.ReactNode }) {
  return (
    <code className="rounded-sm bg-muted px-1 py-0.5 font-mono text-[0.85em]">{children}</code>
  );
}

const link = (href: string, className = "font-medium underline underline-offset-4") => (
  // biome-ignore lint/a11y/useAnchorContent: Trans fills it.
  <a href={href} className={className} />
);

function DocsIntroduction() {
  const { t } = useTranslation();
  const c = { c: <C /> };
  return (
    <article className="max-w-3xl pb-12">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">
        {t(($) => $.nav.introduction)}
      </h1>
      <p className="mt-2 text-base text-muted-foreground">
        {t(($) => $.docs.lead, {
          components: COMPONENTS.length,
          blocks: BLOCKS.length,
          themes: THEME_COUNT,
        })}
      </p>

      <P>
        <Trans t={t} i18nKey={($) => $.docs.intro} components={c} />
      </P>

      <H2 id="installation">{t(($) => $.docs.installation)}</H2>
      <P>
        <Trans
          t={t}
          i18nKey={($) => $.docs.start}
          components={{ ...c, compat: link("/docs/compatibility") }}
        />
      </P>
      <CodeBlock className="mt-4" code={REGISTRIES_SNIPPET} language="json">
        <CodeBlockHeader>
          <CodeBlockTitle>components.json</CodeBlockTitle>
          <CodeBlockCopyButton className="ml-auto" />
        </CodeBlockHeader>
      </CodeBlock>
      <P>{t(($) => $.docs.add)}</P>
      <CodeBlock className="mt-4" code={installCommand("button")} language="bash">
        <CodeBlockCopyButton alwaysVisible />
      </CodeBlock>
      <P>{t(($) => $.docs.deps)}</P>
      <P>
        <Trans
          t={t}
          i18nKey={($) => $.docs.index}
          values={{ url: REGISTRY_INDEX_URL }}
          components={{ ...c, index: link(REGISTRY_INDEX_URL) }}
        />
      </P>
      <P>
        <Trans
          t={t}
          i18nKey={($) => $.docs.llms}
          components={{
            ...c,
            llms: link(LLMS_TXT_URL),
            full: link(LLMS_FULL_TXT_URL),
            org: link("https://llmstxt.org", "underline underline-offset-4"),
          }}
        />
      </P>

      <H2 id="react-aria">{t(($) => $.docs.aria)}</H2>
      <P>
        <Trans
          t={t}
          i18nKey={($) => $.docs.ariaText}
          components={{ ...c, routing: link("/docs/routing") }}
        />
      </P>

      <H2 id="themes">{t(($) => $.docs.themes)}</H2>
      <P>
        <Trans
          t={t}
          i18nKey={($) => $.docs.themesText}
          values={{ name: "<name>" }}
          components={{ ...c, dark: link("/docs/dark-mode") }}
        />
      </P>
      <div className="mt-4">
        <LinkButton href="/themes" variant="outline">
          {t(($) => $.docs.openEditor)}
        </LinkButton>
      </div>

      <H2 id="storybook">{t(($) => $.docs.storybook)}</H2>
      <P>{t(($) => $.docs.storybookText)}</P>
      <div className="mt-4">
        <LinkButton href={STORYBOOK_URL} target="_blank" rel="noreferrer" variant="outline">
          {t(($) => $.docs.openStorybook)}
        </LinkButton>
      </div>

      <H2 id="license">{t(($) => $.docs.license)}</H2>
      <P>
        <Trans
          t={t}
          i18nKey={($) => $.docs.licenseText}
          components={{
            code: <code className="font-mono text-sm" />,
            notices: link(`${REPO_URL}/blob/main/THIRD_PARTY_NOTICES.md`),
          }}
        />
      </P>
    </article>
  );
}
