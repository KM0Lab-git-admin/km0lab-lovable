import { expect, it, vi } from "vitest";
import { getCategories } from "@/services/eventsApi";
import { listScopeCategories } from "@/services/territoryCategories";
import type { Territory } from "@/types/territory";

vi.mock("@/services/eventsApi", () => ({ getCategories: vi.fn() }));

it("reads categories for each town independently, deduplicating while surviving a partial failure", async () => {
  const territory: Territory = { scopeId: "scope", scopeName: "Scope", homeTownId: "b", towns: [
    { id: "b", name: "Breda", postalCodes: ["17400"] },
    { id: "h", name: "Hostalric", postalCodes: ["17450"] },
    { id: "r", name: "Riells i Viabrea", postalCodes: ["17404"] },
  ] };
  vi.mocked(getCategories).mockImplementation(async town => {
    if (town === "Riells i Viabrea") throw new Error("unavailable");
    return [{ id: 1, slug: "cultura", nombre_es: "Cultura", nombre_cat: "Cultura", count: 3 }];
  });
  const categories = await listScopeCategories(territory);
  expect(vi.mocked(getCategories).mock.calls.map(([town]) => town)).toEqual(["Breda", "Hostalric", "Riells i Viabrea"]);
  expect(categories.map(category => category.slug)).toEqual(["cultura"]);
});