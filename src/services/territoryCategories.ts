import { getScopeContentCategories } from "@/services/scopeContent";
import { getCategories } from "@/services/eventsApi";
import type { Territory } from "@/types/territory";

export async function listScopeCategories(territory: Territory, source: "live" | "sample" = "live"): Promise<Awaited<ReturnType<typeof getCategories>>> {
  if (source === "sample") return getScopeContentCategories();
  const results = await Promise.allSettled(territory.towns.map(town => getCategories(town.name)));
  const categories = new Map<string, Awaited<ReturnType<typeof getCategories>>[number]>();
  results.forEach(result => {
    if (result.status === "fulfilled") result.value.forEach(category => {
      if (!categories.has(category.slug)) categories.set(category.slug, category);
    });
  });
  return [...categories.values()];
}