import { useState } from "react";
import ScreenFrame from "@/components/ScreenFrame";
import SimulatedDevice from "@/components/SimulatedDevice";
import HomeSandbox, { type HomeSandboxState } from "@/components/HomeSandbox";
import {
  PREVIEW_SCREENS,
  type PreviewScreen,
  type ScreenStatePreview,
} from "@/design-system/preview-manifest";
import { getViewportById, type ViewportId } from "@/design-system/viewports";

/**
 * /preview-all — Catálogo visual: cada pantalla registrada en
 * `src/design-system/preview-manifest.ts` renderizada en el viewport de
 * contrato mínimo (375×667) más un segundo viewport seleccionable
 * (landscape smoke, tablet o desktop, escalados para caber en pantalla).
 *
 * Las pantallas con varios estados visuales (Home guest/registrado,
 * Evento hero/ticket…) tienen tabs para alternarlos: mismos estados que
 * valida Playwright en tests/visual/screens.spec.ts.
 *
 * Junto a cada pantalla se muestra su árbol de componentes (TREES) como
 * documentación visual + estructural.
 */

/** Estados de la Home que se renderizan SIN iframe (HomeSandbox) para
 *  permitir Visual Edit. El resto de estados/pantallas usa iframe. */
const SANDBOX_HOME_STATES: HomeSandboxState[] = [
  "guest",
  "registered",
  "reward-welcome",
];

/** Opciones del segundo frame. El primario es siempre mobile-portrait-base
 *  (375×667, el más bajo). El segundo por defecto es el portrait ALTO
 *  (390×844): validar en horquilla (bajo + alto) es lo que garantiza que
 *  todo portrait intermedio se vea bien — los gaps por altura extra solo
 *  aparecen en el alto. Con "teléfono centrado" (DeviceShell),
 *  desktop/landscape son la misma columna centrada, así que basta un frame
 *  ancho (encuadre) y el smoke de landscape móvil (no-rotura). */
const SECONDARY_VIEWPORTS: { id: ViewportId; scale: number }[] = [
  { id: "mobile-portrait-tall", scale: 1 },
  { id: "desktop-landscape", scale: 0.5 },
  { id: "mobile-landscape-base", scale: 1 },
];

