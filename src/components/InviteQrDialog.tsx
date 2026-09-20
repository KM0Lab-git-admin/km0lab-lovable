import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Copy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLang } from "@/contexts/LangContext";
import { t } from "@/lib/i18n";

interface InviteQrDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  link: string;
  onCopy: () => void;
  titleKey?: string;
}

const InviteQrDialog = ({ open, onOpenChange, link, onCopy, titleKey = "invite.qr.title" }: InviteQrDialogProps) => {
  const { lang } = useLang();
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let active = true;
    setQrDataUrl(null);
    void QRCode.toDataURL(link, { width: 256, margin: 2, errorCorrectionLevel: "M" }).then((value) => {
      if (active) setQrDataUrl(value);
    });
    return () => {
      active = false;
    };
  }, [link, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-sm rounded-2xl border-km0-blue-100 bg-card p-5">
        <DialogHeader className="text-left">
          <DialogTitle className="font-brand text-xl text-km0-blue-900">{t(titleKey, lang)}</DialogTitle>
          <DialogDescription className="font-body text-xs text-km0-blue-800/70">{t("invite.qr.description", lang)}</DialogDescription>
        </DialogHeader>
        <div className="flex aspect-square w-full items-center justify-center rounded-xl border border-km0-blue-100 bg-background p-4">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt={t("invite.qr.title", lang)} className="h-full w-full object-contain" />
          ) : (
            <Loader2 className="animate-spin text-km0-blue-700" aria-label={t("common.loading", lang)} />
          )}
        </div>
        <DialogFooter>
          <Button type="button" onClick={onCopy} className="w-full bg-km0-yellow-400 font-ui font-bold text-km0-blue-900 hover:bg-km0-yellow-500">
            <Copy aria-hidden />
            {t("invite.share.copy", lang)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InviteQrDialog;
