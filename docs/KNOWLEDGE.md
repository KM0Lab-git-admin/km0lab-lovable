# KNOWLEDGE — contrato de generación de código (COMPLETO Y VINCULANTE)

> Este documento es la versión completa de las reglas resumidas en el
> campo Knowledge del proyecto. Fuente de verdad: `docs/LOVABLE-KNOWLEDGE.md`
> del monorepo de producción `km0lab` (se actualizan juntos, en el mismo
> cambio). La IA de Lovable DEBE leer este archivo antes de generar o
> modificar código y cumplirlo literalmente.


Eres el entorno de prototipado del proyecto **KM0 LAB**. El código que
generas NO es desechable: se sincroniza de forma automática con un
monorepo de producción mediante un mapping mecánico de archivos. Cada
regla de este documento existe para que esa sincronización funcione sin
intervención humana. Cúmplelas literalmente.

## 0. Frontera Lovable ↔ producción

Aquí vive todo lo que el usuario experimenta, funcionando contra
implementaciones falsas o APIs de solo lectura. En producción vive todo
lo que toca el mundo real. La prueba de fuego ante cualquier duda:

> ¿Necesita un secreto (API key privada, credencial, BD), escribe datos,
> o contiene lógica de negocio de backend? → NO se hace aquí; se deja la
> firma mock y se avisa en el chat.

**Permitido en Lovable**: pantallas y flujos completos, estado global
(Zustand), máquinas de estados (XState), validaciones de formulario,
services mock con firmas estables, y **consumo de APIs públicas de solo
lectura** (ver §6).

**Prohibido en Lovable**: escrituras contra backends reales, auth real,
acceso a BD, secretos, procesamiento de datos de negocio.

**Piezas solo-Lovable** (nunca se sincronizan; no las mezcles con código
de producto): `src/integrations/`, `supabase/`, `src/design-system/`,
las páginas `PreviewAll`, `DesignSystem` y `Components`, y los
componentes `DeviceShell` y `SimulatedDevice`.

## 1. Estructura de carpetas (contrato de sync)

Trabaja SOLO dentro de `src/` (y `supabase/` para el entorno propio de
Lovable), con esta estructura exacta:

```
src/
├── pages/          # 1 pantalla = 1 archivo PascalCase (Home.tsx)
├── components/     # componentes específicos de pantalla, PascalCase, planos
│   └── ui/         # primitivos shadcn, kebab-case (button.tsx, dialog.tsx)
├── hooks/          # hooks reutilizables (use-postal-code.ts)
├── services/       # capa de datos: mocks tipados y consumo de APIs read-only
├── data/           # datos mock y fixtures capturadas (data/fixtures/)
├── stores/         # estado global Zustand (useAppStore.ts)
├── machines/       # máquinas de estados XState (chatMachine.ts)
├── contexts/       # providers React (LangContext.tsx)
├── types/          # tipos de dominio compartidos
├── lib/i18n.ts     # diccionario de copy ca/es/en (único lugar del copy)
├── lib/utils.ts    # SOLO cn(). No añadas nada más aquí.
└── assets/         # imágenes y fuentes (kebab-case)
```

Cada carpeta tiene un destino fijo en producción; NO crees carpetas
nuevas de primer nivel ni subcarpetas en `pages/`. Los componentes de
`components/` van planos; solo agrupa en subcarpeta PascalCase cuando una
pantalla tenga varios componentes auxiliares propios.

## 2. Convenciones de nombres

- Código e identificadores **en inglés** (los nombres de dominio ya
  existentes en español — `Evento`, `Noticia` — se mantienen por
  coherencia con la API). Copy de producto SOLO en `lib/i18n.ts`.
- Pantallas y componentes de app: archivo y componente en `PascalCase`,
  `export default`.
- Primitivos de `components/ui/`: archivo `kebab-case`, **exports con
  nombre** (estilo shadcn: `export { Button, buttonVariants }`).
- Hooks: archivo `use-<nombre>.ts(x)` en kebab-case, función `useNombre`.
- Services, stores, machines y data: archivo `camelCase.ts`.
- Props y funciones: `camelCase`. Tipos exportados: `PascalCase`, sin
  prefijo `I`. Props siempre tipadas; **prohibido `any`**.
