import { POINTS_HISTORY } from "@/data/pointsHistory";
import { REDEMPTIONS } from "@/data/redemptions";
import { INVITATIONS_MOCK } from "@/data/invitationsMock";
import { MOCK_POINTS } from "@/data/mockPointsConfig";
import { useAppStore } from "@/stores/useAppStore";
import { useMockAccountStore } from "@/stores/useMockAccountStore";
import { accountTotals, type MockAccount } from "@/types/mockAccount";
import { t, type Lang } from "@/lib/i18n";
import type { Reward } from "@/types/reward";
import type { Redemption } from "@/types/redemption";

/** Explicit sample account, never a real balance or a backend write. */
export function createSampleAccount(): MockAccount {
  const transactions = POINTS_HISTORY.filter(tx => tx.type !== "redeem");
  return {
    redemptions: REDEMPTIONS,
    transactions: [
      ...transactions,
      { id: "demo-credit", type: "demo_credit", conceptKey: "points.history.type.demo_credit", date: transactions.at(-1)?.date ?? new Date().toISOString(), points: MOCK_POINTS.sampleCredit },
      ...INVITATIONS_MOCK.filter(record => record.status === "granted").map(record => ({
        id: `invitation-${record.id}`, type: "invitation" as const, conceptKey: "points.history.type.invitation" as const,
        date: record.grantedAt ?? record.completedAt ?? new Date().toISOString(), points: record.points,
      })),
      ...REDEMPTIONS.map(redemption => ({
        id: `redemption-${redemption.id}`, type: "redeem" as const, conceptKey: "points.history.type.redeem" as const,
        date: redemption.redeemedAt, points: -redemption.costPoints, place: redemption.shopName,
      })),
    ],
  };
}

export async function loadMockAccount(userId: string): Promise<MockAccount> {
  await new Promise(resolve => setTimeout(resolve, 150));
  const existing = useMockAccountStore.getState().accounts[userId];
  if (existing) return existing;
  const account = createSampleAccount();
  useMockAccountStore.getState().putAccount(userId, account);
  return account;
}

/** Atomic local simulation: one deduction and one matching redemption. */
export async function redeemMockReward(reward: Reward, code: string | null): Promise<Redemption> {
  const userId = useAppStore.getState().session?.user.id;
  const account = userId ? useMockAccountStore.getState().accounts[userId] : null;
  if (!userId || !account || reward.status !== "active" || reward.stock === 0 || accountTotals(account.transactions).balance < reward.costPoints) throw new Error("Cannot redeem");
  const date = new Date().toISOString();
  const redemption: Redemption = {
    translations: reward.translations,
    id: crypto.randomUUID(), rewardId: reward.id, rewardTitle: reward.title, rewardDescription: reward.description,
    rewardCategory: reward.category, rewardKind: reward.kind, imageUrl: reward.imageUrl ?? null,
    hasImage: reward.hasImage ?? !!reward.imageUrl, isMock: true,
    costPoints: reward.costPoints, valueLabel: reward.valueLabel, status: "pending", code, redeemedAt: date,
  };
  useMockAccountStore.getState().putAccount(userId, {
    redemptions: [redemption, ...account.redemptions],
    transactions: [{ id: `redemption-${redemption.id}`, type: "redeem", conceptKey: "points.history.type.redeem", date, points: -reward.costPoints, place: reward.title }, ...account.transactions],
  });
  return redemption;
}

export function localizeRedemption(redemption: Redemption, lang: Lang): Redemption {
  const translated = redemption.translations?.[lang];
  if (translated) return { ...redemption, rewardTitle: translated.title, rewardDescription: translated.description,
    valueLabel: redemption.rewardKind === "product" && redemption.valueLabel === "1 unitat" ? t("reward.mock.unit", lang) : redemption.rewardKind === "ticket" && redemption.valueLabel === "1 entrada" ? t("reward.mock.ticket", lang) : redemption.valueLabel };
  const keys = {
    "entrada-cinema": ["reward.mock.cinema.title", "reward.mock.cinema.description"],
    "gorra-km0": ["reward.mock.cap.title", "reward.mock.cap.description"],
    "samarreta-km0": ["reward.mock.shirt.title", "reward.mock.shirt.description"],
    "val-5eur": ["reward.mock.voucher5", "reward.mock.voucher.description"],
    "val-20eur": ["reward.mock.voucher20", "reward.mock.voucher.description"],
  } as const;
  const key = keys[redemption.rewardId as keyof typeof keys];
  if (!key) return redemption;
  return { ...redemption, rewardTitle: t(key[0], lang), rewardDescription: t(key[1], lang),
    valueLabel: redemption.rewardKind === "product" ? t("reward.mock.unit", lang) : redemption.rewardKind === "ticket" ? t("reward.mock.ticket", lang) : redemption.valueLabel };
}
