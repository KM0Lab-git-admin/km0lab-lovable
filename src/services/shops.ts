import { CATEGORIES_ADHERITS, COMERCIOS_ADHERITS, COMERCIOS_DETALL, SCOPE_SHOPS } from "@/data/comerciosAdheridos";
import type { Territory } from "@/types/territory";
import type { CategoriaAdherit, ComercAdherit, ComercDetall, ShopPromotion } from "@/types/comercAdherit";

export async function listShops(territory?: Territory | null): Promise<{ shops: ComercAdherit[]; categories: CategoriaAdherit[] }> {
  await new Promise(resolve => setTimeout(resolve, 400));
  if (!territory || territory.towns.length < 2) return { shops: COMERCIOS_ADHERITS, categories: CATEGORIES_ADHERITS };
  const townIds = new Set(territory.towns.map(town => town.id));
  const shops = SCOPE_SHOPS.filter(shop => shop.townId && townIds.has(shop.townId));
  const categories = [...CATEGORIES_ADHERITS, ...shops.filter(shop => !CATEGORIES_ADHERITS.some(category => category.slug === shop.categoriaSlug)).map(shop => ({ slug: shop.categoriaSlug, nom: shop.categoriaNom, count: 0, emoji: shop.emoji }))]
    .map(category => ({ ...category, count: category.slug === "totes" ? shops.length : shops.filter(shop => shop.categoriaSlug === category.slug).length }))
    .filter(category => category.count > 0);
  return { shops, categories };
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