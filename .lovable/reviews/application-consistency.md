# Revisión de consistencia de KM0 Lab

## Conclusión

La navegación de tus capturas es inconsistente y está reproducida: **sin sesión, «Els meus punts» abre el panel de cuenta desde Home, pero abre la pantalla completa de acceso desde Acciones**. No he modificado la aplicación.

Antes del traslado a Cursor conviene resolver los siguientes problemas. La revisión sigue el criterio de la habilidad **code-review**: únicamente hallazgos confirmados, sin actualizaciones ni correcciones automáticas.

## Problemas confirmados, por prioridad

### 1. Los accesos con candado cambian según la pantalla

- Home muestra el panel contextual; Acciones y otros interiores envían a `/login`.
- Las pestañas comparten aspecto, pero cada pantalla decide por separado qué ocurre al pulsarlas.
- **Impacto:** una misma acción interrumpe al visitante de formas diferentes y puede perder su destino.
- **Corrección propuesta:** reutilizar el panel de cuenta de Home desde los interiores, conservando la pantalla de origen y el destino solicitado. Con sesión, abrir directamente la sección correspondiente.

### 2. El municipio elegido no llega a todas las secciones

- Probé seleccionar **08001 · Barcelona**: Home recupera Barcelona, pero Agenda sigue consultando y mostrando Malgrat de Mar.
- La selección postal escribe unas claves antiguas; Agenda y premios públicos leen otro estado que sigue vacío.
- Noticias consulta expresamente Malgrat de Mar.
- **Impacto:** el visitante puede ver actividades o premios de un municipio distinto al elegido.
- **Corrección propuesta:** unificar el municipio y código postal utilizados por todas las pantallas, manteniendo las consultas públicas existentes.

### 3. Los puntos y premios no representan una misma cuenta

- Tras acceder con el código de demostración, Home muestra **100 puntos** y Premios **2.500**.
- Historial suma **390 ganados − 430 gastados = −40**, pero el resumen muestra **40**, porque elimina el signo.
- El seguimiento de invitaciones muestra **700 concedidos**, sin movimientos equivalentes en el historial.
- Sin sesión, Premios también muestra **2.500 puntos** y permite abrir la confirmación de canje.
- Los canjes solo descuentan el saldo local de esa pantalla; no alimentan el historial ni la lista de premios canjeados.
- **Impacto:** no se puede confiar en el saldo, la capacidad de canje ni el seguimiento, aunque todo sea simulado.
- **Corrección propuesta:** un único escenario de cuenta simulada, con saldo, movimientos, invitaciones y canjes relacionados. Mantener el catálogo público, sin saldo personal ni canje para invitados. Nada de abonos reales.

### 4. Las recompensas anuncian cantidades diferentes

- Perfil promete **500 puntos por cumpleaños**; Home y Acciones anuncian **10**.
- Comercios anuncia **20 por escaneo**; Acciones ofrece **50**. El primer escaneo figura con **75** en Acciones y **50** en Historial.
- **Impacto:** el usuario recibe promesas contradictorias.
- **Corrección propuesta:** una configuración compartida; antes de cambiar importes, confirmar cuáles son los vigentes con el responsable del programa.

### 5. El catálogo público y los listados tienen fuentes divergentes

- Home muestra premios UAT; «Ver todos» abre un catálogo local diferente.
- Si los premios UAT fallan o devuelven una lista vacía, Home los sustituye por ejemplos locales sin distinguir esos estados.
- Agenda solicita la primera página de **100 eventos** y Noticias **20 noticias**, sin cargar las páginas siguientes ni usar el total para advertirlo. No observé un recorte real con el volumen actual, pero el límite está confirmado.
- Agenda consulta dos veces el mismo rango: una para las tarjetas y otra para disponibilidad de categorías, con cachés distintas.
- **Impacto:** premios que cambian al entrar al catálogo; posibles resultados incompletos al crecer los datos; categorías y tarjetas susceptibles de desincronizarse.
- **Corrección propuesta:** compartir el catálogo y la consulta del rango; gestionar el total y las siguientes páginas sin modificar contratos verificados.

### 6. Algunos mensajes y estados todavía son engañosos

