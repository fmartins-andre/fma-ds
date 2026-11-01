import { useTranslation } from "react-i18next";
import { categoryTitle, componentsByCategory } from "./registry";

/** Components by category, with the titles in the current language and sorted in it. */
export function useComponentsByCategory() {
  const title = useCategoryTitle();
  const { i18n } = useTranslation();
  return componentsByCategory()
    .map((group) => ({ ...group, title: title(group.category) }))
    .sort((a, b) => a.title.localeCompare(b.title, i18n.resolvedLanguage));
}

export function useCategoryTitle() {
  const { t } = useTranslation();
  return (category: string) =>
    t(($) => $.categories[category as keyof typeof $.categories], {
      defaultValue: categoryTitle(category),
    });
}
