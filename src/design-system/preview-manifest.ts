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
    id: "rewards", label: "Premis", path: "/rewards", dynamicContent: true,
    states: [
      { id: "guest", label: "Público", src: "/rewards", notes: "Catálogo público UAT compartido con Home; tarjetas de una columna con imágenes completas y fallback de icono solo sin imagen. Sin saldo de invitado ni pestaña Canjes activa; confirmación requiere sesión mediante AccountAccessFlow compartido con las pestañas." },
      { id: "registered", label: "Cuenta demo", src: "/rewards", seedSession: true, notes: "Saldo compartido con Home/historial/canjes; confirmación en BubbleSheet y escritura solo en el ledger local simulado. Navegación inferior, teclado y arrastre." },
      { id: "promos", label: "Promociones", src: "/rewards?tab=promos", notes: "Promociones y arte de comercios mediante useShopPromotions, compartidos con Home; presentación conservada." },
      { id: "loading", label: "Carga", src: "/rewards?state=loading" },
      { id: "empty", label: "Vacío", src: "/rewards?state=empty" },
      { id: "error", label: "Error", src: "/rewards?state=error" },
    ],
  },
  {
    id: "language",
    label: "Language",
    path: "/",
    states: [{
      id: "default",
      label: "Por defecto",
      src: "/",
      notes: "Ilustración centrada a todo el ancho del marco que absorbe la altura sobrante. Hoja beige ajustada a su contenido, título en los tres idiomas y tres tarjetas compactas de 60px mínimos, sin elevación ni saltos. Validar sin scroll en 375×667, 390×844 y 412×915; logo, imágenes, colores y navegación a 300ms conservados.",
    }],
  },
  {
    id: "onboarding",
    label: "Onboarding",
    path: "/onboarding",
    states: [{
      id: "default",
      label: "Por defecto",
      src: "/onboarding",
      notes: "Carrusel centrado a ancho completo con imágenes enteras próximas a la cabecera, sin filtros ni recortes, sobre fondo blanco.",
    }],
  },
  {
    id: "how-it-works",
    label: "HowItWorks",
    path: "/how-it-works",
    states: [{
      id: "default",
      label: "Por defecto",
      src: "/how-it-works",
      notes: "Carrusel de 5 pasos («Com funciona?»): cabecera con logo, claim bajo el logo y botón volver; los cinco pasos muestran su ilustración completa (asset CDN) sobre el panel de color. Tarjeta de texto con badge «PAS n» y botón derecho a /login.",
    }],
  },
  {
    id: "postal-code",

    label: "PostalCode",
    path: "/postal-code",
    states: [{ id: "default", label: "Por defecto", src: "/postal-code", notes: "Ilustración isométrica de la plaza (fuente, ayuntamiento, panadería, farmacia, cafetería y frutería) a ancho completo y sin recortes; el resto de la pantalla no cambia." }],
  },
  {
    id: "login",
    label: "Login",
    path: "/login",
    states: [{ id: "default", label: "Por defecto", src: "/login", notes: "Acceso simulado, cualquier correo con 123456, sin promesa de envío; retorno contextual desde ruta privada." }],
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
        notes: "La tarjeta «Comparteix KM0 Lab» conserva un único botón «Compartir» que abre el panel de canales (drawer en móvil, modal en escritorio) con aviso de que sin sesión no hay puntos, accesos a crear cuenta / iniciar sesión, WhatsApp · Correu · Facebook · Més opcions (solo con menú nativo) y «Copia l'enllaç»; sin QR en esta fase. Vista directa del panel en /home?share=1. Acabado Burbuja: cabecera amarilla con ilustración genérica, registro blanco con «Com funciona?» y acceso a sesión, burbujas ilustradas, eventos 84%, premios 44%, filas de acciones y promociones y tarjeta Compartir al final. Oculta PointsCard. Secciones EarnPointsCard, RewardsPreview y MerchantPromosPreview visibles. RewardsPreview consume la API real de premios (UAT, /api/v1/rewards/public?postal_code=&lang=) con imágenes; fallback al mock local si falla. BottomTabs con 5 tabs: Inici · Accions · Els meus punts · Premis canjats · Perfil.",
      },
      {
        id: "registered",
        label: "Registrado",
        src: "/home",
        seedSession: true,
        notes: "Acabado Burbuja con cabecera amarilla y PointsCard blanca con moneda y progreso. La tarjeta «Invita i guanya punts» incluye el resumen mock 2 persones + 1 negoci = 700 punts, el CTA principal «Invitar» y el botón secundario «Les meves invitacions». Secciones EarnPointsCard, RewardsPreview y MerchantPromosPreview activas. BottomTabs: Inici · Accions · Els meus punts · Premis canjats · Perfil.",
      },
      {
        id: "notifications",
        label: "Notificaciones abiertas",
        src: "/home?notifs=open",
        notes: "Panel de noticias municipales abierto dentro del marco de Home, con cierre accesible y estados loading/empty/error/ready; no sustituye datos por avisos ficticios.",
      },
      { id: "account-points", label: "Acceso a puntos sin sesión", src: "/home?access=points", notes: "AccountBottomTabs reutiliza el panel contextual de cuenta de todos los interiores, correo y OTP simulado con retorno a puntos; cerrar conserva la pantalla y limpia access." },
      { id: "account-rewards", label: "Acceso a premios sin sesión", src: "/home?access=rewards" },
      { id: "account-profile", label: "Acceso a perfil sin sesión", src: "/home?access=profile" },
    ],
  },
  {
    id: "invite",
    label: "Invite",
    path: "/invite",
    states: [
      { id: "guest", label: "Sin sesión", src: "/invite", notes: "Enlace público del municipio: aviso de que sin sesión no hay puntos, accesos a crear cuenta / iniciar sesión y canales WhatsApp · Correu · Facebook · Més opcions · Copia l'enllaç. Sin QR." },
      { id: "account-profile", label: "Acceso a perfil sin sesión", src: "/invite?access=profile", notes: "Panel de cuenta compartido, contenido de invitación conservado al cerrar y retorno a perfil después del OTP." },
      { id: "registered", label: "Con sesión", src: "/invite", seedSession: true, notes: "Cabecera «Invita i guanya punts», selector Una persona (+100) / Un negoci (+500) con explicación contextual y canales de envío con enlace atribuido. Sin QR ni bloque de registro." },
      { id: "loading", label: "Cargando", src: "/invite?state=loading", seedSession: true },
      { id: "expired", label: "Sesión caducada", src: "/invite?state=expired", notes: "Estado excepcional: invita a recuperar la sesión antes de generar invitaciones con puntos." },
      { id: "error", label: "Error", src: "/invite?state=error", seedSession: true, notes: "El enlace personal no se ha podido preparar; ofrece «Torna-ho a provar» y no cae a un enlace sin atribución." },
    ],
  },
  {
    id: "my-invitations",
    label: "MyInvitations",
    path: "/my-invitations",
    dynamicContent: true,
    states: [
      { id: "default", label: "Con registros", src: "/my-invitations", seedSession: true, notes: "Datos simulados compartidos con Home y Els meus punts: 2 persones + 1 negoci = 700 punts. El acceso directo vuelve por defecto a Els meus punts; ?from=home|points|actions conserva la sección de origen. AccountBottomTabs comparte el flujo de acceso contextual." },
      { id: "pending", label: "Punts pendents", src: "/my-invitations?state=pending", seedSession: true, notes: "Incluye un registro completado con recompensa procesándose; los punts pendents no suman a «Punts guanyats»." },
      { id: "loading", label: "Cargando", src: "/my-invitations?state=loading", seedSession: true },
      { id: "empty", label: "Sin registros", src: "/my-invitations?state=empty", seedSession: true, notes: "Mensaje vacío + CTA «Invitar» y aclaración de que compartir no confirma envío ni registro." },
      { id: "error", label: "Error", src: "/my-invitations?state=error", seedSession: true, notes: "Error con «Tornar-ho a provar»." },
    ],
  },
  {
    id: "business-signup",
    label: "BusinessSignup",
    path: "/business-signup",
    states: [
      { id: "ready", label: "Formulario", src: "/business-signup?ref=pilot-preview&town=Malgrat%20de%20Mar" },
      { id: "loading", label: "Cargando", src: "/business-signup?state=loading" },
      { id: "empty", label: "Vacío", src: "/business-signup?state=empty" },
      { id: "error", label: "Error", src: "/business-signup?state=error" },
      { id: "already", label: "Ya registrado", src: "/business-signup?state=already" },
      { id: "success", label: "Confirmación", src: "/business-signup?state=success" },
    ],
  },
  {
    id: "points-actions",
    label: "PointsActions",
    path: "/points-actions",
    states: [
      { id: "loading", label: "loading", src: "/points-actions?state=loading" },
      { id: "empty", label: "empty", src: "/points-actions?state=empty" },
      { id: "error", label: "error", src: "/points-actions?state=error" },

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
        notes: "Lista de acciones para ganar puntos con sesión simulada. El tab 'Accions' está activo; ejemplos unificados 500 cumpleaños, 20 escaneo y 50 primer escaneo, no puntos reales.",
      },
      { id: "account-points", label: "Acceso a puntos sin sesión", src: "/points-actions?access=points" },
      { id: "account-rewards", label: "Acceso a canjes sin sesión", src: "/points-actions?access=rewards" },
      { id: "account-profile", label: "Acceso a perfil sin sesión", src: "/points-actions?access=profile" },
    ],
  },
  {
    id: "historial-punts",
    label: "HistorialPunts",
    path: "/points-history",
    states: [
      { id: "loading", label: "loading", src: "/points-history?state=loading", seedSession: true },
      { id: "empty", label: "empty", src: "/points-history?state=empty", seedSession: true },
      { id: "error", label: "error", src: "/points-history?state=error", seedSession: true },

      {
        id: "registered",
        label: "Registrado",
        src: "/points-history",
        seedSession: true,
        notes: "Cuenta simulada persistida por usuario, saldo con signo y canjes vinculados al mismo historial. Cabecera común y arrastre vertical; estados explícitos. Historial de transacciones con filtros y resumen de saldo. Incluye la fila «Punts per invitacions» con el total histórico concedido y acceso al seguimiento. AccountBottomTabs comparte el acceso contextual sin sesión y abre destinos directamente con sesión; «Els meus punts» activo.",
      },
    ],
  },

  {
    id: "agenda",
    label: "Agenda",
    path: "/events",
    dynamicContent: true, // eventos remotos (Supabase)
    states: [
      {
        id: "default",
        label: "Por defecto",
        src: "/events",
        notes: "Una sola consulta paginada completa por municipio/rango/idioma. Categorías y conteos derivados de esa lista, selección múltiple y menú junto a fechas. Campana abre el panel compartido y marca leído al abrir; arrastre vertical.",
      },
    ],
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
      { id: "happy", label: "Feliz", src: "/news", notes: "Municipio único, noticias completas paginadas y caché compartida con campanas. Campana abre NotificationsOverlay contenido en el marco; arrastre vertical." },
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
        notes: "Sin sesión se redirige al acceso simulado conservando el destino; los accesos de navegación usan el panel contextual.",
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
      { id: "loading", label: "loading", src: "/redeemed-rewards?state=loading", seedSession: true },
      { id: "empty", label: "empty", src: "/redeemed-rewards?state=empty", seedSession: true },
      { id: "error", label: "error", src: "/redeemed-rewards?state=error", seedSession: true },

      {
        id: "default",
        label: "Por defecto",
        src: "/redeemed-rewards",
        seedSession: true,
        notes: "Un único DeviceShell en App. Tarjetas compartidas con catálogo, imágenes, arrastre, copia confirmada y cuenta simulada persistida. Pendientes reúne pending/ready, filtro caducados y fechas relativas coherentes; ca/es/en. Mock con todos los estados: pending, ready, redeemed y expired. AccountBottomTabs con 5 tabs y AccountAccessFlow compartido; tab 'Premis canjats' activo.",
      },

    ],
  },

  {
    id: "merchants",
    label: "Comercos",
    path: "/merchants",
    states: [
      { id: "guest", label: "Sin sesión", src: "/merchants" },
      { id: "registered", label: "Con sesión", src: "/merchants", seedSession: true },
      { id: "account-points", label: "Acceso a puntos sin sesión", src: "/merchants?access=points", notes: "AccountBottomTabs compone AccountAccessFlow: el mismo panel de Home se abre sobre Comercios, conserva el destino tras OTP y mantiene la lista al cerrar." },
      { id: "loading", label: "Carga", src: "/merchants?state=loading" },
      { id: "empty", label: "Vacío", src: "/merchants?state=empty" },
      { id: "error", label: "Error recuperable", src: "/merchants?state=error" },
    ],
  },
  {
    id: "merchant-detail", label: "ComercDetall", path: "/merchants/forn-rovira",
    states: [
      { id: "unvisited", label: "Sin visitar", src: "/merchants/forn-rovira", notes: "Datos mediante useShop; municipio y panel de notificaciones compartidos con Agenda; distancia oculta si es null." },
      { id: "visited", label: "Visitado", src: "/merchants/cafe-del-mar" },
      { id: "loading", label: "Carga", src: "/merchants/forn-rovira?state=loading" },
      { id: "empty", label: "No encontrado", src: "/merchants/forn-rovira?state=empty" },
      { id: "error", label: "Error recuperable", src: "/merchants/forn-rovira?state=error" },
    ],
  },
  {
    id: "scanner",
    label: "Scanner",
    path: "/scanner",
    states: [{ id: "default", label: "Lectura", src: "/scanner", notes: "scannerService.scan y tipos de types/scan; escaneo mock suma 20 solo en la cuenta simulada, total deriva del ledger compartido. Casos: éxito, ya visitado, código inválido, QR caducado y sin conexión." }],
  },
];

export const getScreenById = (id: string): PreviewScreen => {
  const screen = PREVIEW_SCREENS.find((s) => s.id === id);
  if (!screen) throw new Error(`Pantalla no registrada en preview-manifest: ${id}`);
  return screen;
};
