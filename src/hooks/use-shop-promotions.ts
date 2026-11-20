import { useMemo, useState } from "react";
import { listShopPromotions } from "@/services/shops";
import type { ShopPromotion } from "@/types/comercAdherit";

export function useShopPromotions(): { promotions: ShopPromotion[]; loading: boolean; error: string | null; reload: () => void } {
  const [revision, setRevision] = useState(0);
  const result = useMemo(() => {
    try { return { promotions: listShopPromotions(), error: null }; }
    catch (error: unknown) { return { promotions: [], error: error instanceof Error ? error.message : "SHOP_PROMOTIONS_ERROR" }; }
  }, [revision]);
  return { ...result, loading: false, reload: () => setRevision(value => value + 1) };
}