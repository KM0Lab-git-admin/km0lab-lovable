import { describe, expect, it } from "vitest";
import { countEventCategories, filterScopeTown, visibleHomeNews } from "@/lib/scopeListings";
import type { ScopedItem, Town } from "@/types/territory";
import type { AgendaEvent } from "@/services/eventsApi";

const home: Town = { id: "b", name: "Breda", postalCodes: ["17400"] };
const nearby: Town = { id: "h", name: "Hostalric", postalCodes: ["17450"] };
const event = (id: string, tags: string[], town: Town): ScopedItem<AgendaEvent> => ({ town, item: { id_unico_evento: id, titulo: id, tags, categorias: tags, fecha_inicio: null, fecha_fin: null, hora_inicio: null, hora_fin: null, es_gratuito: true, precio_euros: null, poblacion_nombre: null, lugar_nombre: null, url_imagen: null } });

describe("scope list rules", () => {
  it("shows five home news initially and expands all in place", () => {
    const news = [1, 2, 3, 4, 5, 6, 7];
    expect(visibleHomeNews(news, false)).toEqual([1, 2, 3, 4, 5]);
    expect(visibleHomeNews(news, true)).toEqual(news);
  });
  it("a selected town shows only its items, while all preserves both towns", () => {
    const items = [event("b1", [], home), event("h1", [], nearby)];
    expect(filterScopeTown(items, "h").map(entry => entry.item.id_unico_evento)).toEqual(["h1"]);
    expect(filterScopeTown(items, null)).toEqual(items);
  });
  it("category counts only include the visible town and count each event once per tag", () => {
    const items = [event("b1", ["music"], home), event("h1", ["music", "music", "culture"], nearby)];
    expect([...countEventCategories(filterScopeTown(items, "h"))]).toEqual([["music", 1], ["culture", 1]]);
    expect(countEventCategories(items).get("music")).toBe(2);
  });
});