const TREES: Record<string, string> = {
  home: `(NO usa BrandedFrame — DeviceShell propio, con el MISMO tamaño de frame que BrandedFrame en cada resolución)
│
DeviceShell → contenedor centrado (max-w-[430px], bg beige a los lados) → HomeContent
├── HomeHero               ← header FIJO (inline=true; showLogin={!user})
│   ├── skyline malgrat    (bg absoluto, object-top, opacity-25)
│   └── fila header        (escudo + ciudad + KM0 + bell + LoginButton si !user)
├── body scroll-y
│   ├── section JoinCard (guest) / PointsCard (auth)
│   ├── section "Accesos rápidos"     → HomeModules (6 módulos: 2 filas × 3 cols)
│   ├── section "Eventos destacados"  → EventHeroCarousel
│   ├── section "Bescanvia amb punts" → CouponCard × N
│   └── section "Com guanyar punts"   → EarnPointsCard (guest)

├── BottomTabs             ← fijo abajo (showProfile si auth)
└── NotificationsOverlay

Estado "Notificaciones abiertas" (?notifs=open):
└── NotificationsOverlay         ← absolute inset-0 z-50 sobre la card
    ├── motion.div  (fade + slide-up, AnimatePresence)
    ├── header  (<h2> "Notificaciones" + <button X>)
    └── lista scroll-y
        ├── empty state  "No tienes notificaciones"
        └── notificación × N  (dot estado + título + hora + desc + link)

Lógica:
  · useAuth → isAuthed → showLogin / showProfile / showPoints
  · useNotifications → bell + overlay (markAllRead al abrir)
  · modules state (INITIAL_MODULES) con toggleModule
  · módulo "agenda" → navigate("/agenda")
  · módulo "noticias" → navigate("/noticias"); resto togglea activo`,
  language: `BrandedFrame                    ← wrapper de marca (logo + card + back)
└── (decide portrait/landscape con clases tailwind)
    ├── Portrait
    │   ├── FloatingDots        ← partículas decorativas
    │   ├── <img> mascota robot
    │   ├── <h2> "Escoge tu idioma"
    │   └── LanguageCard × 3    ← ca / es / en (driven by \`languages[]\`)
    │
    └── Landscape
        ├── FloatingDots + mascota (columna izquierda)
        ├── divisor vertical
        └── LanguageCard × 3    ← columna derecha`,
  onboarding: `BrandedFrame                    ← wrapper de marca (logo + card + back)
└── StackCarousel               ← carrusel reutilizable (stack 3D + drag + flechas)
    │   props: items, index, onIndexChange, skipLabel, finishLabel,
    │          onFinish, renderSlideContent, renderThumbnail?
    │
    ├── Portrait  (landscape:hidden)
    │   ├── motion.div  carousel  (pointer handlers + scale wrapper)
    │   │   └── sliding track  (translateX = trackX + dragOffset)
    │   │       └── slide × N
    │   │           ├── stack layers (solo activa)
    │   │           └── card (renderSlideContent)
    │   │               └── OnboardingCard  ← contenido de dominio
    │   │                   (emoji + XP badge + título + desc)
    │   ├── ChevronLeft / ChevronRight  ← prev / next
    │   ├── thumbnails × N    (renderThumbnail || item.thumb)
    │   └── footer  (contador + dots + botón SKIP/START → onFinish)
    │
    └── Landscape  (hidden landscape:flex)
        ├── motion.div carousel  (slotLs adaptativo 360/560)
        │   └── sliding track → slide × N → OnboardingCard
        ├── ChevronLeft / ChevronRight
        └── footer (contador + thumbs × N + dots + SKIP/START)`,
  "postal-code": `BrandedFrame                    ← wrapper de marca (logo + card + back)
└── (decide portrait/landscape con clases tailwind)
    │
    ├── Portrait  (landscape:hidden)
    │   ├── motion.div  city illustration   ← <img> cityMap (km0_city_map.png)
    │   ├── motion.div  title slot          ← alterna entre:
    │   │   ├── default:  <h1> título + <p> subtítulo
    │   │   └── found:    "📍 {cityName}"  (AnimatePresence)
    │   ├── motion.div  input field
    │   │   ├── MapPin / MapPinOff  (lucide)
    │   │   ├── <input> numérico  maxLength=5
    │   │   └── mensaje error / notFound  (AnimatePresence)
    │   └── motion.div  CTA  → <button> CONTINUAR
    │       (Loader2 spinner mientras valida)
    │
    └── Landscape  (hidden landscape:flex)
        ├── motion.div  city image (basis 42%)
        └── motion.div  columna derecha
            ├── title slot  (default / found)
            ├── input field  (MapPin + input + errores)
            └── <button> CONTINUAR

Lógica:
  · lookupTown(cp)  → src/lib/postalCodes.ts (Supabase \`postal_codes\`)
  · estados: idle / validating / found / not_found / error (no numérico)
  · al continuar: sessionStorage (km0_postal_code + km0_town) y navega /home`,
  login: `BrandedFrame                    ← wrapper de marca (logo + card + back)
└── motion.div  contenedor (fade-in + y)
    ├── header
    │   ├── <h1> "Entra o regístrate"
    │   └── <p> subtítulo
    │
    ├── <form>  (passwordless OTP email)
    │   ├── <input type="email">
    │   └── <button> CONTINUAR / "Enviando enlace..."
    │
    ├── divider  "próximamente"
    │
    └── grid social  (deshabilitados)
        ├── <button> Google  (gris + disabled)
        └── <button> Apple   (gris + disabled)

Lógica:
  · supabase.auth.signInWithOtp({ shouldCreateUser: true })
  · recupera km0_postal_code + km0_town de sessionStorage → data
  · al éxito: navega a /check-email con state {email, mode:"login"}`,
  "check-email": `BrandedFrame                    ← wrapper de marca (logo + card + back)
└── motion.div  contenedor (fade-in + y, items-center)
    ├── icon circle  (Mail dentro de círculo amarillo)
    ├── bloque texto
    │   ├── <h1> "Revisa tu correo"
    │   ├── <p> "Te hemos enviado un enlace a"
    │   ├── <p> {email}
    │   └── <p> "Pulsa el enlace del email para entrar"
    ├── <button> "Reenviar enlace" / cooldown 30s
    └── <p> footer  "¿No lo encuentras? Mira en spam..."

Lógica:
  · state.email (o ?email=) obligatorio → si falta: <Navigate to="/login">
  · cooldown decreciente (setTimeout 1s) deshabilita el botón
  · resend → supabase.auth.signInWithOtp(email)`,
  agenda: `BrandedFrame  (hideHeader, contentClassName overflow-hidden)
└── content (flex-col h-full)
    ├── HomeHero               ← reutilizado del Home
    │   └── greetingSlot: ScreenTitle "Agenda"
    ├── WhenTabs               ← segmented control (semana/próxima/mes/trimestre)
    ├── grid 4×2 categorías    ← chips con icono lucide + color por categoría
    │   (música, cultura, infantil, deporte, talleres, fiestas, gastro, todos)
    ├── contador               ← "{N} eventos" / Loader2 "Buscando…"
    └── <section> resultados (única zona scroll-y)
        ├── SkeletonCard × 3   (estado loading)
        ├── error card         (km0-coral, si fetch falla)
        ├── empty state        (CalendarIcon + mensaje)
        └── AnimatePresence
            └── grupos por día
                ├── <h3> sticky  "Hoy/Mañana/..." (formatDayHeader)
                └── EventListCard × N

Lógica:
  · queryEvents(hintCategoría, CP=08380, limit=50) en cada cambio de categoría
  · filtros locales: rango temporal (rangeFor), categoría (matches[]), precio
  · agrupación por startOfDay → Map<isoDate, items[]>`,
  evento: `BrandedFrame  (hideHeader, contentClassName overflow-hidden)
└── Estados (loading / error / notFound / detalle) según ?id=<id>
    │
    ├── loading  (spinner centrado)
    ├── error    (AlertTriangle + mensaje)
    ├── notFound (Calendar + "No hemos encontrado el evento")
    └── EventoDetalle
        ├── Hero  (ImageCarousel aspect 4/3 → 16/10, back + share flotantes)
        │   └── overlay: chips (categoría · gratis/precio · familiar) + título
        ├── section scroll-y
        │   ├── Cuándo   (horarios[]: fecha larga + hora HH:mm–HH:mm)
        │   ├── Dónde    (lugar · dirección · población · cp)
        │   ├── Descripción (whitespace-pre-line)
        │   ├── Organiza (nombre + link organizador_web)
        │   └── Tags (#tag chips)
        └── CTA sticky "Ver publicación original" (fuente_url_original) + share

Lógica:
  · Datos: getEvento(id, lang) → /api/v1/eventos?id=<id>&limit=1
  · i18n titulo/descripcion/tags/categorias según useLang (es|ca)
  · Fallback horarios: si vacío, usa fecha_inicio/hora_inicio top-level
  · CTA solo si hay fuente_url_original`,
  noticias: `DeviceShell (frame estándar)
└── content (flex-col h-full)
    ├── HomeHero  (showGreeting=false, greetingSlot: ScreenTitle "Noticias")
    └── AnimatePresence
        ├── list  (grid 1/2/3 cols responsive, única zona scroll-y)
        │   ├── SkeletonCard × 3          (?state=loading)
        │   ├── error card + Reintentar    (?state=error)
        │   ├── empty state (Newspaper)   (?state=empty)
        │   └── NoticiaCard × N            (happy)
        └── NoticiaDetail                  (?id=<id>)
            ├── back button
            └── section scroll-y (imagen, fecha, título, tags, cuerpo, fuente)

Lógica:
  · Datos: @/data/fixtures/news.json → newsListResponseSchema.parse → adaptNoticia
  · i18n de títulos/resumen/tags con useLang → noticia.titulo[lang]
  · Estados forzables por query: ?state=loading|empty|error, ?id=<id> para detalle`,
  profile: `BrandedFrame                    ← wrapper de marca (logo + card + back)
└── motion.div  contenedor (fade-in + y, overflow-y-auto en landscape)
    ├── header
    │   ├── <h1> "Mi perfil"
    │   └── <p> "Actualiza tus datos"
    │
    ├── loading state  ← Loader2 spinner centrado
    │
    └── <form>  (handleSave)
        ├── Field "Nombre"        → <input>
        ├── Field "Apellidos"     → <input>
        ├── Field "Email"         → <input readOnly disabled>  (de user.email)
        ├── grid [110px_1fr]
        │   ├── Field "C. postal" → <input numeric maxLength=5>
        │   └── Field "Población" → <input readOnly>  (derivada de CP)
        ├── <button submit> "Guardar cambios" / Loader2
        └── <button> "Cerrar sesión"  (LogOut icon)

Lógica:
  · useAuth → user (si no hay, formulario vacío modo testing)
  · validación: zod schema (first_name, last_name, postal_code regex 5d)
  · town se resuelve async vía lookupTown(postal_code)
  · signOut → toast + navigate("/home")`,
  scanner: `BrandedFrame (hideHeader)
└── content (relative flex-col h-full overflow-hidden)
    ├── header (X close + KM0 logo)
    ├── title block
    │   ├── <h1> "Escàner QR" (font-brand)
    │   └── <p> hint
    ├── viewport (dark gradient bg + teal corners + scanline)
    │   ├── motion scan line (reading only)
    │   └── validating overlay (spinner + title)
    ├── footer
    │   ├── status pill (ScanLine + footer text)
    │   └── simulation panel (reading only)
    ├── bottom teal accent line
    └── absolute overlays (error bottom-sheet / success centered card)

Lògica:
  · XState scannerMachine: reading → validating → error|success
  · scannerMockService retorna èxit/error segons el codi simulat
  · success → navigate("/scanner/success")`,
};

