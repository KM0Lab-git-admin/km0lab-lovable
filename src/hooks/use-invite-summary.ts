import { INVITATIONS_MOCK_SUMMARY } from "@/services/mock/invitations";
import type { InvitationsSummary } from "@/types/invitation";

export function useInviteSummary(): { summary: InvitationsSummary; loading: boolean; error: string | null; reload: () => void } {
  return { summary: INVITATIONS_MOCK_SUMMARY, loading: false, error: null, reload: () => {} };
}