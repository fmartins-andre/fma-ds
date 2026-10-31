// Design-system gate: interactive states use `accent`, not `muted`, and never
// the identity color `brand`.
//
// Following the shadcn theming docs (https://ui.shadcn.com/docs/theming),
// `accent` is the "interactive hover, focus, and active surfaces" token (menu
// highlights, hovered rows, selected items) and `muted` is for "subtle
// surfaces and lower-emphasis content". The upstream `*-nova` styles drift from
// that (and aria-nova paints focused items with `bg-foreground/10`), which
// ignores the theme's accent. See CONTRIBUTING.md, "Tokens de estado".
//
// Checked: our own code — components whose meta.json `source` is "customized"
// or "original", and every block. Vendored ("shadcn") and "third-party"
// components are left as shipped; customizing one brings it under the gate.
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const UI_ROOT = join(__dirname, "..");
const CORE_DIR = join(UI_ROOT, "src", "core");
const BLOCKS_DIR = join(UI_ROOT, "src", "blocks");

// Deliberate exceptions, keyed by file (relative to packages/ds). Keep the
// reason honest: the default answer is to switch to `bg-accent`.
const GHOST_BUTTON_REASON =
  "matches Button ghost/outline hover, which still uses muted (aria-nova); revisit together with Button";
const ALLOWED: Record<string, { classes: string[]; reason: string }> = {
  "src/core/badge/badge.tsx": {
    classes: ["[a]:hover:bg-muted", "hover:bg-muted", "dark:hover:bg-muted/50"],
    reason: GHOST_BUTTON_REASON,
  },
  "src/core/menubar/menubar.tsx": {
    classes: ["data-hovered:bg-muted", "data-pressed:bg-muted", "aria-expanded:bg-muted"],
    reason: GHOST_BUTTON_REASON,
  },
  "src/core/navigation-menu/navigation-menu.tsx": {
    classes: [
      "data-focus-visible:bg-muted",
      "data-hovered:bg-muted",
      "aria-expanded:bg-muted/50",
      "aria-expanded:data-hovered:bg-muted",
      "data-current:bg-muted/50",
    ],
    reason: GHOST_BUTTON_REASON,
  },
  "src/core/toggle/toggle.tsx": {
    classes: ["hover:bg-muted"],
    reason:
      "hover stays muted (as in shadcn's toggle) so it differs from the pressed state, which uses accent",
  },
  "src/core/date-field/date-field.tsx": {
    classes: ["data-focused:bg-muted"],
    reason: "the focused segment is a text-editing caret highlight, not a picked item",
  },
};

const CHECKED_SOURCES = new Set(["customized", "original"]);

// A variant that means "the user is interacting with / has picked this".
const INTERACTIVE_VARIANT =
  /^(hover|focus|focus-visible|focus-within|active|aria-(selected|expanded|pressed|current|checked)|data-(hovered|focused|focus-visible|pressed|selected|highlighted|current|open|checked|today)|(data|aria)-\[(selected|selected-single|state|today|range-[a-z]+|highlighted|focused|current|expanded|pressed)(=[^\]]*)?\])$/;
