# Encargos para Lovable: que el porte sea automático

**Fecha:** 19 de noviembre de 2026
**Escritos para la versión:** `km0lab-lovable`, `origin/main` en `9b3717c`.
**Sustituye a:** la sección 4 de `INFORME.md`, que estaba escrita para una versión anterior.

## Cómo usarlos

- **Uno por mensaje y en este orden.** Cada uno termina pidiendo a Lovable que pare; revisa en la vista previa que la app se ve y funciona igual antes de pegar el siguiente.
- **Ninguno cambia el aspecto.** Si después de un encargo algo se ve distinto, es un error: dilo en el chat de Lovable antes de seguir.
- Los encargos **0 a 3** son los que hacen falta para portar sin romper lo que ya funciona con datos reales. Los **4 a 8** se pueden hacer después del primer porte, pero cuanto antes mejor.
- Cuando acabes una tanda, dímelo: vuelvo a simular el porte y te digo si pasa.

La idea que hay detrás de todos: **una pantalla pide siempre lo mismo, en Lovable y en producción** («dame la cuenta», «canjea este premio»). Lovable contesta con ejemplos y producción con la API. Así la pantalla viaja sola y nadie tiene que retocarla.

---

## Encargo 0 · La regla, en el contrato

Va primero para que todo lo que Lovable genere a partir de ahora la respete. Además de pegarlo en el chat, **añade el mismo texto en Settings → Knowledge** del proyecto.

```text
Encargo técnico de documentación. No toques código.

Añade a docs/KNOWLEDGE.md, al final de la sección 5 («Separación presentación / lógica»), este bloque tal cual, y añade una línea equivalente en AGENTS.md:

### 5.1. Costuras de datos (obligatorio para el sync)

- Las pantallas (src/pages) y los componentes (src/components) piden los datos del usuario, del municipio y de los comercios SOLO a través de hooks de src/hooks o funciones de src/services con nombre neutro. El nombre no dice si el dato es de ejemplo o real: prohibido «mock», «demo», «sample» o «fake» en cualquier nombre que importe una pantalla o un componente.
- Prohibido importar desde src/pages o src/components: @/services/mock/*, @/stores/useMock*, y los ficheros de @/data que contengan datos de usuario, saldo, puntos, premios, canjes, invitaciones o comercios. Sí se puede importar de @/data lo que es pura presentación (pasos de onboarding, pasos de «Cómo funciona», módulos de la Home, ilustraciones).
- La implementación de ejemplo vive dentro del hook o del service. En producción ese mismo hook o service tiene otra implementación, con el mismo nombre y la misma forma de respuesta. Por eso la forma de respuesta de una costura no se cambia sin avisar en el chat.
- Nada en src/hooks, src/services, src/stores, src/machines ni src/types importa de src/components, src/pages ni src/contexts.
- Un hook de datos devuelve siempre { …datos, loading: boolean, error: string | null, reload: () => void } y la pantalla pinta los cuatro estados a partir de ahí.
- Las reglas de negocio (saldo, descuento de puntos, códigos de canje, caducidades, atribución de invitaciones, importes de puntos) no se calculan en pantallas ni componentes. La maqueta enseña estados; no reproduce el servidor.

Para cuando termines y enséñame el texto añadido.
```

---

## Encargo 1 · Cuenta del usuario y canje

```text
Encargo técnico de estructura. Sin cambios visuales ni de comportamiento.

Las pantallas importan hoy piezas con «mock» en el nombre. Hay que darles nombre neutro para que la misma pantalla sirva en producción.

1. Renombra el hook: src/hooks/use-mock-account.ts → src/hooks/use-account.ts, y la función useMockAccount → useAccount. Debe devolver:
   { balance, earned, spent, transactions, redemptions, loading, error, reload }
   donde error es string | null (no boolean) y redemptions llega YA traducido al idioma activo: mueve dentro del hook la llamada a localizeRedemption, leyendo el idioma de useAppStore((s) => s.lang). Las pantallas no llaman a localizeRedemption.
2. Canje: crea en src/services/redemptions.ts la función
   redeemReward(reward: Reward): Promise<Redemption>
   que hace lo que hoy hace redeemMockReward. El código de recogida lo genera ESTA función, no el componente: quita la generación del código de RedeemBalanceOverlay y RedeemMerchandiseOverlay y muestra redemption.code del resultado. Si redemption.code es null, no se muestra bloque de código (en producción los premios que no son vales no tienen código).
3. Mueve isPendingRedemption a src/types/redemption.ts como función exportada.
4. Actualiza las pantallas que usaban lo anterior: Home, Premis, PremisCanjats, HistorialPunts, ScannerSuccess y los dos paneles de canje. Ninguna debe importar de @/services/mock/account, @/hooks/use-mock-account ni @/stores/useMockAccountStore.
5. Tipos (solo añadidos; adapta los datos de ejemplo):
   - src/types/redemption.ts: code pasa a string | null; imageUrl pasa a string | null opcional; añade hasImage?: boolean e isMock?: boolean.
   - src/types/reward.ts: añade hasImage?: boolean.
6. El almacén de ejemplo (useMockAccountStore) y src/services/mock/account.ts pueden seguir existiendo como implementación interna; solo los usan use-account.ts y redemptions.ts.

Comprueba: acceso con el correo de prueba, canje de un premio, saldo y movimiento actualizados, «Premios canjeados» con el canje nuevo, en ca/es/en. Pasa los tests. Para y espera revisión.
```

