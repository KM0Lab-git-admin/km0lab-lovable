import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import BottomTabs from "@/components/BottomTabs";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
let root: Root | null = null;
let container: HTMLDivElement | null = null;

function renderTabs(isAuthed: boolean) {
  const handlers = { onLogin: vi.fn(), onHome: vi.fn(), onProfile: vi.fn(), onPoints: vi.fn(), onRewards: vi.fn(), onActions: vi.fn() };
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  act(() => root?.render(<BottomTabs activeTab="home" isAuthed={isAuthed} {...handlers} />));
  const buttons = Array.from(container.querySelectorAll("button"));
  const click = (index: number) => {
    const button = buttons[index];
    if (!button) throw new Error("Missing navigation button");
    act(() => button.dispatchEvent(new MouseEvent("click", { bubbles: true })));
  };
  return { handlers, click };
}

afterEach(() => {
  act(() => root?.unmount());
  container?.remove();
});

describe("contextual account access", () => {
  it.each([
    [2, "puntos", "onPoints"],
    [3, "rewards", "onRewards"],
    [4, "perfil", "onProfile"],
  ] as const)("guest tab %s requests its own account context", (index, target, handler) => {
    const { handlers, click } = renderTabs(false);
    click(index);
    expect(handlers.onLogin).toHaveBeenCalledWith(target);
    expect(handlers[handler]).not.toHaveBeenCalled();
  });

  it("signed-in users open all private destinations without registration prompts", () => {
    const { handlers, click } = renderTabs(true);
    click(2);
    click(3);
    click(4);
    expect(handlers.onPoints).toHaveBeenCalledOnce();
    expect(handlers.onRewards).toHaveBeenCalledOnce();
    expect(handlers.onProfile).toHaveBeenCalledOnce();
    expect(handlers.onLogin).not.toHaveBeenCalled();
  });
});