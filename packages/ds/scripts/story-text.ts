import { parse } from "@babel/parser";
import type * as t from "@babel/types";
import { storyDescriptions } from "./story-snippets";

/**
 * The text a reader sees in a stories file, and that file with the text swapped for another
 * language's: the docs site's examples in each language start here, so the story stays a single
 * file. Only what renders counts: `play`, `decorators` and the like never reach
 * the page, and a string only counts when it reads like prose (see `isProse`).
 *
 * Node-only (it parses with babel), like story-snippets.ts.
 */

type Node = t.Node;
type Found = { start: number; end: number; text: string; kind: "string" | "jsx" | "template" };

/** Story properties that don't render. */
const SKIPPED_KEYS = new Set([
  "argTypes",
  "beforeEach",
  "component",
  "decorators",
  "globals",
  "loaders",
  "parameters",
  "play",
  "subcomponents",
  "tags",
]);

/** In an object these usually hold data to show; on an element they're identifiers. */
const CODE_ATTRIBUTES = new Set(["form", "name", "role", "slot", "target", "to"]);

/** Attributes and properties that hold identifiers, classes or addresses, not prose. */
const CODE_KEYS = new Set([
  "accessorKey",
  "accept",
  "as",
  "autoComplete",
  "className",
  "color",
  "d",
  "dataKey",
  "fill",
  "href",
  "htmlFor",
  "icon",
  "id",
  "image",
  "inputMode",
  "key",
  "language",
  "locale",
  "nameKey",
  "pattern",
  "rel",
  "src",
  "stroke",
  "style",
  "testId",
  "type",
  "url",
  "variant",
  "viewBox",
]);

/** Calls whose strings are classes or test plumbing. */
const CODE_CALLS = new Set(["cn", "cva", "fn", "expect", "require", "Date"]);

