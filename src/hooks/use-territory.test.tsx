import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useTerritory } from "@/hooks/use-territory";
import { useScopeNews } from "@/hooks/use-scope-news";
import { useScopeEvents } from "@/hooks/use-scope-events";
import { getTerritory } from "@/services/territory";
import { listScopeNews, listScopeEvents } from "@/services/municipalListings";
vi.mock("@/services/territory", () => ({ getTerritory: vi.fn() }));
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
