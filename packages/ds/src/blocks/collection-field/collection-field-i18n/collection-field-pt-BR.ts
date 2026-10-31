import { defineFmaNamespace } from "@/lib/i18n/i18n";

export const collectionFieldPtBR = defineFmaNamespace("collectionField", {
  labels: {
    remove: (item) => `Remover ${item}`,
    removeText: "Remover",
    added: (item) => `${item} adicionado`,
    removed: (item) => `${item} removido`,
    maxReached: (max) => `Até ${max} itens.`,
    empty: "Nada adicionado ainda.",
  },
});
