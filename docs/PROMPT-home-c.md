# Prompt de arranque — Home "Missió del barri" (variant C)

> Pega este prompt en el chat de Lovable para construir la Home por
fases. La especificación completa está en `docs/spec-home-c.md` (léela
antes) y las reglas del proyecto en `docs/KNOWLEDGE.md`.

## Paso 1 — Estructura, copy y los dos estados

```
Rediseña la Home (src/pages/Home.tsx y su contenido) según el spec
docs/spec-home-c.md ("Missió del barri"). En este primer paso: solo
estructura, copy y los dos estados (guest / registered), con puntos,
eventos y cupones como datos MOCK estáticos (aún sin services nuevos).

Antes de tocar código, léete docs/KNOWLEDGE.md y docs/spec-home-c.md y
resume en 3-4 líneas cómo vas a montar los dos estados; espera mi OK.

Reutiliza los componentes existentes (HomeHero, GreetingBlock,
EventHeroCarousel, CouponCard, BottomTabs); no construyas todavía
PointsCard evolucionada ni el escáner. Copy nuevo en lib/i18n.ts según
la tabla del spec. Valida guest y registered a 375×667.
```

## Paso 2 — PointsCard + EarnPointsInfo + reward-welcome

```
Continua la Home del spec docs/spec-home-c.md. Evoluciona PointsCard al
modo "progreso con recompensa" (añade variante, no rompas su API) y crea
el bloque informativo EarnPointsInfo (título + formas de ganar puntos +
botón "Escaneja un QR" que navega a un placeholder /scan; NO construyas
el escáner). Añade el estado reward-welcome con el momento de "+100 punts
de benvinguda" al registrarse. Copy en lib/i18n.ts. Valida en 375×667 y
768×1024.
```

## Paso 3 — Estados forzables y pulido

```
Cierra la Home del spec docs/spec-home-c.md. Añade el forzado de estados
por query param (?state=loading|empty|error y ?session=guest|registered)
y pule los 4 estados de pantalla (loading con skeletons,
empty del carrusel, error, feliz) en las 4 resoluciones canónicas. No
toques el contrato de API ni los primitivos de components/ui.
```
