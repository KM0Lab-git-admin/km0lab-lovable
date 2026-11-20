import { describe, expect, it, vi } from "vitest";
import { getScopeNews, getScopeEvents } from "@/services/scopeContent";
import { getContentSource, getContentPath } from "@/hooks/use-preview-state";
import { getTerritory } from "@/services/territory";
import { listScopeEvents } from "@/services/municipalListings";

vi.mock("@/services/townsApi", () => ({ getTownArtUrl: vi.fn(async () => null) }));

describe("explicit scope preview source", () => {
  it("never enables sample for a missing, empty, error or unknown state", () => {
    for (const state of [null, "empty", "error", "ready", "loading", "unknown"]) expect(getContentSource(state)).toBe("live");
    expect(getContentSource("sample")).toBe("sample");
  });
  it("preserves explicit sample navigation without modifying live links or losing detail IDs", () => {
    expect(getContentPath("/events", "live")).toBe("/events");
    expect(getContentPath("/news?id=article-1", "sample")).toBe("/news?id=article-1&state=sample");
    expect(getContentPath("/merchants", "sample")).toBe("/merchants?state=sample");
  });
  it("provides events from all three postal-code towns interleaved by date", async () => {
    const territory = await getTerritory("17400");
    if (!territory) throw new Error("Missing territory");
    const listing = getScopeEvents(territory, {}, new Date(2026, 10, 20));
    const events = [...listing.home, ...listing.nearby].sort((a, b) => (a.item.fecha_inicio ?? "").localeCompare(b.item.fecha_inicio ?? ""));
    expect(events).toHaveLength(6);
    expect(new Set(events.map(entry => entry.town.name))).toEqual(new Set(["Breda", "Hostalric", "Riells i Viabrea"]));
    expect(events.map(entry => entry.item.fecha_inicio)).toEqual(["2026-11-21", "2026-11-21", "2026-11-22", "2026-11-22", "2026-11-23", "2026-11-23"]);
    expect(new Set(events.slice(0, 2).map(entry => entry.town.id)).size).toBe(2);
  });
  it("switching the home town changes grouping without changing event dates or IDs", async () => {
    const breda = await getTerritory("17400");
    const hostalric = await getTerritory("17450");
    if (!breda || !hostalric) throw new Error("Missing territory");
    const today = new Date(2026, 10, 20);
    const first = getScopeEvents(breda, {}, today);
    const next = getScopeEvents(hostalric, {}, today);
    const dates = (listing: typeof first) => [...listing.home, ...listing.nearby].map(entry => `${entry.item.id_unico_evento}/${entry.item.fecha_inicio}`).sort();
    expect(dates(next)).toEqual(dates(first));
    expect(next.home.map(entry => entry.town.id)).toEqual(["hostalric", "hostalric"]);
  });
  it("filters sample events by the same date range as the live list", async () => {
    const territory = await getTerritory("17400");
    if (!territory) throw new Error("Missing territory");
    const listing = getScopeEvents(territory, { fechaDesde: "2026-11-22", fechaHasta: "2026-11-22" }, new Date(2026, 10, 20));
    expect([...listing.home, ...listing.nearby].map(entry => entry.item.fecha_inicio)).toEqual(["2026-11-22", "2026-11-22"]);
  });
  it("provides six home news and twelve nearby without leaking into a single-town scope", async () => {
    const grouped = await getTerritory("17400");
    const single = await getTerritory("08380");
    if (!grouped || !single) throw new Error("Missing territory");
    expect(getScopeNews(grouped).home).toHaveLength(6);
    expect(getScopeNews(grouped).nearby).toHaveLength(12);
    expect(getScopeNews(grouped).nearby.slice(0, 4).map(entry => entry.town.id)).toEqual(["hostalric", "riells-i-viabrea", "hostalric", "riells-i-viabrea"]);
    expect(getScopeNews(single).nearby).toEqual([]);
    const sample = await listScopeEvents(grouped, {}, "sample");
    expect(sample.home).toHaveLength(2);
    expect(sample.nearby).toHaveLength(4);
  });
});