---

## Encargo 2 · Acciones, invitaciones e importes de puntos

```text
Encargo técnico de estructura. Sin cambios visuales ni de comportamiento.

Crea estos hooks en src/hooks/ (con datos de ejemplo dentro) y haz que pantallas y componentes los usen en lugar de importar datos o servicios «mock»:

1. usePointsActions(): { actions: PointAction[]; loading: boolean; error: string | null; reload: () => void }
   → src/pages/PointsActions.tsx (sustituye a listMockActions).
2. useHomeActions(): misma forma → src/components/EarnPointsCard.tsx (sustituye al import de POINTS_ACTIONS; el filtrado de «pendientes, máximo 3» se queda en el componente).
3. useInviteSummary(): { summary: InvitationsSummary; loading: boolean; error: string | null }
   → src/pages/Home.tsx y src/pages/HistorialPunts.tsx (sustituye a INVITATIONS_MOCK_SUMMARY).
4. useInvitations(): { records: InvitationRecord[]; summary: InvitationsSummary; loading: boolean; error: string | null; reload: () => void }
   → src/pages/MyInvitations.tsx (sustituye a fetchInvitations y summarizeInvitations; las variantes de vista previa las resuelve el hook leyendo la URL, no la pantalla).
5. useInviteRewards(): { person: number; business: number }
   → src/pages/Invite.tsx, src/pages/PointsActions.tsx y src/components/InviteHomeCard.tsx (sustituye al import de INVITE_REWARDS).
6. usePointsConfig(): { signup: number; birthday: number; scan: number }
   → src/pages/Home.tsx, src/pages/Profile.tsx y src/pages/Comercos.tsx (sustituye al import de MOCK_POINTS).

Tipos, en src/types/points.ts (solo añadidos; adapta los datos de ejemplo):
- PointsTxType: añade "invite_person" e "invite_business".
- PointActionIcon: añade "share" (icono Share2), también en los mapas de iconos.
- PointAction: id pasa a ser string; añade apiType: string, title?: string, description?: string, earnedPoints?: number. Si title o description existen, la pantalla los muestra en lugar de la traducción de titleKey/descriptionKey; si earnedPoints existe, se muestra en lugar de points.
- Añade la interfaz PointsHistorySummary { balance: number; earnedTotal: number; spentTotal: number; items: PointsTransaction[] }.

Ninguna pantalla ni componente debe importar ya de @/services/mock/actions, @/services/mock/invitations, @/data/pointsActions, @/data/mockPointsConfig ni INVITE_REWARDS de @/data/inviteConfig.

Comprueba Home con y sin sesión, Acciones, Historial, Invitar y Mis invitaciones (incluidas sus variantes de vista previa). Pasa los tests. Para y espera revisión.
```

---

## Encargo 3 · Compartir e invitar

