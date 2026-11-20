import type { ScopedItem } from "@/types/territory";
import type { AgendaEvent } from "@/services/eventsApi";

export const INITIAL_HOME_NEWS_LIMIT = 5;

export function filterScopeTown<T>(items: ScopedItem<T>[], townId: string | null): ScopedItem<T>[] {
  return townId === null ? items : items.filter(entry => entry.town.id === townId);
}

export function countEventCategories(items: ScopedItem<AgendaEvent>[]): Map<string, number> {
  const counts = new Map<string, number>();
  items.forEach(({ item }) => new Set(item.tags).forEach(slug => counts.set(slug, (counts.get(slug) ?? 0) + 1)));
  return counts;
}

export function visibleHomeNews<T>(items: T[], expanded: boolean): T[] {
  return expanded ? items : items.slice(0, INITIAL_HOME_NEWS_LIMIT);
}