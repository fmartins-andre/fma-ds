import { defineFmaNamespace } from "@/lib/i18n/i18n";

export const carouselPtBR = defineFmaNamespace("carousel", {
  labels: {
    previous: "Slide anterior",
    next: "Próximo slide",
    pause: "Pausar slides",
    start: "Reproduzir slides",
    goToSlide: (slide, total) => `Ir para o slide ${slide} de ${total}`,
  },
});
