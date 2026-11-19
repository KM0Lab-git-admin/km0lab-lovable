/**
 * usePublicRewards — premios públicos activos desde la API real
 * (api.uat.km0lab.com vía proxy `rewards-api`), filtrados por el CP del
 * usuario cuando existe. React Query: cache 5 min por CP+idioma.
 */
import { useQuery } from "@tanstack/react-query";
import { listPublicRewards, type ApiReward } from "@/services/rewardsApi";
import { useLocationContext } from "@/hooks/use-location-context";
import { useLang } from "@/contexts/LangContext";

const DEFAULT_POSTAL_CODE = "08380";

export function usePublicRewards(): {
  rewards: ApiReward[];
  loading: boolean;
  error: boolean;
  reload: () => void;
} {
  const { postalCode } = useLocationContext();
  const { lang } = useLang();

  const query = useQuery({
    queryKey: ["public-rewards", postalCode, lang],
    queryFn: () => listPublicRewards({ postalCode, lang }),
    staleTime: 5 * 60 * 1000,
  });

  return {
    rewards: query.data ?? [],
    loading: query.isLoading,
    error: query.isError,
    reload: () => { void query.refetch(); },
  };
}
