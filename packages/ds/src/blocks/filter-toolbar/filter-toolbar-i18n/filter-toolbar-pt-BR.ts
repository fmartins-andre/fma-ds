import { defineFmaNamespace } from "@/lib/i18n/i18n";

export const filterToolbarPtBR = defineFmaNamespace("filterToolbar", {
  labels: {
    search: "Pesquisar",
    searchPlaceholder: "Pesquisar…",
    clearSearch: "Limpar pesquisa",
    quickFilters: "Filtros rápidos",
    filters: "Filtros",
    filtersTrigger: (active) => (active > 0 ? `Filtros, ${active} ativos` : "Filtros"),
    filtersTitle: "Filtrar resultados",
    apply: "Aplicar",
    clear: "Limpar",
    activeFilters: "Filtros ativos",
    clearAll: "Limpar filtros",
    refresh: "Atualizar",
  },
});
