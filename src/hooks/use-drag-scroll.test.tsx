import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useDragScroll } from "@/hooks/use-drag-scroll";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

function Track({ axis, onClick }: { axis: "vertical" | "horizontal"; onClick: () => void }) {
  const ref = useDragScroll(axis);
  return <div ref={ref} data-testid="track"><button onClick={onClick}>item</button></div>;
}

let root: Root | null = null;
let container: HTMLDivElement | null = null;

function renderTrack(axis: "vertical" | "horizontal", onClick = vi.fn()) {
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  act(() => root?.render(<Track axis={axis} onClick={onClick} />));
  const track = container.firstElementChild;
  const button = track?.firstElementChild;
  if (!(track instanceof HTMLDivElement) || !(button instanceof HTMLButtonElement)) throw new Error("Missing track");
  return { track, button };
}

function click(target: HTMLElement) {
  act(() => target.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, detail: 1 })));
}

function pointer(target: EventTarget, type: string, x: number, y: number, pointerType = "mouse") {
  const event = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, button: 0 });
  Object.defineProperties(event, { pointerType: { value: pointerType }, pointerId: { value: 1 } });
  act(() => target.dispatchEvent(event));
}

afterEach(() => {
  act(() => root?.unmount());
  container?.remove();
  root = null;
  container = null;
});

describe("mouse drag scrolling", () => {
  it.each(["vertical", "horizontal"] as const)("scrolls the %s axis without activating a card", (axis) => {
    const onClick = vi.fn();
    const { track, button } = renderTrack(axis, onClick);
    track.setPointerCapture = vi.fn();
    track.hasPointerCapture = () => false;
    pointer(button, "pointerdown", 200, 200);
    pointer(window, "pointermove", axis === "horizontal" ? 100 : 200, axis === "vertical" ? 100 : 200);
    expect(axis === "horizontal" ? track.scrollLeft : track.scrollTop).toBe(100);
    pointer(window, "pointerup", 100, 100);
    click(button);
    expect(onClick).not.toHaveBeenCalled();
    pointer(button, "pointerdown", 200, 200);
    pointer(window, "pointerup", 200, 200);
    click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("leaves touch scrolling to the browser", () => {
    const { track } = renderTrack("vertical");
    pointer(track, "pointerdown", 200, 200, "touch");
    pointer(window, "pointermove", 200, 100, "touch");
    expect(track.scrollTop).toBe(0);
  });

  it("does not move a vertical parent during horizontal dragging", () => {
    const { track } = renderTrack("vertical");
    pointer(track, "pointerdown", 200, 200);
    pointer(window, "pointermove", 100, 190);
    expect(track.scrollTop).toBe(0);
  });
});