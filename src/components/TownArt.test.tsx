import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import TownArt from "@/components/TownArt";
import { DEFAULT_TOWN_ART } from "@/data/townArt";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
let root: Root | null = null;
const container = document.createElement("div");
function render(src?: string | null) {
  root ??= createRoot(container);
  act(() => root?.render(<TownArt src={src} />));
  const image = container.querySelector("img");
  if (!image) throw new Error("Missing town artwork");
  return image;
}
afterEach(() => { act(() => root?.unmount()); root = null; });

describe("TownArt fallback", () => {
  it.each([undefined, null, ""])("uses the generic artwork for %s", src => {
    expect(render(src).getAttribute("src")).toBe(DEFAULT_TOWN_ART);
  });
  it("uses the generic artwork when a specific image fails", () => {
    const image = render("/unavailable-town.webp");
    act(() => image.dispatchEvent(new Event("error")));
    expect(image.getAttribute("src")).toBe(DEFAULT_TOWN_ART);
  });
  it("shows the new reference town after a previous artwork fails", () => {
    const image = render("/unavailable-town.webp");
    act(() => image.dispatchEvent(new Event("error")));
    render("/next-town.webp");
    const pending = container.querySelector('img[src="/next-town.webp"]');
    if (!pending) throw new Error("Missing pending artwork");
    act(() => pending.dispatchEvent(new Event("load")));
    expect(container.querySelector("img")?.getAttribute("src")).toBe("/next-town.webp");
  });
  it("keeps the previous illustration until the replacement loads", () => {
    const image = render("/previous.webp");
    act(() => image.dispatchEvent(new Event("load")));
    render("/replacement.webp");
    expect(image.getAttribute("src")).toBe("/previous.webp");
    const pending = container.querySelector('img[src="/replacement.webp"]');
    if (!pending) throw new Error("Missing pending artwork");
    act(() => pending.dispatchEvent(new Event("load")));
    expect(image.getAttribute("src")).toBe("/replacement.webp");
  });
  it("reports only the requested artwork load and error", () => {
    const onLoad = vi.fn();
    const onError = vi.fn();
    root = createRoot(container);
    act(() => root?.render(<TownArt src="/town.webp" onLoad={onLoad} onError={onError} />));
    const image = container.querySelector("img");
    if (!image) throw new Error("Missing artwork");
    act(() => image.dispatchEvent(new Event("error")));
    expect(onError).toHaveBeenCalledTimes(1);
    act(() => image.dispatchEvent(new Event("load")));
    expect(onLoad).not.toHaveBeenCalled();
  });
});