```text
Encargo técnico de estructura. Sin cambios visuales ni de comportamiento en la vista previa.

Hoy el componente de compartir construye direcciones y abre ventanas por su cuenta, y el enlace de invitación se calcula en la pantalla. En la app instalada eso no funciona. Hay que pasar por funciones de nombre fijo.

1. Crea src/lib/shareUrl.ts con:
   getShareLink(path: string, searchParams?: Record<string, string | null | undefined>): string
   getCanonicalWebLink(path: string, searchParams?: Record<string, string | null | undefined>): string
   Las dos montan la dirección a partir de window.location.origin (en la maqueta son equivalentes). Es el ÚNICO fichero del proyecto que puede leer window.location.origin.
2. Crea src/lib/openShareChannel.ts con:
   type ShareChannelId = "whatsapp" | "email" | "facebook"
   openShareChannel(options: { channel: ShareChannelId; message: string; subject: string; link: string }): Promise<void>
   con el comportamiento actual (wa.me, mailto, compartir de Facebook).
3. src/components/ShareChannelList.tsx llama a openShareChannel para los tres canales; quita de ahí window.open, window.location.href y las direcciones escritas a mano.
4. Crea el hook src/hooks/use-invite-link.ts:
   useInviteLink(kind: InvitationKind): { link: string | null; loading: boolean; error: string | null; reload: () => void }
   Dentro va lo que hoy hace src/pages/Invite.tsx con getReferralReferenceForUser y buildInviteLink, usando getCanonicalWebLink. Invite.tsx solo llama al hook.
5. buildPublicShareLink (en src/data/inviteConfig.ts) pasa a usar getShareLink. src/pages/Evento.tsx comparte getShareLink("/event", { id }) en lugar de window.location.href.

Comprueba compartir desde Home sin sesión, invitar persona y negocio con sesión, copiar enlace y compartir un evento. Para y espera revisión.
```

---

## Encargo 4 · Comercios, promociones y escáner

Estas pantallas siguen con datos de ejemplo también en producción, así que no rompen nada hoy. Hacerlo ahora evita repetir el problema cuando se conecten.

```text
Encargo técnico de estructura. Sin cambios visuales ni de comportamiento.

1. Crea en src/hooks/:
   - useShops(): { shops: ComercAdherit[]; categories: CategoriaAdherit[]; loading: boolean; error: string | null; reload: () => void }
     → src/pages/Comercos.tsx (los recuentos por categoría se calculan a partir de shops).
   - useShop(id: string): { shop: ComercDetall | null; loading: boolean; error: string | null; reload: () => void }
     → src/pages/ComercDetall.tsx. La carga con temporizador que hoy hace la pantalla pasa al hook. El botón «reintentar» llama a reload.
   - useShopPromotions(): { promotions: (PromocioInfo & { shopId: string; shopName: string })[]; loading: boolean; error: string | null }
     → src/pages/Premis.tsx y src/components/MerchantPromosPreview.tsx (sustituye al recorrido de COMERCIOS_DETALL que hoy hacen los dos por separado).
   Ninguna pantalla ni componente importa ya de @/data/comerciosAdheridos.
2. En src/types/comercAdherit.ts, distanciaM pasa a number | null en los dos sitios; si es null, la pantalla no muestra la distancia.
3. Escáner: mueve src/services/mock/scanner.ts a src/services/scanner.ts, exportando scannerService (antes scannerMockService) con la misma función scan(code). Los tipos ScanResult y ScanErrorKind pasan a src/types/scan.ts. src/machines/scannerMachine.ts y src/pages/Scanner.tsx importan de ahí.
4. En src/pages/ComercDetall.tsx: la campana debe abrir el mismo panel que en Agenda (useNotificationsPanel); hoy cambia un estado que nadie usa (líneas 235 y 284). Y el nombre del municipio de la cabecera (línea 282) debe salir de useLocationContext, no estar escrito.

Comprueba Comercios, dos fichas de comercio, la pestaña de promociones de Premios y el escáner con sus casos de prueba. Para y espera revisión.
```

---

## Encargo 5 · La barra inferior con candados

```text
Encargo técnico de estructura. Sin cambios visuales ni de comportamiento.

src/hooks/use-account-access.ts no se puede sincronizar: está en hooks/ pero importa componentes (AccountAccessSheet, BottomTabs), el contexto de idioma y react-router-dom.

1. Mueve esa lógica dentro de src/components/AccountBottomTabs.tsx (o a un componente hermano en src/components/) y borra src/hooks/use-account-access.ts. Adapta su test al componente.
2. El tipo AccountAccessTarget pasa a src/types/.
3. La petición del código de acceso sigue llamando a requestOtp con la misma firma que usa src/pages/Login.tsx.
4. En src/App.tsx (línea 73) el marco DeviceShell está puesto dos veces alrededor de PremisCanjats: deja uno.

Comprueba que una pestaña con candado abre el panel sin salir de la pantalla y conserva el destino. Para y espera revisión.
```

---

