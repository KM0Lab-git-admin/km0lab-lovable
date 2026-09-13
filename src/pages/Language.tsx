import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LanguageCard from "@/components/LanguageCard";
import BrandedFrame from "@/components/BrandedFrame";
import languageSelectionAsset from "@/assets/language-selection.png.asset.json";
import flagCa from "@/assets/flags/flag-ca.svg";
import flagEs from "@/assets/flags/flag-es.svg";
import flagEn from "@/assets/flags/flag-en.svg";
import { useLang } from "@/contexts/LangContext";
import { t, type Lang, type TKey } from "@/lib/i18n";

interface LanguageOption {
  id: Lang;
  flag: string;
  nameKey: TKey;
  descriptionKey: TKey;
}

const languages: LanguageOption[] = [
  { id: "ca", flag: flagCa, nameKey: "language.catalan", descriptionKey: "language.catalan_description" },
  { id: "es", flag: flagEs, nameKey: "language.spanish", descriptionKey: "language.spanish_description" },
  { id: "en", flag: flagEn, nameKey: "language.english", descriptionKey: "language.english_description" },
];

const Language = () => {
  const navigate = useNavigate();
  const { lang, setLang } = useLang();
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (id: Lang) => {
    setSelected(id);
    setLang(id);
    setTimeout(() => navigate("/onboarding"), 300);
  };

  return (
    <BrandedFrame portraitContentClassName="!px-0 !pb-0 bg-background">
      <div className="min-h-full w-full max-w-[390px] mx-auto flex flex-col justify-center overflow-hidden bg-background">
        <div className="relative h-[280px] shrink-0 overflow-hidden">
          <img
            src={languageSelectionAsset.url}
            alt={t("language.image_alt", lang)}
            className="h-full w-full object-cover object-center"
          />
        </div>

        <div className="relative z-10 -mt-5 rounded-t-3xl bg-km0-beige-100 px-4 pb-5 pt-5 shadow-[0_-12px_30px_-24px_hsl(var(--foreground)/0.35)]">
          <h1 className="mb-4 text-center font-brand text-2xl font-black text-km0-blue-700">
            {t("language.title", lang)}
          </h1>
          <div className="flex flex-col gap-2 shrink-0
            [&_button]:!py-2 [&_button]:!gap-3
            [&_button>span:first-child]:!w-10 [&_button>span:first-child]:!h-10
            [&_button>span:first-child>img]:!w-7 [&_button>span:first-child>img]:!h-7
            [&_button_p:first-child]:!text-base
            [&_button_p:last-child]:!text-xs">
            {languages.map((langOpt, i) => (
              <LanguageCard
                key={langOpt.id}
                flag={langOpt.flag}
                flagIsImage
                name={t(langOpt.nameKey, lang)}
                description={t(langOpt.descriptionKey, lang)}
                selected={selected === langOpt.id}
                onClick={() => handleSelect(langOpt.id)}
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    </BrandedFrame>
  );
};

export default Language;
