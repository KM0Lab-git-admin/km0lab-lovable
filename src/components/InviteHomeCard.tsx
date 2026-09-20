import { useMemo, useState } from "react";
import { Copy, QrCode, Share2 } from "lucide-react";
import InviteQrDialog from "@/components/InviteQrDialog";
import { Button } from "@/components/ui/button";
import { useLang } from "@/contexts/LangContext";
import { useShareLink } from "@/hooks/useShareLink";
import { buildPublicShareLink, INVITE_REWARDS } from "@/data/inviteConfig";
import { useAppStore } from "@/stores/useAppStore";
import { t } from "@/lib/i18n";

interface InviteHomeCardProps {
  isAuthed: boolean;
  onInvite: () => void;
  onLogin: () => void;
  onCreateAccount: () => void;
}

const InviteHomeCard = ({ isAuthed, onInvite, onLogin, onCreateAccount }: InviteHomeCardProps) => {
  const { lang } = useLang();
  const town = useAppStore((state) => state.town);
  const [qrOpen, setQrOpen] = useState(false);

  const link = useMemo(() => (typeof window === "undefined" ? "" : buildPublicShareLink(town)), [town]);
  const shareText = t("share.public_text", lang).replace("{link}", link);
  const { manualCopy, linkRef, copyLink, share } = useShareLink({
    link,
    text: shareText,
    title: t("share.title", lang),
  });

  return (
    <section className="rounded-2xl border border-km0-blue-100 bg-card px-4 py-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-km0-teal-100 text-km0-teal-700">
          <Share2 aria-hidden size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-brand text-base font-black text-km0-blue-900">
            {t(isAuthed ? "invite.home.title" : "share.title", lang)}
          </h2>
          <p className="mt-1 font-body text-xs leading-snug text-km0-blue-800/70">
            {t(isAuthed ? "invite.home.description_authed" : "share.home.description", lang)}
          </p>
        </div>
      </div>

      {isAuthed ? (
        <>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <span className="rounded-lg bg-km0-yellow-100 px-2 py-1.5 text-center font-ui text-[11px] font-bold text-km0-blue-900">
              {t("invite.person.short", lang)} · +{INVITE_REWARDS.person} {t("common.points", lang)}
            </span>
            <span className="rounded-lg bg-km0-teal-100 px-2 py-1.5 text-center font-ui text-[11px] font-bold text-km0-blue-900">
              {t("invite.business.short", lang)} · +{INVITE_REWARDS.business} {t("common.points", lang)}
            </span>
          </div>
          <Button
            type="button"
            onClick={onInvite}
            className="mt-3 w-full bg-km0-yellow-400 font-ui font-bold text-km0-blue-900 hover:bg-km0-yellow-500"
          >
            {t("invite.home.cta", lang)}
          </Button>
          <p className="mt-2 text-center font-body text-[11px] text-km0-blue-800/60">{t("invite.home.note", lang)}</p>
        </>
      ) : (
        <>
          <Button
            type="button"
            onClick={() => void share()}
            className="mt-3 w-full bg-km0-yellow-400 font-ui font-bold text-km0-blue-900 hover:bg-km0-yellow-500"
          >
            <Share2 aria-hidden />
            {t("share.cta", lang)}
          </Button>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => void copyLink()}
              className="border-km0-blue-100 font-ui text-xs font-bold text-km0-blue-800"
            >
              <Copy aria-hidden />
              {t("share.copy", lang)}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setQrOpen(true)}
              className="border-km0-blue-100 font-ui text-xs font-bold text-km0-blue-800"
            >
              <QrCode aria-hidden />
              {t("share.qr", lang)}
            </Button>
          </div>
          {manualCopy && (
            <label className="mt-3 block font-ui text-xs font-bold text-km0-blue-800">
              {t("invite.copy_failed", lang)}
              <textarea
                ref={linkRef}
                readOnly
                rows={2}
                value={link}
                onFocus={(event) => event.currentTarget.select()}
                className="mt-1 w-full resize-none break-all rounded-lg border border-km0-blue-200 bg-background px-3 py-2 font-body text-xs leading-snug text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </label>
          )}
          <p className="mt-3 font-body text-[11px] text-km0-blue-800/60">{t("share.points_question", lang)}</p>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
            <button
              type="button"
              onClick={onCreateAccount}
              className="font-ui text-xs font-bold text-km0-blue-700 underline underline-offset-2"
            >
              {t("share.create_account", lang)}
            </button>
            <button
              type="button"
              onClick={onLogin}
              className="font-ui text-xs font-bold text-km0-blue-800/70 underline underline-offset-2"
            >
              {t("share.login", lang)}
            </button>
          </div>
          <InviteQrDialog
            open={qrOpen}
            onOpenChange={setQrOpen}
            link={link}
            onCopy={() => void copyLink()}
            titleKey="share.qr.title"
          />
        </>
      )}
    </section>
  );
};

export default InviteHomeCard;
