// The shadcn CLI rewrites an alias import by the file's name, not its path: with two
// items holding a `format.ts`, an import of one can land on the other. That only shows
// in a consumer that installs both, so every file imported by alias needs its own name.
import { readFileSync } from "node:fs";
import { basename, extname, join } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(import.meta.dirname, "..");

type Item = { name: string; files: { path: string }[] };
const { items } = JSON.parse(readFileSync(join(root, "registry.json"), "utf8")) as {
  items: Item[];
};

const files = items.flatMap((item) => item.files.map(({ path }) => ({ item: item.name, path })));
const withoutExtension = (path: string) => path.slice(0, -extname(path).length);
const stem = (path: string) => basename(path, extname(path));

// Older names that hold up today: nothing imports `input-masks/index` by alias, and
// `app-sidebar/types` is only imported relatively. Don't add to this list.
const ALLOWED = new Set(["src/lib/date-fns-compat/index", "src/lib/types"]);

function aliasImports(path: string) {
  const source = readFileSync(join(root, path), "utf8");
  return [...source.matchAll(/from "@\/((?:lib|hooks)\/[^"]+)"/g)].flatMap(([, target]) =>
    target ? [`src/${target}`] : [],
  );
}

describe("files imported by alias", () => {
  const imported = [...new Set(files.flatMap(({ path }) => aliasImports(path)))];

  it.each(imported)("%s has a name no other item uses", (target) => {
    const owner = files.find(({ path }) => withoutExtension(path) === target);
    if (!owner || ALLOWED.has(target)) return;
    const others = files.filter(
      ({ item, path }) => item !== owner.item && stem(path) === stem(owner.path),
    );
    expect(others).toEqual([]);
  });
});

// The CLI only rewrites import declarations: `export { x } from "@/lib/..."` reaches the
// consumer as it is, pointing at a path that doesn't exist there.
describe("published files", () => {
  it("don't re-export from an alias", () => {
    const reExports = files.filter(({ path }) =>
      /^export\s[^;"]*from\s+"@\//m.test(readFileSync(join(root, path), "utf8")),
    );
    expect(reExports).toEqual([]);
  });
});
