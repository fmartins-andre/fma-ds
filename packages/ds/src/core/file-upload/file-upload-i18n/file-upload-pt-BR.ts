import { defineFmaNamespace } from "@/lib/i18n/i18n";

export const fileUploadPtBR = defineFmaNamespace("fileUpload", {
  labels: {
    dropzone: "Arraste e solte um arquivo aqui",
    dropzoneMultiple: "Arraste e solte os arquivos aqui",
    browse: "Escolher arquivo",
    browseMultiple: "Escolher arquivos",
    remove: (name) => `Remover ${name}`,
    progress: (name) => `Enviando ${name}`,
  },
});
