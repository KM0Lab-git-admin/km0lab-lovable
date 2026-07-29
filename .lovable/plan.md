## Objetivo

En la Home, las tres secciones de valor —**Cómo ganar puntos**, **Promocions de comerços** y **Premis**— deben mostrarse siempre con el mismo formato tanto si el usuario está registrado como si no. Cuando el usuario es invitado, cada sección aparece con un overlay de candado + CTA de registro; el contenido sigue siendo visible pero no interactivo.

## Cambios de UI

### 1. `EarnPointsCard` (ya existente, siempre visible)
- Añadir prop `locked?: boolean`.
- Cuando `locked`, envolver la lista de acciones en un contenedor con `pointer-events-none` + ligera opacidad, y superponer un badge/candado en la esquina superior derecha (junto al "Verlos todos") con texto "Registra't per activar" (i18n).
- El botón "Verlos todos" en modo `locked` navega a `/login` en vez de `/points-actions`.

### 2. Nueva sección **Premis destacats** en Home
- Componente `RewardsPreview` (nuevo, `src/components/RewardsPreview.tsx`).
- Reutiliza el mismo estilo visual que las tarjetas de `/rewards` pero en versión compacta: carrusel horizontal (scroll-snap) con las 3-4 primeras `REWARDS` activas.
- Cabecera con título "Premis" y acción "Veure tots" → `/rewards`.
- Prop `locked` idem que EarnPointsCard: overlay candado + CTA registro, navegación a `/login`.

### 3. Nueva sección **Promocions de comerços** en Home
- Componente `MerchantPromosPreview` (nuevo, `src/components/MerchantPromosPreview.tsx`).
- Deriva las promos de `COMERCIOS_DETALL` (mismo mapeo que hace `Premis.tsx` en la tab "promos") y muestra las 3-4 primeras con la misma `PromoCard` compacta.
- Cabecera "Promocions" con acción "Veure totes" → `/rewards?tab=promos`.
- Soporta `locked` con overlay + CTA registro.

### 4. Integración en `HomeContent.tsx`
Orden dentro del scroll (mobile-first, portrait):
1. `JoinCard` (solo invitado) / `PointsCard` (solo registrado) — sin cambios.
2. `HomeModules` — sin cambios.
3. `EventHeroCarousel` — sin cambios.
4. `EarnPointsCard` con `locked={!isAuthed}`.
5. `RewardsPreview` con `locked={!isAuthed}`.
6. `MerchantPromosPreview` con `locked={!isAuthed}`.

### 5. Overlay reutilizable de bloqueo
Un pequeño helper interno (mismo patrón usado en cada uno de los tres componentes, sin nuevo componente compartido para no proliferar API) con:
- Ícono `Lock` de lucide-react sobre un chip pill con fondo `bg-km0-blue-800/85 text-white`, esquina superior derecha de la cabecera.
- Botón CTA en la parte inferior de la sección: "Registra't per activar" que llama al handler `onLogin`.

## Cambios técnicos

- `src/components/EarnPointsCard.tsx`: nueva prop `locked` + `onLogin`.
- `src/components/RewardsPreview.tsx` (nuevo).
- `src/components/MerchantPromosPreview.tsx` (nuevo).
- `src/components/HomeContent.tsx`: pasar handlers y renderizar las dos nuevas secciones siempre.
- `src/pages/Home.tsx`: pasar `onRewards={() => navigate('/rewards')}`, `onPromos={() => navigate('/rewards?tab=promos')}`, `onLogin={goToLogin}` a las nuevas props.
- `src/pages/Premis.tsx`: leer `?tab=promos` del querystring para abrir directamente la pestaña de promocions cuando se navega desde la Home.
- `src/lib/i18n.ts`: nuevas claves
  - `home.section.rewards` — "Premis" / "Premios" / "Rewards"
  - `home.section.promos` — "Promocions dels comerços" / "Promociones de los comercios" / "Merchant promos"
  - `home.locked.badge` — "Bloquejat" / "Bloqueado" / "Locked"
  - `home.locked.cta` — "Registra't per desbloquejar" / "Regístrate para desbloquear" / "Sign up to unlock"
- `src/design-system/preview-manifest.ts`: actualizar la ficha de `/home` para reflejar las nuevas secciones (títulos y estado guest vs registered).
- `docs/PORTABILITY-CHANGELOG.md`: añadir entrada bajo **v1.0 — En curso** describiendo las nuevas secciones y el patrón `locked` + CTA.

## Fuera de alcance

- No se cambian rutas, no se toca RLS, no se añaden dependencias.
- No se rediseñan las tarjetas de `/rewards`; solo se reutiliza su estilo en versión compacta horizontal.
- No se cambia la lógica de puntos ni de canje.
