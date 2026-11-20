/** Neutral profile seam. This implementation only updates the local prototype store. */
import { updateProfile as updateLocalProfile } from "@/services/mock/profile";
import type { AppProfile } from "@/stores/useAppStore";

export function updateProfile(userId: string, patch: Partial<AppProfile>): Promise<{ error: { message: string } | null }> {
  return updateLocalProfile(userId, patch);
}
