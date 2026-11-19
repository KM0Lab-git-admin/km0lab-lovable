import { MOCK_POINTS } from "@/data/mockPointsConfig";

export function usePointsConfig(): { signup: number; birthday: number; scan: number } {
  return { signup: MOCK_POINTS.signup, birthday: MOCK_POINTS.birthday, scan: MOCK_POINTS.scan };
}