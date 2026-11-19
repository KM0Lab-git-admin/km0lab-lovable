import { useQuery } from "@tanstack/react-query";
import { useLocationContext } from "@/hooks/use-location-context";
import { listMunicipalNews } from "@/services/municipalListings";
/**
 * useNotifications — deriva notificaciones a partir de las noticias
 * municipales (`/api/v1/news`).
 *
 * Regla de lectura:
 *  - Si el usuario nunca ha abierto el panel (`notificationsLastSeenAt`
 *    es null) y hay noticias → todas se consideran no leídas.
 *  - Si sí lo ha abierto, una noticia es no leída cuando
 *    `fechaPublicacion > notificationsLastSeenAt`.
 *  - Al abrir el panel se llama a `markAllSeen()` que actualiza el
 *    timestamp a `now()` en el store persistido.
 */
import { useMemo } from "react";

import { useAppStore } from "@/stores/useAppStore";

import { type Noticia } from "@/services/newsApi";

export interface NotificationItem {
  noticia: Noticia;
  read: boolean;
}

const DEFAULT_CITY = "Malgrat de Mar";

export const useNotifications = () => {
  const { town: city } = useLocationContext();
  const lastSeenAt = useAppStore(s => s.notificationsLastSeenAt);
  const markNotificationsSeen = useAppStore(s => s.markNotificationsSeen);
  const query = useQuery({ queryKey: ["municipal-news", city], queryFn: () => listMunicipalNews({ city }), staleTime: 300000 });
  const items = useMemo<NotificationItem[]>(() => (query.data ?? []).map(noticia => ({ noticia, read: lastSeenAt !== null && (!noticia.fechaPublicacion || new Date(noticia.fechaPublicacion).getTime() <= new Date(lastSeenAt).getTime()) })), [query.data, lastSeenAt]);
  return { items, hasUnread: items.some(item => !item.read), loading: query.isLoading, error: query.error ? "news_error" : null,
    reload: () => { void query.refetch(); }, markAllSeen: markNotificationsSeen, markAllRead: markNotificationsSeen };
};
