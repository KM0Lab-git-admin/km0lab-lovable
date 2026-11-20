import type { Town } from "@/types/territory";

export interface ScopeDefinition { scopeId: string; scopeName: string; towns: Town[] }

/** Example scopes; production resolves them from the business API. */
export const SCOPE_DEFINITIONS: ScopeDefinition[] = [
  {
    scopeId: "baix-montseny-demo",
    scopeName: "Baix Montseny",
    towns: [
      { id: "breda", name: "Breda", postalCodes: ["17400"] },
      { id: "hostalric", name: "Hostalric", postalCodes: ["17450"] },
      { id: "riells-i-viabrea", name: "Riells i Viabrea", postalCodes: ["17404"] },
    ],
  },
];
