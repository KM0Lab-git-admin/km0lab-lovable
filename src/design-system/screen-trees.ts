/**
 * Árboles de componentes por pantalla. Fuente de verdad para el panel
 * de inspección (`/inspect/*`) y para el catálogo `/preview-all`.
 *
 * Mantén cada entrada sincronizada con la composición real de la
 * pantalla; si cambias la estructura, actualiza también su árbol aquí.
 */
export const SCREEN_TREES: Record<string, string> = {
  home: `(NO usa BrandedFrame — DeviceShell propio; layout único centrado y limitado (~430px), bg beige rellena laterales en viewports anchos)

DeviceShell → contenedor centrado → HomeContent
├── HomeHero               ← header FIJO (inline=true; sin greetingSlot)
│   ├── skyline malgrat    (bg absoluto, object-top, opacity-25)
│   └── fila header        (escudo + ciudad + KM0 + bell)
├── body scroll-y
│   ├── section JoinCard (guest) / PointsCard (auth)
│   ├── section "Accesos rápidos"     → HomeModules (6 módulos: 2 filas × 3 cols)
│   ├── section "Eventos destacados"  → EventHeroCarousel
│   ├── section "Bescanvia amb punts" → CouponCard × N (guest: locked)
│   └── section "Com guanyar punts"   → EarnPointsCard (guest)

├── BottomTabs             ← fijo abajo (showProfile si auth)
└── NotificationsOverlay

Lógica:
  · useAuth → isAuthed → showLogin / showProfile / showPoints
  · useNotifications → bell + overlay (markAllRead al abrir)
  · modules state (INITIAL_MODULES) con toggleModule
  · módulo "agenda" → navigate("/agenda")
  · módulo "noticias" → navigate("/noticias"); resto togglea activo`,
};
