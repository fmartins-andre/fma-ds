import { defineFmaNamespace, plural } from "@/lib/i18n/i18n";

export const emojiPickerPtBR = defineFmaNamespace("emojiPicker", {
  labels: {
    trigger: "Adicionar emoji",
    panel: "Seletor de emoji",
    search: "Pesquisar emoji",
    clearSearch: "Limpar pesquisa",
    categories: "Categorias de emoji",
    frequent: "Usados com frequência",
    recent: "Usados recentemente",
    searchResults: "Resultados da pesquisa",
    custom: "Personalizados",
    smileys: "Carinhas e emoções",
    people: "Pessoas e corpo",
    nature: "Animais e natureza",
    food: "Comidas e bebidas",
    travel: "Viagens e lugares",
    activities: "Atividades",
    objects: "Objetos",
    symbols: "Símbolos",
    flags: "Bandeiras",
    skinTone: "Tom de pele",
    skinTones: ["Padrão", "Claro", "Médio-claro", "Médio", "Médio-escuro", "Escuro"],
    empty: "Nenhum emoji encontrado",
    emptyHint: "Tente outra palavra ou um atalho",
    loading: "Carregando emoji",
    error: "Não foi possível carregar os emoji",
    retry: "Tentar novamente",
    preview: "Escolha um emoji",
  },
  functions: () => ({
    formatResultCount: (count) =>
      plural("pt-BR", count, { one: "1 emoji encontrado", other: `${count} emoji encontrados` }),
    formatSelected: (label) => `${label} selecionado`,
  }),
});
