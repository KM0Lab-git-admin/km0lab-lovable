import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useTerritory, useTerritoryFor } from "@/hooks/use-territory";
import { useScopeNews } from "@/hooks/use-scope-news";
import { useScopeEvents } from "@/hooks/use-scope-events";
import { getTerritory } from "@/services/territory";
import { resolveTerritory } from "@/services/territory";
import type { Territory } from "@/types/territory";
import { listScopeNews, listScopeEvents } from "@/services/municipalListings";
vi.mock("@/services/territory", () => ({ getTerritory: vi.fn(), resolveTerritory: vi.fn(() => null) }));
vi.mock("@/services/municipalListings", () => ({ listScopeNews: vi.fn(), listScopeEvents: vi.fn() }));

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
function renderHook<T>(hook: () => T): { result: { current: T } } {
  const result = { current: undefined as unknown as T };
  const Probe = () => { result.current = hook(); return null; };
  const root = createRoot(document.createElement("div"));
  act(() => root.render(wrapper({ children: <Probe /> })));
  return { result };
}
const waitFor = (check: () => void) => vi.waitFor(check);
const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><MemoryRouter>{children}</MemoryRouter></QueryClientProvider>;

describe("territory hooks error shape", () => {
  it("delivers remembered artwork on the first render and refreshes it without waiting to show it", async () => {
    const territory: Territory = { scopeId: "s", scopeName: "S", homeTownId: "reference", towns: [{ id: "reference", name: "Reference", postalCodes: ["12345"], artUrl: "/remembered?v=123" }] };
    const deferred: { resolve?: (value: Territory) => void } = {};
    vi.mocked(resolveTerritory).mockReturnValueOnce(territory);
    vi.mocked(getTerritory).mockImplementationOnce(() => new Promise(resolve => { deferred.resolve = resolve; }));
    const { result } = renderHook(() => useTerritoryFor("12345"));
    expect(result.current.homeTown?.artUrl).toBe("/remembered?v=123");
    expect(result.current.loading).toBe(false);
    act(() => deferred.resolve?.({ ...territory, towns: territory.towns.map(town => ({ ...town, artUrl: "/new?v=456" })) }));
    await waitFor(() => expect(result.current.homeTown?.artUrl).toBe("/new?v=456"));
  });
  it("exposes local town metadata immediately and adds API artwork when it arrives", async () => {
    const territory: Territory = { scopeId: "s", scopeName: "S", homeTownId: "reference", towns: [{ id: "reference", name: "Reference", postalCodes: ["12345"], artUrl: null }] };
    const deferred: { resolve?: (value: Territory) => void } = {};
    vi.mocked(resolveTerritory).mockReturnValueOnce(territory);
    vi.mocked(getTerritory).mockImplementationOnce(() => new Promise(resolve => { deferred.resolve = resolve; }));
    const { result } = renderHook(() => useTerritoryFor("12345"));
    expect(result.current.homeTown?.id).toBe("reference");
    expect(result.current.homeTown?.artUrl).toBeNull();
    act(() => deferred.resolve?.({ ...territory, towns: territory.towns.map(town => ({ ...town, artUrl: "/api-art?v=123" })) }));
    await waitFor(() => expect(result.current.homeTown?.artUrl).toBe("/api-art?v=123"));
  });
  it("useTerritoryFor exposes the reference town with its artwork before location is saved", async () => {
    vi.mocked(getTerritory).mockResolvedValue({ scopeId: "s", scopeName: "S", homeTownId: "reference", towns: [
      { id: "nearby", name: "Nearby", postalCodes: ["12344"] },
      { id: "reference", name: "Reference", postalCodes: ["12345"], artUrl: "/reference.webp" },
    ] });
    const { result } = renderHook(() => useTerritoryFor("12345"));
    await waitFor(() => expect(result.current.homeTown?.artUrl).toBe("/reference.webp"));
    expect(result.current.homeTown?.id).toBe("reference");
  });
  it("useTerritory exposes the failure as a message string", async () => {
    vi.mocked(getTerritory).mockRejectedValueOnce(new Error("territory down"));
    const { result } = renderHook(() => useTerritory());
    await waitFor(() => expect(result.current.error).toBe("territory down"));
  });
  it("useScopeNews exposes null when loaded and a string when every town fails", async () => {
    vi.mocked(getTerritory).mockResolvedValue({ scopeId: "s", scopeName: "S", homeTownId: "b", towns: [{ id: "b", name: "Breda", postalCodes: ["17400"] }] });
    vi.mocked(listScopeNews).mockRejectedValueOnce(new Error("Scope listing failed"));
    const { result } = renderHook(() => useScopeNews());
    await waitFor(() => expect(result.current.error).toBe("Scope listing failed"));
  });
  it("useScopeEvents exposes an error message instead of a boolean", async () => {
    vi.mocked(getTerritory).mockResolvedValue({ scopeId: "s", scopeName: "S", homeTownId: "b", towns: [{ id: "b", name: "Breda", postalCodes: ["17400"] }] });
    vi.mocked(listScopeEvents).mockRejectedValueOnce(new Error("events down"));
    const { result } = renderHook(() => useScopeEvents());
    await waitFor(() => expect(result.current.error).toBe("events down"));
  });
  it("territory failure stops loading in both list hooks", async () => {
    vi.mocked(getTerritory).mockRejectedValue(new Error("territory unavailable"));
    const { result } = renderHook(() => ({ news: useScopeNews(), events: useScopeEvents() }));
    await waitFor(() => {
      expect(result.current.news.error).toBe("territory unavailable");
      expect(result.current.news.loading).toBe(false);
      expect(result.current.events.error).toBe("territory unavailable");
      expect(result.current.events.loading).toBe(false);
    });
  });
});