const FORBIDDEN_UTILITY = /^!?(bg-muted(\/\d+)?|bg-foreground\/\d+)!?$/;
// Any utility painting with brand: bg-brand, text-brand-foreground, border-brand/30,
// from-brand, shadow-[…var(--brand)…], [--ring:var(--brand-foreground)]…
const BRAND_UTILITY = /(^|[-[(:,])brand\b/;

// A brand element's own hover (a brand badge rendered as a link dims, like
// primary's) keeps the color; it doesn't use brand to mark another element.
const BRAND_ALLOWED: Record<string, { classes: string[]; reason: string }> = {
  "src/core/badge/badge.tsx": {
    classes: ["[a]:hover:bg-brand/80"],
    reason: "the brand badge as a link dims its own color on hover, like [a]:hover:bg-primary/80",
  },
};

/** Splits `a:[&:is(x)]:b` on the colons outside brackets/parens. */
function splitVariants(token: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = "";
  for (const char of token) {
    if (char === "[" || char === "(") depth++;
    if (char === "]" || char === ")") depth--;
    if (char === ":" && depth === 0) {
      parts.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  parts.push(current);
  return parts;
}

function isInteractive(variant: string): boolean {
  // `not-*` negates the state; group-/peer-/in-/has- relay it from elsewhere.
  if (variant.startsWith("not-")) return false;
  const bare = variant.replace(/^(group-|peer-|in-|has-)/, "").replace(/\/[\w-]+$/, "");
  return INTERACTIVE_VARIANT.test(bare);
}

// A class-like token: anything but separators, where an [arbitrary value] (one
// level of nesting, no spaces or quotes, so not an array literal) stays whole
// and keeps its `var(--x)`.
const TOKEN = /(?:\[(?:[^[\]\s"'`]|\[[^[\]\s"'`]*\])*\]|[^\s"'`{}(),;[\]])+/g;

function tokenize(source: string): string[] {
  return source.match(TOKEN) ?? [];
}

function findViolations(source: string, forbidden: RegExp = FORBIDDEN_UTILITY): string[] {
  const found = new Set<string>();
  for (const token of tokenize(source)) {
    if (!token.includes(":")) continue;
    const parts = splitVariants(token);
    const utility = parts.pop() ?? "";
    if (forbidden.test(utility) && parts.some(isInteractive)) found.add(token);
  }
  return [...found];
}

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true, recursive: true })
    .filter((entry) => entry.isFile() && /\.tsx?$/.test(entry.name))
    .filter((entry) => !entry.name.includes(".stories."))
    .map((entry) => join(entry.parentPath, entry.name));
}

const checkedFiles = [
  ...readdirSync(CORE_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name !== "_incoming")
    .filter((entry) => {
      const meta = JSON.parse(readFileSync(join(CORE_DIR, entry.name, "meta.json"), "utf8"));
      return CHECKED_SOURCES.has(meta.source);
    })
    .flatMap((entry) => sourceFiles(join(CORE_DIR, entry.name))),
  ...sourceFiles(BLOCKS_DIR),
].map((file) => relative(UI_ROOT, file));

describe("interactive states use accent", () => {
  it.each(checkedFiles)("%s", (file) => {
    const allowed = new Set(ALLOWED[file]?.classes);
    const violations = findViolations(readFileSync(join(UI_ROOT, file), "utf8")).filter(
      (token) => !allowed.has(token),
    );
    expect(
      violations,
      "hover/focus/selected states must use bg-accent (+ text-accent-foreground), not bg-muted or bg-foreground/N",
    ).toEqual([]);
  });

  it.each(Object.entries(ALLOWED))("allowlist entry %s is still needed", (file, { classes }) => {
    expect(checkedFiles).toContain(file);
    const present = findViolations(readFileSync(join(UI_ROOT, file), "utf8"));
    expect(classes.filter((token) => !present.includes(token))).toEqual([]);
  });
});

describe("interactive states never use brand", () => {
  it.each(checkedFiles)("%s", (file) => {
    const allowed = new Set(BRAND_ALLOWED[file]?.classes);
    const violations = findViolations(
      readFileSync(join(UI_ROOT, file), "utf8"),
      BRAND_UTILITY,
    ).filter((token) => !allowed.has(token));
    expect(
      violations,
      "brand is identity, not state: hover/focus/selected use accent and ring",
    ).toEqual([]);
  });

  it.each(Object.entries(BRAND_ALLOWED))(
    "allowlist entry %s is still needed",
    (file, { classes }) => {
      expect(checkedFiles).toContain(file);
      const present = findViolations(readFileSync(join(UI_ROOT, file), "utf8"), BRAND_UTILITY);
      expect(classes.filter((token) => !present.includes(token))).toEqual([]);
    },
  );
});

describe("findViolations", () => {
  it("flags muted and foreground/N on interactive variants", () => {
    expect(
      findViolations(
        `"hover:bg-muted data-focused:bg-muted/50 **:data-[slot$=-item]:data-focused:bg-foreground/10 data-[range-middle=true]:bg-muted dark:hover:bg-muted/50 group-hover/cell:bg-muted"`,
      ),
    ).toEqual([
      "hover:bg-muted",
      "data-focused:bg-muted/50",
      "**:data-[slot$=-item]:data-focused:bg-foreground/10",
      "data-[range-middle=true]:bg-muted",
      "dark:hover:bg-muted/50",
      "group-hover/cell:bg-muted",
    ]);
  });

  it("ignores static surfaces, accent, text tokens and negated states", () => {
    expect(
      findViolations(
        `"bg-muted odd:bg-muted/30 data-pinned:bg-muted/40 hover:bg-accent text-muted-foreground hover:text-muted-foreground not-data-selected:bg-muted [&:is(:first-child)]:bg-muted ring-foreground/10"`,
      ),
    ).toEqual([]);
  });

  it("flags brand on interactive variants", () => {
    expect(
      findViolations(
        `"data-selected:border-brand hover:bg-brand/10 focus-visible:ring-brand data-selected:shadow-[0_0_8px_var(--brand)] aria-current:text-brand-foreground"`,
        BRAND_UTILITY,
      ),
    ).toEqual([
      "data-selected:border-brand",
      "hover:bg-brand/10",
      "focus-visible:ring-brand",
      "data-selected:shadow-[0_0_8px_var(--brand)]",
      "aria-current:text-brand-foreground",
    ]);
  });

  it("reads class strings inside array literals and nested arbitrary variants", () => {
    expect(findViolations(`["hover:bg-muted", "[&_[data-selected]]:hover:bg-muted"]`)).toEqual([
      "hover:bg-muted",
      "[&_[data-selected]]:hover:bg-muted",
    ]);
  });

  it("ignores brand on static surfaces and non-brand names", () => {
    expect(
      findViolations(
        `"bg-brand text-brand-foreground dark:bg-brand/20 before:bg-brand hover:bg-accent data-selected:border-primary hover:bg-branded-thing"`,
        BRAND_UTILITY,
      ),
    ).toEqual([]);
  });
});