const StateTabs = ({
  states,
  activeId,
  onChange,
  screenLabel,
}: {
  states: ScreenStatePreview[];
  activeId: string;
  onChange: (id: string) => void;
  screenLabel: string;
}) => (
  <div
    role="tablist"
    aria-label={`Estado de ${screenLabel}`}
    className="inline-flex rounded-full border-2 border-km0-blue-700/20 bg-white p-1 shadow-sm"
  >
    {states.map((st) => {
      const active = activeId === st.id;
      return (
        <button
          key={st.id}
          type="button"
          role="tab"
          aria-selected={active}
          title={st.notes}
          onClick={() => onChange(st.id)}
          className={`px-3 py-1 rounded-full font-ui text-xs transition-colors ${
            active
              ? "bg-km0-blue-700 text-white"
              : "text-km0-blue-700 hover:bg-km0-blue-700/10"
          }`}
        >
          {st.label}
        </button>
      );
    })}
  </div>
);

const ScreenSection = ({
  screen,
  secondary,
}: {
  screen: PreviewScreen;
  secondary: { id: ViewportId; scale: number };
}) => {
  const [stateId, setStateId] = useState(screen.states[0].id);
  const state = screen.states.find((s) => s.id === stateId) ?? screen.states[0];

  // La Home se renderiza SIN iframe (HomeSandbox) en los estados que el
  // sandbox soporta, para permitir Visual Edit. El resto vía iframe.
  const useSandbox =
    screen.id === "home" &&
    (SANDBOX_HOME_STATES as string[]).includes(state.id);
  const sandboxState = state.id as HomeSandboxState;

  // Estados que requieren sesión sembrada: el iframe comparte localStorage
  // con la app real, así que aquí se ve la sesión REAL del navegador.
  // El estado exacto lo valida Playwright sembrando PREVIEW_SESSION.
  const sessionWarning =
    state.seedSession && !useSandbox
      ? "⚠ Este estado depende de la sesión real del navegador. Playwright lo valida sembrando la sesión simulada."
      : null;

  const renderFrame = (viewportId: ViewportId, scale: number) =>
    useSandbox ? (
      <SimulatedDevice
        viewportId={viewportId}
        scale={scale}
        label={screen.label}
      >
        <HomeSandbox state={sandboxState} />
      </SimulatedDevice>
    ) : (
      <ScreenFrame
        src={state.src ?? screen.path}
        viewportId={viewportId}
        scale={scale}
        label={screen.label}
      />
    );

  return (
    <section className="flex flex-col gap-4 w-full">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-ui text-lg text-km0-blue-700">{screen.label}</h2>
        {screen.states.length > 1 && (
          <StateTabs
            states={screen.states}
            activeId={stateId}
            onChange={setStateId}
            screenLabel={screen.label}
          />
        )}
        {screen.dynamicContent && (
          <span className="font-ui text-[10px] uppercase tracking-wide rounded-full bg-km0-coral-100 text-km0-coral-700 px-2 py-1">
            contenido dinámico · sin captura px
          </span>
        )}
      </div>
      {sessionWarning && (
        <p className="font-body text-xs text-km0-coral-700">{sessionWarning}</p>
      )}
      <div className="flex flex-wrap items-start gap-6 w-full">
        {renderFrame("mobile-portrait-base", 1)}
        <div className="flex flex-col gap-4 flex-1 min-w-[320px]">
          {renderFrame(secondary.id, secondary.scale)}
          {TREES[screen.id] && (
            <pre className="w-full overflow-auto rounded-xl border-2 border-km0-blue-700/20 bg-white p-4 font-mono text-xs leading-relaxed text-km0-blue-700 shadow-[0_8px_24px_-16px_hsl(var(--km0-blue-700)/0.35)] whitespace-pre">
              {TREES[screen.id]}
            </pre>
          )}
        </div>
      </div>
    </section>
  );
};

