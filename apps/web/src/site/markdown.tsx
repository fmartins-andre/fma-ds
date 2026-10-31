import { Fragment } from "react";
import { cn } from "@/lib/utils";

// Registry and story descriptions are a small markdown subset (the same text
// Storybook renders as markdown): paragraphs split by blank lines, "- " lists
// (an indented line continues the item above), "### " headings, and inline
// `code`, **bold** and *emphasis*. The first paragraph is the summary: it's
// what lists, search results and meta tags show.

/** Inline markdown: `code` spans, **bold** and *emphasis*. */
export function InlineMarkdown({ text }: { text: string }) {
  return (
    <>
      {text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*\s][^*]*\*)/).map((part, index) => {
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code
              key={index}
              className="rounded-sm bg-muted px-1 py-0.5 font-mono text-[0.85em] text-foreground"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={index} className="font-semibold text-foreground">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.length > 2 && part.startsWith("*") && part.endsWith("*")) {
          return <em key={index}>{part.slice(1, -1)}</em>;
        }
        return <Fragment key={index}>{part}</Fragment>;
      })}
    </>
  );
}

function blocksOf(text: string) {
  return text.trim().split(/\n\s*\n/);
}

/** The first paragraph, which stands for the whole text where there's room for one. */
export function summaryOf(text: string) {
  return (blocksOf(text)[0] ?? "").replace(/\s*\n\s*/g, " ");
}

/** Everything after the summary ("" when the text is a single paragraph). */
export function detailsOf(text: string) {
  return blocksOf(text).slice(1).join("\n\n");
}

/** The summary without markdown marks, for meta tags and clamped previews. */
export function plainSummaryOf(text: string) {
  return summaryOf(text)
    .replace(/`|\*\*/g, "")
    .replace(/\*([^*\s][^*]*)\*/g, "$1");
}

/** "- " items, an indented line joining the item above it. */
function listItems(lines: string[]) {
  const items: string[] = [];
  for (const line of lines) {
    if (line.startsWith("- ")) items.push(line.slice(2).trim());
    else items[items.length - 1] += ` ${line.trim()}`;
  }
  return items;
}

/** Paragraphs, "- " lists and "### " headings of inline markdown. */
export function Markdown({ text, className }: { text: string; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {blocksOf(text).map((block, index) => {
        const lines = block.split("\n").filter((line) => line.trim());
        const first = lines[0]?.trim() ?? "";
        const key = `${index}-${first}`;
        if (first.startsWith("### ")) {
          const rest = lines.slice(1).join("\n");
          return (
            <Fragment key={key}>
              <h4 className="mt-3 font-heading text-sm font-semibold text-foreground first:mt-0">
                <InlineMarkdown text={first.slice(4)} />
              </h4>
              {rest && <Markdown text={rest} />}
            </Fragment>
          );
        }
        if (first.startsWith("- ") && lines.every((line) => /^(- |\s)/.test(line))) {
          return (
            <ul
              key={key}
              className="flex list-disc flex-col gap-1.5 ps-5 marker:text-muted-foreground/60"
            >
              {listItems(lines).map((item) => (
                <li key={item} className="ps-1">
                  <InlineMarkdown text={item} />
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={key}>
            <InlineMarkdown text={lines.map((line) => line.trim()).join(" ")} />
          </p>
        );
      })}
    </div>
  );
}
