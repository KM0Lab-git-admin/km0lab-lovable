# Portability Changelog

Registro de cambios realizados en este prototipo (Lovable) que deben
portarse **manualmente** al monorepo de producción KM0 LAB.

- Formato: cada versión agrupa cambios listos para portar en un único
  pase manual.
- La versión **solo** sube cuando el usuario lo indica explícitamente
  en el chat. Mientras tanto, todo cambio nuevo se acumula bajo la
  versión abierta actual.
- Cada entrada incluye: qué se cambió, archivos tocados, motivo y
  notas de portabilidad (dependencias, migraciones, gotchas).

---

## v1.0 — En curso

### 1. Bypass de `RequireAuth` en desarrollo

**Qué:** el guard `RequireAuth` deja pasar sin sesión cuando
`import.meta.env.DEV` es `true`, para poder validar pantallas
protegidas (`/points-history`, `/redeemed-rewards`, `/profile`) sin
loguearse.

**Archivos:**
- `src/components/RequireAuth.tsx`

**Motivo:** acelerar la validación visual del prototipo.

**Notas de portabilidad:**
- En producción (`import.meta.env.DEV === false`) el guard sigue
  activo: no expone rutas protegidas al usuario final.
- Si el monorepo usa otro flag para "modo dev" (por ejemplo una env
  var propia), sustituir `import.meta.env.DEV` por el flag equivalente
  antes de portar.
- Mantener también el bypass por `sessionStorage.km0_preview_authed`
  usado por `/home-registered` para las demos.

---

### 2. Slugs de URL en inglés (internacionalización de rutas)

**Qué:** todos los `path` de React Router y los `navigate(...)` del
código pasan a slugs en inglés. La app es internacional; el copy sigue
traducido vía `lib/i18n.ts`, pero las URLs son estables y en inglés.

**Mapa de renombrados (aplicar 1:1 en el monorepo):**

| Antes (CA/ES)         | Ahora (EN)            |
| --------------------- | --------------------- |
| `/historial-punts`    | `/points-history`     |
| `/premis`             | `/rewards`            |
| `/premis-canjats`     | `/redeemed-rewards`   |
| `/comercos`           | `/merchants`          |
| `/comercos/:id`       | `/merchants/:id`      |
| `/noticias`           | `/news`               |
| `/agenda`             | `/events`             |
| `/evento`             | `/event`              |
| `/home-registrado`    | `/home-registered`    |

Sin cambios (ya en inglés o neutros): `/`, `/onboarding`,
`/postal-code`, `/login`, `/check-email`, `/home`, `/points`,
`/scanner`, `/scanner/success`, `/profile`, `/design-system`.

**Archivos tocados** (todas las referencias a rutas — `<Route path>`,
`navigate("/...")`, `<Link to="/...">`, `<Navigate to="/...">`):
- `src/App.tsx`
- `src/pages/Home.tsx`
- `src/pages/HistorialPunts.tsx`
- `src/pages/PremisCanjats.tsx`
- `src/pages/Premis.tsx`
- `src/pages/Points.tsx`
- `src/pages/Comercos.tsx`
- `src/pages/ComercDetall.tsx`
- `src/pages/Agenda.tsx`
- `src/pages/Evento.tsx`
- `src/pages/Noticias.tsx`
- `src/pages/Scanner.tsx`
- `src/components/HomeModules.tsx`
- `src/components/PromoCarousel.tsx`
- `src/components/NotificationsOverlay.tsx`
- `src/components/RequireAuth.tsx`
- `src/design-system/preview-manifest.ts`
- `src/design-system/componentsCatalog.ts`

**Nota:** los **nombres de archivo/componente** (`HistorialPunts.tsx`,
`PremisCanjats.tsx`, `Comercos.tsx`, etc.) se conservan intencionadamente
en esta versión para minimizar el diff. Se renombrarán a inglés en una
versión posterior si el monorepo lo requiere; por ahora el mapping es
solo de **URLs públicas**.

**Motivo:** producto internacional; los slugs deben ser estables e
independientes del idioma de UI.

**Notas de portabilidad:**
- Redirigir permanentemente (301) las rutas antiguas a las nuevas si el
  monorepo ya está publicado con los slugs CA/ES.
- Revisar analytics, sitemaps, deep links móviles y emails
  transaccionales que apunten a las rutas antiguas.
- Los `id` internos de módulos (`m.id === "premis"`, `"agenda"`,
   `"noticias"`) NO se han renombrado — son claves de datos, no URLs.

---

### 3. Bottom tabs persistente en historial de puntos

**Qué:** la pantalla `/points-history` ahora muestra el mismo menú
inferior (`BottomTabs`) que la Home, de modo que el usuario no pierde
el contexto de navegación principal al consultar su historial de puntos.
La pestaña activa es **"Els meus punts"**.

**Archivos:**
- `src/pages/HistorialPunts.tsx`

**Motivo:** coherencia de navegación; evitar que el usuario quede "atrapado"
en una pantalla protegida sin acceso rápido a Inicio, Perfil o Premis
canjats.

**Notas de portabilidad:**
- Se reutiliza el componente `BottomTabs` existente; no hay nuevas
  dependencias.
- El cálculo de `isAuthed` respeta tanto la sesión real (`useAuth`) como
  la bandera de preview `sessionStorage.km0_preview_authed` usada en
  `/home-registered`. Al portar, mantener esta misma lógica para que las
  demos de diseño sigan navegables.
- Si se quiere el mismo comportamiento en otras pantallas protegidas
  (`/redeemed-rewards`, `/profile`), aplicar el mismo patrón: importar
  `BottomTabs`, `useAuth`, y añadir la barra como `shrink-0` dentro del
  contenedor principal de la pantalla.

