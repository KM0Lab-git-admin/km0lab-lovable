import type { PointsTransaction } from "@/types/points";
import type { Redemption } from "@/types/redemption";

export interface MockAccount { transactions: PointsTransaction[]; redemptions: Redemption[]; }
export const accountTotals = (transactions: PointsTransaction[]) => {
  const earned = transactions.reduce((sum, tx) => sum + Math.max(0, tx.points), 0);
  const spent = transactions.reduce((sum, tx) => sum + Math.max(0, -tx.points), 0);
  return { balance: earned - spent, earned, spent };
};