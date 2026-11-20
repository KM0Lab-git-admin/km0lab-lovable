import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, expectTypeOf, it, vi } from "vitest";
import { useInviteLink } from "@/hooks/use-invite-link";
import { getReferralReferenceForUser } from "@/data/inviteConfig";
import { useAppStore } from "@/stores/useAppStore";
import type { PointActionId } from "@/types/points";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const mounts: { root: Root; container: HTMLDivElement }[] = [];
function renderHook<T, P>(hook: (props: P) => T, options?: { initialProps: P }) {
  let current: T | undefined;
  function Probe({ props }: { props: P }) { current = hook(props); return null; }
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  mounts.push({ root, container });
  const rerender = (props: P) => act(() => root.render(<Probe props={props} />));
  rerender(options?.initialProps as P);
  return { rerender, result: { get current(): T {
    if (current === undefined) throw new Error("Hook has not rendered");
    return current;
  } } };
}

afterEach(() => {
  for (const { root, container } of mounts.splice(0)) {
    act(() => root.unmount());
    container.remove();
  }
  vi.restoreAllMocks();
  sessionStorage.clear();
  act(() => useAppStore.setState({ session: null, town: null, lang: "ca" }));
});

describe("invitation link data seam", () => {
  it("returns a public link without session or referral", () => {
    useAppStore.setState({ session: null, town: "Malgrat de Mar", lang: "ca" });
    const { result } = renderHook(() => useInviteLink("person"));
    const url = new URL(result.current.link ?? "");
    expect(url.pathname).toBe("/home");
    expect(url.searchParams.has("ref")).toBe(false);
    expect(result.current).toMatchObject({ loading: false, error: null });
  });

  it("preserves user attribution while switching between person and business", () => {
    useAppStore.setState({ session: { user: { id: "test-inviter", email: "invite@example.test" }, createdAt: "2026-11-20" }, town: "Malgrat de Mar", lang: "ca" });
    const { result, rerender } = renderHook(({ kind }: { kind: "person" | "business" }) => useInviteLink(kind), { initialProps: { kind: "person" } });
    const person = new URL(result.current.link ?? "");
    expect(person.pathname).toBe("/home");
    expect(person.searchParams.get("invite")).toBe("person");
    expect(person.searchParams.get("ref")).toBe(getReferralReferenceForUser("test-inviter"));
    rerender({ kind: "business" });
    const business = new URL(result.current.link ?? "");
    expect(business.pathname).toBe("/business-signup");
    expect(business.searchParams.get("invite")).toBe("business");
    expect(business.searchParams.get("ref")).toBe(person.searchParams.get("ref"));
    act(() => useAppStore.getState().setLang("es"));
    expect(new URL(result.current.link ?? "").searchParams.get("lang")).toBe("es");
    act(() => result.current.reload());
    expect(new URL(result.current.link ?? "").searchParams.get("ref")).toBe(person.searchParams.get("ref"));
  });

  it("keeps the registered preview linked to its existing simulated user", () => {
    useAppStore.setState({ session: null });
    sessionStorage.setItem("km0_preview_authed", "1");
    const { result } = renderHook(() => useInviteLink("business"));
    expect(new URL(result.current.link ?? "").searchParams.get("ref")).toBe(getReferralReferenceForUser("preview-user"));
  });

  it("exposes failures and recovers through reload", () => {
    const failure = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("Storage unavailable"); });
    useAppStore.setState({ session: null });
    const { result } = renderHook(() => useInviteLink("person"));
    expect(result.current.link).toBeNull();
    expect(result.current.error).toBe("Storage unavailable");
    failure.mockRestore();
    act(() => result.current.reload());
    expect(result.current.error).toBeNull();
    expect(result.current.link).not.toBeNull();
  });

  it("accepts invite_person in PointActionId", () => {
    expectTypeOf<"invite_person">().toExtend<PointActionId>();
  });

  it("accepts invite_business in PointActionId", () => {
    expectTypeOf<"invite_business">().toExtend<PointActionId>();
  });
});