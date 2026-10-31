import { defineFmaNamespace } from "@/lib/i18n/i18n";

export const colorPickerPtBR = defineFmaNamespace("colorPicker", {
  labels: {
    lightness: "Luminosidade",
    chroma: "Croma",
    hue: "Matiz",
    saturation: "Saturação",
    brightness: "Brilho",
    red: "Vermelho",
    green: "Verde",
    blue: "Azul",
    alpha: "Alfa",
    oklchArea: "Croma e luminosidade",
    hsbArea: "Saturação e brilho",
    pickColor: "Escolher cor",
    swatches: "Cores predefinidas",
    format: "Formato da cor",
    copy: "Copiar cor",
    copied: "Copiado",
    copyFailed: "Não foi possível copiar",
    eyeDropper: "Escolher uma cor da tela",
    fix: (level) => `Corrigir para ${level}`,
    largeText: "AA grande",
    fail: "Reprovado",
  },
});
