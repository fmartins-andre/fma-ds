import { GUIDES } from "../guides";
import type { site } from "./i18n/en";
import { BLOCKS, COMPONENTS, STORYBOOK_URL } from "./registry";

export type NavTitle = keyof typeof site.nav;

export interface NavLink {
  title: string;
  /** A page of the site, whose title has a translation. */
  page?: NavTitle;
  guide?: keyof typeof site.guides;
  href: string;
  external?: boolean;
}

export interface NavSection {
  title: NavTitle;
  links: NavLink[];
}

export const MAIN_NAV: NavLink[] = [
  { title: "Docs", href: "/docs" },
  { title: "Components", href: "/components" },
  { title: "Blocks", href: "/blocks" },
  { title: "Themes", href: "/themes" },
  { title: "Storybook", href: STORYBOOK_URL, external: true },
];

export const DOCS_NAV: NavSection[] = [
  {
    title: "gettingStarted",
    links: [
      { title: "Introduction", page: "introduction", href: "/docs" },
      { title: "Components", page: "components", href: "/components" },
      { title: "Blocks", page: "blocks", href: "/blocks" },
      { title: "Theme editor", page: "themeEditor", href: "/themes" },
      { title: "Storybook", href: STORYBOOK_URL, external: true },
    ],
  },
  {
    title: "guides",
    links: GUIDES.map((guide) => ({
      title: guide.title,
      guide: guide.slug as NavLink["guide"],
      href: `/docs/${guide.slug}`,
    })),
  },
  {
    title: "components",
    links: COMPONENTS.map((item) => ({ title: item.title, href: `/components/${item.name}` })),
  },
  {
    title: "blocks",
    links: BLOCKS.map((item) => ({ title: item.title, href: `/blocks/${item.name}` })),
  },
];
