# Encargo 05 · Agrupación de poblaciones — plan (sin ejecutar)

## 1. Ficheros por etapa

**Etapa 1 · Costuras (sin cambios visibles)**
- Nuevos: `src/types/territory.ts`, `src/data/territories.ts` (ámbito demo Breda/Hostalric/Riells), `src/services/territory.ts` (`getTerritory`), `src/hooks/use-territory.ts`, `src/hooks/use-scope-news.ts`, `src/hooks/use-scope-events.ts`, `src/components/TownTag.tsx`.
- Editados: `src/data/mockPostalCodes.ts` (17400, 17450, 17404), `src/services/municipalListings.ts` (`listScopeNews`, `listScopeEvents` con `Promise.allSettled`, dedupe a favor de la población propia, orden), `src/types/comercAdherit.ts` (`townId?`, `townName?`), `src/data/comerciosAdheridos.ts` (2-3 comercios por población nueva), `src/lib/i18n.ts` (textos §5 + helper de sustitución).
- Tests: `municipalListings.test.ts` (paralelo, fallo parcial, dedupe, orden), `territory.test.ts` (1 vs 3 poblaciones, CP desconocido → ámbito de una).

**Etapa 2 · Principal, CP, hoja y Perfil**
- `src/components/HomeHero.tsx`, `src/components/HomeContent.tsx`, `src/pages/Home.tsx`, `src/components/EventHeroCarousel.tsx` (TownTag opcional), `src/pages/PostalCode.tsx`, `src/pages/Profile.tsx`, nuevo `src/components/TownPickerSheet.tsx`, nuevo `src/components/SectionHeader.tsx` (extraído de HomeContent), `preview-manifest.ts`.

**Etapa 3 · Notícies y Agenda**
- `src/pages/Noticias.tsx`, `src/pages/Agenda.tsx`, `src/components/CategoryFilterMenu.tsx` (prop opcional de icono), `preview-manifest.ts`.

**Etapa 4 · Comerços, «sample» y repaso**
- `src/pages/Comercos.tsx`, `src/hooks/use-shops.ts` / `src/services/shops.ts` (ámbito), `src/hooks/use-preview-state.ts` (estado `sample`), nuevos fixtures de muestra, `preview-manifest.ts`.

## 2. Reutilización por pantalla

- **Principal:** HomeHero (etiqueta + nombre como Button), HomeContent, EventHeroCarousel, SectionHeader (extraído), ScreenStatus, BubbleSheet. Tarjeta de noticia: reutilizo NoticiaCard sacándola a componente compartido (hoy es local en `Noticias.tsx`).
- **Notícies:** ScreenHeader/ScreenTitle, FilterChip, NoticiaCard + prop `town`, SectionHeader, ScreenStatus.
- **Agenda:** WhenTabs, CategoryFilterMenu ×2 (categorías y población, única), EventListCard + prop `town`, ScreenStatus.
- **Comerços:** CategoryFilterMenu ×2, ComercCard + prop `town`, buscador actual, SectionHeader, ScreenStatus.
- **Código postal:** BrandedFrame y flujo actual + TownTag.
- **Perfil:** fila existente del listado + BubbleSheet.

Piezas nuevas además de TownTag (pido visto bueno):
1. `TownPickerSheet` — contenido de la hoja «El teu poble» compuesto sobre BubbleSheet; se usa desde Home y Perfil, así no se duplica.
2. `SectionHeader` compartido — extracción, no pieza nueva.
3. NoticiaCard / EventListCard movidas a `components/` solo si las necesito fuera de su página (NoticiaCard sí, para la principal; EventListCard no).

## 3. Choques con el código o KNOWLEDGE.md

1. **`src/data/fixtures/*` es intocable** (KNOWLEDGE §7). El estado «sample» pide fixtures ahí. Propuesta: añadir ficheros nuevos sin tocar los existentes. ¿Lo autorizas, o los pongo en `src/data/` (p. ej. `sampleScope.ts`)?
2. **Sustitución `{població}`:** no hay mecanismo común; hay 14 `.replace("{x}")` sueltos. KNOWLEDGE solo permite `lib/i18n.ts` en `lib/` para copy, así que añadiría `tf(key, lang, vars)` dentro de `i18n.ts` y lo usaría en los textos nuevos. No migro los 14 existentes salvo que lo pidas.
3. **CategoryFilterMenu tiene el icono fijo** (SlidersHorizontal). Necesito una prop opcional `icon` para el de ubicación; cambio aditivo en un componente compartido (no es un primitivo ui).
4. **`usePreviewState` acepta solo loading/empty/error.** Añadir `sample` cambia el tipo `ScreenState`; las pantallas que no lo usen deben ignorarlo.
5. **`useLocationContext` cae por defecto en 08380 Malgrat de Mar** sin CP. Malgrat no está agrupado → se verá como hoy. Para la demo hay que entrar con 17400/17450/17404.
6. **Detalle de evento/noticia de otra población:** hay que confirmar que `Evento.tsx` y el detalle de noticia resuelven por id sin depender de la población de referencia; si dependen, lo arreglo leyendo del caché del ámbito, sin tocar las APIs.
7. **Regla ya incumplida:** `Login.tsx` importa `@/services/mock/auth`, contra §5.1. No es parte de este encargo; ¿lo dejo o lo corrijo aparte?
8. **Cambio de forma en costura:** `ComercAdherit` gana `townId?`/`townName?` (aviso, según §3.3).

## 4. Dudas

1. Fixtures del estado `sample`: ¿en `data/fixtures/` (ficheros nuevos) o en `data/`?
2. Sin sesión, ¿la hoja «El teu poble» cambia solo el CP local (como hoy `setLocation`)? Entiendo que sí.
3. Ámbito de una población: la fila «El meu poble» de Perfil, ¿se muestra también a invitados o solo con sesión?
4. Eventos destacados del ámbito: ¿máximo total igual que hoy, con los propios primero, o un cupo para vecinas?
5. Comercios: ¿el subtítulo y las dos secciones se mantienen al aplicar el filtro de población (como en Notícies, sin secciones)? Propongo lo mismo que Notícies: con una población elegida, lista única.

No empiezo la etapa 1 hasta que me lo digas.