- Rutas de React Router: paths en `kebab-case` (`/postal-code`).
- Un componente por archivo; el nombre del archivo = nombre del export.

## 3. Design system y componentes compartidos

- Usa EXCLUSIVAMENTE los tokens del design system KM0 (documento anexo):
  tokens semánticos (`primary`, `foreground`, `muted`, `card`,
  `destructive`, `success`…) o paleta `km0-*`. **Prohibido** hex/rgb
  crudos y atributos de presentación. `style={{...}}` inline solo para
  valores calculados en runtime (p. ej. `animationDelay` dinámico),
  nunca para estilos estáticos.
- Antes de crear un primitivo nuevo en `components/ui/`, reutiliza los
  existentes. Composición explícita (`<Card>`, `<CardHeader>`…) antes
  que props mágicas.
- Pantallas con marca se envuelven en `<BrandedFrame>`; el chat usa su
  fullbleed propio.
- **Portrait-only (regla absoluta).** La app vive en un marco fijo
  vertical (~420px). Diseña UNA sola maqueta portrait por pantalla, que
  se ve igual en cualquier resolución u orientación real del dispositivo.
  En `src/pages` y `src/components` está **prohibido** usar variantes de
  orientación/tablet — `landscape:`, `vertical-tablet:`,
  `horizontal-mobile:`, `horizontal-desktop:`, `wide-landscape:`,
  `short-landscape:` — y también `sm:`/`md:`/`lg:`. No crees bloques
  paralelos por orientación (`hidden landscape:flex`, componentes
  `XxxLandscape`) ni midas `window.innerWidth`/`innerHeight` para
  maquetar: el layout debe depender del marco, no de la ventana. Una
  regla de ESLint rechaza estas variantes (ver `eslint.config.js`).
- Las 4 variantes siguen DEFINIDAS en `tailwind.config.ts` (mirror 1:1
  con producción y Playwright) y las usan las piezas solo-Lovable
  (`PreviewAll`, `SimulatedDevice`), pero NO el código de producto. No
  modifiques su definición: está espejada con producción. En pantallas,
  en la práctica solo se usa la base portrait (opcionalmente
  `vertical-mobile:`, que conserva su media-query).
- Diseña y valida cada pantalla en las resoluciones canónicas. En
  portrait, valida SIEMPRE en horquilla de altura: 375×667 (el más bajo)
  Y 390×844 (alto). Un solo alto de pantalla no basta: los gaps y
  espacios estirados solo aparecen con altura extra.
- **Estructura vertical que garantiza cualquier altura portrait**: cada
  pantalla es una columna flex de `[cabecera shrink-0]` +
  `[cuerpo flex-1 min-h-0 con el scroll]` + `[footer/tabs shrink-0]`. La
  altura sobrante SIEMPRE la absorbe el scroll del cuerpo, NUNCA un gap.
  Los heros/cabeceras tienen altura acotada (no crecen con el alto del
  viewport). Con esto, si una pantalla se ve bien en 375×667, se ve bien
  en cualquier portrait más alto por construcción.
- **Layout canónico = columna portrait, centrada y limitada.** El diseño
  base es una sola columna portrait (375×667). En viewports más anchos
  (tablet, landscape, desktop) NO se reflowa a varias columnas: se
  renderiza la MISMA columna, centrada y con ancho máximo (~430px), y el
  fondo rellena los laterales. Así todos los formatos heredan
  automáticamente los cambios del portrait y ninguno se desincroniza. NO
  crees layouts bespoke por orientación (un componente `XxxLandscape`
  aparte). Esto aplica a TODAS las pantallas sin excepción, incluidas las
  de marca (Language, Onboarding, PostalCode). Los bloques anchos
  (carruseles) hacen scroll DENTRO de su contenedor; el cuerpo nunca
  desborda en horizontal.
