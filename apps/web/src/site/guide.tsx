import { Fragment } from "react";
import { Link } from "react-aria-components";
import { CodeBlock, CodeBlockCopyButton } from "@/core/code-block/code-block";
import { fillGuide, GUIDES } from "../guides";
import { InlineMarkdown } from "./markdown";

const SOURCES = import.meta.glob<string>("../guides/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

export function getGuide(slug: string) {
  const guide = GUIDES.find((item) => item.slug === slug);
  const source = SOURCES[`../guides/${slug}.md`];
  return guide && source ? { ...guide, text: fillGuide(source) } : undefined;
}

type Block =
  | { type: "heading" | "paragraph"; text: string }
  | { type: "list" | "ordered"; items: string[] }
  | { type: "code"; language: string; code: string }
  | { type: "table"; head: string[]; rows: string[][] };

const cells = (line: string) =>
  line
    .trim()
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((cell) => cell.trim());

/** Guides use headings, paragraphs, lists, fenced code and tables. */
function parseBlocks(text: string) {
  const blocks: Block[] = [];
  const lines = text.trim().split("\n");
  let index = 0;
  const takeWhile = (test: (line: string) => boolean) => {
    const taken: string[] = [];
    while (index < lines.length && test(lines[index] ?? "")) taken.push(lines[index++] ?? "");
    return taken;
  };
  while (index < lines.length) {
    const line = lines[index] ?? "";
    if (!line.trim()) index++;
    else if (line.startsWith("```")) {
      index++;
      const code = takeWhile((next) => !next.startsWith("```")).join("\n");
      index++;
      blocks.push({ type: "code", language: line.slice(3).trim(), code });
    } else if (line.startsWith("## ")) {
      index++;
      blocks.push({ type: "heading", text: line.slice(3) });
    } else if (line.startsWith("|")) {
      const [head = "", , ...rows] = takeWhile((next) => next.startsWith("|"));
      blocks.push({ type: "table", head: cells(head), rows: rows.map(cells) });
    } else if (line.startsWith("- ")) {
      const items = takeWhile((next) => next.startsWith("- ")).map((item) => item.slice(2));
      blocks.push({ type: "list", items });
    } else if (/^\d+\. /.test(line)) {
      const items = takeWhile((next) => /^\d+\. /.test(next));
      blocks.push({ type: "ordered", items: items.map((item) => item.replace(/^\d+\. /, "")) });
    } else {
      blocks.push({ type: "paragraph", text: takeWhile((next) => next.trim() !== "").join(" ") });
    }
  }
  return blocks;
}

/** Inline markdown plus [links](url). */
function Inline({ text }: { text: string }) {
  return text.split(/(\[[^\]]+\]\([^)]+\))/).map((part, index) => {
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    const key = `${index}-${part}`;
    if (!link) return <InlineMarkdown key={key} text={part} />;
    return (
      <Link key={key} href={link[2]} className="font-medium underline underline-offset-4">
        <InlineMarkdown text={link[1] ?? ""} />
      </Link>
    );
  });
}

function GuideBlock({ block }: { block: Block }) {
  switch (block.type) {
    case "heading":
      return (
        <h2 className="mt-8 scroll-m-20 border-b pb-2 font-heading text-xl font-semibold tracking-tight">
          {block.text}
        </h2>
      );
    case "paragraph":
      return (
        <p className="leading-7 text-foreground/90">
          <Inline text={block.text} />
        </p>
      );
    case "list":
    case "ordered": {
      const Tag = block.type === "list" ? "ul" : "ol";
      return (
        <Tag
          className={
            block.type === "list"
              ? "flex list-disc flex-col gap-1.5 ps-5"
              : "flex list-decimal flex-col gap-1.5 ps-5"
          }
        >
          {block.items.map((item) => (
            <li key={item} className="ps-1 leading-7 text-foreground/90">
              <Inline text={item} />
            </li>
          ))}
        </Tag>
      );
    }
    case "code":
      return (
        <CodeBlock code={block.code} language={block.language}>
          <CodeBlockCopyButton alwaysVisible />
        </CodeBlock>
      );
    case "table":
      return (
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                {block.head.map((cell) => (
                  <th key={cell} scope="col" className="px-3 py-2 text-start font-medium">
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row) => (
                <tr key={row.join("|")} className="border-b last:border-0">
                  {row.map((cell) => (
                    <td key={cell} className="px-3 py-2 align-top">
                      <Inline text={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}

export function GuidePage({ title, text }: { title: string; text: string }) {
  const [lead, ...rest] = parseBlocks(text);
  return (
    <article className="max-w-3xl pb-12">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">{title}</h1>
      {lead?.type === "paragraph" && (
        <p className="mt-2 text-base text-muted-foreground">
          <Inline text={lead.text} />
        </p>
      )}
      <div className="mt-6 flex flex-col gap-4">
        {rest.map((block, index) => (
          <Fragment key={`${index}-${block.type}`}>
            <GuideBlock block={block} />
          </Fragment>
        ))}
      </div>
    </article>
  );
}
