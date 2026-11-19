import { redeemMockReward } from "@/services/mock/account";
import type { Reward } from "@/types/reward";
import type { Redemption } from "@/types/redemption";

/** Local implementation of the stable redemption seam; never writes to a backend. */
export function redeemReward(reward: Reward): Promise<Redemption> {
  const code = reward.kind === "voucher" ? Math.floor(10000 + Math.random() * 90000).toString() : null;
  return redeemMockReward(reward, code);
}