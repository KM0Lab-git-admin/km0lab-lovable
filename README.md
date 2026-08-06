# km0lab-lovable

**Prototipo en Lovable de la app de vecinos de KM0 LAB.** Es la **fuente de
verdad del diseño**: pantallas, componentes React y assets nacen aquí y se
llevan a producción (repo `km0lab`, `apps/km0lab`) mediante sincronización
mecánica.

> Parte del ecosistema KM0 LAB (app del comercio y la vida de proximidad de un
> municipio). Visión global del proyecto:
> `km0lab/docs/PROYECTO-GLOBAL.md`.

## La frontera (Lovable ↔ producción)

Aquí vive **todo lo que el usuario experimenta contra mocks o APIs de solo
lectura**: UI, pantallas, componentes, layout portrait-first, i18n. **No** vive
aquí nada que toque el mundo real (auth, BD, secretos, lógica de negocio): eso
se implementa en producción. El código se porta con `pnpm sync:lovable` desde
el repo `km0lab` (ver `km0lab/docs/PORTING-FROM-LOVABLE.md` y el contrato de
generación en [`docs/KNOWLEDGE.md`](docs/KNOWLEDGE.md)).

## Stack

- **Vite 5** + **React 18** + **TypeScript**
- **Tailwind CSS 3** + **shadcn/ui**
- **React Router DOM v6** — rutas en `src/App.tsx`

> Nota: producción (`apps/km0lab`) va un paso por delante (**React 19 + React
> Router DOM v7**); el desfase lo absorbe el sync al portar.

## Estructura

- `src/pages/` — pantallas (fuente de las rutas de producción).
- `src/components/` — componentes específicos de pantalla.
- `src/components/ui/` — primitivos shadcn (kebab-case).
- `src/assets/` — imágenes/ilustraciones (source of truth de assets).

## Desarrollo

```sh
npm i
npm run dev
```

Rama: `main` (Lovable commitea aquí automáticamente; **no despliega** UAT/prod).

## Documentación

- [`docs/KNOWLEDGE.md`](docs/KNOWLEDGE.md) — contrato de generación para Lovable
  (frontera, estructura, deps aprobadas). Se pega en `Settings → Knowledge`.
- [`docs/lovable-prompting-guide.md`](docs/lovable-prompting-guide.md) — cómo
  promptear.
- [`docs/spec-home-c.md`](docs/spec-home-c.md), `screen-states.md`,
  `responsive-layout-process.md` — specs y proceso de layout.
- [`docs/PORTABILITY-CHANGELOG.md`](docs/PORTABILITY-CHANGELOG.md) — histórico
  de portabilidad hacia producción.
