import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { fetchInvitations, summarizeInvitations, type InvitationsVariant } from "@/services/mock/invitations";
import type { InvitationRecord, InvitationsSummary } from "@/types/invitation";

export function useInvitations(): { records: InvitationRecord[]; summary: InvitationsSummary; loading: boolean; error: string | null; reload: () => void } {
  const [params, setParams] = useSearchParams();
  const forced = params.get("state");
  const variant: InvitationsVariant = forced === "empty" ? "empty" : forced === "pending" ? "pending" : "default";
  const query = useQuery({
    queryKey: ["invitations", variant],
    queryFn: () => fetchInvitations(variant),
    enabled: forced !== "loading" && forced !== "error",
  });
  const records = query.data ?? [];
  return {
    records,
    summary: summarizeInvitations(records),
    loading: forced !== "error" && (forced === "loading" || query.isLoading),
    error: forced === "error" ? "FORCED_ERROR" : query.error?.message ?? null,
    reload: () => {
      if (forced === "error" || forced === "loading") {
        const next = new URLSearchParams(params);
        next.delete("state");
        setParams(next, { replace: true });
      } else {
        void query.refetch();
      }
    },
  };
}