/**
 * preview-manifest — FUENTE ÚNICA DE VERDAD de pantallas y estados visuales.
 *
 * Este fichero es DATA PURA (sin React ni imports con side-effects) porque
 * lo consumen los tests de regresión visual de Playwright.
 *
 * REGLA: cada vez que se añade una pantalla nueva (ruta en App.tsx) o un
 * estado visual nuevo (variante con más/menos componentes según sesión,
 * datos, query param…), HAY QUE registrarlo aquí. Es parte de la definición
 * de "tarea terminada" (ver docs/responsive-layout-process.md).
 */

export interface ScreenStatePreview {
  /** Identificador estable (se usa en nombres de screenshot). */
  id: string;
  label: string;
  /**
   * Ruta completa (path + query) que reproduce este estado en la app real.
   * `null` = el estado no tiene URL propia y Playwright lo ignora.
   */
  src: string | null;
  /**
   * Si true, antes de cargar la página se siembra en localStorage la sesión
   * simulada `PREVIEW_SESSION` (usuario registrado). Lo usa Playwright vía
   * addInitScript; manualmente puedes pegarla en DevTools → Application.
   */
  seedSession?: boolean;
  notes?: string;
}

export interface PreviewScreen {
  /** Identificador estable (se usa en nombres de screenshot). */
  id: string;
  label: string;
  /** Ruta base de la pantalla (como en App.tsx). */
  path: string;
  /** Estados visuales. El primero es el estado por defecto. */
  states: ScreenStatePreview[];
  /**
   * true = la pantalla pinta contenido no determinista (datos remotos,
   * fecha actual…). Playwright NO compara screenshots aquí (solo checks
   * estructurales) hasta que el contenido se pueda fijar/mockear.
   */
  dynamicContent?: boolean;
}

/**
 * Sesión simulada para el estado "registrado".
 * Replica el shape de zustand/persist de `src/stores/useAppStore.ts`
 * (clave `km0_app`, `{ state, version }`). Si cambia el store, actualizar
 * aquí y en la versión.
 */
export const PREVIEW_SESSION = {
  key: "km0_app",
  value: {
    state: {
      session: {
        user: { id: "preview-user", email: "preview@km0lab.com" },
        createdAt: "2026-01-01T00:00:00.000Z",
      },
      profiles: {
        "preview-user": {
          first_name: "Aina",
          last_name: "Preview",
          email: "preview@km0lab.com",
          postal_code: "08380",
          town: "Malgrat de Mar",
          avatar_url: null,
        },
      },
      lang: "es",
      postalCode: "08380",
      town: "Malgrat de Mar",
    },
    version: 1,
  },
} as const;

