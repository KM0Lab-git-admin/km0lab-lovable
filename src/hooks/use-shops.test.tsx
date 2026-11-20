import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useShops } from "@/hooks/use-shops";
import { useShop } from "@/hooks/use-shop";
import { useShopPromotions } from "@/hooks/use-shop-promotions";
import type { ComercAdherit, ComercDetall } from "@/types/comercAdherit";

vi.mock("@/services/townsApi", () => ({ getTownArtUrl: vi.fn(async () => null) }));

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const mounts: { root: Root; container: HTMLDivElement; client: QueryClient }[] = [];
afterEach(() => {
  for (const { root, container, client } of mounts.splice(0)) { act(() => root.unmount()); client.clear(); container.remove(); }
});

function renderHook<T>(hook: () => T, path = "/merchants") {
  let current: T | undefined;
  function Probe() { current = hook(); return null; }
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  function Wrapper({ children }: { children: ReactNode }) { return <QueryClientProvider client={client}><MemoryRouter initialEntries={[path]}>{children}</MemoryRouter></QueryClientProvider>; }
  const container = document.createElement("div"); document.body.append(container);
  const root = createRoot(container); mounts.push({ root, container, client });
  act(() => root.render(<Wrapper><Probe /></Wrapper>));
  return { get current(): T { if (current === undefined) throw new Error("Hook has not rendered"); return current; } };
}

async function waitFor(assertion: () => void) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try { assertion(); return; } catch (error) { if (attempt === 49) throw error; await act(async () => { await new Promise(resolve => setTimeout(resolve, 20)); }); }
  }
}

describe("merchant data seams", () => {
  it("preserves eight shops, actual category counts and reload", async () => {
    const result = renderHook(useShops);
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.shops).toHaveLength(8));
    expect(result.current.categories.find(category => category.slug === "alimentacio")?.count).toBe(2);
    expect(result.current.error).toBeNull();
    act(() => result.current.reload());
    await waitFor(() => expect(result.current.loading).toBe(false));
  });
  it("recovers forced list errors through reload", async () => {
    const result = renderHook(useShops, "/merchants?state=error");
    expect(result.current.error).toBe("FORCED_ERROR");
    act(() => result.current.reload());
    await waitFor(() => expect(result.current.shops).toHaveLength(8));
    expect(result.current.error).toBeNull();
  });
  it("supports empty and forced loading list previews", () => {
    const empty = renderHook(useShops, "/merchants?state=empty");
    const loading = renderHook(useShops, "/merchants?state=loading");
    expect(empty.current.shops).toEqual([]);
    expect(loading.current.loading).toBe(true);
  });
  it.each([['forn-rovira', false], ['cafe-del-mar', true]] as const)("loads %s with its original visit state", async (id, visited) => {
    const result = renderHook(() => useShop(id));
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.shop?.id).toBe(id));
    expect(result.current.shop?.visitat).toBe(visited);
  });
  it("returns null for a missing shop", async () => {
    const result = renderHook(() => useShop("missing"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.shop).toBeNull();
    expect(result.current.error).toBeNull();
  });
  it("recovers forced detail errors through reload", async () => {
    const result = renderHook(() => useShop("forn-rovira"), "/merchants/forn-rovira?state=error");
    expect(result.current.error).toBe("FORCED_ERROR");
    act(() => result.current.reload());
    await waitFor(() => expect(result.current.shop?.nom).toBe("Forn Rovira"));
    expect(result.current.error).toBeNull();
  });
  it("shares five promotions in the existing order, including merchant artwork", () => {
    const result = renderHook(useShopPromotions);
    expect(result.current.promotions.map(promo => `${promo.shopId}/${promo.id}`)).toEqual(["forn-rovira/p1", "forn-rovira/p2", "forn-rovira/p3", "cafe-del-mar/p1", "cafe-del-mar/p2"]);
    expect(result.current.promotions.every(promo => Boolean(promo.shopImage))).toBe(true);
    act(() => result.current.reload());
    expect(result.current.promotions).toHaveLength(5);
  });
  it("accepts unknown distances in both merchant contracts", () => {
    const listDistance: ComercAdherit["distanciaM"] = null;
    const detailDistance: ComercDetall["distanciaM"] = null;
    expect([listDistance, detailDistance]).toEqual([null, null]);
  });
});