import { useEffect, useMemo, useState } from "react";
import HomeContent from "@/components/HomeContent";
import PointsRewardOverlay from "@/components/PointsRewardOverlay";
import { useLang } from "@/contexts/LangContext";
import { t } from "@/lib/i18n";
import { INITIAL_MODULES, type HomeModuleSeed } from "@/data/homeModules";
import type { HomeModule, HomeModuleId } from "@/components/HomeModules";
import { PROMOS } from "@/data/promos";
import { REDEEM_COUPONS } from "@/data/redeemCoupons";
import { type HomeTab } from "@/components/BottomTabs";


export type HomeSandboxState = "guest" | "registered" | "reward-welcome";

interface HomeSandboxProps {
  /** Estado simulado de la Home.
   *  - `guest` = no registrado (muestra LoginButton, oculta puntos).
   *  - `registered` = sesión iniciada (oculta LoginButton, muestra puntos).
   *  - `reward-welcome` = como registered, pero dispara automáticamente
   *    el overlay de bienvenida (+500 pts) al montar.
   *  Default: `guest`. */
  state?: HomeSandboxState;
}

const HomeSandbox = ({ state = "guest" }: HomeSandboxProps) => {
  const [seeds, setSeeds] = useState<HomeModuleSeed[]>(INITIAL_MODULES);
  const [activeTab, setActiveTab] = useState<HomeTab>("home");
  const [showReward, setShowReward] = useState(state === "reward-welcome");
  const { lang } = useLang();

  // Reabrir overlay cuando se cambia el estado a reward-welcome.
  useEffect(() => {
    if (state === "reward-welcome") setShowReward(true);
  }, [state]);

  const toggle = (id: HomeModuleId) =>
    setSeeds((prev) => prev.map((m) => (m.id === id ? { ...m, active: !m.active } : m)));

  const modulesWithHandlers: HomeModule[] = useMemo(
    () => seeds.map((m) => ({ id: m.id, active: m.active, label: t(m.labelKey, lang), onClick: () => toggle(m.id) })),
    [seeds, lang],
  );

  const noop = () => {};
  // reward-welcome se comporta como registered.
  const isRegistered = state === "registered" || state === "reward-welcome";
  const greeting = isRegistered
    ? t("home.greeting.registered", lang).replace("{name}", "Aina")
    : t("home.greeting.guest", lang);
  const subtitle = isRegistered
    ? t("home.subtitle.registered", lang)
    : t("home.subtitle.guest", lang);

  return (
    <div className="relative w-full h-full bg-km0-beige-50 overflow-hidden flex justify-center">
      <div className="relative w-full max-w-[430px] h-full flex flex-col overflow-hidden bg-km0-beige-50">
      <HomeContent
        cityName="Malgrat de Mar"
        hasAlerts={false}
        onToggleAlerts={noop}
        greeting={greeting}
        subtitle={subtitle}
        points={isRegistered ? 100 : 0}
        nextLevel={500}
        modules={modulesWithHandlers}
        promos={PROMOS}
        coupons={REDEEM_COUPONS}
        activeTab={activeTab}

        onTabChange={setActiveTab}
        showLogin={!isRegistered}
        onLogin={noop}
        showProfile={isRegistered}
        onProfile={noop}
        onPoints={noop}
        showPoints={isRegistered}
        onSeeAllEvents={noop}
        onSeeAllCoupons={noop}

        onOpenEvent={noop}
      />

      {state === "reward-welcome" && showReward && (
        <PointsRewardOverlay
          points={500}
          message="¡Bienvenido!"
          onClose={() => setShowReward(false)}
          contained
        />
      )}
      </div>
    </div>
  );
};

export default HomeSandbox;
