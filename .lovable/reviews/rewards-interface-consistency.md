# Premios, canjes y coherencia de interfaz

## Alcance y resultado

Revisión con la habilidad **code-review**, sin cambios en la aplicación. Comparé las dos capturas y el código actual; recorrí Home, Agenda, Noticias, Comercios, Acciones, Compartir, Premios y, después de acceder con correo de prueba y `123456`, Canjes, Historial, Perfil e Invitaciones. Comprobé específicamente el canje con teclado y ratón y el filtro de pendientes a 393×852. No hice capturas nuevas ni una certificación visual de todas las resoluciones.

**Sí deben compartir presentación; no deben mostrar exactamente la misma información.** Premios ofrece productos disponibles; Canjes explica qué se ha solicitado, cuándo y dónde recogerlo. Hacer ambas idénticas funcionalmente borraría información necesaria.

## Propuesta visual para aprobar

- Una tarjeta por fila en ambas pantallas, con igual ancho, banda de imagen, márgenes, tipografía y distribución del título y coste.
- Imagen reconocible del premio, entera y centrada; icono de tipo únicamente cuando no exista imagen. Fondo suave por tipo, coherente con Home.
- Misma cabecera, controles de filtro y acabado Burbuja; mantener la barra inferior en ambas. En el catálogo no marcar «Premios canjeados» como destino activo: son secciones diferentes.
- Premios conserva disponibilidad, valor, stock y acción de canje. Canjes conserva estado, fecha, recogida y código cuando corresponda.
- Unificar también el aspecto de la confirmación de canje para que no vuelva a un regalo genérico.
- No cambiar precios, puntos, stock, contratos de API ni conectar operaciones reales para resolver esta presentación. La elección de la fuente común del catálogo requiere una etapa específica de datos.

## Hallazgos confirmados

### Prioridad 1: premios sin imagen y composición distinta

`src/pages/Premis.tsx` pinta únicamente `KindIcon` en `RewardCard`; `src/types/reward.ts` y `src/data/rewards.ts` no incluyen imagen. Cambiar de categoría no arregla el problema: ninguna tarjeta usa el producto. Canjes sí consume `imageUrl` y sus cinco imágenes terminaron cargando correctamente en la comprobación móvil. La primera lectura a tiempo fijo encontró algunas pendientes de carga: **no se confirma una avería de esas imágenes**.

El catálogo usa dos columnas, banda de 128px y cuerpo de 12px de margen; Canjes una columna, banda de 112px y cuerpo de 16px. El título, coste y metadatos disponen de mucho menos ancho en el catálogo. El catálogo tampoco tiene barra inferior. La confirmación de merchandising vuelve al icono genérico.

**Coste para el usuario:** cuesta identificar y comparar productos; pasar del catálogo a lo canjeado parece cambiar de aplicación.

### Prioridad 1: una misma cuenta muestra cifras incompatibles

Después del acceso simulado observé Home **100**, catálogo **2500**, Historial **40** e Invitaciones **700 ganados**. El historial calcula **390 − 430 = −40**, pero `fmtInt` aplica `Math.abs` y elimina el signo. Premios mantiene su saldo en estado local, lo descuenta tras confirmar y no incorpora el canje a la lista fija `REDEMPTIONS`.

Sin sesión, el catálogo también anuncia **2500** y abrir una tarjeta muestra la confirmación de canje. Esto no implica una escritura real: es una simulación incongruente.

**Coste:** la interfaz no permite saber qué saldo se tiene, qué puede canjearse ni dónde quedó una solicitud.

**Propuesta:** una cuenta simulada coherente para saldo, movimientos, canjes e invitaciones; catálogo visible a visitantes, pero sin saldo personal ficticio ni confirmación directa de canje.

### Prioridad 1: campanas con la misma apariencia hacen cosas distintas

Home abre el panel de notificaciones. En Agenda y Noticias el callback de la campana es `markAllRead`: al pulsarla no se abre ningún diálogo. Comercios sí mantiene una apertura de avisos propia.

**Coste:** se marcan avisos como leídos sin permitir leerlos desde ese acceso.

**Propuesta:** compartir el mismo panel y la misma lógica de lectura en los interiores, preservando el indicador coral/gris.

### Prioridad 1: contexto municipal dividido

Home toma el municipio del perfil o claves antiguas del navegador; Agenda toma `useAppStore.town`; los premios públicos toman `postalCode` con fallback 08380; Noticias solicita Malgrat de Mar expresamente. Agenda y varios interiores pasan también Malgrat de Mar fijo a la cabecera.

**Coste:** cambiar de municipio no garantiza que cabecera, contenido y enlaces se refieran al mismo lugar.

**Propuesta:** propagar un único contexto municipal e idioma sin cambiar los contratos de consulta. El fallo Barcelona→Agenda ya está reproducido en la revisión anterior; no repetí esa selección en este recorrido.

### Prioridad 2: estados y filtros de canjes incompletos

El resumen cuenta **2** premios pendientes o listos para recoger. El filtro «Pendent» solo incluye `status === 'pending'`: comprobé que muestra la gorra y deja fuera la entrada con estado `ready`. Tampoco hay filtro propio para `ready` o `expired`.