## Encargo 6 · Idioma en las piezas de datos

```text
Encargo técnico. Sin cambios visuales.

src/hooks/usePublicRewards.ts y src/hooks/useShareLink.ts importan useLang de @/contexts/LangContext. Haz que lean el idioma de useAppStore((s) => s.lang), como ya hace src/hooks/useFeaturedPromos.ts. Revisa que ningún fichero de src/hooks importe de src/contexts ni de src/components. Para y espera revisión.
```

---

## Encargo 7 · Portada del evento por identificador de categoría

```text
Encargo técnico. Sin cambios visuales.

En src/components/EventHeroCarousel.tsx la portada ilustrada se elige con expresiones regulares sobre el nombre visible de la categoría.

1. Añade al tipo Promo (src/types/promo.ts) el campo opcional categorySlug y rellénalo en src/hooks/useFeaturedPromos.ts con el primer identificador de categoría del evento (ev.tags[0]).
2. Crea en src/data/ un mapa «identificador de categoría → portada», con las cuatro portadas actuales y una por defecto, y úsalo en EventHeroCarousel.
3. Usa los identificadores reales que devuelve /categories; no existe «mercado», la categoría equivalente es «ferias».

No cambies los schemas ni los services de eventos. Para y espera revisión.
```

---

## Encargo 8 · Herramientas de demostración fuera de la vista del vecino

```text
Sin cambios para quien abra la maqueta con el parámetro de vista previa.

1. En src/pages/Scanner.tsx el panel «simular escaneo» (hacia la línea 166) se ve siempre. Muéstralo solo cuando la dirección lleve ?preview=1.
2. En src/pages/ComercDetall.tsx el selector «Encara no visitat / Ja escanejat» (hacia la línea 405) debe verse solo con ?preview=1 y sus textos deben salir de src/lib/i18n.ts.
3. Actualiza el catálogo de vistas (src/design-system/preview-manifest.ts) para que sus enlaces lleven ese parámetro.

No toques src/components/RequireAuth.tsx. Para y espera revisión.
```

---

## Lo que cada costura exigirá después en producción

Para que sepas qué queda del otro lado. No es trabajo de Lovable.

| Costura | La usan | En producción |
|---|---|---|
| `useAccount()` | Home, Premios, Canjes, Historial, Escáner (éxito) | **Nueva**, pequeña: junta lo que ya dan `usePointsHistory` y `useMyRedemptions` |
| `redeemReward(reward)` | Premios y sus dos paneles | **Nueva**: llamar al servidor para crear el canje. Hoy producción tampoco lo hace |
| `usePointsActions()`, `useHomeActions()` | Acciones, tarjeta de la Home | Ya existen con esa forma |
| `useInviteSummary()`, `useInviteRewards()` | Home, Historial, Invitar | Ya existen con esa forma |
| `useInvitations()` | Mis invitaciones | **Nueva**, pequeña: sobre `listMyConversions` y `useInviteSummary` |
| `useInviteLink(kind)` | Invitar | **Nueva**, pequeña: sobre `getMyInviteLink` |
| `getShareLink`, `getCanonicalWebLink`, `openShareChannel` | Compartir, invitar, evento | Ya existen, con candado y con esa misma forma |
| `usePointsConfig()` | Home, Perfil, Comercios | **Nueva**, pequeña: sobre el municipio y las acciones |
| `useShops()`, `useShop(id)`, `useShopPromotions()` | Comercios, ficha, Premios | **Nuevas**, sobre `usePublicShops`, `useMyShops` y `useShopPromotions`, que existen y nadie usa |
| `scannerService.scan(code)` | Máquina del escáner | **Nueva**, pequeña: sobre `scanQr`, que existe y nadie usa |
| `useLocationContext()` | 6 pantallas y 3 hooks | **Nueva**, mínima: lee el almacén real |

Además, en producción habrá que resolver cosas que estos encargos no tocan: dar de alta las 11 imágenes, copiar los estilos nuevos, poner el marco de teléfono en las rutas, ordenar el manifest y montar el ensayo automático (ver `PROCESO.md`, apartado 4).

## Lo que no he comprobado

- Los nombres y formas de esta lista están contrastados con el código de producción y con el de Lovable en `9b3717c`, pero **no están probados**: hasta que Lovable los aplique y yo repita la simulación del porte, no se sabe si encajan a la primera.
- Si Lovable sube más cambios antes de aplicar los encargos, las líneas citadas pueden haberse movido.
