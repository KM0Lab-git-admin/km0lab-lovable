import type { Town } from "@/types/territory";
import malgratArt from "@/assets/malgrat-de-mar.webp.asset.json";
import blanesArt from "@/assets/blanes.webp.asset.json";
import bredaArt from "@/assets/breda.webp.asset.json";
import hostalricArt from "@/assets/hostalric.webp.asset.json";

/** Artwork for standalone example towns resolved from the postal-code catalogue. */
export const SINGLE_TOWN_ART: Readonly<Record<string, string>> = {
  "malgrat-de-mar": malgratArt.url,
  blanes: blanesArt.url,
};

export interface ScopeDefinition { scopeId: string; scopeName: string; towns: Town[] }

/** Example scopes; production resolves them from the business API. */
export const SCOPE_DEFINITIONS: ScopeDefinition[] = [
  {
    scopeId: "baix-montseny-demo",
    scopeName: "Baix Montseny",
    towns: [
      { id: "breda", name: "Breda", postalCodes: ["17400"], artUrl: bredaArt.url },
      { id: "hostalric", name: "Hostalric", postalCodes: ["17450"], artUrl: hostalricArt.url },
      { id: "riells-i-viabrea", name: "Riells i Viabrea", postalCodes: ["17404"] },
    ],
  },
];
