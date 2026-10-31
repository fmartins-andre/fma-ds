import { defineFmaNamespace } from "@/lib/i18n/i18n";

export const useFileUploadPtBR = defineFmaNamespace("useFileUpload", {
  messages: {
    fileInvalidType: (file) => `"${file.name}" não é um tipo de arquivo aceito.`,
    tooManyFiles: (maxFiles) => `Você pode adicionar até ${maxFiles} arquivos.`,
  },
});
