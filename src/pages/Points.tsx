import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import DeviceShell from "@/components/DeviceShell";
import BottomTabs, { type HomeTab } from "@/components/BottomTabs";
import { useLang } from "@/contexts/LangContext";
import { t } from "@/lib/i18n";

const Points = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { lang } = useLang();
  const isAuthed = !!user;

  const handleTabChange = (tab: HomeTab) => {
    if (tab === "home") navigate("/home");
    if (tab === "perfil") {
      if (isAuthed) navigate("/profile");
      else navigate("/login");
    }
  };

  return (
    <DeviceShell>
      <div className="w-full h-full bg-km0-beige-50 overflow-hidden flex justify-center">
        <div className="relative w-full max-w-[430px] h-full flex flex-col overflow-hidden bg-km0-beige-50">
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-4">
            <h1 className="font-brand text-2xl text-km0-blue-700">
              {t("points.title", lang)}
            </h1>
            <p className="font-body text-sm text-km0-blue-800/70">
              {t("points.placeholder", lang)}
            </p>
          </div>
          <BottomTabs
            activeTab="puntos"
            onTabChange={handleTabChange}
            showProfile={isAuthed}
            onLogin={() => navigate("/login")}
            onProfile={() => navigate("/profile")}
            onPoints={() => {}}
          />
        </div>
      </div>
    </DeviceShell>
  );
};

export default Points;
