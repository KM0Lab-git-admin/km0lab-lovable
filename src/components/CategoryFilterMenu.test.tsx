import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import CategoryFilterMenu from "@/components/CategoryFilterMenu";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

let root: Root | null = null;
let container: HTMLDivElement | null = null;

function openMenu() {
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  act(() =>
    root?.render(
      <CategoryFilterMenu
        title="Població"
        allOption={{ key: "all", label: "Tots els pobles", icon: null }}
        options={[
          { key: "breda", label: "Breda", icon: null, isHome: true },
          { key: "hostalric", label: "Hostalric", icon: null },
          { key: "riells", label: "Riells i Viabrea", icon: null },
        ]}
        selected={[]}
        onToggle={() => {}}
        onClear={() => {}}
      />,
    ),
  );
  const trigger = container.querySelector("button");
  if (!trigger) throw new Error("Missing filter trigger");
  act(() => trigger.dispatchEvent(new MouseEvent("click", { bubbles: true })));
  return Array.from(container.querySelectorAll("li"));
}

afterEach(() => {
  act(() => root?.unmount());
  container?.remove();
});

describe("town filter home marking", () => {
  it("marks only the user's own town with the home pill", () => {
    const items = openMenu();
    const labelled = items.map((li) => li.textContent ?? "");
    const withHomePill = labelled.filter((text) => text.includes("El teu poble"));
    expect(withHomePill).toHaveLength(1);
    expect(withHomePill[0]).toContain("Breda");
    expect(labelled.find((text) => text.includes("Hostalric"))).not.toContain("El teu poble");
  });

  it("keeps the neighbour rows in the neutral colour", () => {
    const items = openMenu();
    const home = items.find((li) => (li.textContent ?? "").includes("Breda"));
    const neighbour = items.find((li) => (li.textContent ?? "").includes("Hostalric"));
    const homeLabel = home?.querySelector("span.truncate");
    const neighbourLabel = neighbour?.querySelector("span.truncate");
    expect(homeLabel?.className).toContain("text-km0-yellow-800");
    expect(neighbourLabel?.className).not.toContain("text-km0-yellow-800");
  });
});
