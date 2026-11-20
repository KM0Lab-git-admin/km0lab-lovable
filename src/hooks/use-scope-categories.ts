import { useContentSource } from "@/hooks/use-preview-state";
import { useQuery } from "@tanstack/react-query";
import { useTerritory } from "@/hooks/use-territory";
import { listScopeCategories } from "@/services/territoryCategories";

export function useScopeCategories() {
  const source = useContentSource();
  const { territory, loading, error, reload } = useTerritory();
  const query = useQuery({
    queryKey: ["scope-categories", territory?.scopeId, territory?.towns.map(town => town.id), source],
    queryFn: () => territory ? listScopeCategories(territory, source) : Promise.resolve([]),
    enabled: territory !== null,
    staleTime: 300000,
  });
  return {
    categories: query.data ?? [], loading: loading || (territory !== null && query.isLoading),
    error: error ?? query.error?.message ?? null,
    reload: () => { if (error) reload(); else void query.refetch(); },
  };
}