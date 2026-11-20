import { motion } from "framer-motion";
import { Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TownTag } from "@/components/TownTag";
import type { Lang } from "@/lib/i18n";
import type { Noticia } from "@/services/newsApi";

export const formatNewsDate = (iso: string | null, lang: Lang): string => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const locale = lang === "ca" ? "ca-ES" : lang === "en" ? "en-GB" : "es-ES";
  return d
    .toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" })
    .replace(/^\w/, (c) => c.toUpperCase());
};

/** News list card shared by Notícies and Home. */
const NoticiaCard = ({
  noticia,
  lang,
  onOpen,
  town,
}: {
  noticia: Noticia;
  lang: Lang;
  onOpen: () => void;
  /** Town of origin inside a grouped scope; omit for single-town scopes. */
  town?: { name: string; isHome: boolean };
}) => {
  const titulo = noticia.titulo[lang];
  const resumen = noticia.resumen[lang];
  const tags = noticia.tags[lang] ?? [];
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-km0-blue-100 rounded-2xl overflow-hidden shadow-sm hover:border-km0-blue-300 transition-colors"
    >
      <Button variant="bubbleSurface"
        type="button"
        onClick={onOpen}
        className="block h-auto w-full whitespace-normal rounded-none p-0 text-left active:scale-[0.99] transition-transform"
      >
        {noticia.imagenUrl ? (
          <div className="aspect-[16/9] w-full bg-km0-blue-50 overflow-hidden">
            <img
              src={noticia.imagenUrl}
              alt=""
              loading="lazy"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        ) : (
          <div className="aspect-[16/9] w-full bg-gradient-to-br from-km0-blue-100 to-km0-blue-50 flex items-center justify-center">
            <Newspaper size={28} className="text-km0-blue-700/40" />
          </div>
        )}
        <div className="p-3">
          <h3 className="font-brand text-sm leading-tight text-km0-blue-900 mb-1 line-clamp-2">
            {titulo}
          </h3>
          {resumen && (
            <p className="text-[11px] font-ui text-km0-blue-700/80 line-clamp-2 mb-1.5">
              {resumen}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-1">
            {town && <TownTag townName={town.name} isHome={town.isHome} lang={lang} />}
            {noticia.fechaPublicacion && (
              <span className="text-[10px] font-ui text-km0-blue-700/60">
                {formatNewsDate(noticia.fechaPublicacion, lang)}
              </span>
            )}
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 rounded-full text-[10px] font-ui bg-km0-blue-50 text-km0-blue-700"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </Button>
    </motion.article>
  );
};

export default NoticiaCard;
