import HomeModules, { type HomeModule } from "@/components/HomeModules";
import HomeHero from "@/components/HomeHero";
import EventHeroCarousel from "@/components/EventHeroCarousel";
import PointsCard from "@/components/PointsCard";
import JoinCard from "@/components/JoinCard";
import EarnPointsCard from "@/components/EarnPointsCard";
import RewardsPreview from "@/components/RewardsPreview";
import MerchantPromosPreview from "@/components/MerchantPromosPreview";
import InviteHomeCard from "@/components/InviteHomeCard";
import BottomTabs, { type HomeTab } from "@/components/BottomTabs";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useLang } from "@/contexts/LangContext";
import { t } from "@/lib/i18n";

import type { Promo } from "@/types/promo";
import type { ApiReward } from "@/services/rewardsApi";
import type { InvitationsSummary } from "@/types/invitation";


export interface HomeContentProps {
  cityName: string;
  townArtSrc?: string;
  hasAlerts: boolean;
  onToggleAlerts: () => void;
  /** Saludo ya localizado (e.g. "Bon dia, Aina 👋" o "Hola! 👋"). */
  greeting: string;
  /** Subtítulo ya localizado según estado (guest vs registered). */
  subtitle: string;
  points: number;
  nextLevel: number;
  nextReward?: string;
  level?: number;
  modules: HomeModule[];
  promos: Promo[];
  /** Premios públicos (API UAT); Home resuelve fallback mock si falla. */
  rewards: ApiReward[];

  activeTab: HomeTab;
  isAuthed: boolean;
  onLogin: () => void;
  onHowItWorks: () => void;
  onHome: () => void;
  onProfile: () => void;
  onPoints: () => void;
  onRewards: () => void;
  onActions: () => void;
  onInvite: () => void;
  onViewInvitations: () => void;
  invitationSummary: InvitationsSummary | null;

  /** Solo se muestra PointsCard si hay sesión. */
  showLogin: boolean;
  showPoints: boolean;
  onSeeAllEvents?: () => void;
  onSeeAllRewards?: () => void;
  onSeeAllPromos?: () => void;
  onOpenEvent?: (id: string) => void;
  onOpenPointsHistory?: () => void;
}



const HomeContent = ({
  cityName,
  townArtSrc,
  hasAlerts,
  onToggleAlerts,
  points,
  nextLevel,
  nextReward,
  level,
  modules,
  promos,
  rewards,

  activeTab,
  isAuthed,
  onLogin,
  onHowItWorks,
  onHome,
  onProfile,
  onPoints,
  onRewards,
  onActions,
  onInvite,
  onViewInvitations,
  invitationSummary,
  showLogin,
  showPoints,

  onSeeAllEvents,
  onSeeAllRewards,
  onSeeAllPromos,
  onOpenEvent,
  onOpenPointsHistory,

}: HomeContentProps) => {


  const { lang } = useLang();

  return (
    <>
      <HomeHero
        cityName={cityName}
        townArtSrc={townArtSrc}
        hasAlerts={hasAlerts}
        onToggleAlerts={onToggleAlerts}
        showGreeting={false}
      />

      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden flex flex-col">
        <div className="relative z-10 flex flex-col gap-5 px-4 pt-4 pb-7">
          <section className="flex flex-col gap-3">
            {showLogin && <JoinCard onCreateAccount={onLogin} onLogin={onLogin} onHowItWorks={onHowItWorks} />}
            {showPoints && <PointsCard points={points} nextLevel={nextLevel} nextReward={nextReward} level={level} onClick={onOpenPointsHistory} />}
          </section>

          <section className="rounded-3xl bg-card p-4 shadow-[var(--shadow-bubble)] space-y-3">
            <SectionHeader title={t("home.section.quick", lang)} />
            <HomeModules modules={modules} />
          </section>


          <section className="space-y-3">
            <SectionHeader title={t("home.section.events", lang)} actionLabel={t("home.action.see_all_m", lang)} onAction={onSeeAllEvents} />
            <EventHeroCarousel promos={promos} onOpen={onOpenEvent} />
          </section>

          <EarnPointsCard onSeeAll={onActions} locked={false} onLogin={onLogin} isAuthed={isAuthed} />

          <section className="space-y-3">
            <SectionHeader title={t("home.section.rewards", lang)} actionLabel={t("home.action.see_all_m", lang)} onAction={onSeeAllRewards} />
            <RewardsPreview items={rewards} onSeeAll={onSeeAllRewards} />
          </section>

          <MerchantPromosPreview onSeeAll={onSeeAllPromos} locked={false} onLogin={onLogin} />
          <div>
            <InviteHomeCard
              isAuthed={isAuthed}
              onInvite={onInvite}
              onLogin={onLogin}
              onCreateAccount={onLogin}
              onViewInvitations={onViewInvitations}
              invitationSummary={invitationSummary}
            />
          </div>

        </div>
      </div>


      <BottomTabs
        activeTab={activeTab}
        isAuthed={isAuthed}
        onLogin={onLogin}
        onHome={onHome}
        onProfile={onProfile}
        onPoints={onPoints}
        onRewards={onRewards}
        onActions={onActions}
      />



    </>
  );
};

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

const SectionHeader = ({ title, actionLabel, onAction }: SectionHeaderProps) => (
  <div className="flex items-center justify-between gap-2">
    <h2 className="font-brand font-black text-km0-blue-800 text-lg">
      {title}
    </h2>
    {actionLabel && (
      <Button
        variant="bubbleLink"
        type="button"
        onClick={onAction}
        className="h-auto min-h-11 shrink-0 gap-1 px-0 text-xs text-km0-coral-700"
      >
        {actionLabel}
        <ArrowRight size={13} strokeWidth={2.4} />
      </Button>
    )}
  </div>
);

export default HomeContent;
