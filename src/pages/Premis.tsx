import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  Gift,
  Ticket,
  Percent,
  ShoppingBag,
  Package,
  Lock,
  Coins,
  type LucideIcon,
} from "lucide-react";

import DeviceShell from "@/components/DeviceShell";
import { useAuth } from "@/hooks/useAuth";
import { useLang } from "@/contexts/LangContext";
import { t, type TKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { REWARDS } from "@/data/rewards";
import type { Reward, RewardCategory, RewardKind } from "@/types/reward";

type Filter = "all" | RewardCategory;

const CATEGORY_KEY: Record<RewardCategory, TKey> = {
  balance: "rewards.category.balance",
  experience: "rewards.category.experience",
  merchandising: "rewards.category.merchandising",
  discount: "rewards.category.discount",
};

const KIND_ICON: Record<RewardKind, LucideIcon> = {
  voucher: Gift,
  ticket: Ticket,
  product: ShoppingBag,
  discount: Percent,
};

const fmt = (n: number) => n.toLocaleString("es-ES");

/* ─── Chip filtro ────────────────────────────────────────── */
const FilterChip = ({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "shrink-0 px-3 py-1.5 rounded-full text-xs font-ui font-bold transition-colors",
      active
        ? "bg-km0-blue-800 text-white"
        : "bg-white text-km0-blue-800 border border-km0-blue-100",
    )}
  >
    {label}
  </button>
);

/* ─── Tarjeta de premio ──────────────────────────────────── */
interface RewardCardProps {
  reward: Reward;
  points: number;
  isAuthed: boolean;
  index: number;
  onRedeem: (r: Reward) => void;
  onLoginPrompt: () => void;
}

const RewardCard = ({
  reward,
  points,
  isAuthed,
  index,
  onRedeem,
  onLoginPrompt,
}: RewardCardProps) => {
  const { lang } = useLang();
  const KindIcon = KIND_ICON[reward.kind];

  const isSoldOut = reward.status === "sold_out";
  const isInactive = reward.status === "inactive";
  const missingPoints = Math.max(0, reward.costPoints - points);
  const canAfford = isAuthed && missingPoints === 0;

  // Dim si: no registrado, sin puntos suficientes, esgotat o inactiu.
  const dimmed = !isAuthed || !canAfford || isSoldOut || isInactive;
  // Locked overlay solo para: no registrado o sin puntos suficientes en un
  // premio que sí está disponible (evita doble mensaje con esgotat/inactiu).
  const showLock = (!isAuthed || !canAfford) && !isSoldOut && !isInactive;

  const statusChip = isSoldOut
    ? { key: "rewards.status.sold_out" as TKey, cls: "bg-km0-coral-100 text-km0-coral-500" }
    : isInactive
      ? { key: "rewards.status.inactive" as TKey, cls: "bg-km0-blue-100 text-km0-blue-800/70" }
      : { key: "rewards.status.active" as TKey, cls: "bg-km0-teal-100 text-km0-teal-700" };

  const stockLabel =
    reward.stock === null
      ? t("rewards.stock_unlimited", lang)
      : t("rewards.stock_units", lang).replace("{n}", String(reward.stock));

  const ctaLabel = isSoldOut
    ? t("rewards.cta.sold_out", lang)
    : isInactive
      ? t("rewards.cta.inactive", lang)
      : !isAuthed
        ? t("rewards.cta.locked_guest", lang)
        : !canAfford
          ? t("rewards.cta.locked_points", lang).replace("{n}", fmt(missingPoints))
          : t("rewards.cta.redeem", lang);

  const ctaDisabled = isSoldOut || isInactive;
  const ctaActive = canAfford && !isSoldOut && !isInactive;

  const handleCta = () => {
    if (ctaDisabled) return;
    if (!isAuthed) return onLoginPrompt();
    if (canAfford) return onRedeem(reward);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.28) }}
      className={cn(
        "relative overflow-hidden rounded-2xl bg-white border border-km0-blue-100",
        "shadow-[0_8px_20px_-14px_hsl(var(--km0-blue-900)/0.35)]",
        "flex flex-col",
      )}
    >
      {/* Cabecera: banda con icono grande + chip estado */}
      <div
        className={cn(
          "relative h-32 flex items-center justify-center",
          "bg-gradient-to-br from-km0-yellow-100 to-km0-yellow-300",
          dimmed && "opacity-60",
        )}
      >
        {/* Chip categoría (top-left) */}
        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-white/85 text-[10px] font-ui font-bold text-km0-blue-800 uppercase tracking-wide">
          {t(CATEGORY_KEY[reward.category], lang)}
        </span>
        {/* Chip estado (top-right) */}
        <span
          className={cn(
            "absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-ui font-bold uppercase tracking-wide",
            statusChip.cls,
          )}
        >
          {t(statusChip.key, lang)}
        </span>

        <KindIcon
          size={56}
          strokeWidth={1.8}
          className={cn("text-km0-blue-900", dimmed && "grayscale-[0.3]")}
        />

        {/* Overlay de bloqueo (invitado o sin puntos) */}
        {showLock && (
          <div className="absolute inset-0 flex items-center justify-center bg-km0-blue-900/25 backdrop-blur-[1px]">
            <span className="w-11 h-11 rounded-full bg-white/95 flex items-center justify-center shadow-md">
              <Lock size={20} className="text-km0-blue-900" strokeWidth={2.2} />
            </span>
          </div>
        )}
      </div>

      {/* Cuerpo */}
      <div className="p-3 flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-brand font-black text-sm text-km0-blue-900 leading-tight">
            {reward.title}
          </h3>
          <span
            className={cn(
              "shrink-0 rounded-full px-2 py-1 text-[11px] font-ui font-black tabular-nums",
              ctaActive
                ? "bg-km0-yellow-400 text-km0-blue-900"
                : "bg-km0-beige-100 text-km0-blue-800/70",
            )}
          >
            {t("rewards.cost", lang).replace("{n}", fmt(reward.costPoints))}
          </span>
        </div>

        <p className="font-body text-xs text-km0-blue-800/70 leading-snug">
          {reward.description}
        </p>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <div>
            <p className="font-body text-[10px] uppercase tracking-wide text-km0-blue-800/50">
              {t("rewards.value", lang)}
            </p>
            <p className="font-ui font-bold text-xs text-km0-blue-900">
              {reward.valueLabel}
            </p>
          </div>
          <div>
            <p className="font-body text-[10px] uppercase tracking-wide text-km0-blue-800/50">
              {t("rewards.stock", lang)}
            </p>
            <p className="font-ui font-bold text-xs text-km0-blue-900 flex items-center gap-1">
              <Package size={12} className="text-km0-blue-800/60" />
              {stockLabel}
            </p>
          </div>
        </div>

        <p className="font-body text-[11px] text-km0-blue-800/60 pt-0.5 truncate">
          {reward.scope}
        </p>

        <button
          type="button"
          onClick={handleCta}
          disabled={ctaDisabled}
          className={cn(
            "mt-auto w-full h-10 rounded-full font-ui font-bold text-xs transition-transform active:scale-[0.98]",
            ctaDisabled && "bg-km0-beige-100 text-km0-blue-800/50 cursor-not-allowed",
            !ctaDisabled && ctaActive && "bg-km0-blue-800 text-white",
            !ctaDisabled && !ctaActive && "bg-white text-km0-blue-800 border border-km0-blue-200",
          )}
        >
          {ctaLabel}
        </button>
      </div>
    </motion.article>
  );
};