export const PREVIEW_SCREENS: PreviewScreen[] = [
  {
    id: "language",
    label: "Language",
    path: "/",
    states: [{ id: "default", label: "Por defecto", src: "/" }],
  },
  {
    id: "onboarding",
    label: "Onboarding",
    path: "/onboarding",
    states: [{ id: "default", label: "Por defecto", src: "/onboarding" }],
  },
  {
    id: "postal-code",
    label: "PostalCode",
    path: "/postal-code",
    states: [{ id: "default", label: "Por defecto", src: "/postal-code" }],
  },
  {
    id: "login",
    label: "Login",
    path: "/login",
    states: [{ id: "default", label: "Por defecto", src: "/login" }],
  },
  {
    id: "check-email",
    label: "CheckEmail",
    path: "/check-email",
    states: [
      {
        id: "default",
        label: "Por defecto",
        src: "/check-email?email=preview%40km0lab.com",
        notes: "Sin ?email redirige a /login; el query param sustituye al state de navegación.",
      },
    ],
  },
  {
    id: "email-otp",
    label: "Email OTP (plantilla de correo)",
    path: "/email/otp",
    states: [
      {
        id: "default",
        label: "Por defecto",
        src: "/email/otp?code=660111&minutes=10&email=preview%40km0lab.com",
        notes: "Maqueta presentacional del email con el código de 6 dígitos y su validez.",
      },
    ],
  },
  {
    id: "home",
    label: "Home",
    path: "/home",
    dynamicContent: false,
    states: [
      {
        id: "guest",
        label: "No registrado",
        src: "/home",
        notes: "LoginButton en el header; oculta PointsCard. Secciones EarnPointsCard, RewardsPreview y MerchantPromosPreview visibles con overlay bloqueado + CTA 'Registra't per desbloquejar'. BottomTabs con 5 tabs: Inici · Accions · Els meus punts · Premis canjats · Perfil. Sin sesión solo Inicio y Acciones están activos; los demás redirigen a /login.",
      },
      {
        id: "registered",
        label: "Registrado",
        src: "/home",
        seedSession: true,
        notes: "Oculta LoginButton; muestra PointsCard. Secciones EarnPointsCard, RewardsPreview y MerchantPromosPreview activas (sin overlay). BottomTabs: Inici · Accions · Els meus punts · Premis canjats · Perfil.",
      },
      {
        id: "notifications",
        label: "Notificaciones abiertas",
        src: "/home?notifs=open",
        notes: "NotificationsOverlay abierto al montar.",
      },
    ],
  },
  {
    id: "points-actions",
    label: "PointsActions",
    path: "/points-actions",
    states: [
      {
        id: "guest",
        label: "No registrado",
        src: "/points-actions",
        notes: "Lista de acciones para ganar puntos; el tab 'Accions' está activo y es accesible sin sesión. Sin sesión simulada se muestran los estados del mock.",
      },
      {
        id: "registered",
        label: "Registrado",
        src: "/points-actions",
        seedSession: true,
        notes: "Lista de acciones para ganar puntos con sesión simulada. El tab 'Accions' está activo.",
      },
    ],
  },
  {
    id: "historial-punts",
    label: "HistorialPunts",
    path: "/points-history",
    states: [
      {
        id: "registered",
        label: "Registrado",
        src: "/points-history",
        seedSession: true,
        notes: "Historial de transacciones con filtros y resumen de saldo. BottomTabs con 5 tabs: Inici · Accions · Els meus punts · Premis canjats · Perfil; tab 'Els meus punts' activo.",
      },
    ],
  },

  {
    id: "agenda",
    label: "Agenda",
    path: "/events",
    dynamicContent: true, // eventos remotos (Supabase)
    states: [{ id: "default", label: "Por defecto", src: "/events" }],
  },
  {
    id: "evento",
    label: "Evento",
    path: "/event",
    dynamicContent: true,
    states: [
      { id: "notfound", label: "Sin id", src: "/event" },
      {
        id: "detail",
        label: "Detalle",
        src: "/event?id=d981284158e506fe00adc07973b5c3645d10a9e169ab69c6acd985eb3a887359",
      },
    ],
  },
  {
    id: "noticias",
    label: "Noticias",
    path: "/news",
    states: [
      { id: "happy", label: "Feliz", src: "/news" },
      { id: "loading", label: "Loading", src: "/news?state=loading" },
      { id: "empty", label: "Vacío", src: "/news?state=empty" },
      { id: "error", label: "Error", src: "/news?state=error" },
      { id: "detail", label: "Detalle", src: "/news?id=not_a1b2c3d4e5f6" },
    ],
  },
  {
    id: "profile",
    label: "Profile",
    path: "/profile",
    states: [
      {
        id: "anonymous",
        label: "Sin sesión",
        src: "/profile",
        notes: "Formulario vacío (modo testing sin user).",
      },
      {
        id: "registered",
        label: "Con sesión",
        src: "/profile",
        seedSession: true,
        notes: "Formulario precargado con el perfil de la sesión sembrada.",
      },
    ],
  },
  {
    id: "premis-canjats",
    label: "PremisCanjats",
    path: "/redeemed-rewards",
    states: [
      {
        id: "default",
        label: "Por defecto",
        src: "/redeemed-rewards",
        notes: "Mock con todos los estados: pending, redeemed y expired. Incluye BottomTabs con 5 tabs: Inici · Accions · Els meus punts · Premis canjats · Perfil; tab 'Premis canjats' activo.",
      },

    ],
  },

  {
    id: "scanner",
    label: "Scanner",
    path: "/scanner",
    states: [{ id: "default", label: "Lectura", src: "/scanner" }],
  },
];

export const getScreenById = (id: string): PreviewScreen => {
  const screen = PREVIEW_SCREENS.find((s) => s.id === id);
  if (!screen) throw new Error(`Pantalla no registrada en preview-manifest: ${id}`);
  return screen;
};