/** Reads as prose: has a letter, and starts uppercase or has more than one word. */
export function isProse(text: string) {
  const trimmed = text.trim();
  if (!/\p{L}/u.test(trimmed)) return false;
  // An identifier is plain ASCII, so an accent means a word ("/mês", "1 usuário").
  if (/\p{L}/u.test(trimmed.replace(/\p{ASCII}/gu, "")) && !trimmed.startsWith("<")) return true;
  if (
    /^(https?:|mailto:|tel:|<|#|\/|\.\/|@\/|[\w.-]+@[\w.-]+$|[\w-]+\/[\w-]+$|ds\/)/.test(trimmed)
  ) {
    return false;
  }
  return /^[^\p{L}]*\p{Lu}/u.test(trimmed) || /\p{L}\s+\p{L}/u.test(trimmed);
}

const keyName = (node: t.ObjectProperty["key"] | t.JSXAttribute["name"]) =>
  node.type === "Identifier" || node.type === "JSXIdentifier"
    ? node.name
    : node.type === "StringLiteral"
      ? node.value
      : node.type === "JSXNamespacedName"
        ? node.name.name
        : "";

function isChild(value: unknown): value is Node {
  return typeof (value as Node | null)?.type === "string";
}

/** A story's own `name`, which the site translates apart (story-names-pt-BR.json). */
function storyName(node: t.ExportNamedDeclaration) {
  if (node.declaration?.type !== "VariableDeclaration") return [];
  return node.declaration.declarations.flatMap(({ init }) => {
    const story = init?.type === "TSSatisfiesExpression" ? init.expression : init;
    if (story?.type !== "ObjectExpression") return [];
    return story.properties.filter(
      (property) => property.type === "ObjectProperty" && keyName(property.key) === "name",
    );
  });
}

function collect(node: Node, found: Found[], skipped = new Set<Node>()) {
  if (skipped.has(node)) return;
  if (node.type === "ImportDeclaration" || node.type.startsWith("TS")) {
    if (node.type !== "TSAsExpression" && node.type !== "TSSatisfiesExpression") return;
  }
  if (node.type === "ExportNamedDeclaration") {
    for (const property of storyName(node)) skipped.add(property);
  }
  if (node.type === "ObjectProperty" || node.type === "ObjectMethod") {
    const key = keyName(node.key as t.ObjectProperty["key"]);
    if (SKIPPED_KEYS.has(key) || CODE_KEYS.has(key)) return;
  }
  if (node.type === "JSXAttribute") {
    const key = keyName(node.name);
    if (CODE_KEYS.has(key) || CODE_ATTRIBUTES.has(key) || key.startsWith("data-")) return;
  }
  if (node.type === "CallExpression" || node.type === "NewExpression") {
    const callee = node.callee.type === "Identifier" ? node.callee.name : "";
    if (CODE_CALLS.has(callee)) return;
  }
  const { start, end } = node;
  if (typeof start === "number" && typeof end === "number") {
    if (node.type === "StringLiteral" && isProse(node.value)) {
      found.push({ start, end, text: node.value, kind: "string" });
    }
    if (node.type === "JSXText" && /\p{L}/u.test(node.value)) {
      found.push({ start, end, text: node.value, kind: "jsx" });
    }
    // Text next to an expression shows as a space before or after a lowercase word.
    const { raw } = node.type === "TemplateElement" ? node.value : { raw: "" };
    if (raw && (isProse(raw) || /^\s+\p{L}|\p{L}\s+$/u.test(raw))) {
      found.push({ start, end, text: raw, kind: "template" });
    }
  }
  for (const [key, value] of Object.entries(node)) {
    if (key === "loc" || key === "extra") continue;
    for (const child of Array.isArray(value) ? value : [value]) {
      if (isChild(child)) collect(child, found, skipped);
    }
  }
}

function find(source: string) {
  const found: Found[] = [];
  const ast = parse(source, { sourceType: "module", plugins: ["typescript", "jsx"] });
  collect(ast.program, found);
  return found.sort((a, b) => a.start - b.start);
}

/** How the dictionary keys a text: spacing around it and inside it doesn't count. */
export const textKey = (text: string) => text.replace(/\s+/g, " ").trim();

/** Every text of a stories file, as dictionary keys. */
export function storyTexts(source: string) {
  return [...new Set(find(source).map(({ text }) => textKey(text)))];
}

function replacement({ text, kind }: Found, translated: string) {
  // The spacing around a text separates it from what's next.
  const [before = ""] = text.match(/^\s*/) ?? [];
  const [after = ""] = text.match(/\s*$/) ?? [];
  const spaced = `${before}${translated}${after}`;
  return kind === "string" ? JSON.stringify(spaced) : spaced;
}

/** The stories file with each text the dictionary changes replaced. */
export function translateStory(source: string, dictionary: Record<string, string>) {
  let result = source;
  for (const item of find(source).reverse()) {
    const key = textKey(item.text);
    const translated = dictionary[key];
    // A key has no line breaks or inner spacing: only a real translation may replace the text.
    if (translated === undefined || translated === key) continue;
    result = result.slice(0, item.start) + replacement(item, translated) + result.slice(item.end);
  }
  return result;
}

function member(object: Node | undefined, name: string) {
  if (object?.type !== "ObjectExpression") return undefined;
  const found = object.properties.find(
    (property) => property.type === "ObjectProperty" && keyName(property.key) === name,
  );
  return found?.type === "ObjectProperty" ? found.value : undefined;
}

/** The descriptions a reader sees: `parameters.docs` wins over the JSDoc, as in Storybook. */
export function shownDescriptions(source: string) {
  const comments = storyDescriptions(source);
  const ast = parse(source, { sourceType: "module", plugins: ["typescript", "jsx"] });
  return ast.program.body.flatMap((statement) => {
    if (statement.type !== "ExportNamedDeclaration") return [];
    if (statement.declaration?.type !== "VariableDeclaration") return [];
    return statement.declaration.declarations.flatMap(({ id, init }) => {
      const story = init?.type === "TSSatisfiesExpression" ? init.expression : init;
      const tags = member(story ?? undefined, "tags");
      if (tags?.type === "ArrayExpression") {
        const hidden = tags.elements.some(
          (tag) => tag?.type === "StringLiteral" && tag.value === "!autodocs",
        );
        if (hidden) return [];
      }
      const docs = member(member(story ?? undefined, "parameters"), "docs");
      const text = member(member(docs, "description"), "story");
      const explicit =
        text?.type === "StringLiteral"
          ? text.value
          : text?.type === "TemplateLiteral"
            ? text.quasis[0]?.value.cooked
            : undefined;
      const description = explicit ?? (id.type === "Identifier" ? comments[id.name] : undefined);
      return description ? [textKey(description)] : [];
    });
  });
}
