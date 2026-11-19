import { useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { AccountAccessTarget } from "@/components/AccountAccessSheet";
import type { HomeTab } from "@/components/BottomTabs";
import { useLang } from "@/contexts/LangContext";
import { t } from "@/lib/i18n";
import { requestOtp } from "@/services/mock/auth";
import { useAppStore } from "@/stores/useAppStore";

const DESTINATIONS: Record<AccountAccessTarget, string> = {
  points: "/points-history",
  rewards: "/redeemed-rewards",
  profile: "/profile",
};

export function useAccountAccess(isAuthed: boolean) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { lang } = useLang();
  const [target, setTarget] = useState<AccountAccessTarget | null>(() => {
    const access = searchParams.get("access");
    return !isAuthed && (access === "points" || access === "rewards" || access === "profile") ? access : null;
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const busy = useRef(false);
  const requestVersion = useRef(0);

  const close = () => {
    requestVersion.current += 1;
    busy.current = false;
    setSubmitting(false);
    setError(null);
    setTarget(null);
    if (searchParams.has("access")) {
      const next = new URLSearchParams(searchParams);
      next.delete("access");
      setSearchParams(next, { replace: true });
    }
  };

  const open = (tab?: HomeTab) => {
    if (tab !== "puntos" && tab !== "rewards" && tab !== "perfil") {
      navigate("/login");
      return;
    }
    setError(null);
    setTarget(tab === "puntos" ? "points" : tab === "perfil" ? "profile" : "rewards");
  };

  const continueWithEmail = async (email: string) => {
    if (!target || isAuthed || busy.current) return;
    busy.current = true;
    const version = ++requestVersion.current;
    const returnTo = DESTINATIONS[target];
    setSubmitting(true);
    setError(null);
    try {
      const { postalCode, town } = useAppStore.getState();
      const result = await requestOtp(email, {
        postal_code: postalCode ?? undefined,
        town: town ?? undefined,
      });
      if (version !== requestVersion.current) return;
      if (result.error) {
        setError(t("login.error_email", lang));
        return;
      }
      navigate("/check-email", { state: { email, mode: "signup", returnTo } });
    } catch {
      if (version === requestVersion.current) setError(t("login.error_email", lang));
    } finally {
      if (version === requestVersion.current) {
        busy.current = false;
        setSubmitting(false);
      }
    }
  };

  const login = () => {
    if (target) navigate(`/login?returnTo=${encodeURIComponent(DESTINATIONS[target])}`);
  };

  return { target: isAuthed ? null : target, submitting, error, open, close, continueWithEmail, login };
}