const PreviewAll = () => {
  const [secondaryId, setSecondaryId] = useState<ViewportId>("tablet-portrait");
  const secondary =
    SECONDARY_VIEWPORTS.find((v) => v.id === secondaryId) ??
    SECONDARY_VIEWPORTS[0];

  return (
    <div className="min-h-screen w-screen bg-km0-beige-50">
      <header className="sticky top-0 z-10 bg-km0-blue-700 text-white px-4 py-3 shadow-md flex flex-wrap items-center gap-x-6 gap-y-2">
        <div>
          <h1 className="font-brand text-xl">Preview · todas las pantallas</h1>
          <p className="font-body text-sm opacity-80">
            Frame fijo: {getViewportById("mobile-portrait-base").label}{" "}
            (375×667, contrato mínimo) · Segundo frame seleccionable
          </p>
        </div>
        <div
          role="tablist"
          aria-label="Segundo viewport"
          className="inline-flex flex-wrap rounded-full bg-white/10 p-1"
        >
          {SECONDARY_VIEWPORTS.map((v) => {
            const vp = getViewportById(v.id);
            const active = secondaryId === v.id;
            return (
              <button
                key={v.id}
                type="button"
                role="tab"
                aria-selected={active}
                title={vp.purpose}
                onClick={() => setSecondaryId(v.id)}
                className={`px-3 py-1 rounded-full font-ui text-xs transition-colors ${
                  active
                    ? "bg-white text-km0-blue-700"
                    : "text-white hover:bg-white/15"
                }`}
              >
                {vp.label}
                {vp.tier === "smoke" ? " · smoke" : ""}
              </button>
            );
          })}
        </div>
      </header>

      <main className="w-full px-6 sm:px-10 lg:px-16 py-6 flex flex-col gap-10">
        {PREVIEW_SCREENS.map((screen) => (
          <ScreenSection
            key={screen.id}
            screen={screen}
            secondary={secondary}
          />
        ))}
      </main>
    </div>
  );
};

export default PreviewAll;
