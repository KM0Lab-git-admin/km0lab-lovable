import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { getShop } from "@/services/shops";
import type { ComercDetall } from "@/types/comercAdherit";

export function useShop(id: string): { shop: ComercDetall | null; loading: boolean; error: string | null; reload: () => void } {
  const [params, setParams] = useSearchParams();
  const forced = params.get("state");
  const query = useQuery({ queryKey: ["shop", id], queryFn: () => getShop(id), enabled: Boolean(id) && forced !== "loading" && forced !== "error" });
  return {
    shop: forced === "empty" ? null : query.data ?? null,
    loading: forced !== "error" && (forced === "loading" || (Boolean(id) && query.isLoading)),
    error: forced === "error" ? "FORCED_ERROR" : query.error?.message ?? null,
    reload: () => {
      if (forced) { const next = new URLSearchParams(params); next.delete("state"); setParams(next, { replace: true }); }
      else void query.refetch();
    },
  };
}