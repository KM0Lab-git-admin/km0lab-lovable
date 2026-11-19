import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import NotificationBell from "@/components/NotificationBell";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

let root: Root | null = null;
let container: HTMLDivElement | null = null;

function renderBell(hasAlerts: boolean) {
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  act(() => root?.render(<NotificationBell hasAlerts={hasAlerts} />));
  const indicator = container.querySelector<HTMLElement>(
    '[data-testid="notification-indicator"]',
  );
  if (!indicator) throw new Error("Missing notification indicator");
  return indicator;
}

afterEach(() => {
  act(() => root?.unmount());
  container?.remove();
  root = null;
  container = null;
});

describe("notification bell reading indicator", () => {
  it("is always visible, coral when there are unread notifications", () => {
    const indicator = renderBell(true);
    expect(indicator.className).toContain("bg-km0-coral-400");
    expect(indicator.className).not.toContain("bg-muted-foreground");
  });

  it("stays visible but turns gray once everything is read", () => {
    const indicator = renderBell(false);
    expect(indicator.className).toContain("bg-muted-foreground");
    expect(indicator.className).not.toContain("bg-km0-coral-400");
  });

  it("defaults to the read (gray) state when no prop is passed", () => {
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
    act(() => root?.render(<NotificationBell />));
    const indicator = container.querySelector<HTMLElement>(
      '[data-testid="notification-indicator"]',
    );
    expect(indicator).not.toBeNull();
    expect(indicator?.className).toContain("bg-muted-foreground");
  });
});
