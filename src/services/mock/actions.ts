import { POINTS_ACTIONS } from "@/data/pointsActions";
import type { PointAction } from "@/types/points";
export async function listMockActions(): Promise<PointAction[]> {
  await new Promise(resolve => setTimeout(resolve, 150));
  return POINTS_ACTIONS;
}
