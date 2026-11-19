# Acabado Burbuja en KM0 Lab

## Objetivo
Renovar el aspecto de la aplicación usando el HTML, las capturas y los dos documentos del ZIP como referencia. Mantener las funciones, los datos, las rutas, las traducciones y los estados existentes. Las capturas interiores orientan el estilo: no sustituyen los flujos actuales.

## Decisiones confirmadas
- Trabajar por etapas y detenerse al terminar cada una para revisión.
- Conservar el panel de Compartir y sus canales, incluido el aviso de que compartir sin sesión no genera puntos. Cambiar solo su aspecto.
- Agenda: botón «Filtres» con contador que abre un panel lateral superpuesto, cerrado inicialmente. Fechas y selección múltiple de categorías dentro; cambios directos, cierre accesible y eventos a todo el ancho cuando esté cerrado. Sin scroll horizontal de filtros ni de página.
- Priorizar más eventos visibles mediante filas compactas legibles, no reduciendo los textos ni las zonas de pulsación.
- Mantener la selección de idioma ya rehecha y sus colores. Conservar el contenido, las imágenes y el carrusel de «Cómo funciona»; únicamente su botón adopta el nuevo acabado.
- Mantener las invitaciones con sesión, su seguimiento y los accesos desde Home y puntos. No sustituirlos por la versión pública de la demo.
- Dejar animaciones y transiciones detalladas para una fase posterior.

## Etapa 1 · Piezas comunes y Home
- Preparar botones de píldora, tarjetas blancas redondeadas, filas compactas, círculos pastel, etiquetas y moneda de puntos, respetando el sistema de diseño.
- Renovar cabeceras, barra inferior de cinco pestañas, capas y estados compartidos sin cambiar sus funciones.
- Home: cabecera amarilla con municipio, logo, campana e ilustración; usar la ilustración genérica aportada si no existe una específica del municipio.
- Orden: registro o puntos, accesos rápidos, eventos, acciones para ganar puntos, premios, promociones y compartir/invitaciones.
- Incorporar las ilustraciones aportadas a los seis accesos rápidos y las portadas de categoría como alternativa cuando no haya foto real.
- Mantener datos actuales, versión con sesión, seguimiento de invitaciones y destinos existentes. «Cómo funciona» pasa a la tarjeta de registro según la referencia.
- Revisar Home con y sin sesión y las piezas compartidas. **Parar para revisión.**

## Etapa 2 · Pantallas interiores
- Aplicar el acabado a Agenda, noticias, comercios y ficha, premios/promociones, acciones, puntos, historial, premios canjeados, invitar y seguimiento de invitaciones.
- Agenda: panel lateral de filtros confirmado; filas con miniatura y agrupación por día, sin perder selección múltiple ni opciones de fecha.
- Conservar saldos, cálculos, estados y navegación; no crear versiones duplicadas de seguimiento.
- **Parar para revisión.**

## Etapa 3 · Entrada y tareas
- Renovar controles, campos, tarjetas y estados de onboarding, código postal, acceso, código de verificación, plantilla de correo, alta de negocio, detalle de evento, perfil y escáner.
- Conservar sus ilustraciones, contenidos y lógica. No rehacer la selección de idioma ni el carrusel «Cómo funciona».
- **Parar para revisión.**

## Etapa 4 · Comprobación final
- Revisar catalán, castellano e inglés a 375×667, 390×844 y 412×915; comprobar también que la columna centrada no se rompe en las medidas adicionales exigidas por el proyecto.
- Comprobar carga, vacío, error y contenido; textos de al menos 11 px, controles de al menos 44 px y puntos de carrusel de 24 px.
- Verificar teclado, foco, cierre de paneles, navegación y ausencia de desbordamiento horizontal.
- Entregar lista de pantallas revisadas y cualquier limitación pendiente, sin afirmar que funcionan integraciones no disponibles.

## Detalles técnicos y portabilidad
- React y componentes existentes; sin dependencias nuevas, sin servicios ni contratos de API modificados, sin escrituras reales ni concesión de puntos.
- Estilos con Tailwind y tokens KM0; añadir únicamente tokens que falten, sin renombrar ni eliminar los existentes. Extender variantes de botones sin romper su API.
- Una única columna portrait centrada, sin diseños alternativos de escritorio.
- Assets binarios mediante punteros CDN, conservando los nombres aportados; no copiar el HTML de la demo como aplicación ni adoptar sus datos ficticios como reglas de negocio.
- Copy y accesibilidad en el diccionario ca/es/en. Actualizar catálogo, manifiesto de pantallas y documentación de portabilidad según los cambios de cada etapa.
- Ejecutar las pruebas pertinentes y comprobar dependencias usadas antes de cada commit.