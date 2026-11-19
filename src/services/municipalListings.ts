import { listEvents, type ListEventsParams, type AgendaEvent } from "@/services/eventsApi";
import { listNews, type ListNewsParams, type Noticia } from "@/services/newsApi";

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