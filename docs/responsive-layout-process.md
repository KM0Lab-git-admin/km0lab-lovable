# Proceso de maquetación responsive

Este proyecto se maqueta contra una matriz fija de resoluciones, no contra la
idea genérica de "mobile" o "desktop". Cada cambio visual tiene un contrato
verificable antes de aceptar el resultado, y ese contrato lo automatiza
Playwright (ver más abajo).

## Matriz oficial de viewports

La fuente de verdad está en `src/design-system/viewports.ts`. Cada viewport
tiene un **tier**:

- **contract** → la pantalla debe verse BIEN: composición, jerarquía,
  espaciados. Playwright captura screenshot y compara píxeles.
- **smoke** → la pantalla solo debe NO ROMPERSE: sin overflow lateral ni
  contenido inaccesible. No se invierte tiempo de diseño aquí.

La matriz son las **4 resoluciones canónicas** compartidas con producción
(AGENTS.md de km0lab): un punto por rama CSS. Cualquier otra resolución cae
en una de estas 4 ramas, así que añadir más puntos es revisar el mismo CSS
dos veces. No se añaden viewports sin decisión humana explícita.

| Viewport | Tamaño | Breakpoint | Tier | Uso |
| --- | ---: | --- | --- | --- |
| Mobile portrait base | 375×667 | `vertical-mobile` | contract | Contrato mínimo: toda pantalla y todo estado se validan aquí. |
| Mobile landscape base | 667×375 | `horizontal-mobile` | **smoke** | Solo no-rotura (ver decisión abajo). |
| Tablet portrait | 768×1024 | `vertical-tablet` | contract | Valida escalado vertical (solo estado feliz). |
| Desktop landscape | 1280×550 | `horizontal-desktop` | contract | Punto canónico desktop, alineado con producción (solo estado feliz). |

**Estados**: loading/empty/error y variantes de sesión se validan SOLO a
375×667 — los estados cambian contenido, no ramas de layout. El estado
feliz (o la variante estructuralmente más compleja) es el único que pasa
por los 4 puntos. Excepción: un estado que cambie la estructura del
layout se trata como estado feliz.

> **Decisión de producto (2026-06): el móvil en landscape NO es un requisito.**
> Basta con que no haya overflow horizontal y todo el contenido sea accesible
> con scroll. NO se diseñan ni optimizan composiciones específicas para
> 667×375, y NO se acepta complejidad extra en el código solo para ese caso.
> Las pantallas que ya tienen layout landscape elaborado se mantienen, pero
> los cambios nuevos no están obligados a cuidarlo más allá del smoke test.

## Jerarquía de responsabilidades

1. **Frame de pantalla** (`ScreenFrame`, shells de página): controla
   anchura, altura, `overflow`, safe area y breakpoint forzado en previews.
2. **Layout de página** (`HomeContent`, `Agenda`, `Chat`): decide columnas,
   filas, zonas con scroll y orden de bloques.
3. **Componente de sección** (`HomeHero`, `EventHeroCarousel`, `ComercioCarousel`):
   resuelve composición interna, espaciados y densidad dentro del espacio
   recibido.
4. **Componente atómico** (`CouponCard`, `PointsCard`, botones): no debe
   imponer alturas globales de pantalla ni reglas de layout de página.

## Orden obligatorio para cambios visuales

1. Identificar el bloque objetivo y qué nivel de la jerarquía controla el problema.
2. Mantener estable el contrato base portrait (`375×667`), estados incluidos.
3. Revisar tablet portrait (`768×1024`), solo estado feliz.
4. Ajustar desktop (`1280×550`) solo cuando los tamaños pequeños sean estables.
5. Smoke final en móvil landscape (`667×375`): sin overflow, contenido
   accesible. Nada más.
6. Evitar "parches cruzados": si una variante necesita un override, documentar por qué.

## Reglas de implementación

- Preferir layout fluido: `flex-1`, `min-h-0`, `min-w-0`, `overflow-auto` y `clamp()`.
- Evitar alturas fijas salvo en elementos realmente constantes (headers, barras, iconos).
- Si un bloque tiene que hacer scroll, debe haber una única zona scroll clara por pantalla.
- Usar los breakpoints oficiales: `vertical-mobile`, `vertical-tablet`,
  `horizontal-mobile`, `horizontal-desktop`.
- No introducir breakpoints ad hoc sin actualizar `src/design-system/viewports.ts`,
  `src/hooks/use-breakpoint.tsx` y `tailwind.config.ts`.
- Mantener el JSX legible: si una clase responsive se vuelve difícil de razonar,
  extraer un componente o una constante de clases.

## Registro de pantallas y estados (OBLIGATORIO)

`src/design-system/preview-manifest.ts` es la fuente única de pantallas y
estados visuales. **Una tarea que añade una pantalla nueva o un estado visual
nuevo (variante con más/menos componentes según sesión, datos o query param)
no está terminada hasta registrarlo en el manifest.** Detalle de cada estado
y cómo forzarlo: `docs/screen-states.md`.

## Validación automática (Playwright)

Matriz `pantallas × estados × viewports` definida por el manifest y
`viewports.ts`. Cada test comprueba: (1) sin overflow horizontal en TODOS los
viewports, (2) captura px-a-px contra baseline en los viewports `contract`
(salvo pantallas `dynamicContent`).

- `npm run test:visual:local` → en local: levanta el dev server y valida todo
  EXCEPTO las capturas (las baselines son de Linux/CI y en Windows difieren).
- `npm run test:visual` → en CI compara también las capturas. Se ejecuta en
  cada push/PR a `main` (`.github/workflows/visual-regression.yml`).
- Cambio visual **intencionado** → ejecutar a mano el workflow
  `visual-regression` en GitHub Actions con `update_baselines: true`; las
  baselines nuevas se commitean solas. Revisar el diff de imágenes en el PR.
- Informe con diffs: artifact `playwright-report` del workflow, o
  `npm run test:visual:report` en local.
