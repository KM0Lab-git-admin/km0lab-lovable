import { describe, expect, test } from "bun:test";
import { isUnavailableMunicipalCatalogue } from "./publicRewardsResponse";

const target = new URL("https://api.uat.km0lab.com/api/v1/rewards/public?postal_code=17400&lang=ca");
const unknownTown = JSON.stringify({ detail: "Unknown postal code" });

describe("public rewards for an unsupported municipality", () => {
  test("17400's explicit unknown-postal-code 404 means an empty catalogue", () => {
    expect(isUnavailableMunicipalCatalogue("GET", target, 404, unknownTown)).toBe(true);
  });

  test("does not suppress other 404 errors", () => {
    expect(isUnavailableMunicipalCatalogue("GET", target, 404, '{"detail":"Not found"}')).toBe(false);
    expect(isUnavailableMunicipalCatalogue("GET", target, 404, "Not JSON")).toBe(false);
  });

  test("preserves server failures", () => {
    expect(isUnavailableMunicipalCatalogue("GET", target, 500, unknownTown)).toBe(false);
  });

  test("only handles the public GET catalogue with a valid postal code", () => {
    expect(isUnavailableMunicipalCatalogue("POST", target, 404, unknownTown)).toBe(false);
    expect(isUnavailableMunicipalCatalogue("GET", new URL("https://api.uat.km0lab.com/api/v1/rewards/public"), 404, unknownTown)).toBe(false);
    expect(isUnavailableMunicipalCatalogue("GET", new URL("https://api.uat.km0lab.com/api/v1/rewards/private?postal_code=17400"), 404, unknownTown)).toBe(false);
    expect(isUnavailableMunicipalCatalogue("GET", new URL("https://api.uat.km0lab.com/api/v1/rewards/public?postal_code=invalid"), 404, unknownTown)).toBe(false);
  });
});