import type { ReactNode } from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useAccount } from "@/hooks/use-account";
import { useAppStore } from "@/stores/useAppStore";
import { useMockAccountStore } from "@/stores/useMockAccountStore";
import { redeemReward } from "@/services/redemptions";
import { REWARDS } from "@/data/rewards";

beforeEach(() => {
  useMockAccountStore.setState({ accounts: {} });
  useAppStore.setState({ lang: "ca", session: { user: { id: "hook-test", email: "test@example.test" }, createdAt: new Date().toISOString() } });
});

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
let root: Root | null = null;
let container: HTMLDivElement | null = null;
afterEach(() => {
  act(() => root?.unmount());
  container?.remove();
});

function renderAccount() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  let current: ReturnType<typeof useAccount> | null = null;
  const Probe = () => { current = useAccount(); return null; };
  const children: ReactNode = <Probe />;
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  act(() => root?.render(<QueryClientProvider client={client}>{children}</QueryClientProvider>));
  return { result: { get current() {
    if (!current) throw new Error("Account hook has not rendered");
    return current;
  } } };
}

describe("account seam", () => {
  it("returns a null error and updates the balance and localized snapshots after redemption", async () => {
    const { result } = renderAccount();
    expect(result.current.loading).toBe(true);
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 200)); });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    const before = result.current.balance;
    const reward = REWARDS.find(item => item.id === "gorra-km0");
    if (!reward) throw new Error("Missing cap fixture");
    await act(async () => { await redeemReward({ ...reward, translations: { ca: { title: "Cap CA", description: "CA" }, es: { title: "Cap ES", description: "ES" }, en: { title: "Cap EN", description: "EN" } } }); });
    expect(result.current.balance).toBe(before - 180);
    const redemptionId = result.current.redemptions[0].id;
    for (const lang of ["ca", "es", "en"] as const) {
      act(() => useAppStore.getState().setLang(lang));
      expect(result.current.redemptions[0].rewardTitle).toBe(`Cap ${lang.toUpperCase()}`);
      expect(result.current.redemptions[0].id).toBe(redemptionId);
      expect(result.current.redemptions[0].costPoints).toBe(180);
      expect(result.current.transactions.find(tx => tx.id === `redemption-${redemptionId}`)?.points).toBe(-180);
    }
  });

  it("does not load an account without a session", () => {
    useAppStore.setState({ session: null });
    const { result } = renderAccount();
    expect(result.current).toMatchObject({ balance: 0, transactions: [], redemptions: [], loading: false, error: null });
  });
});