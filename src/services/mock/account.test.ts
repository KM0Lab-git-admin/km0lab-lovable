import { COMERCIOS_ADHERITS, COMERCIOS_DETALL, CATEGORIES_ADHERITS } from "@/data/comerciosAdheridos";
import { beforeEach, describe, expect, it } from "vitest";
import { createSampleAccount, loadMockAccount, redeemMockReward } from "@/services/mock/account";
import { isPendingRedemption } from "@/types/redemption";
import { useMockAccountStore } from "@/stores/useMockAccountStore";
import { useAppStore } from "@/stores/useAppStore";
import { accountTotals } from "@/types/mockAccount";
import { REWARDS } from "@/data/rewards";
import { POINTS_ACTIONS } from "@/data/pointsActions";
import { REDEMPTIONS } from "@/data/redemptions";

beforeEach(() => {
  useMockAccountStore.setState({ accounts: {} });
  useAppStore.setState({ session: { user: { id: "account-test", email: "test@example.test" }, createdAt: new Date().toISOString() } });
});

describe("coherent frontend pilot account", () => {
  it("uses 20 sample scan points in every merchant and its detail", () => {
    expect(COMERCIOS_ADHERITS.map(shop => shop.punts)).toEqual(Array(8).fill(20));
    expect(Object.values(COMERCIOS_DETALL).map(shop => shop.punts)).toEqual([20, 20]);
    expect(CATEGORIES_ADHERITS.find(category => category.slug === "totes")?.count).toBe(8);
  });

  it("uses 500 sample birthday points", () => expect(POINTS_ACTIONS.find(action => action.id === "birthday")?.points).toBe(500));
  it("uses 20 sample scan points", () => expect(POINTS_ACTIONS.find(action => action.id === "scan")?.points).toBe(20));
  it("uses 50 sample first scan points", () => expect(POINTS_ACTIONS.find(action => action.id === "first_scan")?.points).toBe(50));
  it("retains a signed negative balance rather than an absolute value", () => {
    expect(accountTotals([{ id: "test", type: "redeem", conceptKey: "points.history.type.redeem", date: "2026-11-19", points: -40 }]).balance).toBe(-40);
  });
  it("pending includes delivery pending and ready for collection", () => {
    expect(REDEMPTIONS.filter(isPendingRedemption).map(item => item.status).sort()).toEqual(["pending", "ready"]);
  });
  it("has exactly one signed transaction for each seeded redemption", () => {
    const sample = createSampleAccount();
    for (const redemption of sample.redemptions) {
      expect(sample.transactions.filter(tx => tx.id === `redemption-${redemption.id}`).map(tx => tx.points)).toEqual([-redemption.costPoints]);
    }
    expect(sample.transactions.filter(tx => tx.type === "invitation").reduce((sum, tx) => sum + tx.points, 0)).toBe(700);
  });
  it("deducts 50 once and records the same code in canjes and history", async () => {
    const sample = await loadMockAccount("account-test");
    const before = accountTotals(sample.transactions).balance;
    const reward = REWARDS.find(item => item.id === "val-5eur");
    if (!reward) throw new Error("Missing test reward");
    const redemption = await redeemMockReward(reward, "12345");
    const account = useMockAccountStore.getState().accounts["account-test"];
    expect(accountTotals(account.transactions).balance).toBe(before - 50);
    expect(account.redemptions.find(item => item.id === redemption.id)?.code).toBe("12345");
    expect(account.transactions.find(tx => tx.id === `redemption-${redemption.id}`)?.points).toBe(-50);
    expect(useMockAccountStore.getState().accounts["other-account"]).toBeUndefined();
  });
  it("rejects a visitor redemption without changing any account", async () => {
    await loadMockAccount("account-test");
    const before = useMockAccountStore.getState().accounts;
    useAppStore.setState({ session: null });
    await expect(redeemMockReward(REWARDS[0], "12345")).rejects.toThrow();
    expect(useMockAccountStore.getState().accounts).toBe(before);
  });
  it("keeps ready sample pickup valid and expired examples in the past", () => {
    const ready = REDEMPTIONS.find(item => item.status === "ready");
    const expired = REDEMPTIONS.find(item => item.status === "expired");
    expect(new Date(ready?.expiresAt ?? "").getTime()).toBeGreaterThan(Date.now());
    expect(new Date(expired?.expiresAt ?? "").getTime()).toBeLessThan(Date.now());
  });
});