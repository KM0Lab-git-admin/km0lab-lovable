import { beforeEach, describe, expect, it, vi } from "vitest";
import { getTerritory } from "@/services/territory";
import { getTownArtUrl } from "@/services/townsApi";

vi.mock("@/services/townsApi", () => ({ getTownArtUrl: vi.fn() }));
beforeEach(() => {
  vi.mocked(getTownArtUrl).mockReset();
  vi.mocked(getTownArtUrl).mockImplementation(async postalCode => postalCode === "17404" ? null : `https://api.uat.km0lab.com/art/${postalCode}?v=123`);
});

describe("territory", () => {
  it("carries the reference town artwork for 17400", async () => {
    const territory = await getTerritory("17400");
    const home = territory?.towns.find(town => town.id === territory.homeTownId);
    expect(home?.id).toBe("breda");
    expect(home?.artUrl).toBe("https://api.uat.km0lab.com/art/17400?v=123");
    expect(getTownArtUrl).toHaveBeenCalledWith("17400");
  });
  it("leaves 17404 without specific artwork", async () => {
    const territory = await getTerritory("17404");
    const home = territory?.towns.find(town => town.id === territory.homeTownId);
    expect(home?.id).toBe("riells-i-viabrea");
    expect(home?.artUrl ?? null).toBeNull();
  });
  it.each(["08380", "17300"])("carries standalone town artwork for %s", async postalCode => {
    const territory = await getTerritory(postalCode);
    const home = territory?.towns[0];
    expect(home?.artUrl).toBe(`https://api.uat.km0lab.com/art/${postalCode}?v=123`);
    expect(getTownArtUrl).toHaveBeenCalledTimes(1);
    expect(getTownArtUrl).toHaveBeenCalledWith(postalCode);
  });
  it("requests all town artworks concurrently and preserves towns when one request rejects", async () => {
    const pending: { postalCode: string; resolve: (value: string | null) => void; reject: (reason: Error) => void }[] = [];
    vi.mocked(getTownArtUrl).mockImplementation(postalCode => new Promise((resolve, reject) => pending.push({ postalCode, resolve, reject })));
    const territoryPromise = getTerritory("17400");
    await vi.waitFor(() => expect(pending.map(request => request.postalCode)).toEqual(["17400", "17450", "17404"]));
    for (const request of pending) {
      if (request.postalCode === "17404") request.reject(new Error("unavailable"));
      else request.resolve(`/art/${request.postalCode}`);
    }
    const territory = await territoryPromise;
    expect(territory?.towns.map(town => town.artUrl)).toEqual(["/art/17400", "/art/17450", null]);
    expect(territory?.towns).toHaveLength(3);
  });
  it("puts the home town first and the rest alphabetically", async () => {
    const territory = await getTerritory("17450");
    expect(territory?.homeTownId).toBe("hostalric");
    expect(territory?.towns.map(town => town.name)).toEqual(["Hostalric", "Breda", "Riells i Viabrea"]);
  });
  it("returns a single-town scope for an ungrouped postal code", async () => {
    const territory = await getTerritory("08380");
    expect(territory?.towns.map(town => town.name)).toEqual(["Malgrat de Mar"]);
  });
  it("returns null for an unknown postal code", async () => {
    expect(await getTerritory("99999")).toBeNull();
    expect(getTownArtUrl).not.toHaveBeenCalled();
  });
});
