import { motion } from "framer-motion";
import { ArrowRight, Gift, Ticket, Percent, ShoppingBag, Lock, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLang } from "@/contexts/LangContext";
import { t } from "@/lib/i18n";
import { REWARDS } from "@/data/rewards";
import type { Reward, RewardKind } from "@/types/reward";

/**
 * RewardsPreview — sección Home con los primeros premios del catálogo.
 * Reutiliza el estilo visual de `/rewards` en versión compacta horizontal.
 * Cuando `locked`, aplica overlay + CTA de registro.
 */
export interface RewardsPreviewProps {
  onSeeAll?: () => void;
  locked?: boolean;
  onLogin?: () => void;
  className?: string;
}

const KIND_ICON: Record<RewardKind, LucideIcon> = {
  voucher: Gift,
  ticket: Ticket,
  product: ShoppingBag,
  discount: Percent,
};

const fmt = (n: number) => n.toLocaleString("es-ES");

const RewardsPreview = ({ onSeeAll, locked = false, onLogin, className }: RewardsPreviewProps) => {
  const { lang } = useLang();
  const items: Reward[] = REWARDS.filter((r) => r.status === "active").slice(0, 4);
  const handleSeeAll = locked ? onLogin : onSeeAll;

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={cn(
        "w-full rounded-3xl border border-km0-beige-200 bg-gradient-to-b from-card/90 to-secondary/40 shadow-[0_20px_50px_-32px_hsl(var(--foreground)/0.38)] ring-1 ring-white/60 px-4 py-4 space-y-3",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-brand font-black text-km0-blue-800 text-base flex items-center gap-2">
          {t("home.section.rewards", lang)}
          {locked && (
            <span className="inline-flex items-center gap-1 rounded-full bg-km0-blue-800/85 text-white px-2 py-0.5 text-[10px] font-ui font-bold uppercase tracking-wide">
              <Lock size={10} strokeWidth={2.4} />
              {t("home.locked.badge", lang)}
            </span>
          )}
        </h2>
        {handleSeeAll && (
          <button
            type="button"
            onClick={handleSeeAll}
            className="font-ui font-bold text-km0-coral-400 active:scale-95 transition-transform underline underline-offset-4 text-xs flex items-center whitespace-nowrap shrink-0"
          >
            {t("home.action.see_all_m", lang)}
            <ArrowRight size={13} strokeWidth={2.4} />
          </button>
        )}
      </div>

      <ul
        className={cn(
          "flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory -mx-1 px-1",
          locked && "pointer-events-none opacity-60",
        )}
        aria-hidden={locked || undefined}
      >
        {items.map((reward, i) => {
          const Icon = KIND_ICON[reward.kind];
          return (
            <motion.li
              key={reward.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: Math.min(i * 0.05, 0.25) }}
              className="snap-start shrink-0 w-40 rounded-2xl bg-white border border-km0-blue-100 shadow-[0_8px_20px_-14px_hsl(var(--km0-blue-900)/0.35)] overflow-hidden flex flex-col"
            >
              <div className="h-20 flex items-center justify-center bg-gradient-to-br from-km0-yellow-100 to-km0-yellow-300">
                <Icon size={36} strokeWidth={1.8} className="text-km0-blue-900" />
              </div>
              <div className="p-2.5 flex flex-col gap-1.5 flex-1">
                <h3 className="font-brand font-black text-xs text-km0-blue-900 leading-tight line-clamp-2">
                  {reward.title}
                </h3>
                <p className="font-ui font-bold text-[11px] text-km0-blue-800/70">
                  {reward.valueLabel}
                </p>
                <span className="mt-auto self-start rounded-full bg-km0-yellow-400 text-km0-blue-900 px-2 py-0.5 text-[10px] font-ui font-black tabular-nums">
                  {t("rewards.cost", lang).replace("{n}", fmt(reward.costPoints))}
                </span>
              </div>
            </motion.li>
          );
        })}
      </ul>

      {locked && onLogin && (
        <button
          type="button"
          onClick={onLogin}
          className="w-full rounded-full bg-km0-blue-800 text-white font-ui font-bold text-sm py-2.5 active:scale-[0.98] transition-transform inline-flex items-center justify-center gap-2"
        >
          <Lock size={14} strokeWidth={2.4} />
          {t("home.locked.cta", lang)}
        </button>
      )}
    </motion.section>
  );
};

export default RewardsPreview;
