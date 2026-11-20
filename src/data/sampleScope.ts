import cultureCover from "@/assets/burbuja/cover-cultura.webp.asset.json";
import musicCover from "@/assets/burbuja/cover-mercado.webp.asset.json";
import type { TKey } from "@/lib/i18n";

/** Explicit preview templates; never a fallback for empty or failed APIs. */
export const SCOPE_CONTENT = {
  newsPerTown: 6,
  events: [
    { offset: 1, hour: "18:00", slug: "cultura", titleKey: "preview.event.culture", image: cultureCover.url },
    { offset: 2, hour: "20:00", slug: "musica", titleKey: "preview.event.music", image: musicCover.url },
  ] satisfies { offset: number; hour: string; slug: string; titleKey: TKey; image: string }[],
  newsImage: cultureCover.url,
};
