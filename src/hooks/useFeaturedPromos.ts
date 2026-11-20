import { useQuery } from "@tanstack/react-query";
import { useLocationContext } from "@/hooks/use-location-context";

import { listEvents, type AgendaEvent } from "@/services/eventsApi";
import { listScopeFeaturedEvents } from "@/services/municipalListings";
import { useTerritory } from "@/hooks/use-territory";
import type { Promo } from "@/types/promo";
import { useAppStore } from "@/stores/useAppStore";

/**
 * useFeaturedPromos — obtiene los N primeros eventos de la API y los
 * adapta al shape `Promo` que consume `EventHeroCarousel`.
 *
 * Solo lectura. Si la API falla o no devuelve nada, el hook devuelve una
 * lista vacía; el consumidor decide el fallback (por ejemplo, ocultar la
 * sección o mostrar los PROMOS mock).
 */
const GRADIENTS = [
  "from-km0-blue-800 via-km0-blue-700 to-km0-blue-900",
  "from-km0-teal-700 via-km0-teal-600 to-km0-blue-800",
  "from-km0-yellow-400 via-km0-coral-400 to-km0-coral-500",
  "from-km0-coral-500 via-km0-coral-400 to-km0-blue-700",
];

function formatDateRange(
  ev: AgendaEvent,
  lang: "es" | "ca" | "en",
): string {
  const locale = lang === "ca" ? "ca-ES" : lang === "en" ? "en-GB" : "es-ES";
  const start = ev.fecha_inicio ? new Date(ev.fecha_inicio) : null;
  const end = ev.fecha_fin ? new Date(ev.fecha_fin) : null;
  if (!start || Number.isNaN(start.getTime())) return "";

  const fmt = new Intl.DateTimeFormat(locale, { day: "numeric", month: "long" });
  const startStr = fmt.format(start);

  if (end && !Number.isNaN(end.getTime()) && end.toDateString() !== start.toDateString()) {
    const endStr = fmt.format(end);
    return lang === "es"
      ? `Del ${startStr} al ${endStr}`
      : lang === "ca"
        ? `Del ${startStr} al ${endStr}`
        : `From ${startStr} to ${endStr}`;
  }

  if (ev.hora_inicio) return `${startStr} · ${ev.hora_inicio.slice(0, 5)}`;
  return startStr;
}

function toPromo(ev: AgendaEvent, index: number, lang: "es" | "ca" | "en"): Promo {
  return {
    id: ev.id_unico_evento,
    title: ev.titulo,
    dateRange: formatDateRange(ev, lang),
    location: ev.lugar_nombre || ev.poblacion_nombre || "",
    badge: {
      text: ev.categorias?.[0] ?? "",
      bg: "bg-km0-blue-700",
      text_color: "text-primary-foreground",
    },
    gradient: GRADIENTS[index % GRADIENTS.length] ?? "",
    images: ev.url_imagen ? [ev.url_imagen] : [],
  };
}

export function useFeaturedPromos(limit = 4): {
  promos: Promo[];
  loading: boolean;
  error: string | null;
} {
  const lang = useAppStore((s) => s.lang);
  const { town } = useLocationContext();
  const today = new Date();
  const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const { territory, isGrouped } = useTerritory();
  const apiLang = lang === "ca" ? "ca" : "es";
  const query = useQuery({ queryKey: ["featured-events", town, lang, limit, date],
    queryFn: () => listEvents({ poblacion: town, fechaDesde: date, pageSize: limit, lang: apiLang }), staleTime: 300000, enabled: !isGrouped });
  const scopeQuery = useQuery({
    queryKey: ["scope-featured-events", territory?.scopeId, territory?.homeTownId, territory?.towns.map(item => item.id), lang, limit, date],
    queryFn: () => territory ? listScopeFeaturedEvents(territory, { fechaDesde: date, lang: apiLang }, limit) : Promise.resolve([]),
    enabled: isGrouped, staleTime: 300000,
  });
  if (isGrouped) return {
    promos: (scopeQuery.data ?? []).map(({ item, town: origin }, i) => ({ ...toPromo(item, i, lang), town: { name: origin.name, isHome: origin.id === territory?.homeTownId } })),
    loading: scopeQuery.isLoading, error: scopeQuery.isError ? "events_error" : null,
  };
  return { promos: (query.data?.eventos ?? []).map((ev, i) => toPromo(ev, i, lang)), loading: query.isLoading,
    error: query.isError ? "events_error" : null };
}
