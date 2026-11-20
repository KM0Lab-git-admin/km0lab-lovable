import { SCOPE_CONTENT } from "@/data/sampleScope";
import { t, tf, type Lang, type TKey } from "@/lib/i18n";
import type { AgendaEvent, ListEventsParams } from "@/services/eventsApi";
import type { Noticia } from "@/services/newsApi";
import type { ScopedItem, ScopeListing, Territory } from "@/types/territory";
import type { Category } from "@/services/apiSchemas";

const translated = (key: TKey, vars: Record<string, string | number> = {}): Record<Lang, string> => ({ ca: tf(key, "ca", vars), es: tf(key, "es", vars), en: tf(key, "en", vars) });
const dateAt = (today: Date, offset: number): string => {
  const date = new Date(today);
  date.setDate(date.getDate() + offset);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};
function split<T>(territory: Territory, entries: ScopedItem<T>[]): ScopeListing<T> {
  return { home: entries.filter(entry => entry.town.id === territory.homeTownId), nearby: entries.filter(entry => entry.town.id !== territory.homeTownId), failedTownIds: [] };
}

export function getScopeNews(territory: Territory, today = new Date()): ScopeListing<Noticia> {
  return split(territory, territory.towns.flatMap(town => Array.from({ length: SCOPE_CONTENT.newsPerTown }, (_, index) => ({ town, item: {
    id: `scope-preview-news-${town.id}-${index}`, ciudad: town.name,
    titulo: translated("preview.news.title", { town: town.name, number: index + 1 }), resumen: translated("preview.news.summary"), cuerpo: translated("preview.news.summary"),
    tags: { ca: [t("preview.category.culture", "ca")], es: [t("preview.category.culture", "es")], en: [t("preview.category.culture", "en")] },
    fechaPublicacion: dateAt(today, -index), imagenUrl: SCOPE_CONTENT.newsImage, fuenteUrl: null,
  } }))).sort((a, b) => (b.item.fechaPublicacion ?? "").localeCompare(a.item.fechaPublicacion ?? "")));
}

export function getScopeEvents(territory: Territory, params: Omit<ListEventsParams, "poblacion"> = {}, today = new Date()): ScopeListing<AgendaEvent> {
  const lang = params.lang ?? "ca";
  // Alphabetical position, independent of the home-town ordering, keeps event dates stable when switching towns.
  const towns = [...territory.towns].sort((a, b) => a.id.localeCompare(b.id));
  const entries = towns.flatMap((town, index) => SCOPE_CONTENT.events.map((template, occurrence) => ({ town, item: {
    id_unico_evento: `scope-preview-event-${town.id}-${occurrence}`, titulo: tf(template.titleKey, lang, { town: town.name }),
    fecha_inicio: dateAt(today, template.offset + ((index + occurrence) % 2)), fecha_fin: null,
    hora_inicio: template.hour, hora_fin: null, es_gratuito: true, precio_euros: null,
    poblacion_nombre: town.name, lugar_nombre: t("preview.venue", lang),
    categorias: [t(template.slug === "cultura" ? "preview.category.culture" : "preview.category.music", lang)], tags: [template.slug], url_imagen: template.image,
  } })));
  const filtered = entries.filter(({ item }) => (!params.fechaDesde || item.fecha_inicio >= params.fechaDesde) && (!params.fechaHasta || item.fecha_inicio <= params.fechaHasta) && (!params.categoria || item.tags.includes(params.categoria)) && (params.esGratuito === undefined || item.es_gratuito === params.esGratuito))
    .sort((a, b) => `${a.item.fecha_inicio}${a.item.hora_inicio}`.localeCompare(`${b.item.fecha_inicio}${b.item.hora_inicio}`));
  return split(territory, filtered);
}

export function getScopeContentCategories(): Category[] {
  return ["cultura", "musica"].map((slug, index) => ({ id: index + 1, slug, nombre_cat: t(slug === "cultura" ? "preview.category.culture" : "preview.category.music", "ca"), nombre_es: t(slug === "cultura" ? "preview.category.culture" : "preview.category.music", "es") }));
}
