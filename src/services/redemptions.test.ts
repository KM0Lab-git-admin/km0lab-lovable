import { beforeEach, describe, expect, it, vi } from "vitest";
import { redeemReward } from "@/services/redemptions";
import { loadMockAccount } from "@/services/mock/account";
import { useAppStore } from "@/stores/useAppStore";
import { useMockAccountStore } from "@/stores/useMockAccountStore";
import { accountTotals } from "@/types/mockAccount";
import { REWARDS } from "@/data/rewards";

beforeEach(() => {
  useMockAccountStore.setState({ accounts: {} });
  useAppStore.setState({ session: { user: { id: "redemption-test", email: "test@example.test" }, createdAt: new Date().toISOString() } });
});

describe("redemption seam", () => {
  it("generates the voucher code in the service and records its 50 point deduction once", async () => {
    const sample = await loadMockAccount("redemption-test");
    const reward = REWARDS.find(item => item.id === "val-5eur");
    if (!reward) throw new Error("Missing voucher fixture");
    const random = vi.spyOn(Math, "random").mockReturnValue(0.5);
    try {
      const redemption = await redeemReward(reward);
      const account = useMockAccountStore.getState().accounts["redemption-test"];
      expect(redemption.code).toBe("55000");
      expect(account.redemptions.find(item => item.id === redemption.id)?.code).toBe("55000");
      expect(accountTotals(account.transactions).balance).toBe(accountTotals(sample.transactions).balance - 50);
      expect(account.transactions.filter(tx => tx.id === `redemption-${redemption.id}`).map(tx => tx.points)).toEqual([-50]);
    } finally { random.mockRestore(); }
  });

  it.each(["gorra-km0", "entrada-cinema"])("does not generate a collection code for %s", async id => {
    await loadMockAccount("redemption-test");
    const reward = REWARDS.find(item => item.id === id);
    if (!reward) throw new Error("Missing reward fixture");
    const redemption = await redeemReward(reward);
    expect(redemption.code).toBeNull();
    expect(useMockAccountStore.getState().accounts["redemption-test"].redemptions[0].code).toBeNull();
  });
});