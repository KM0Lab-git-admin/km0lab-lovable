import { useQuery } from "@tanstack/react-query";
import { useLocationContext } from "@/hooks/use-location-context";
import { getTerritory, resolveTerritory } from "@/services/territory";
import { useAppStore } from "@/stores/useAppStore";
import type { Town } from "@/types/territory";

export function useTerritory() {
  const { postalCode } = useLocationContext();
  const query = useQuery({ queryKey: ["territory", postalCode], queryFn: () => getTerritory(postalCode), placeholderData: () => resolveTerritory(postalCode), staleTime: Infinity, refetchOnMount: "always" });
  const territory = query.data ?? null;
  const homeTown = territory?.towns.find(town => town.id === territory.homeTownId) ?? null;
  const nearbyTowns = territory?.towns.filter(town => town.id !== territory.homeTownId) ?? [];
  return {
    territory, homeTown, nearbyTowns, isGrouped: nearbyTowns.length > 0,
    loading: query.isLoading, error: query.error?.message ?? null, reload: () => { void query.refetch(); },
  };
}

/** Territory for a postal code that is not stored yet (postal code confirmation). */
export function useTerritoryFor(postalCode: string | null) {
  const query = useQuery({ queryKey: ["territory", postalCode], queryFn: () => getTerritory(postalCode ?? ""), placeholderData: () => postalCode ? resolveTerritory(postalCode) : null, enabled: postalCode !== null, staleTime: Infinity, refetchOnMount: "always" });
  const territory = query.data ?? null;
  return {
    territory, homeTown: territory?.towns.find(town => town.id === territory.homeTownId) ?? null,
    nearbyTowns: territory?.towns.filter(town => town.id !== territory.homeTownId) ?? [],
    loading: query.isLoading && postalCode !== null, error: query.error?.message ?? null, reload: () => { void query.refetch(); },
  };
}

/** Changes the home town through the existing location store; balance and account stay untouched. */
export function useSetHomeTown(): (town: Town) => void {
  const setLocation = useAppStore(s => s.setLocation);
  return town => setLocation(town.postalCodes[0] ?? null, town.name);
}
