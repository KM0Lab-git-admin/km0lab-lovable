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
