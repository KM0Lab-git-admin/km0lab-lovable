import { describe, expect, it, vi } from "vitest";
import { listNews, type Noticia } from "@/services/newsApi";
import { listScopeNews, pickFeatured } from "@/services/municipalListings";
import type { Territory } from "@/types/territory";
vi.mock("@/services/eventsApi", () => ({ listEvents: vi.fn() }));
vi.mock("@/services/newsApi", () => ({ listNews: vi.fn() }));

const territory: Territory = { scopeId: "s", scopeName: "S", homeTownId: "b", towns: [
  { id: "b", name: "Breda", postalCodes: ["17400"] }, { id: "h", name: "Hostalric", postalCodes: ["17450"] }, { id: "r", name: "Riells i Viabrea", postalCodes: ["17404"] },
] };
const news = (id: string, date: string): Noticia => ({ id, ciudad: null, titulo: { ca: id, es: id, en: id }, resumen: { ca: "", es: "", en: "" }, cuerpo: { ca: "", es: "", en: "" }, tags: { ca: [], es: [], en: [] }, fechaPublicacion: date, imagenUrl: null, fuenteUrl: null });

describe("scope news", () => {
  it("requests each town separately, keeps duplicates in the home town and survives a failing town", async () => {
    vi.mocked(listNews).mockImplementation(async ({ city }) => {
      if (city === "Breda") return { noticias: [news("shared", "2026-11-01"), news("b2", "2026-11-03")], total: 2 };
      if (city === "Hostalric") return { noticias: [news("shared", "2026-11-01"), news("h1", "2026-11-02")], total: 2 };
      throw new Error("down");
    });
    const result = await listScopeNews(territory);
    expect(vi.mocked(listNews).mock.calls.map(([params]) => params.city)).toEqual(["Breda", "Hostalric", "Riells i Viabrea"]);
    expect(result.home.map(entry => entry.item.id)).toEqual(["b2", "shared"]);
    expect(result.nearby.map(entry => [entry.item.id, entry.town.name])).toEqual([["h1", "Hostalric"]]);
    expect(result.failedTownIds).toEqual(["r"]);
  });
  it("fails only when every town fails", async () => {
    vi.mocked(listNews).mockRejectedValue(new Error("down"));
    await expect(listScopeNews(territory)).rejects.toThrow();
  });
});

describe("featured events quota", () => {
  it("keeps 2 of 4 seats for nearby towns", () => {
    expect(pickFeatured(["h1", "h2", "h3", "h4"], ["n1", "n2", "n3"], 4)).toEqual(["h1", "h2", "n1", "n2"]);
  });
  it("gives unused nearby seats to the home town", () => {
    expect(pickFeatured(["h1", "h2", "h3", "h4"], ["n1"], 4)).toEqual(["h1", "h2", "h3", "n1"]);
  });
  it("gives unused home seats to nearby towns", () => {
    expect(pickFeatured(["h1"], ["n1", "n2", "n3", "n4"], 4)).toEqual(["h1", "n1", "n2", "n3"]);
  });
});