/* ─── Pantalla ───────────────────────────────────────────── */
const Premis = () => {
  const navigate = useNavigate();
  const { lang } = useLang();
  const { user } = useAuth();
  const isAuthed = !!user;

  // Mismo mock que Home: registrado = 100 pts.
  const points = isAuthed ? 100 : 0;

  const [filter, setFilter] = useState<Filter>("all");

  const categories = useMemo<Filter[]>(() => {
    const set = new Set<RewardCategory>();
    for (const r of REWARDS) set.add(r.category);
    return ["all", ...Array.from(set)];
  }, []);

  const filtered = useMemo(
    () => (filter === "all" ? REWARDS : REWARDS.filter((r) => r.category === filter)),
    [filter],
  );

  const handleRedeem = () => {
    // TODO: flujo real de bescanvi (fuera de scope de esta pantalla).
  };

  const handleLoginPrompt = () => navigate("/login");

  return (
    <DeviceShell>
      <div className="w-full h-full bg-km0-beige-50 overflow-hidden flex justify-center">
        <div className="relative w-full max-w-[430px] h-full flex flex-col overflow-hidden bg-km0-beige-50">
          {/* Header */}
          <header className="shrink-0 flex items-center gap-2 px-3 pt-4 pb-3 bg-km0-beige-50">
            <button
              type="button"
              onClick={() => navigate("/home")}
              aria-label={t("common.back", lang)}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-km0-blue-100 active:scale-95 transition-transform"
            >
              <ChevronLeft size={20} className="text-km0-blue-800" />
            </button>
            <h1 className="flex-1 text-center font-brand font-black text-base text-km0-blue-900 pr-10">
              {t("rewards.title", lang)}
            </h1>
          </header>

          {/* Intro + saldo */}
          <section className="shrink-0 px-4 pb-3">
            <p className="font-body text-xs text-km0-blue-800/70 leading-snug">
              {t("rewards.subtitle", lang)}
            </p>
            <div className="mt-2 flex items-center gap-2 rounded-full bg-white border border-km0-blue-100 px-3 py-1.5 w-fit">
              <Coins size={14} className="text-km0-yellow-500" />
              <span className="font-ui font-bold text-xs text-km0-blue-900">
                {isAuthed
                  ? t("rewards.balance_label", lang).replace("{n}", fmt(points))
                  : t("rewards.guest_label", lang)}
              </span>
            </div>
          </section>

          {/* Filtros */}
          <div className="shrink-0 px-4 pb-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
            {categories.map((c) => (
              <FilterChip
                key={c}
                active={filter === c}
                onClick={() => setFilter(c)}
                label={
                  c === "all"
                    ? t("rewards.filter_all", lang)
                    : t(CATEGORY_KEY[c], lang)
                }
              />
            ))}
          </div>

          {/* Grid */}
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 pt-1 pb-6">
            {filtered.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center px-6">
                <p className="font-body text-sm text-km0-blue-800/60">
                  {t("rewards.empty", lang)}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {filtered.map((r, i) => (
                  <RewardCard
                    key={r.id}
                    reward={r}
                    points={points}
                    isAuthed={isAuthed}
                    index={i}
                    onRedeem={handleRedeem}
                    onLoginPrompt={handleLoginPrompt}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DeviceShell>
  );
};

export default Premis;
