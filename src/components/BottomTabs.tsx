import { Home as HomeIcon, User, Coins } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLang } from "@/contexts/LangContext";
import { t } from "@/lib/i18n";

export type HomeTab = "home" | "perfil" | "puntos";

export interface BottomTabsProps {
  activeTab: HomeTab;
  onTabChange: (t: HomeTab) => void;
  /** Si hay sesión, el tab Perfil navega a /profile vía onProfile. */
  showProfile: boolean;
  onLogin: () => void;
  onProfile: () => void;
  /** Acción del tab "Ver mis puntos". */
  onPoints: () => void;
}

const BottomTabs = ({
  activeTab,
  onTabChange,
  showProfile,
  onLogin,
  onProfile,
  onPoints,
}: BottomTabsProps) => {
  const { lang } = useLang();
  return (
    <nav
      className="shrink-0 bg-white border-t border-km0-beige-200 px-2 pt-2 pb-3 grid grid-cols-3"
      aria-label="Navegación principal"
    >
      <TabItem
        icon={<HomeIcon size={20} strokeWidth={2.2} />}
        label={t("tabs.home", lang)}
        active={activeTab === "home"}
        onClick={() => onTabChange("home")}
      />
      <TabItem
        icon={<Coins size={20} strokeWidth={2.2} />}
        label={t("tabs.points", lang)}
        active={activeTab === "puntos"}
        onClick={() => {
          onTabChange("puntos");
          onPoints();
        }}
      />
      <TabItem
        icon={<User size={20} strokeWidth={2.2} />}
        label={t("tabs.profile", lang)}
        active={activeTab === "perfil"}
        onClick={() => {
          onTabChange("perfil");
          if (showProfile) onProfile();
          else onLogin();
        }}
      />
    </nav>
  );
};

interface TabItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

const TabItem = ({ icon, label, active, onClick }: TabItemProps) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className="flex flex-col items-center gap-0.5 py-1 active:scale-95 transition-transform"
  >
    <span
      className={cn(
        "transition-colors",
        active ? "text-km0-blue-700" : "text-km0-blue-800/40",
      )}
    >
      {icon}
    </span>
    <span
      className={cn(
        "font-ui text-[10px] leading-none",
        active ? "font-bold text-km0-blue-700" : "text-km0-blue-800/55",
      )}
    >
      {label}
    </span>
  </button>
);

export default BottomTabs;
