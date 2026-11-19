import { describe, expect, it, vi } from "vitest";
import { listEvents } from "@/services/eventsApi";
import { listNews } from "@/services/newsApi";
import { listMunicipalEvents, listMunicipalNews } from "@/services/municipalListings";
vi.mock("@/services/eventsApi", () => ({ listEvents: vi.fn() }));
vi.mock("@/services/newsApi", () => ({ listNews: vi.fn() }));

describe("complete municipal lists", () => {
  it("continues past the first 100 events preserving town and dates", async () => {
    vi.mocked(listEvents).mockResolvedValueOnce({ eventos: Array.from({ length: 100 }, (_, id) => ({ id_unico_evento: String(id), titulo: "", fecha_inicio: null, fecha_fin: null, hora_inicio: null, hora_fin: null, es_gratuito: true, precio_euros: null, poblacion_nombre: "Barcelona", lugar_nombre: null, categorias: [], tags: [], url_imagen: null })), total: 101 });
    vi.mocked(listEvents).mockResolvedValueOnce({ eventos: [{ id_unico_evento: "100", titulo: "", fecha_inicio: null, fecha_fin: null, hora_inicio: null, hora_fin: null, es_gratuito: true, precio_euros: null, poblacion_nombre: "Barcelona", lugar_nombre: null, categorias: [], tags: [], url_imagen: null }], total: 101 });
    expect(await listMunicipalEvents({ poblacion: "Barcelona", fechaDesde: "2026-11-19" })).toHaveLength(101);
    expect(listEvents).toHaveBeenLastCalledWith({ poblacion: "Barcelona", fechaDesde: "2026-11-19", page: 2, pageSize: 100 });
  });
  it("does not turn an incomplete response into a successful complete list", async () => {
    vi.mocked(listNews).mockResolvedValueOnce({ noticias: [], total: 21 });
    await expect(listMunicipalNews({ city: "Barcelona" })).rejects.toThrow("Incomplete news pagination");
  });
});