import { afterEach, describe, expect, it, vi } from "vitest";
import { getTownArtUrl, publicTownResponseSchema } from "@/services/townsApi";
import townFixture from "@/data/fixtures/towns-public.json";

afterEach(() => vi.unstubAllGlobals());

function response(body: unknown, status = 200) {
  const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("public town artwork", () => {
  it("validates the captured UAT response", () => {
    expect(publicTownResponseSchema.safeParse(townFixture).success).toBe(true);
  });
  it("reads the public GET endpoint through the rewards proxy and preserves the version query", async () => {
    const fetchMock = response({ ...townFixture, art_url: "/api/v1/towns/town-id/media/art?v=123" });
    expect(await getTownArtUrl("17400")).toBe("https://api.uat.km0lab.com/api/v1/towns/town-id/media/art?v=123");
    const base = import.meta.env.VITE_SUPABASE_URL ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/rewards-api` : "";
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(`${base}/api/v1/towns/public?postal_code=17400`, expect.objectContaining({ headers: expect.objectContaining({ "Content-Type": "application/json" }) }));
  });
  it("returns null when art_url is null", async () => {
    response({ ...townFixture, art_url: null });
    expect(await getTownArtUrl("17404")).toBeNull();
  });
  it("accepts old responses without slug, postal_codes or art_url", async () => {
    response({ id: "town-id", name: "Town" });
    expect(await getTownArtUrl("17400")).toBeNull();
  });
  it("accepts artwork without the optional slug and postal_codes", async () => {
    response({ id: "town-id", name: "Town", art_url: "/media/art?v=456" });
    expect(await getTownArtUrl("17400")).toBe("https://api.uat.km0lab.com/media/art?v=456");
  });
  it("returns null for unknown postal codes (404)", async () => {
    response({ detail: "Unknown postal code" }, 404);
    expect(await getTownArtUrl("99999")).toBeNull();
  });
  it("returns null for a failed request", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Network unavailable")));
    expect(await getTownArtUrl("17400")).toBeNull();
  });
  it("returns null for server errors", async () => {
    response({ detail: "Unavailable" }, 500);
    expect(await getTownArtUrl("17400")).toBeNull();
  });
  it("returns null for a contract violation", async () => {
    response({ id: 1, name: "Town", art_url: "/art" });
    expect(await getTownArtUrl("17400")).toBeNull();
  });
  it("returns null for invalid JSON", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("invalid json")));
    expect(await getTownArtUrl("17400")).toBeNull();
  });
});