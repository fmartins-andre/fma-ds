import type { DictionaryNamespace } from "../types";

export type CarouselLabels = {
  previous: string;
  next: string;
  pause: string;
  /** Starts the rotation (also when reduced motion started it paused). */
  start: string;
  /** A dot's label, given the slide number (1-based) and the total. */
  goToSlide: (slide: number, total: number) => string;
};

export type CarouselConfig = { labels: CarouselLabels };

declare module "../types" {
  interface FmaNamespaces {
    carousel: CarouselConfig;
  }
}

export const carouselEn: DictionaryNamespace<CarouselConfig> = {
  labels: {
    previous: "Previous slide",
    next: "Next slide",
    pause: "Pause slides",
    start: "Play slides",
    goToSlide: (slide, total) => `Go to slide ${slide} of ${total}`,
  },
};