- El acceso completo promete enviar un correo y muestra una confirmación de envío, aunque el servicio solo prepara un código simulado. El panel de Home sí avisa de que no se envían correos.
- Acciones ejecuta su temporizador de carga dentro de `useMemo`; la función de limpieza no se ejecuta como limpieza del componente.
- Historial no contempla carga ni error; Acciones no contempla error. No todas las pantallas cumplen los cuatro estados acordados.
- Comercios anuncia **32 establecimientos**, mientras muestra **8** ejemplos.
- **Impacto:** expectativas falsas y estados difíciles de comprobar antes de producción.
- **Corrección propuesta:** distinguir claramente simulación, vacío y fallo; derivar cifras de la misma información presentada.

### 7. El código todavía necesita preparación para Cursor

- Hay importaciones relativas en el archivo de rutas y varios componentes, contrarias al contrato de sincronización.
- Las pantallas importan directamente `DeviceShell`, aunque las reglas lo excluyen del código de producto sincronizado.
- Permanecen piezas sin consumidores, como `SocialAuthButtons`, `VoiceRecorder` y `ScreenFrame`; algunas siguen referenciadas como texto en el catálogo, no utilizadas como componentes.
- `SocialAuthButtons` conserva una integración exclusiva de Lovable, pese a que el acceso actual utiliza el servicio simulado.
- Detecté botones propios en **34 archivos** y clases de blanco/negro fuera de los componentes básicos en **22 archivos**: es un patrón, no un problema aislado.
- Pantallas como Comercios detalle (**619 líneas**), Agenda (**572**) y Evento (**507**) concentran presentación, adaptación y comportamiento.
- **Impacto:** el traslado puede arrastrar dependencias del entorno de prueba, código que no se usa y controles que se comportan distinto.
- **Corrección propuesta:** eliminar primero piezas confirmadas como sobrantes, normalizar imports y acordar con el desarrollador el límite del marco de prototipo; después separar las pantallas grandes sin cambiar comportamiento. No reescribir la aplicación ni actualizar paquetes por iniciativa propia.

## Comprobaciones realizadas

- Reproducción real de Home → Mis puntos y Acciones → Mis puntos, sin sesión.
- Acceso simulado con correo de prueba y código `123456`, con retorno a Home.
- Recorrido con sesión por Home, historial, premios, canjes, perfil, invitaciones, seguimiento, Agenda, Noticias, Comercios, Acciones y Escáner.
- Selección postal de Barcelona y lectura posterior de Agenda.
- Apertura de confirmación de canje sin sesión.
- **12 pruebas actuales superadas**, en cuatro archivos. Cubren menú inferior, campana y arrastre; no cubren saldo, municipio, retorno de acceso ni canje.
- Ninguna excepción de ejecución durante el recorrido; sin desbordamiento horizontal de página a **393×852**. Esto no sustituye una validación visual completa ni comprueba todos los contenidos internos.
- Todas las dependencias de ejecución tienen imports en `src/`, salvo `tailwindcss-animate`, utilizado por la configuración. No se añadieron ni quitaron dependencias.
- No había registros de compilación disponibles: no afirmo haber verificado una compilación de producción en esta revisión.

## Seguridad: resultado disponible, no auditoría propia

El informe disponible advierte que la comprobación de contraseñas filtradas está desactivada e informa de lectura pública de códigos postales. Este último dato puede ser intencionadamente público y requiere valoración, no una restricción automática.

**No hay resultados recientes de análisis profundo disponibles. Ejecuta un análisis desde la pestaña Seguridad antes de la entrega.** No he cambiado permisos, configuración de acceso ni servicios reales, y no considero esta revisión una certificación de seguridad.

## Orden propuesto de corrección

1. **Unificar los accesos con candado.** Comprobar Home e interiores como visitante, cancelar el panel y acceder con retorno al destino; comprobar navegación directa con sesión.
2. **Unificar municipio y cuenta simulada.** Probar cambio de municipio y lectura en todas las secciones; comprobar que saldo, historial y canjes coinciden antes y después de un canje simulado. Resolver primero los importes pendientes de confirmación.
3. **Consolidar catálogos, categorías y estados.** Probar carga, vacío, error y éxito; comprobar conteos con varios filtros y respuestas con más de una página.
4. **Preparar portabilidad.** Retirar sobrantes y dependencias que queden huérfanas, normalizar imports y documentar los límites para Cursor, sin tocar contratos protegidos. Después dividir las pantallas grandes conservando su comportamiento.
5. **Validación final.** Añadir pruebas de municipio, saldo, acceso y canje; recorrer los flujos y estados en los idiomas y tamaños acordados. Comprobar cada paso en la aplicación antes de continuar.

La migración visual Burbuja de interiores y entrada sigue pendiente según el roadmap; esta revisión no la da por terminada.