- **Centrado vertical.** El cuerpo de la pantalla centra su contenido en
  el eje vertical cuando cabe, y hace scroll (sin recortar) cuando no
  cabe. Patrón: el contenedor de scroll es `flex-1 min-h-0 overflow-y-auto`
  y el contenido va en una columna `min-h-full flex flex-col justify-center`.
  Con esto, en pantallas cortas (onboarding, idioma, código postal) el
  contenido queda centrado sin gaps colgando abajo; en pantallas con
  mucho contenido (Home, Noticias, Agenda) el sobrante se resuelve con
  scroll del cuerpo. Nunca uses `justify-start` + alturas fijas dejando
  que el hueco caiga abajo, ni `justify-center` a secas en un contenedor
  con scroll (recorta la parte superior al desbordar).
- **Desktop = teléfono centrado (app mobile-first).** KM0 LAB es una app
  de móvil (Capacitor); desktop es superficie secundaria. En pantallas
  anchas la app se presenta como un teléfono en vertical centrado sobre
  el fondo (lo hace `DeviceShell`), NO como un layout de escritorio
  propio. No construyas layouts desktop multicolumna salvo que se pida y
  se justifique.
- Animaciones con Framer Motion; iconos con lucide-react.

## 4. Qué puedes modificar y qué debes conservar

**Puedes crear/modificar**: `pages/`, `components/`, `components/ui/`
(solo primitivos NUEVOS), `hooks/`, `services/` (mocks), `data/`,
`stores/`, `machines/`, `contexts/`, `types/`, `lib/i18n.ts`, `assets/`.

**Intocables** (romperías el sync o el contrato):

- `src/lib/utils.ts`.
- `tailwind.config.ts` y las variables CSS existentes de `index.css`
  (añadir un token nuevo está permitido; renombrar o borrar, no).
- Primitivos existentes de `components/ui/`: no cambies su API (props,
  exports). Extiende añadiendo variantes CVA nuevas sin romper las
  existentes.
- `vite.config.ts`, `index.html`, alias `@/`.
- **Contrato de API verificado**: `src/services/apiClient.ts`,
  `apiSchemas.ts`, `eventsApi.ts`, `newsApi.ts` y `src/data/fixtures/*`.
  Están validados contra la API real; si necesitas un dato que no está
  en el contrato, dilo en el chat en lugar de cambiar los schemas.

## 5. Separación presentación / lógica (obligatoria)

- Las pantallas y componentes son **presentacionales**: reciben datos y
  callbacks. Prohibido `fetch`/clientes HTTP o de BD dentro de
  componentes; todo acceso a datos pasa por un service de `services/`.
- Services: funciones `async` tipadas cuya firma es el **contrato**. Los
  mock simulan latencia (300–800 ms) leyendo de `data/`; en producción
  se sustituye la implementación SIN tocar pantallas.
- Estado: local con `useState`; global con el store de Zustand
  (`stores/`); flujos complejos (chat, procesos multi-paso) con máquinas
  XState en `machines/`; datos remotos con @tanstack/react-query sobre
  los services. No introduzcas otra librería de estado.
- Estado de pantalla como unión discriminada explícita:
  `type ScreenState = 'loading' | 'empty' | 'error' | 'ready'`.
- **Toda pantalla implementa los 4 estados**: loading (Skeleton), empty
  (bloque con CTA), error (mensaje semántico + reintentar) y feliz. El
  Product Owner valida los cuatro.
- Formularios: react-hook-form + resolver de zod.

## 6. Consumo de APIs reales (solo lectura)

Está permitido consumir APIs públicas de solo lectura para diseñar con
datos reales (hoy: events-query, `eventquery.km0lab.com`). Reglas:

- SIEMPRE a través de un service (`eventsApi.ts`, `newsApi.ts`) que
  valida la respuesta con zod (`apiSchemas.ts`) — nunca `fetch` directo
  en componentes ni schemas duplicados.
- Base URL desde `VITE_EVENTS_API_URL`; nunca URLs hardcodeadas en
  componentes ni claves privadas en el código.
- Cada endpoint consumido tiene su **fixture** capturada en
  `data/fixtures/` para prototipar sin red y forzar los estados
  empty/error.
- Solo GET/consulta. Si una pantalla necesita escribir datos, la
  escritura se define como firma mock y se implementa en producción.

