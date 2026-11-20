import { useMemo, useState } from "react";
import { getReferralReferenceForUser } from "@/data/inviteConfig";
import { getCanonicalWebLink, getShareLink } from "@/lib/shareUrl";
import { useAppStore } from "@/stores/useAppStore";
import type { InvitationKind } from "@/types/invitation";

interface InviteLinkResult {
  link: string | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

/** Local referral implementation; production supplies the same neutral contract. */
export function useInviteLink(kind: InvitationKind): InviteLinkResult {
  const sessionUserId = useAppStore(state => state.session?.user.id);
  const town = useAppStore(state => state.town) ?? "Malgrat de Mar";
  const lang = useAppStore(state => state.lang);
  const [revision, setRevision] = useState(0);
  const result = useMemo(() => {
    try {
      if (typeof window === "undefined") return { link: null, error: null };
      const userId = sessionUserId ?? (sessionStorage.getItem("km0_preview_authed") === "1" ? "preview-user" : null);
      const link = userId
        ? getCanonicalWebLink(kind === "person" ? "/home" : "/business-signup", {
            invite: kind, ref: getReferralReferenceForUser(userId), town, lang,
          })
        : getShareLink("/home", { town, lang });
      return { link, error: null };
    } catch (error: unknown) {
      return { link: null, error: error instanceof Error ? error.message : "INVITE_LINK_ERROR" };
    }
  }, [sessionUserId, kind, town, lang, revision]);
  return { ...result, loading: false, reload: () => setRevision(value => value + 1) };
}