La entrada aparece «lista para recoger» aunque muestra validez hasta **27 de agosto de 2026**, anterior a la fecha de esta revisión (**19 de noviembre de 2026**). Las fechas y estados de los mocks son estáticos.

**Coste:** se ocultan solicitudes que requieren atención y se presenta como vigente una recogida con fecha vencida.

**Propuesta:** hacer que el filtro de pendientes represente lo que anuncia el resumen, o añadir un filtro explícito de listos; acordar y mantener escenarios simulados con fechas y estados coherentes. No inventar una política de caducidad automática.

### Prioridad 2: interacción y accesibilidad sin patrón común

- La tarjeta del catálogo tiene `role="button"` y `tabIndex`, pero no respuesta a Enter/Espacio. Enter no abrió el canje; el clic sí lo abrió.
- Canjes dispara `clipboard.writeText` sin esperar el resultado y muestra «copiado» inmediatamente. Un permiso denegado produciría un falso éxito. Es un defecto confirmado en código, no reproduje la denegación.
- Los paneles de canje no usan la pieza compartida `BubbleSheet`; declarar `aria-modal` no proporciona por sí solo gestión del foco y cierre con Escape. No doy por reproducidos todos esos fallos de foco.
- El arrastre con ratón está aplicado a Home y sus carruseles, pero no a los cuerpos de Premios y Canjes. Ocultar la barra no añade arrastre.
- El botón Atrás del catálogo siempre va a Home; Canjes retrocede en el historial. Entrar al catálogo desde otro origen pierde ese retorno contextual.

**Coste:** acciones visualmente equivalentes no funcionan igual con ratón, teclado o desde otro origen.

**Propuesta:** botones compartidos, copia confirmada solo tras éxito, panel de canje accesible y desplazamiento/retorno coherentes.

### Prioridad 2: información y estados de pantalla divergentes

- Home intenta premios públicos y sustituye tanto carga/vacío como fallo por mocks sin imágenes; el catálogo siempre usa `REWARDS`. No se puede inferir que el recorrido actual haya mostrado UAT solo por haber visto tarjetas en Home.
- Los títulos/descripciones de premios y canjes son datos fijos en catalán. Las capturas en español conservan esas descripciones catalanas: no todo cambia de idioma con la interfaz.
- Home y Acciones anuncian **10 por cumpleaños**, Perfil **500**; Acciones **50 por escaneo**, Comercios e Historial **20**; primer escaneo **75** en Acciones y **50** en Historial.
- Premios y Canjes tienen vacío, pero no carga/error; Acciones usa un temporizador en `useMemo`, cuya función de retorno no actúa como limpieza; Historial no contempla carga/error.
- Agenda hace dos consultas del mismo rango con cachés diferentes y limita la lista a **100**; Noticias carga **20** sin continuación. No confirmé truncamiento con el volumen actual.

**Coste:** cambian los premios, las promesas y los mensajes según la sección; los fallos pueden parecer datos válidos.

**Propuesta:** catálogo compartido y estados explícitos; importes aprobados antes de unificarlos; paginación cuando corresponda.

### Prioridad 3: preparación para Cursor

Continúan imports relativos en `App.tsx`, imports de `DeviceShell` desde pantallas de producto y controles con estilos propios en lugar de los compartidos. Los duplicados `FilterChip`, mapas de iconos y presentación de premio en catálogo, canjes, carrusel y confirmación permiten precisamente estas diferencias. Son patrones, no nits de estilo.

**Coste:** Cursor recibiría varias implementaciones de la misma idea y piezas dependientes del marco de prototipo.

**Propuesta:** primero retirar duplicación confirmada; después documentar el límite del marco con el desarrollador, normalizar imports y separar presentación/datos, sin reescritura ni cambios de paquetes sin aprobación.

## Orden de trabajo y comprobación

1. **Premios y Canjes:** aprobar y alinear la presentación indicada arriba. Comprobar todas las categorías, producto visible, estados, textos largos, retorno y barra inferior en los tamaños acordados.
2. **Interacciones compartidas:** campanas, copia, teclado, paneles y arrastre; probar como visitante y con acceso simulado. Los candados del menú ya usan `AccountBottomTabs`: no presentar aquel problema anterior como pendiente.
3. **Datos coherentes:** municipio, catálogo y cuenta simulada. Antes, confirmar importes y reglas de caducidad. Probar un canje completo y leerlo en saldo, historial y lista.
4. **Idiomas, estados y portabilidad:** ca/es/en; carga/vacío/error/éxito; imports, dependencias y límites de sincronización con Cursor. Añadir pruebas de reglas y ejecutar las existentes.

Cada etapa debe dejar la app funcionando y revisarse antes de la siguiente. No cambiar toda la aplicación de golpe.

## Seguridad y limitaciones

Solo resumí `security--get_scan_results`: mantiene una advertencia sobre comprobación de contraseñas filtradas desactivada y una información sobre lectura pública de códigos postales; puede ser intencionada. No hay resultado reciente de análisis profundo: ejecutarlo desde la pestaña Seguridad antes de entrega. No revisé seguridad por mi cuenta ni afirmo que la app sea segura.

No aparecieron excepciones de ejecución en el recorrido. No ejecuté una compilación manual, no hice cambios de código, no comprobé backend real, abonos ni atribución real de invitaciones.