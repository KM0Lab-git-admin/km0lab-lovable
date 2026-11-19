import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import { usePointsActions } from "@/hooks/use-points-actions";
import { useHomeActions } from "@/hooks/use-home-actions";
import { useInviteSummary } from "@/hooks/use-invite-summary";
import { useInvitations } from "@/hooks/use-invitations";
import { useInviteRewards } from "@/hooks/use-invite-rewards";
import { usePointsConfig } from "@/hooks/use-points-config";
import type { PointAction, PointsHistorySummary, PointsTxType } from "@/types/points";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const mounts: { root: Root; container: HTMLDivElement }[] = [];
afterEach(() => {
  for (const { root, container } of mounts.splice(0)) {
    act(() => root.unmount());
    container.remove();
  }
});

function renderHook<T>(hook: () => T, options?: { wrapper: (props: { children: ReactNode }) => ReactNode }) {
  let current: T | undefined;
  function Probe() { current = hook(); return null; }
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  mounts.push({ root, container });
  const Wrapper = options?.wrapper;
  act(() => root.render(Wrapper ? <Wrapper><Probe /></Wrapper> : <Probe />));
  return { result: { get current(): T {
    if (current === undefined) throw new Error("Hook has not rendered");
    return current;
  } } };
}

async function waitFor(assertion: () => void) {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try { assertion(); return; } catch (error) {
      if (attempt === 29) throw error;
      await act(async () => { await new Promise(resolve => setTimeout(resolve, 20)); });
    }
  }
}

function wrapperFor(path = "/my-invitations") {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}><MemoryRouter initialEntries={[path]}>{children}</MemoryRouter></QueryClientProvider>;
  };
}

describe("points and invitations data seams", () => {
  it("preserves all eight actions and their API identifiers through reload", async () => {
    const { result } = renderHook(usePointsActions, { wrapper: wrapperFor() });
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeNull();
    expect(result.current.actions).toHaveLength(8);
    expect(result.current.actions.map(action => action.apiType)).toEqual(["birthday", "signup", "first_scan", "scan", "web_visit", "newsletter", "event_signup", "survey"]);
    act(() => result.current.reload());
    await waitFor(() => expect(result.current.actions).toHaveLength(8));
  });

  it("exposes the full immediate Home action list without moving the three-item filter into data", () => {
    const { result } = renderHook(useHomeActions);
    expect(result.current.actions).toHaveLength(8);
    expect(result.current.actions.filter(action => !action.completed).slice(0, 3).map(action => action.id)).toEqual(["birthday", "scan", "web_visit"]);
    expect(result.current).toMatchObject({ loading: false, error: null });
  });

  it("keeps the pilot signup reward at 100", () => {
    const { result } = renderHook(usePointsConfig);
    expect(result.current.signup).toBe(100);
  });
  it("keeps the pilot birthday reward at 500", () => {
    const { result } = renderHook(usePointsConfig);
    expect(result.current.birthday).toBe(500);
  });
  it("keeps the pilot scan reward at 20", () => {
    const { result } = renderHook(usePointsConfig);
    expect(result.current.scan).toBe(20);
  });
  it("keeps the pilot person invitation reward at 100", () => {
    const { result } = renderHook(useInviteRewards);
    expect(result.current.person).toBe(100);
  });
  it("keeps the pilot business invitation reward at 500", () => {
    const { result } = renderHook(useInviteRewards);
    expect(result.current.business).toBe(500);
  });

  it("returns the same default summary for Home, history and invitation tracking", async () => {
    const compact = renderHook(useInviteSummary);
    const { result } = renderHook(useInvitations, { wrapper: wrapperFor() });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.records).toHaveLength(4);
    expect(result.current.summary).toEqual(compact.result.current.summary);
    expect(result.current.summary).toEqual({ personsRegistered: 2, businessesRegistered: 1, pointsEarned: 700, pointsPending: 0 });
  });

  it("keeps pending business points out of earned points", async () => {
    const { result } = renderHook(useInvitations, { wrapper: wrapperFor("/my-invitations?state=pending") });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.records[0].status).toBe("pending");
    expect(result.current.summary).toEqual({ personsRegistered: 2, businessesRegistered: 1, pointsEarned: 200, pointsPending: 500 });
  });

  it("resolves the empty preview in the hook", async () => {
    const { result } = renderHook(useInvitations, { wrapper: wrapperFor("/my-invitations?state=empty") });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.records).toEqual([]);
    expect(result.current.summary).toEqual({ personsRegistered: 0, businessesRegistered: 0, pointsEarned: 0, pointsPending: 0 });
  });

  it("recovers the error preview through reload without a screen-owned override", async () => {
    const { result } = renderHook(useInvitations, { wrapper: wrapperFor("/my-invitations?state=error&from=home") });
    expect(result.current.error).toBe("FORCED_ERROR");
    expect(result.current.loading).toBe(false);
    act(() => result.current.reload());
    await waitFor(() => expect(result.current.records).toHaveLength(4));
    expect(result.current.error).toBeNull();
  });

  it("keeps the forced loading preview until reloaded", async () => {
    const { result } = renderHook(useInvitations, { wrapper: wrapperFor("/my-invitations?state=loading") });
    expect(result.current.loading).toBe(true);
    expect(result.current.records).toEqual([]);
    act(() => result.current.reload());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.records).toHaveLength(4);
  });

  it("allows production action identifiers, optional fields and invitation transaction types", () => {
    const { result } = renderHook(useHomeActions);
    const base = result.current.actions[0];
    if (!base) throw new Error("Missing action fixture");
    const action: PointAction = { ...base, id: "municipal-action-42", apiType: "invite_person", icon: "share", title: "API title", description: "API description", earnedPoints: 0 };
    expect(action.earnedPoints ?? action.points).toBe(0);
    const types: PointsTxType[] = ["invite_person", "invite_business"];
    const summary: PointsHistorySummary = { balance: 100, earnedTotal: 120, spentTotal: 20, items: types.map((type, index) => ({ id: String(index), type, conceptKey: "points.history.type.invitation", date: new Date().toISOString(), points: 100 })) };
    expect(summary.items.map(item => item.type)).toEqual(types);
  });
});