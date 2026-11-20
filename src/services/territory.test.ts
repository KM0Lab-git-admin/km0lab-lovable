import { describe, expect, it } from "vitest";
import { getTerritory } from "@/services/territory";
import { SCOPE_DEFINITIONS, SINGLE_TOWN_ART } from "@/data/territories";

describe("territory", () => {
  it("carries the reference town artwork for 17400", async () => {
    const territory = await getTerritory("17400");
    const home = territory?.towns.find(town => town.id === territory.homeTownId);
    expect(home?.id).toBe("breda");
    expect(home?.artUrl).toBeTruthy();
    expect(home?.artUrl).toBe(SCOPE_DEFINITIONS[0]?.towns.find(town => town.id === "breda")?.artUrl);
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
    expect(home?.artUrl).toBeTruthy();
    expect(home?.artUrl).toBe(SINGLE_TOWN_ART[home?.id ?? ""]);
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
  });
});
