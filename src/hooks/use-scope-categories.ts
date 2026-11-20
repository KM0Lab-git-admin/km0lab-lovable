import { useQuery } from "@tanstack/react-query";
import { useTerritory } from "@/hooks/use-territory";
import { listScopeCategories } from "@/services/territoryCategories";

export function useScopeCategories() {
  const { territory, loading, error, reload } = useTerritory();
  const query = useQuery({
    queryKey: ["scope-categories", territory?.scopeId, territory?.towns.map(town => town.id)],
    queryFn: () => territory ? listScopeCategories(territory) : Promise.resolve([]),
    enabled: territory !== null,
    staleTime: 300000,
  });
  return {
    categories: query.data ?? [], loading: loading || (territory !== null && query.isLoading),
    error: error ?? query.error?.message ?? null,
    reload: () => { if (error) reload(); else void query.refetch(); },
  };
}