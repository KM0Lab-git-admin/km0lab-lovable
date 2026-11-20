import { describe, expect, it } from "vitest";
import { getTerritory } from "@/services/territory";

describe("territory", () => {
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
