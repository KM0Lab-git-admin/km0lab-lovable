import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/contexts/LangContext";
import { INVITE_REWARDS } from "@/data/inviteConfig";
import { t } from "@/lib/i18n";

interface InviteHomeCardProps {
  onInvite: () => void;
}

const InviteHomeCard = ({ onInvite }: InviteHomeCardProps) => {
  const { lang } = useLang();

  return (
    <section className="rounded-2xl border border-km0-blue-100 bg-card px-4 py-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-km0-teal-100 text-km0-teal-700">
          <Share2 aria-hidden size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-brand text-base font-black text-km0-blue-900">{t("invite.home.title", lang)}</h2>
          <p className="mt-1 font-body text-xs leading-snug text-km0-blue-800/70">{t("invite.home.description", lang)}</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <span className="rounded-lg bg-km0-yellow-100 px-2 py-1.5 text-center font-ui text-[11px] font-bold text-km0-blue-900">
          {t("invite.person.short", lang)} · +{INVITE_REWARDS.person} {t("common.points", lang)}
        </span>
        <span className="rounded-lg bg-km0-teal-100 px-2 py-1.5 text-center font-ui text-[11px] font-bold text-km0-blue-900">
          {t("invite.business.short", lang)} · +{INVITE_REWARDS.business} {t("common.points", lang)}
        </span>
      </div>
      <Button type="button" onClick={onInvite} className="mt-3 w-full bg-km0-yellow-400 font-ui font-bold text-km0-blue-900 hover:bg-km0-yellow-500">
        {t("invite.home.cta", lang)}
      </Button>
      <p className="mt-2 text-center font-body text-[11px] text-km0-blue-800/60">{t("invite.home.note", lang)}</p>
    </section>
  );
};

export default InviteHomeCard;
