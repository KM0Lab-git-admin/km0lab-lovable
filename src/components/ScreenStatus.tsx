import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLang } from "@/contexts/LangContext";
import { t, type TKey } from "@/lib/i18n";
import type { ScreenState } from "@/hooks/use-preview-state";

interface ScreenStatusProps { state: ScreenState; emptyKey: TKey; onRetry: () => void; }
const ScreenStatus = ({ state, emptyKey, onRetry }: ScreenStatusProps) => {
  const { lang } = useLang();
  if (state === "ready") return null;
  if (state === "loading") return <div aria-busy className="space-y-3 py-4"><Skeleton className="h-36 rounded-3xl" /><Skeleton className="h-20 rounded-3xl" /><p className="font-body text-xs text-muted-foreground">{t("common.loading", lang)}</p></div>;
  return <div role={state === "error" ? "alert" : "status"} className="space-y-3 py-8 text-center">
    <p className="font-body text-sm text-muted-foreground">{t(state === "error" ? "account.error" : emptyKey, lang)}</p>
    <Button variant="bubbleTertiary" onClick={onRetry}>{t("merchants.error.retry", lang)}</Button>
  </div>;
};
export default ScreenStatus;