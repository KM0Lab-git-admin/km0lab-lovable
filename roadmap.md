# Roadmap

- [x] Revisar `/rewards`, `/redeemed-rewards` y patrones de interfaz del resto de la aplicación; diagnóstico en `.lovable/reviews/rewards-interface-consistency.md`.
- [x] Alinear premios y canjes: tarjetas, imágenes, filtros, confirmación accesible y navegación.
- [x] Unificar campanas, copia, arrastre y contexto municipal.
- [x] Compartir catálogo y cuenta simulada; verificar canje en saldo, historial y canjes.
- [x] Completar estados, traducciones y preparación para Cursor; validar flujos y dependencias.
- [x] Unificar ejemplos autorizados: cumpleaños 500, escaneo 20, primer escaneo 50; solo simulación, sin abonos reales.

- [x] Revisar consistencia de navegación, municipio, puntos, catálogos y portabilidad; diagnóstico confirmado en `.lovable/reviews/application-consistency.md`.
- [x] Unificar accesos con candado de Home e interiores; panel contextual compartido, cancelación sin salir y OTP simulado con retorno a puntos/canjes/perfil comprobados.
- [x] Aplicar el informe de consistencia aprobado dentro de la frontera frontend/mock; contratos reales intactos.
- [ ] Análisis profundo de seguridad: requiere ejecutarlo desde la pestaña Seguridad.
- [ ] Adaptar contratos e integración de producción: depende del monorepo/Cursor; aquí quedan servicios mock y APIs de solo lectura.

- [x] Home: panel contextual de cuenta para accesos con candado, notificaciones dentro del marco y moneda SVG con relieve.

- [x] Home Burbuja: ocultar barras, habilitar arrastre vertical/horizontal y corregir la interacción del menú y controles comunes.

- [x] Integrar LanguageSelection.png en la pantalla de idioma sin cambiar los colores de los botones.
- [x] Recuperar el fondo beige en el bloque de selección de idioma.
- [x] Eliminar el espacio sobrante arriba y abajo en la pantalla de idioma (foto y selector a altura completa).
- [x] Reducir la foto de la pantalla de idioma, dar más margen inferior y recortar ligeramente la parte superior.
- [x] Sustituir la ilustración de /postal-code por CP.png (asset en CDN, alt traducido).
- [x] Crear la pantalla «¿Cómo funciona?» (/how-it-works) con el carrusel de 5 pasos; el enlace de la Home ya apunta ahí.
- [x] Añadir al carrusel «¿Cómo funciona?» las ilustraciones de los pasos 1-4 (assets CDN en src/assets/how-it-works/).
- [x] Añadir la ilustración del paso 5 de «¿Cómo funciona?» (campo `image` del paso `enjoy_points`).
- [x] Destacar «Com funciona?» como botón debajo del logo KM0 en la cabecera de la Home para visitantes.
- [x] Ocultar el selector de rango temporal de la Agenda y mostrar siempre todos los eventos (sin filtro de fechas).
- [x] Recuperar el selector de rango temporal de la Agenda (Esta semana / Próximos 30 días) con filtro fecha_desde/fecha_hasta.
- [x] Categorías de la Agenda desde `/api/v1/categories?poblacion=<población del usuario>` (solo categorías con eventos activos).
- [x] Unificar visualmente las categorías de la Agenda con iconos propios y amarillo KM0 para la selección.
- [x] Mostrar todas las categorías de la Agenda en una cuadrícula sin scroll horizontal.
- [x] Home: sección Premis alimentada por la API real UAT (/api/v1/rewards/public?postal_code=&lang=) vía proxy rewards-api, con imágenes y estados explícitos, sin fallback mock silencioso.
- [x] Añadir la opción «Todos» al selector de rango temporal de la Agenda (sin fecha límite en la consulta).
- [x] Agenda: la cuadrícula de categorías se puede ocultar y desocultar; la cabecera muestra un chip amarillo con la categoría activa.
- [x] Agenda: selección de categorías múltiple y acumulativa (unión de slugs en cliente); «Tots» limpia la selección; la cabecera muestra todas las seleccionadas en chips amarillos lado a lado.
- [x] Implementar el frontend navegable «Invita y gana»: Home, Acciones, compartir/QR, acceso con retorno, alta de negocio mock y confirmación.
- [x] Hacer visible «Les meves invitacions» desde Home y Els meus punts, con resumen mock compartido y retorno contextual.
- [x] Burbuja · Etapa 1: Home y piezas compartidas renovadas, Compartir e invitaciones conservados; revisión del usuario pendiente antes de seguir.
- [ ] Burbuja · Etapa 2: pantallas interiores y Agenda con filtros en panel lateral superpuesto; detenerse para revisión.
- [ ] Burbuja · Etapa 3: entrada y tareas, preservando idioma y el carrusel «Cómo funciona»; detenerse para revisión.
- [ ] Burbuja · Etapa 4: comprobar pantallas, idiomas, estados y navegación; entregar pendientes concretos.
