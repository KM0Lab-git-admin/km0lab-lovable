import { CATEGORIES_ADHERITS, COMERCIOS_ADHERITS, COMERCIOS_DETALL } from "@/data/comerciosAdheridos";
import type { CategoriaAdherit, ComercAdherit, ComercDetall, ShopPromotion } from "@/types/comercAdherit";

export async function listShops(): Promise<{ shops: ComercAdherit[]; categories: CategoriaAdherit[] }> {
  await new Promise(resolve => setTimeout(resolve, 400));
  return { shops: COMERCIOS_ADHERITS, categories: CATEGORIES_ADHERITS };
}

export async function getShop(id: string): Promise<ComercDetall | null> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return COMERCIOS_DETALL[id] ?? null;
}

export function listShopPromotions(): ShopPromotion[] {
  return Object.values(COMERCIOS_DETALL).flatMap(shop => shop.promocions.map(promotion => ({
    ...promotion, shopId: shop.id, shopName: shop.nom,
    shopEmoji: shop.emoji, shopImage: shop.imatge, shopBg: shop.bg,
  })));
}