---

### 4. Nueva pantalla de acciones para ganar puntos (`/points-actions`)

**Qué:** se añade una página pública, accesible también sin sesión, que
muestra el catálogo de acciones disponibles para obtener puntos, distinguiendo
las ya completadas de las pendientes y explicando en qué consiste cada una.
La página se integra en la navegación principal: el menú inferior pasa de 4 a
5 tabs con el nuevo tab **Accions** (icono Sparkles), ubicado entre Inici y
Els meus punts. El tab Accions está activo para usuarios registrados y no
registrados; el resto de tabs de perfil/puntos/premis sigue requiriendo sesión.

**Catálogo de acciones (mock):**
- Cumpleaños: +10 pts (oculta en Home).
- Primer registre a l'app: +100 pts (oculta en Home, marcada como completada en el mock).
- Primer escaneig d'un comerç: +75 pts.
- Escaneig d'un comerç: +50 pts.
- Visita web: +20 pts.
- Registre al butlletí municipal: +30 pts.
- Inscripció a la Festa Major: +40 pts.
- Enquesta de satisfacció: +15 pts.

**Archivos nuevos:**
- `src/pages/PointsActions.tsx`
- `src/data/pointsActions.ts`

**Archivos tocados:**
- `src/App.tsx` (ruta `/points-actions` pública)
- `src/components/BottomTabs.tsx` (5 columnas, tipo `HomeTab` ampliado, prop `onActions`, lógica de auth actualizada)
- `src/components/HomeContent.tsx` (prop `onActions` en la interfaz y paso a `BottomTabs`)
- `src/pages/Home.tsx` (handler `onActions` → `/points-actions`)
- `src/pages/HistorialPunts.tsx` (navegación a `/points-actions` y 5-column tabs)
- `src/pages/Comercos.tsx` (navegación a `/points-actions` y 5-column tabs)
- `src/pages/PremisCanjats.tsx` (navegación a `/points-actions` y 5-column tabs)
- `src/lib/i18n.ts` (nuevas claves: `tabs.actions`, `points.actions.*`, textos de título/descripción/tipo/filtros)
- `src/types/points.ts` (nuevos tipos `PointActionId`, `PointActionIcon`, interfaz `PointAction`)
- `src/design-system/preview-manifest.ts` (pantalla `points-actions` con estados guest/registered; notas de Home/Historial/Premis actualizadas a 5 tabs)
- `docs/PORTABILITY-CHANGELOG.md` (este registro)

**Motivo:** el usuario necesita saber qué acciones le otorgan puntos, cuáles ya
ha completado y qué le falta por hacer. Al ser informativa, la página puede
ser pública y actúa como punto de entrada para no registrados.

**Notas de portabilidad:**
- La fuente de datos actual es un mock (`src/data/pointsActions.ts`). Al
  portar, consumir la misma fuente de configuración que el panel de admin de
  puntos y añadir la propiedad `completed` por usuario (endpoint o tabla
  propia).
- Las acciones marcadas como `hidden: true` no deben aparecer en el módulo
  `EarnPointsCard` de la Home; asegurar que `EarnPointsCard` filtre
  `POINTS_ACTIONS.filter(a => !a.hidden)`.
- Ajustar el ancho del menú inferior si 5 tabs rompe la legibilidad en
  móviles pequeños (texto de 9-10 px actual).
- El icono `Sparkles` proviene de `lucide-react`, ya disponible en la lista de
  dependencias aprobadas.


### N. Home: secciones siempre visibles con estado bloqueado para invitados

**Qué:** las tres secciones de valor de la Home —**Cómo ganar puntos**,
**Premis** y **Promocions de comerços**— se muestran siempre, tanto para
usuarios registrados como invitados. Para invitados, cada sección aparece
en modo `locked`: contenido con `pointer-events-none` + opacidad, chip
"Bloquejat" con candado en la cabecera y CTA inferior "Registra't per
desbloquejar" que navega a `/login`.

**Archivos:**
- `src/components/EarnPointsCard.tsx` (props `locked` + `onLogin`)
- `src/components/RewardsPreview.tsx` (nuevo — carrusel horizontal compacto de `REWARDS`)
- `src/components/MerchantPromosPreview.tsx` (nuevo — lista de promos derivadas de `COMERCIOS_DETALL`)
- `src/components/HomeContent.tsx` (props `onSeeAllRewards`, `onSeeAllPromos`; render de las dos nuevas secciones)
- `src/pages/Home.tsx` (handlers navegan a `/rewards` y `/rewards?tab=promos`)
- `src/pages/Premis.tsx` (lee `?tab=promos` para abrir directamente esa pestaña)
- `src/lib/i18n.ts` (claves `home.section.rewards`, `home.section.promos`, `home.locked.badge`, `home.locked.cta`)
- `src/design-system/preview-manifest.ts` (notas de Home actualizadas)

**Motivo:** garantizar que el invitado vea toda la propuesta de valor de la
app (acciones, premios y promociones) antes de registrarse, y ofrecer un
punto de conversión claro en cada bloque.

**Notas de portabilidad:**
- Las tarjetas de `RewardsPreview` y `MerchantPromosPreview` reutilizan el
  estilo de `/rewards`; si el design-system del monorepo tiene primitivos
  equivalentes (`RewardCardCompact`, `PromoRow`) usarlos directamente para
  no duplicar CSS.
- `REWARDS` y `COMERCIOS_DETALL` siguen siendo mocks. Al portar, conectar a
  los endpoints reales de catálogo de premios y ficha de comercios.
- El patrón `locked + onLogin` es reutilizable: preserva la misma API en
  cualquier futura sección "gate" (candado + CTA registro).
