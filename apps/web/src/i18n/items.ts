import { useTranslation } from "react-i18next";
import items from "../site/i18n/items-pt-BR.json";
import stories from "../site/i18n/stories-pt-BR.json";
import storyNames from "../site/i18n/story-names-pt-BR.json";

type Item = { name: string; description: string };

const ITEMS: Record<string, string> = items;
const STORIES: Record<string, string> = stories;
const STORY_NAMES: Record<string, string> = storyNames;

/** An item's description; `meta.json` holds the English, the source of truth. */
export function itemDescription(locale: string | undefined, item: Item) {
  return (locale === "pt-BR" ? ITEMS[item.name] : undefined) ?? item.description;
}

export function useItemDescription() {
  const { i18n } = useTranslation();
  return (item: Item) => itemDescription(i18n.resolvedLanguage, item);
}

/**
 * A story's description, found by its English text: the story file holds that text, so
 * a translation that went stale stops matching and the page falls back to English.
 */
export function useStoryDescription() {
  const { i18n } = useTranslation();
  return (english: string) =>
    (i18n.resolvedLanguage === "pt-BR"
      ? STORIES[english.replace(/\s+/g, " ").trim()]
      : undefined) ?? english;
}

/** A story's title, found the same way. */
export function useStoryName() {
  const { i18n } = useTranslation();
  return (english: string) =>
    (i18n.resolvedLanguage === "pt-BR" ? STORY_NAMES[english] : undefined) ?? english;
}
