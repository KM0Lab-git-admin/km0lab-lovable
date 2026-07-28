# Guía de prompts para Lovable

Cómo redactar prompts para que Lovable respete el sistema responsive y de
estados de este proyecto. Reglas de fondo: `docs/responsive-layout-process.md`
y `docs/screen-states.md`.

## Anatomía de un buen prompt

Todo prompt de cambio visual lleva estas 5 partes:

1. **Alcance cerrado** — qué pantalla/componente tocar y, explícitamente, qué
   NO tocar ("no toques componentes compartidos ni otras pantallas").
2. **Nivel de jerarquía** — frame / layout de página / sección / atómico
   (pedirle que lo identifique antes de cambiar código evita arreglos en
   el nivel equivocado).
3. **Contrato responsive** — recordar los breakpoints oficiales y el orden:
   base 375×667 primero, overrides con prefijo después. Móvil landscape =
   solo no-rotura.
4. **Estados afectados** — enumerar los estados de la pantalla (ver
   `docs/screen-states.md`) y exigir que el cambio funcione en todos.
5. **Definición de hecho** — registrar pantalla/estado nuevos en
   `src/design-system/preview-manifest.ts`, y pasar `npm run build`.

## Plantillas

### A. Retocar una pantalla existente

```txt
Modifica SOLO [bloque] de la pantalla [X] ([ruta]).

Antes de cambiar código identifica qué componente controla: (1) el frame,
(2) el layout de página, (3) el contenido. Aplica el cambio en el nivel
correcto, no parchees desde un hijo.

Reglas responsive (docs/responsive-layout-process.md):
- Parte del contrato base 375×667 (clases sin prefijo).
- Overrides SOLO con los breakpoints oficiales (vertical-mobile,
  vertical-tablet, horizontal-mobile, horizontal-desktop) y SOLO donde la
  estructura cambia. Nada de alturas/anchos fijos en px no justificados.
- Móvil landscape (667×375): basta con que no se rompa; no optimices para él.
- No arregles una resolución rompiendo otra: si tocas una clase base sin
  prefijo, justifica por qué debe afectar a todas las resoluciones.

Esta pantalla tiene los estados: [lista de docs/screen-states.md].
El cambio debe verse bien en TODOS; dime si alguno requiere ajuste especial.

Al acabar: lista los archivos tocados y confirma que `npm run build` pasa.
```

### B. Crear una pantalla nueva

```txt
Crea la pantalla [X] en [ruta] siguiendo docs/responsive-layout-process.md.

Orden de trabajo:
1. Maqueta el contrato base 375×667 con layout fluido (flex-1, min-h-0,
   min-w-0, una única zona de scroll clara).
2. Añade overrides vertical-tablet: y horizontal-desktop: solo donde la
   estructura cambie de verdad.
3. Móvil landscape: no debe romperse (sin overflow, todo accesible), nada más.

Estados visuales: [enumerar, p. ej. "guest y registrado — usa useAuth como
en Home"]. Cada estado debe ser forzable por URL si es posible (query param).

Definición de hecho (obligatorio):
- Ruta añadida en src/App.tsx ANTES del catch-all.
- Pantalla y todos sus estados registrados en
  src/design-system/preview-manifest.ts (con su src por estado).
- npm run build pasa.
```

### C. Crear o tocar un componente compartido

```txt
[Crea/Modifica] el componente compartido [X].

Es un componente de nivel [sección/atómico]: NO debe imponer alturas de
pantalla ni decisiones de layout de página; debe adaptarse al espacio que le
dé su padre (min-w-0 si vive en flex/grid).

Lo usan las pantallas: [lista]. Después del cambio revisa cada una en su
ruta real y dime si alguna composición se degrada.
No "arregles" una pantalla concreta metiendo lógica de esa pantalla dentro
del componente compartido.
```

### D. Arreglar un bug responsive

```txt
En [pantalla], con viewport [WxH / breakpoint], pasa esto: [síntoma, mejor
con screenshot].

Antes de tocar nada explícame: (1) qué nivel de la jerarquía
(frame/layout/sección/atómico) causa el bug y (2) qué clase(s) concretas lo
provocan. Luego corrige EN ESE NIVEL.

Restricción dura: el fix debe llevar el prefijo de breakpoint del viewport
afectado salvo que demuestres que la clase base está mal para TODAS las
resoluciones. Verifica contra la matriz completa de
docs/responsive-layout-process.md y confirma que los demás estados de la
pantalla no cambian.
```

### E. Añadir un estado nuevo a una pantalla existente

```txt
Añade a [pantalla] el estado [X]: [qué componentes aparecen/desaparecen].

- Hazlo forzable por URL (query param ?[param]=) para que Playwright pueda
  abrirlo directamente. Si depende de sesión, usa useAuth (el test lo
  sembrará por localStorage).
- Regístralo en src/design-system/preview-manifest.ts (id, label, src y
  notes), como los estados existentes de Home.
- El estado nuevo debe cumplir el mismo contrato responsive que el estado
  por defecto en toda la matriz de viewports.
```

## Antipatrones (no hacer)

- ❌ "Haz que se vea bien en móvil" — sin viewport ni breakpoint concreto,
  Lovable elegirá uno al azar y romperá otro.
- ❌ Pedir varios cambios en pantallas distintas en un mismo prompt: si algo
  sale mal no sabrás qué revertir.
- ❌ "Arregla el desktop" sin prohibir tocar clases base: es el origen del
  loop arreglo-desktop-rompo-mobile.
- ❌ Aceptar un cambio sin validar `npm run build` y los estados afectados.

## Bloque para el Knowledge de Lovable

Pega esto en Lovable → Settings → Knowledge (versión condensada de las
reglas; los detalles viven en `docs/`):

```txt
REGLAS DE MAQUETACIÓN (resumen — detalle en docs/responsive-layout-process.md):

1. Breakpoints oficiales ÚNICOS: vertical-mobile, vertical-tablet,
   horizontal-mobile, horizontal-desktop (definidos en tailwind.config.ts).
   Prohibido usar sm:/md:/lg: u otros ad hoc para layout de pantallas.
2. Mobile-first real: el contrato base es 375×667 con clases SIN prefijo;
   los overrides llevan SIEMPRE prefijo de breakpoint y solo donde la
   estructura cambia. Matriz completa en src/design-system/viewports.ts.
3. Móvil landscape (667×375) NO es requisito: basta con que no haya overflow
   ni contenido inaccesible. No optimizar diseño para ese viewport.
4. Cambios scoped: corregir una resolución NUNCA puede tocar clases base que
   afecten a otra. Layout fluido: flex-1, min-h-0, min-w-0; sin alturas
   fijas no justificadas; una única zona de scroll por pantalla.
5. Estados visuales: las pantallas pueden variar según sesión/datos/params
   (inventario en docs/screen-states.md). Todo cambio debe funcionar en
   TODOS los estados de la pantalla. Estados nuevos: forzables por query
   param si es posible.
6. Definición de hecho: toda pantalla o estado visual nuevo se registra en
   src/design-system/preview-manifest.ts (alimenta los tests de regresión
   visual de Playwright). npm run build debe pasar.
```
