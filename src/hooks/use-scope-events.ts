import { useQuery } from "@tanstack/react-query";
import { useTerritory } from "@/hooks/use-territory";
import { listScopeEvents } from "@/services/municipalListings";
import type { ListEventsParams, AgendaEvent } from "@/services/eventsApi";
import type { ScopeListing } from "@/types/territory";

export function useScopeEvents(params: Omit<ListEventsParams, "poblacion"> = {}) {
  const { territory, loading: territoryLoading, error: territoryError, reload: reloadTerritory } = useTerritory();
  const query = useQuery<ScopeListing<AgendaEvent>>({
    queryKey: ["scope-events", territory?.scopeId, territory?.homeTownId, territory?.towns.map(town => town.id), params],
    queryFn: () => territory ? listScopeEvents(territory, params) : Promise.resolve({ home: [], nearby: [], failedTownIds: [] }),
    enabled: territory !== null,
    staleTime: 300000,
  });
  return {
    home: query.data?.home ?? [], nearby: query.data?.nearby ?? [], failedTownIds: query.data?.failedTownIds ?? [],
    loading: territoryLoading || (territory !== null && query.isLoading), error: territoryError ?? query.error?.message ?? null,
    reload: () => { if (territoryError !== null) reloadTerritory(); else void query.refetch(); },
  };
}
