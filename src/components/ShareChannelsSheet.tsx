import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Copy, Mail, MessageCircle, Share2, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { useShareLink } from "@/hooks/useShareLink";
import { useLang } from "@/contexts/LangContext";
import { useAppStore } from "@/stores/useAppStore";
import { buildPublicShareLink } from "@/data/inviteConfig";
import { t } from "@/lib/i18n";

interface ShareChannelsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Ruta a la que volver tras iniciar sesión o crear cuenta. */
  returnTo: string;
}

interface Channel {
  id: string;
  label: string;
  icon: typeof MessageCircle;
  onSelect: () => void;
}

const ShareChannelsSheet = ({ open, onOpenChange, returnTo }: ShareChannelsSheetProps) => {
  const { lang } = useLang();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const town = useAppStore((state) => state.town);

  const townLabel = town ?? t("share.town_fallback", lang);
  const link = useMemo(() => (typeof window === "undefined" ? "" : buildPublicShareLink(town, lang)), [town, lang]);
  const message = t("share.message", lang).replace("{town}", townLabel).replace("{link}", link);
  const subject = t("share.email_subject", lang).replace("{town}", townLabel);

  const { manualCopy, linkRef, copyLink, share } = useShareLink({
    link,
    text: message,
    title: t("share.title", lang),
  });

  const openExternal = (url: string): void => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const hasNativeShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  const channels: Channel[] = [
    {
      id: "whatsapp",
      label: t("share.channel.whatsapp", lang),
      icon: MessageCircle,
      onSelect: () => openExternal(`https://wa.me/?text=${encodeURIComponent(message)}`),
    },
    {
      id: "email",
      label: t("share.channel.email", lang),
      icon: Mail,
      onSelect: () => {
        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
      },
    },
    {
      id: "facebook",
      label: t("share.channel.facebook", lang),
      icon: ThumbsUp,
      onSelect: () => openExternal(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`),
    },
    ...(hasNativeShare
      ? [
          {
            id: "more",
            label: t("share.channel.more", lang),
            icon: Share2,
            onSelect: () => void share(),
          },
        ]
      : []),
  ];

  const goToAuth = (): void => {
    onOpenChange(false);
    navigate(`/login?returnTo=${encodeURIComponent(returnTo)}`);
  };

  const body = (
    <div className="px-4 pb-6">
      <p className="rounded-xl bg-km0-beige-100 px-3 py-3 font-body text-xs leading-snug text-km0-blue-800/80">
        {t("share.panel.notice", lang)}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
        <button
          type="button"
          onClick={goToAuth}
          className="font-ui text-xs font-bold text-km0-blue-700 underline underline-offset-2"
        >
          {t("share.create_account", lang)}
        </button>
        <button
          type="button"
          onClick={goToAuth}
          className="font-ui text-xs font-bold text-km0-blue-800/70 underline underline-offset-2"
        >
          {t("share.login", lang)}
        </button>
      </div>

      <h3 className="mt-5 font-ui text-sm font-bold text-km0-blue-900">{t("share.panel.how", lang)}</h3>
      <ul className="mt-2 flex flex-col gap-2">
        {channels.map((channel) => (
          <li key={channel.id}>
            <Button
              type="button"
              variant="outline"
              onClick={channel.onSelect}
              className="h-12 w-full justify-start gap-3 rounded-xl border-km0-blue-100 font-ui text-sm font-bold text-km0-blue-800"
            >
              <channel.icon aria-hidden size={18} />
              {channel.label}
            </Button>
          </li>
        ))}
      </ul>

      <Button
        type="button"
        variant="ghost"
        onClick={() => void copyLink()}
        className="mt-3 h-11 w-full justify-start gap-3 rounded-xl font-ui text-sm font-bold text-km0-blue-700"
      >
        <Copy aria-hidden size={18} />
        {t("share.copy", lang)}
      </Button>

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
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[92vh] overflow-y-auto bg-card">
          <DrawerHeader className="text-left">
            <DrawerTitle className="font-brand text-lg font-black text-km0-blue-900">
              {t("share.title", lang)}
            </DrawerTitle>
            <DrawerDescription className="font-body text-xs text-km0-blue-800/70">
              {t("share.home.description", lang)}
            </DrawerDescription>
          </DrawerHeader>
          {body}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] gap-0 overflow-y-auto bg-card p-0 sm:max-w-[420px]">
        <DialogHeader className="px-4 pb-2 pt-5 text-left">
          <DialogTitle className="font-brand text-lg font-black text-km0-blue-900">{t("share.title", lang)}</DialogTitle>
          <DialogDescription className="font-body text-xs text-km0-blue-800/70">
            {t("share.home.description", lang)}
          </DialogDescription>
        </DialogHeader>
        {body}
      </DialogContent>
    </Dialog>
  );
};

export default ShareChannelsSheet;
