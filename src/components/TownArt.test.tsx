import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
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
    expect(render("/next-town.webp").getAttribute("src")).toBe("/next-town.webp");
  });
});