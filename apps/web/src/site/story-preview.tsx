import { ArrowUpRightIcon } from "lucide-react";
import { Component, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  CodeBlock,
  CodeBlockCopyButton,
  CodeBlockExpandButton,
  CodeBlockHeader,
  CodeBlockTitle,
} from "@/core/code-block/code-block";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/core/tabs/tabs";
import { cn } from "@/lib/utils";
import type { ItemKind } from "./registry";
import { STORYBOOK_URL } from "./registry";
import type { DocStory } from "./stories";

function PreviewError({ message }: { message: string }) {
  const { t } = useTranslation();
  return <p className="text-sm text-destructive">{t(($) => $.story.failed, { message })}</p>;
}

class PreviewBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return <PreviewError message={this.state.error.message} />;
    }
    return this.props.children;
  }
}

export function previewPath(kind: ItemKind, name: string, story: string) {
  return `/preview/${kind}/${name}/${story}`;
}

export function storybookStoryUrl(id: string) {
  return `${STORYBOOK_URL}?path=/story/${id}`;
}

/** The example's file, named after its component: `ButtonDemo` → `button-demo.tsx`. */
export function snippetFileName(code: string) {
  const name = code.match(/^export function (\w+)/m)?.[1] ?? "example";
  return `${name.replace(/(?<=[a-z0-9])(?=[A-Z])/g, "-").toLowerCase()}.tsx`;
}

/** Longer examples start collapsed to this many lines, behind "Show more". */
const COLLAPSED_LINES = 24;

/**
 * One story, as shadcn's docs show an example: the live preview, and in a
 * second tab its code as a component to paste into a project. Fullscreen stories (app shells, toasters) get an iframe, so
 * their fixed positioning stays inside the frame instead of over the page.
 */
export function StoryPreview({
  kind,
  name,
  story,
  className,
}: {
  kind: ItemKind;
  name: string;
  story: DocStory;
  className?: string;
}) {
  const { t } = useTranslation();
  const framed = kind === "blocks" || story.layout === "fullscreen";
  const { Component: Story } = story;
  return (
    <Tabs className={cn("gap-3", className)} defaultSelectedKey="preview">
      <div className="flex items-center justify-between gap-2">
        <TabsList variant="line" aria-label={t(($) => $.story.example, { name: story.name })}>
          <TabsTrigger id="preview">{t(($) => $.story.preview)}</TabsTrigger>
          <TabsTrigger id="code">{t(($) => $.story.code)}</TabsTrigger>
        </TabsList>
        <a
          href={framed ? previewPath(kind, name, story.exportName) : storybookStoryUrl(story.id)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          {t(($) => (framed ? $.story.newTab : $.story.openStorybook))}
          <ArrowUpRightIcon className="size-3" aria-hidden="true" />
        </a>
      </div>
      <TabsContent id="preview">
        {framed ? (
          <iframe
            title={t(($) => $.lists.preview, { title: story.name })}
            src={previewPath(kind, name, story.exportName)}
            className="h-[640px] w-full rounded-xl border bg-background"
            loading="lazy"
          />
        ) : (
          <div
            data-slot="story-preview"
            className={cn(
              "flex min-h-[350px] w-full overflow-x-auto rounded-xl border bg-background p-6 md:p-10",
              story.layout === "centered" && "items-center justify-center",
            )}
          >
            <div className={cn(story.layout === "centered" ? "max-w-full" : "w-full")}>
              <PreviewBoundary>
                <Story />
              </PreviewBoundary>
            </div>
          </div>
        )}
      </TabsContent>
      <TabsContent id="code">
        <CodeBlock code={story.code} language="tsx" maxLines={COLLAPSED_LINES}>
          <CodeBlockHeader>
            <CodeBlockTitle>{snippetFileName(story.code)}</CodeBlockTitle>
            <CodeBlockCopyButton className="ml-auto" />
          </CodeBlockHeader>
          <CodeBlockExpandButton />
        </CodeBlock>
      </TabsContent>
    </Tabs>
  );
}
