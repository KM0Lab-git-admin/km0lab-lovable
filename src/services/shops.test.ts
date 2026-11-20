import { describe, expect, it, vi } from "vitest";
import { listShops } from "@/services/shops";
import { getTerritory } from "@/services/territory";
import { filterShops } from "@/lib/scopeListings";

vi.mock("@/services/townsApi", () => ({ getCachedTownArtUrl: () => null, getTownArtUrl: vi.fn(async () => null) }));

describe("scope shops", () => {
  it("serves seven examples across Breda, Hostalric and Riells through listShops", async () => {
    const { shops } = await listShops(await getTerritory("17400"));
    expect(shops).toHaveLength(7);
    expect(shops.filter(shop => shop.townId === "breda")).toHaveLength(3);
    expect(shops.filter(shop => shop.townId === "hostalric")).toHaveLength(2);
    expect(shops.filter(shop => shop.townId === "riells-i-viabrea")).toHaveLength(2);
  });
  it("single-town 08380 preserves the eight existing shops", async () => {
    const { shops } = await listShops(await getTerritory("08380"));
    expect(shops).toHaveLength(8);
    expect(shops[0]?.id).toBe("forn-rovira");
    expect(shops.some(shop => shop.townId !== undefined)).toBe(false);
  });
  it("search and categories include neighbours unless a town is selected", async () => {
    const { shops } = await listShops(await getTerritory("17400"));
    expect(filterShops(shops, { category: "restauracio", townId: null, search: "" }).map(shop => shop.townId)).toEqual(["breda", "riells-i-viabrea"]);
    expect(filterShops(shops, { category: "totes", townId: null, search: " HOSTALRIC " })).toHaveLength(2);
    expect(filterShops(shops, { category: "restauracio", townId: "breda", search: "" }).map(shop => shop.id)).toEqual(["cafe-del-passeig"]);
    expect(filterShops(shops, { category: "totes", townId: null, search: "cafe" }).map(shop => shop.id)).toEqual(["cafe-del-passeig"]);
  });
});