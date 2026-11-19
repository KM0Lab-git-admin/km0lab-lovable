import { POINTS_ACTIONS } from "@/data/pointsActions";
import type { PointsActionsResult } from "@/hooks/use-points-actions";

export function useHomeActions(): PointsActionsResult {
  // Preserve the immediate Home examples; filtering belongs to its presentation.
  return { actions: POINTS_ACTIONS, loading: false, error: null, reload: () => {} };
}