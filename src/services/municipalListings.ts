import { getScopeNews, getScopeEvents } from "@/services/scopeContent";
import { listEvents, type ListEventsParams, type AgendaEvent } from "@/services/eventsApi";
import { listNews, type ListNewsParams, type Noticia } from "@/services/newsApi";
import type { ScopeListing, ScopedItem, Territory, Town } from "@/types/territory";

/** Fetch every verified page so category counts cannot silently truncate. */
export async function listMunicipalEvents(params: ListEventsParams): Promise<AgendaEvent[]> {
  const items = new Map<string, AgendaEvent>();
  let page = 1;
  while (true) {
    const result = await listEvents({ ...params, page, pageSize: 100 });
    const before = items.size;
    result.eventos.forEach(item => items.set(item.id_unico_evento, item));
    if (items.size >= result.total) return [...items.values()];
    if (items.size === before) throw new Error("Incomplete event pagination");
    page += 1;
  }
}

export async function listMunicipalNews(params: ListNewsParams): Promise<Noticia[]> {
  const items = new Map<string, Noticia>();
  let offset = 0;
  while (true) {
    const result = await listNews({ ...params, limit: 20, offset });
    const before = items.size;
    result.noticias.forEach(item => items.set(item.id, item));
    if (items.size >= result.total) return [...items.values()];
    if (items.size === before) throw new Error("Incomplete news pagination");
    offset += result.noticias.length;
  }
}
async function listScope<T>(
  territory: Territory,
  fetchTown: (town: Town) => Promise<T[]>,
  idOf: (item: T) => string,
  compare: (a: T, b: T) => number,
): Promise<ScopeListing<T>> {
  const results = await Promise.allSettled(territory.towns.map(fetchTown));
  if (results.every(result => result.status === "rejected")) throw new Error("Scope listing failed");
  const seen = new Set<string>();
  const home: ScopedItem<T>[] = [];
  const nearby: ScopedItem<T>[] = [];
  const failedTownIds: string[] = [];
  const homeIndex = territory.towns.findIndex(town => town.id === territory.homeTownId);
  const order = homeIndex < 0 ? territory.towns.map((_, i) => i) : [homeIndex, ...territory.towns.map((_, i) => i).filter(i => i !== homeIndex)];
  order.forEach(index => {
    const town = territory.towns[index];
    const result = results[index];
    if (result.status === "rejected") { failedTownIds.push(town.id); return; }
    result.value.forEach(item => {
      const id = idOf(item);
      if (seen.has(id)) return;
      seen.add(id);
      (town.id === territory.homeTownId ? home : nearby).push({ item, town });
    });
  });
  const byItem = (a: ScopedItem<T>, b: ScopedItem<T>) => compare(a.item, b.item);
  return { home: home.sort(byItem), nearby: nearby.sort(byItem), failedTownIds };
}

const newestFirst = (a: Noticia, b: Noticia) => (b.fechaPublicacion ?? "").localeCompare(a.fechaPublicacion ?? "");
const soonestFirst = (a: AgendaEvent, b: AgendaEvent) =>
  `${a.fecha_inicio ?? "9999"}${a.hora_inicio ?? ""}`.localeCompare(`${b.fecha_inicio ?? "9999"}${b.hora_inicio ?? ""}`);

/** One request per town in parallel; a failing town does not hide the others. */
export function listScopeNews(territory: Territory, params: Omit<ListNewsParams, "city"> = {}, source: "live" | "sample" = "live"): Promise<ScopeListing<Noticia>> {
  if (source === "sample") return Promise.resolve(getScopeNews(territory));
  return listScope(territory, town => listMunicipalNews({ ...params, city: town.name }), item => item.id, newestFirst);
}

export function listScopeEvents(territory: Territory, params: Omit<ListEventsParams, "poblacion"> = {}, source: "live" | "sample" = "live"): Promise<ScopeListing<AgendaEvent>> {
  if (source === "sample") return Promise.resolve(getScopeEvents(territory, params));
  return listScope(territory, town => listMunicipalEvents({ ...params, poblacion: town.name }), item => item.id_unico_evento, soonestFirst);
}

/** Home items first, with ceil(limit/3) seats reserved for nearby towns; unused seats go to the other group. */
export function pickFeatured<T>(home: T[], nearby: T[], limit: number): T[] {
  const nearbyQuota = Math.min(Math.ceil(limit / 3), nearby.length);
  const homeCount = Math.min(limit - nearbyQuota, home.length);
  const nearbyCount = Math.min(limit - homeCount, nearby.length);
  return [...home.slice(0, homeCount), ...nearby.slice(0, nearbyCount)];
}

/** First page of upcoming events per town, then the featured quota. */
export async function listScopeFeaturedEvents(
  territory: Territory, params: Omit<ListEventsParams, "poblacion" | "pageSize" | "page">, limit: number,
): Promise<ScopedItem<AgendaEvent>[]> {
  const listing = await listScope(territory, town => listEvents({ ...params, poblacion: town.name, pageSize: limit }).then(result => result.eventos), item => item.id_unico_evento, soonestFirst);
  return pickFeatured(listing.home, listing.nearby, limit);
}