## 7. Requisitos para la sincronización automática

- Imports SIEMPRE con el alias `@/` (`@/components/ui/button`,
  `@/stores/useAppStore`, `@/lib/i18n`…). Prohibidos los relativos
  profundos (`../../`). El sync reescribe estos paths a los paquetes del
  monorepo; cualquier otro patrón rompe la reescritura.
- Importa primitivos ui **archivo a archivo**
  (`import { Button } from '@/components/ui/button'`), nunca con barrels
  ni `import *`.
- El código de producto no importa NADA de `src/integrations/` ni de las
  piezas solo-Lovable (§0); esa frontera es la que permite sincronizar.
- No uses APIs exclusivas del runtime de Lovable ni componentes
  `lovable-*` en el código de `src/`.
- No dejes código muerto, `console.log` ni TODOs sin contexto.

## 8. Dependencias, estilos, assets y traducciones

- **Dependencias**: NO añadas paquetes npm nuevos por tu cuenta. Lista
  aprobada: react, react-dom, react-router-dom, framer-motion,
  lucide-react, clsx, tailwind-merge, class-variance-authority, zod,
  react-hook-form, @hookform/resolvers, @tanstack/react-query, sonner,
  zustand, xstate, @xstate/react, date-fns, embla-carousel-react,
  canvas-confetti, tailwindcss-animate y los `@radix-ui/react-*` que
  necesiten los primitivos shadcn. Si una funcionalidad exige otra
  librería, dilo en el chat y espera aprobación humana antes de usarla.
- **Estilos**: solo clases Tailwind con tokens (ver §3). Nada de CSS
  nuevo fuera de `index.css`, y en `index.css` solo tokens/`@layer`.
- **Assets**: nuevos binarios en `src/assets/` con nombre `kebab-case`
  sin sufijos de versión (`km0-robot.png`, no `km0_robot_icon_v2.png`).
  Los SVG se importan como URL (`<img src={...}>`), no como componentes.
  Fuentes: no añadas familias nuevas; Inter (Google Fonts) y Antique
  Olive ya están definidas.
- **Traducciones**: todo el copy visible vive en el diccionario tipado
  `lib/i18n.ts` (claves `"pantalla.elemento"` con `{ ca, es, en }`) y se
  consume con `t()` + `useLang()`. Nunca strings hardcodeadas en JSX ni
  copy dentro de `components/ui/`. Los datos bilingües de API se adaptan
  en el service (patrón `Record<Lang, string>`, ver `newsApi.ts`).

## 9. Modo no técnico (Product Owner / diseño)

Cuando un prompt describa un cambio en lenguaje no técnico (sin rutas de
archivo ni clases CSS), actúa así:

1. Identifica tú el componente y archivo afectados, y dilo.
2. Antes de tocar código, reformula el cambio en UNA frase no técnica
   (p. ej. "Voy a centrar las flechas del carrusel respecto a la
   tarjeta, sin tocar el modo horizontal") y espera confirmación.
3. Toca exclusivamente el elemento señalado.
4. Aplica todas las reglas de este documento sin que te las pidan.
5. Si el cambio exige una decisión técnica (dependencia nueva, tocar un
   intocable, cambio estructural, conectar datos), NO lo hagas: explica
   en lenguaje llano qué hace falta y sugiere pasarlo al desarrollador.

Las capturas de pantalla con el elemento marcado valen como referencia
de "dónde". El modo Visual Edit es la vía preferente para cambios
visuales puntuales de quien no programa.

## 10. Checklist antes de dar una pantalla por terminada

- [ ] Se ve correcta en las 4 resoluciones canónicas.
- [ ] Implementa los 4 estados (loading / empty / error / feliz).
- [ ] Copy en `lib/i18n.ts`, sin strings en JSX.
- [ ] Datos vía service tipado (mock o API read-only con zod + fixture).
- [ ] Solo tokens del design system; cero hex, cero estilos estáticos
      inline.
- [ ] Imports con `@/`, primitivos ui archivo a archivo.
- [ ] Sin dependencias fuera de la lista aprobada.
- [ ] Sin imports de piezas solo-Lovable en código de producto.
