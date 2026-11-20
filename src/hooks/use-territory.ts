import { useQuery } from "@tanstack/react-query";
import { useLocationContext } from "@/hooks/use-location-context";
import { getTerritory } from "@/services/territory";

export function useTerritory() {
  const { postalCode } = useLocationContext();
  const query = useQuery({ queryKey: ["territory", postalCode], queryFn: () => getTerritory(postalCode), staleTime: Infinity });
  const territory = query.data ?? null;
  const homeTown = territory?.towns.find(town => town.id === territory.homeTownId) ?? null;
  const nearbyTowns = territory?.towns.filter(town => town.id !== territory.homeTownId) ?? [];
  return {
    territory, homeTown, nearbyTowns, isGrouped: nearbyTowns.length > 0,
    loading: query.isLoading, error: query.isError, reload: () => { void query.refetch(); },
  };
}
