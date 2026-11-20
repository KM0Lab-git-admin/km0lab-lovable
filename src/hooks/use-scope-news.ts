import { useQuery } from "@tanstack/react-query";
import { useTerritory } from "@/hooks/use-territory";
import { listScopeNews } from "@/services/municipalListings";
import type { ListNewsParams } from "@/services/newsApi";

export function useScopeNews(params: Omit<ListNewsParams, "city"> = {}) {
  const { territory, loading: territoryLoading, error: territoryError, reload: reloadTerritory } = useTerritory();
  const query = useQuery({
    queryKey: ["scope-news", territory?.scopeId, territory?.homeTownId, territory?.towns.map(town => town.id), params],
    queryFn: () => territory ? listScopeNews(territory, params) : Promise.resolve({ home: [], nearby: [], failedTownIds: [] }),
    enabled: territory !== null,
    staleTime: 300000,
  });
  return {
    home: query.data?.home ?? [], nearby: query.data?.nearby ?? [], failedTownIds: query.data?.failedTownIds ?? [],
    loading: territoryLoading || query.isLoading, error: territoryError || query.isError,
    reload: () => { if (territoryError) reloadTerritory(); else void query.refetch(); },
  };
}
