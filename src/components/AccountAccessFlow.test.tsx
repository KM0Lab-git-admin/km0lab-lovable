import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AccountAccessFlow, { type AccountAccessControls } from "@/components/AccountAccessFlow";
import { useAppStore } from "@/stores/useAppStore";
import { requestOtp } from "@/services/mock/auth";

vi.mock("@/services/mock/auth", () => ({ requestOtp: vi.fn() }));

const wrapper = ({ children }: { children: ReactNode }) => <MemoryRouter initialEntries={["/points-actions?filter=pending"]}>{children}</MemoryRouter>;
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
let root: Root | null = null;
let container: HTMLDivElement | null = null;
const renderAccess = (isAuthed = false) => {
  let current: { access: AccountAccessControls; location: ReturnType<typeof useLocation> } | null = null;
  const Probe = () => {
    const location = useLocation();
    return <AccountAccessFlow isAuthed={isAuthed} container={null}>{access => {
      current = { access, location };
      return null;
    }}</AccountAccessFlow>;
  };
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  act(() => root?.render(wrapper({ children: <Probe /> })));
  return { result: { get current() {
    if (!current) throw new Error("Account flow has not rendered");
    return current;
  } } };
};

afterEach(() => {
  act(() => root?.unmount());
  container?.remove();
});

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  useAppStore.setState({ session: null, postalCode: null, town: null });
  vi.mocked(requestOtp).mockResolvedValue({ error: null });
});

describe("shared locked-tab access", () => {
  it.each([
    ["puntos", "points", "/points-history"],
    ["rewards", "rewards", "/redeemed-rewards"],
    ["perfil", "profile", "/profile"],
  ] as const)("guest %s stays on its page and keeps the requested OTP destination", async (tab, target, returnTo) => {
    const { result } = renderAccess();
    act(() => result.current.access.open(tab));
    expect(result.current.access.target).toBe(target);
    expect(result.current.location.pathname).toBe("/points-actions");
    await act(async () => result.current.access.continueWithEmail("visitor@example.test"));
    expect(result.current.location.pathname).toBe("/check-email");
    expect(result.current.location.state).toEqual({ email: "visitor@example.test", mode: "signup", returnTo });
  });

  it("cancel keeps the page and existing filter", () => {
    const { result } = renderAccess();
    act(() => result.current.access.open("puntos"));
    act(() => result.current.access.close());
    expect(result.current.access.target).toBeNull();
    expect(result.current.location.pathname + result.current.location.search).toBe("/points-actions?filter=pending");
    expect(requestOtp).not.toHaveBeenCalled();
  });

  it("existing-account access keeps the requested destination", () => {
    const { result } = renderAccess();
    act(() => result.current.access.open("perfil"));
    act(() => result.current.access.login());
    expect(result.current.location.pathname).toBe("/login");
    expect(new URLSearchParams(result.current.location.search).get("returnTo")).toBe("/profile");
  });

  it("signed-in users never submit a registration request", async () => {
    const { result } = renderAccess(true);
    act(() => result.current.access.open("puntos"));
    expect(result.current.access.target).toBeNull();
    await act(async () => result.current.access.continueWithEmail("visitor@example.test"));
    expect(requestOtp).not.toHaveBeenCalled();
  });

  it("request failure stays on the origin and allows retry", async () => {
    vi.mocked(requestOtp).mockRejectedValueOnce(new Error("Mock unavailable"));
    const { result } = renderAccess();
    act(() => result.current.access.open("rewards"));
    await act(async () => result.current.access.continueWithEmail("visitor@example.test"));
    expect(result.current.access.error).not.toBeNull();
    expect(result.current.location.pathname).toBe("/points-actions");
    await act(async () => result.current.access.continueWithEmail("visitor@example.test"));
    expect(result.current.location.pathname).toBe("/check-email");
  });

  it("closing during a request prevents late navigation", async () => {
    let finish: ((value: { error: null }) => void) | undefined;
    vi.mocked(requestOtp).mockImplementation(() => new Promise((resolve) => { finish = resolve; }));
    const { result } = renderAccess();
    act(() => result.current.access.open("puntos"));
    act(() => { void result.current.access.continueWithEmail("visitor@example.test"); });
    act(() => result.current.access.close());
    await act(async () => finish?.({ error: null }));
    expect(result.current.access.submitting).toBe(false);
    expect(result.current.location.pathname).toBe("/points-actions");
  });
});