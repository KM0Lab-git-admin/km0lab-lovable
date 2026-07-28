# Pantallas × estados visuales

Inventario de cada pantalla de la app y sus **estados visuales** (variantes
con más/menos componentes según sesión, datos o query param). La versión
ejecutable de esta tabla es `src/design-system/preview-manifest.ts`, que
alimenta los tests de Playwright: **este doc explica, el manifest manda**.
Si añades una pantalla o estado, actualiza los dos.

## Cómo se fuerza cada tipo de estado

| Mecanismo | Cuándo usarlo | Ejemplo |
| --- | --- | --- |
| Query param | Estados de UI puros (overlay abierto, variante de diseño) | `/home?notifs=open`, `/evento?variant=ticket` |
| Sesión sembrada en localStorage | Estados que dependen de `useAuth` (registrado vs guest) | Playwright siembra `PREVIEW_SESSION` (clave `km0_app`) antes de cargar |

La sesión sembrada replica el shape de `zustand/persist` de
`src/stores/useAppStore.ts`. Si el store cambia de shape o de `version`,
actualizar `PREVIEW_SESSION` en el manifest.

## Inventario

### Home (`/home`) — la pantalla con más variación por estado

| Estado | Cómo se fuerza | Qué cambia |
| --- | --- | --- |
| No registrado (guest) | localStorage limpio | `LoginButton` visible y centrado; sin `PointsCard`; `BottomTabs` sin tab Perfil |
| Registrado | sesión sembrada | Sin `LoginButton`; `PointsCard` en el hero; tab Perfil en `BottomTabs` |
| Notificaciones abiertas | `/home?notifs=open` | `NotificationsOverlay` sobre la card |

### Profile (`/profile`)

| Estado | Cómo se fuerza | Qué cambia |
| --- | --- | --- |
| Sin sesión | localStorage limpio | Formulario vacío (modo testing); email deshabilitado vacío |
| Con sesión | sesión sembrada | Formulario precargado con el perfil del usuario |

### Evento (`/evento`)

| Estado | Cómo se fuerza | Qué cambia |
| --- | --- | --- |
| Variante Hero (v1) | `/evento` | `ImageCarousel` horizontal + card flotante + CTAs sticky |
| Variante Ticket (v3) | `/evento?variant=ticket` | Póster 3:4 + perforaciones + stub de 3 columnas |

### CheckEmail (`/check-email`)

| Estado | Cómo se fuerza | Qué cambia |
| --- | --- | --- |
| Por defecto | `/check-email?email=...` | Sin `?email` (ni navigation state) redirige a `/login` |

### Pantallas de estado único (hoy)

| Pantalla | Ruta | Estados runtime NO capturados aún |
| --- | --- | --- |
| Language | `/` | — |
| Onboarding | `/onboarding` | posición del carrusel (drag) |
| PostalCode | `/postal-code` | `idle / validating / found / not_found / error` — dependen de input + Supabase |
| Login | `/login` | enviando enlace (spinner) |
| Agenda | `/agenda` | `loading (skeleton) / error / empty / con resultados` — dependen de Supabase. **dynamicContent** |

Las pantallas `dynamicContent` no tienen comparación de screenshot en
Playwright (los datos remotos/fecha harían el test flaky); solo checks
estructurales. **Mejora pendiente**: interceptar las llamadas a Supabase con
`page.route()` y fixtures para poder capturar Agenda y los estados
`empty/error` de forma determinista — cuando se haga, quitar
`dynamicContent: true` del manifest.

## Regla al crear o modificar pantallas

1. ¿La pantalla muestra/oculta componentes según sesión, datos o params?
   → cada combinación visualmente distinta es un **estado** y se registra en
   `preview-manifest.ts` (con `src` que lo fuerce, o `src: null` si no es
   forzable por URL).
2. Un cambio en una pantalla con N estados debe validarse en los N estados
   en su ruta real y con `npm run build`.
3. Preferir estados forzables por URL (query param) a estados solo-sandbox:
   son testeables sin código extra.
