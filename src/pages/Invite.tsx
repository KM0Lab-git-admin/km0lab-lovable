import { useMemo, useState } from "react";
import { AlertCircle, Building2, ChevronLeft, Copy, Loader2, QrCode, RefreshCw, Send, UserRound } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import DeviceShell from "@/components/DeviceShell";
import BottomTabs from "@/components/BottomTabs";
import InviteQrDialog from "@/components/InviteQrDialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useLang } from "@/contexts/LangContext";
import { buildInviteLink, buildPublicShareLink, getOrCreateReferralReference, INVITE_REWARDS, type InviteKind } from "@/data/inviteConfig";
import { useShareLink } from "@/hooks/useShareLink";
import { useAppStore } from "@/stores/useAppStore";
import { cn } from "@/lib/utils";
import { t } from "@/lib/i18n";

const Invite = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { lang } = useLang();
  const town = useAppStore((state) => state.town);
  const [kind, setKind] = useState<InviteKind>("person");
  const [qrOpen, setQrOpen] = useState(false);
  const forcedState = searchParams.get("state");
  const isAuthed = Boolean(user);

  const link = useMemo(() => {
    if (typeof window === "undefined") return "";
    if (!isAuthed) return buildPublicShareLink(town);
    return buildInviteLink({ kind, reference: getOrCreateReferralReference(), town });
  }, [isAuthed, kind, town]);

  const shareText = t(
    isAuthed ? (kind === "person" ? "invite.share.person_text" : "invite.share.business_text") : "share.public_text",
    lang,
  ).replace("{link}", link);

  const { manualCopy, linkRef, copyLink, share } = useShareLink({
    link,
    text: shareText,
    title: t(isAuthed ? "invite.title" : "share.title", lang),
  });

  return (
    <DeviceShell>
      <div className="flex h-full w-full justify-center overflow-hidden bg-km0-beige-50">
        <div className="relative flex h-full w-full max-w-[430px] flex-col overflow-hidden bg-km0-beige-50">
          <header className="shrink-0 border-b border-km0-blue-100 bg-card px-3 pb-3 pt-4">
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="icon" onClick={() => navigate(-1)} aria-label={t("common.back", lang)} className="shrink-0 rounded-xl border-km0-blue-100">
                <ChevronLeft aria-hidden />
              </Button>
              <div className="min-w-0 flex-1">
                <h1 className="font-brand text-xl font-black text-km0-blue-900">{t(isAuthed ? "invite.title" : "share.title", lang)}</h1>
                <p className="font-body text-xs text-km0-blue-800/65">{t(isAuthed ? "invite.subtitle" : "share.home.description", lang)}</p>
              </div>
            </div>
          </header>

          <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 py-4">
            {forcedState === "loading" ? (
              <div className="flex min-h-full items-center justify-center"><Loader2 className="animate-spin text-km0-blue-700" aria-label={t("common.loading", lang)} /></div>
            ) : forcedState === "empty" ? (
              <section className="flex min-h-full flex-col items-center justify-center text-center"><h2 className="font-brand text-xl font-black text-km0-blue-900">{t("invite.empty.title", lang)}</h2><p className="mt-2 font-body text-sm text-km0-blue-800/70">{t("invite.empty.description", lang)}</p></section>
            ) : forcedState === "error" ? (
              <section className="flex min-h-full flex-col items-center justify-center text-center"><AlertCircle className="text-km0-coral-400" size={40} aria-hidden /><h2 className="mt-3 font-brand text-xl font-black text-km0-blue-900">{t("invite.error.title", lang)}</h2><p className="mt-2 font-body text-sm text-km0-blue-800/70">{t("invite.error.description", lang)}</p><Button type="button" variant="outline" onClick={() => navigate("/invite", { replace: true })} className="mt-4"><RefreshCw aria-hidden />{t("invite.error.retry", lang)}</Button></section>
            ) : (
              <div className="flex flex-col gap-6">
                {isAuthed && (
                <div className="grid grid-cols-1 gap-3" role="radiogroup" aria-label={t("invite.title", lang)}>
                  {(["person", "business"] as const).map((option) => {
                    const selected = kind === option;
                    const Icon = option === "person" ? UserRound : Building2;
                    return (
                      <Button
                        key={option}
                        type="button"
                        variant="outline"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => setKind(option)}
                        className={cn(
                          "flex h-auto w-full items-start gap-3 whitespace-normal rounded-2xl border-2 bg-card p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          selected ? "border-km0-yellow-400" : "border-km0-blue-100",
                        )}
                      >
                        <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", selected ? "bg-km0-yellow-100 text-km0-blue-900" : "bg-km0-blue-50 text-km0-blue-700")}>
                          <Icon aria-hidden size={20} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-start justify-between gap-2">
                            <span className="font-ui text-sm font-bold text-km0-blue-900">{t(`invite.${option}.title`, lang)}</span>
                            <span className="shrink-0 rounded-full bg-km0-teal-100 px-2 py-1 font-ui text-xs font-black text-km0-teal-700">+{INVITE_REWARDS[option]} {t("common.points", lang)}</span>
                          </span>
                          <span className="mt-1 block font-body text-xs leading-snug text-km0-blue-800/65">{t(`invite.${option}.description`, lang)}</span>
                        </span>
                      </Button>
                    );
                  })}
                </div>
                )}

                <section className="rounded-2xl border border-km0-blue-100 bg-card p-4 shadow-sm">
                  <h2 className="font-brand text-lg font-black text-km0-blue-900">{t(!isAuthed ? "share.title" : kind === "person" ? "invite.share.person_title" : "invite.share.business_title", lang)}</h2>
                  <p className="mt-1 font-body text-xs text-km0-blue-800/65">{t(isAuthed ? "invite.share.explanation" : "share.home.description", lang)}</p>
                  <Button type="button" onClick={() => void share()} className="mt-4 w-full bg-km0-yellow-400 font-ui font-bold text-km0-blue-900 hover:bg-km0-yellow-500">
                    <Send aria-hidden />{t(isAuthed ? "invite.share.cta" : "share.cta", lang)}
                  </Button>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <Button type="button" variant="outline" onClick={() => void copyLink()} className="border-km0-blue-100 font-ui font-bold text-km0-blue-800">
                      <Copy aria-hidden />{t(isAuthed ? "invite.share.copy" : "share.copy", lang)}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setQrOpen(true)} className="border-km0-blue-100 font-ui font-bold text-km0-blue-800">
                      <QrCode aria-hidden />{t(isAuthed ? "invite.share.qr" : "share.qr", lang)}
                    </Button>
                  </div>
                  {manualCopy && (
                    <label className="mt-3 block font-ui text-xs font-bold text-km0-blue-800">
                      {t("invite.copy_failed", lang)}
                      <textarea ref={linkRef} readOnly rows={2} value={link} onFocus={(event) => event.currentTarget.select()} className="mt-1 w-full resize-none break-all rounded-lg border border-km0-blue-200 bg-background px-3 py-2 font-body text-xs leading-snug text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                    </label>
                  )}
                </section>

                {!isAuthed && (
                  <section className="rounded-2xl border border-km0-blue-100 bg-km0-beige-100 p-4">
                    <h2 className="font-brand text-base font-black text-km0-blue-900">{t("share.points_block.title", lang)}</h2>
                    <p className="mt-1 font-body text-xs leading-snug text-km0-blue-800/70">{t("share.points_block.description", lang)}</p>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <Button type="button" onClick={() => navigate("/login?returnTo=%2Finvite")} className="bg-km0-yellow-400 font-ui text-xs font-bold text-km0-blue-900 hover:bg-km0-yellow-500">
                        {t("share.login", lang)}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => navigate("/login?returnTo=%2Finvite")} className="border-km0-blue-100 font-ui text-xs font-bold text-km0-blue-800">
                        {t("share.create_account", lang)}
                      </Button>
                    </div>
                  </section>
                )}
              </div>
            )}
          </main>

          <BottomTabs activeTab="actions" isAuthed={isAuthed} onLogin={() => navigate("/login?returnTo=%2Finvite")} onHome={() => navigate("/home")} onProfile={() => navigate("/profile")} onPoints={() => navigate("/points-history")} onRewards={() => navigate("/redeemed-rewards")} onActions={() => navigate("/points-actions")} />
          <InviteQrDialog open={qrOpen} onOpenChange={setQrOpen} link={link} onCopy={() => void copyLink()} titleKey={isAuthed ? "invite.qr.title" : "share.qr.title"} />
        </div>
      </div>
    </DeviceShell>
  );
};

export default Invite;
