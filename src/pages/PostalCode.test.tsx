import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import PostalCode from "@/pages/PostalCode";
import { SCOPE_DEFINITIONS } from "@/data/territories";
import mapAsset from "@/assets/postal-code-map.png.asset.json";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
let root: Root | null = null;
const container = document.createElement("div");
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
    const src = SCOPE_DEFINITIONS[0]?.towns.find(town => town.id === "breda")?.artUrl;
    expect(src).toBeTruthy();
    change("17400");
    await until(() => expect(container.querySelector(`img[src="${src}"]`)).not.toBeNull());
    change("");
    await until(() => expect(container.querySelector(`img[src="${src}"]`)).toBeNull());
    expect(container.querySelector(`img[src="${mapAsset.url}"]`)?.getAttribute("aria-hidden")).toBe("false");
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
});