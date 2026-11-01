import { defineFmaNamespace } from "@/lib/i18n/i18n";

export const formWizardPtBR = defineFmaNamespace("formWizard", {
  labels: {
    steps: "Etapas",
    back: "Voltar",
    next: "Próximo",
    finish: "Concluir",
    progress: (step, total) => `Etapa ${step} de ${total}`,
  },
});
