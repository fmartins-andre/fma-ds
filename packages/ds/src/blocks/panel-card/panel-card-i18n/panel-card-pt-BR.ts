import { defineFmaNamespace } from "@/lib/i18n/i18n";

export const panelCardPtBR = defineFmaNamespace("panelCard", {
  labels: {
    help: "Mais informações",
    updatedAt: (formatted) => `Atualizado em ${formatted}`,
    refreshing: "Atualizando",
    loading: "Carregando",
    empty: "Sem dados",
    emptyDescription: "Ainda não há nada para mostrar neste período.",
    error: "Não foi possível carregar os dados",
    errorDescription: "Verifique sua conexão e tente novamente.",
    retry: "Tentar novamente",
  },
});
