import { useTerritory } from "@/hooks/use-territory";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { listShops } from "@/services/shops";
import type { CategoriaAdherit, ComercAdherit } from "@/types/comercAdherit";

export function useShops(): { shops: ComercAdherit[]; categories: CategoriaAdherit[]; loading: boolean; error: string | null; reload: () => void } {
  const [params, setParams] = useSearchParams();
  const forced = params.get("state");
  const location = useTerritory();
  const query = useQuery({ queryKey: ["shops", location.territory?.scopeId], queryFn: () => listShops(location.territory), enabled: !location.loading && !location.error && forced !== "loading" && forced !== "error" });
  return {
    shops: forced === "empty" ? [] : query.data?.shops ?? [],
    categories: query.data?.categories ?? [],
    loading: forced !== "error" && (forced === "loading" || location.loading || (!location.error && query.isLoading)),
    error: forced === "error" ? "FORCED_ERROR" : location.error ?? query.error?.message ?? null,
    reload: () => {
      if (forced) { const next = new URLSearchParams(params); next.delete("state"); setParams(next, { replace: true }); }
      else if (location.error) location.reload();
      else void query.refetch();
    },
  };
}