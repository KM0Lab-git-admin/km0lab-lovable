import { useQuery } from "@tanstack/react-query";
import { listMockActions } from "@/services/mock/actions";
import type { PointAction } from "@/types/points";

export interface PointsActionsResult {
  actions: PointAction[];
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export function usePointsActions(): PointsActionsResult {
  const query = useQuery({ queryKey: ["mock-actions"], queryFn: listMockActions, staleTime: Infinity });
  return {
    actions: query.data ?? [],
    loading: query.isLoading,
    error: query.error?.message ?? null,
    reload: () => { void query.refetch(); },
  };
}