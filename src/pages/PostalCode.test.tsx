import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import PostalCode from "@/pages/PostalCode";
import { getTownArtUrl } from "@/services/townsApi";
import mapAsset from "@/assets/postal-code-map.png.asset.json";

vi.mock("@/services/townsApi", () => ({ getCachedTownArtUrl: () => null, getTownArtUrl: vi.fn(async (postalCode: string) => postalCode === "17400" ? "https://api.uat.km0lab.com/art/reference?v=123" : null) }));

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
let root: Root | null = null;
const container = document.createElement("div");
beforeEach(() => {
  vi.mocked(getTownArtUrl).mockReset();
  vi.mocked(getTownArtUrl).mockImplementation(async postalCode => postalCode === "17400" ? "https://api.uat.km0lab.com/art/reference?v=123" : null);
});
afterEach(() => { act(() => root?.unmount()); root = null; });
function setup() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  root = createRoot(container);
  act(() => root?.render(<QueryClientProvider client={client}><MemoryRouter><PostalCode /></MemoryRouter></QueryClientProvider>));
  return container;
}
function change(value: string) {
  const input = container.querySelector("input");
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
  if (!input || !setter) throw new Error("Missing postal code input");
  act(() => { setter.call(input, value); input.dispatchEvent(new Event("input", { bubbles: true })); });
}
async function until(check: () => void) {
  await vi.waitFor(async () => {
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 20)); });
    check();
  }, { timeout: 2000 });
}

describe("postal code artwork", () => {
  it("shows town artwork with 17400 and restores the map when cleared", async () => {
    setup();
    const src = "https://api.uat.km0lab.com/art/reference?v=123";
    change("17400");
    await until(() => expect(container.querySelector(`img[src="${src}"]`)).not.toBeNull());
    expect(container.querySelector(`img[src="${mapAsset.url}"]`)?.getAttribute("aria-hidden")).toBe("false");
    const image = container.querySelector(`img[src="${src}"]`);
    if (!image) throw new Error("Missing pending artwork");
    expect(image.parentElement?.getAttribute("aria-hidden")).toBe("true");
    act(() => image.dispatchEvent(new Event("load")));
    expect(container.querySelector(`img[src="${mapAsset.url}"]`)?.getAttribute("aria-hidden")).toBe("true");
    expect(image.parentElement?.getAttribute("aria-hidden")).toBe("false");
    change("");
    await until(() => expect(container.querySelector(`img[src="${src}"]`)).toBeNull());
    expect(container.querySelector(`img[src="${mapAsset.url}"]`)?.getAttribute("aria-hidden")).toBe("false");
  });
  it("keeps the map when the resolved illustration fails to load", async () => {
    setup();
    change("17400");
    const src = "https://api.uat.km0lab.com/art/reference?v=123";
    await until(() => expect(container.querySelector(`img[src="${src}"]`)).not.toBeNull());
    const image = container.querySelector(`img[src="${src}"]`);
    if (!image) throw new Error("Missing pending artwork");
    act(() => image.dispatchEvent(new Event("error")));
    expect(container.querySelector(`img[src="${mapAsset.url}"]`)?.getAttribute("aria-hidden")).toBe("false");
    expect(image.parentElement?.getAttribute("aria-hidden")).toBe("true");
  });
  it("keeps the map with 17404 even after a town with artwork", async () => {
    setup();
    change("17400");
    await until(() => expect(container.querySelectorAll('img[alt=""]')).toHaveLength(1));
    change("17404");
    await until(() => expect(container.querySelector("h1")?.textContent).toContain("Riells i Viabrea"));
    await until(() => expect(container.querySelectorAll('img[alt=""]')).toHaveLength(0));
    expect(container.querySelector(`img[src="${mapAsset.url}"]`)?.getAttribute("aria-hidden")).toBe("false");
  });
  it("keeps the map when the API gives 17400 no artwork", async () => {
    vi.mocked(getTownArtUrl).mockResolvedValue(null);
    setup();
    change("17400");
    await until(() => expect(container.querySelector("h1")?.textContent).toContain("Breda"));
    await until(() => expect(getTownArtUrl).toHaveBeenCalledWith("17400"));
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 100)); });
    expect(container.querySelectorAll('img[alt=""]')).toHaveLength(0);
    expect(container.querySelector(`img[src="${mapAsset.url}"]`)?.getAttribute("aria-hidden")).toBe("false");
  });
});