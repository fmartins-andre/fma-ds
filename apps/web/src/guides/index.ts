import pkg from "../../../../packages/ds/package.json" with { type: "json" };

// The guides are markdown, so the site and /llms.txt read the same text. A guide's
// summary is its first paragraph; {{dependency}} stands for the version in
// packages/ds/package.json, so the compatibility table can't go stale.

export interface Guide {
  slug: string;
  title: string;
}

export const GUIDES: Guide[] = [
  { slug: "compatibility", title: "Compatibility" },
  { slug: "dark-mode", title: "Dark mode" },
  { slug: "routing", title: "Routing" },
  { slug: "offline", title: "Offline and privacy" },
  { slug: "touch", title: "Touch" },
  { slug: "updating", title: "Updating items" },
  { slug: "contributing", title: "Contributing" },
];

const VERSIONS: Record<string, string> = {
  ...pkg.dependencies,
  ...pkg.peerDependencies,
};

export function fillGuide(text: string) {
  return text.replace(/\{\{([^}]+)\}\}/g, (token, name: string) => {
    const version = VERSIONS[name];
    if (!version) throw new Error(`Unknown version in a guide: ${token}`);
    return version;
  });
}
