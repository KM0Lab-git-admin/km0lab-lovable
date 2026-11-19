# Ejecución del informe de consistencia

## Aplicado
- Premios y Canjes comparten tarjeta, imágenes completas, tipografía, controles y cabecera. Catálogo público UAT compartido con Home, sin saldo ficticio para visitantes ni fallback silencioso.
- Confirmaciones de canje en BubbleSheet: teclado, Escape, foco y resultado confirmado después del registro local. No hay operaciones reales.
- Cuenta simulada por usuario: saldo firmado, historial, invitaciones concedidas y canjes vinculados. Ejemplos existentes alineados con UAT: gorra 180, entrada 200, val 5€ 50; saldo inicial muestra su movimiento de demostración. Nuevos canjes conservan traducciones del catálogo.
- Pendientes incluye pending y ready; caducados tiene filtro propio. Fechas relativas para escenarios, sin política automática de caducidad inventada.
- Campanas de Home, Agenda, Noticias y Comercios abren el mismo panel. Coral/gris conservados, lectura al abrir.
- Municipio único desde PostalCode/store y consultas de Agenda, Noticias, Premios y eventos destacados. Paginación completa con detección de respuestas incompletas; una consulta de Agenda para resultados y conteos.
- Arrastre de interiores, copia con resultado real, accesos con candado conservados y mensajes honestos del OTP 123456.
- Puntos de ejemplo: cumpleaños 500, escaneo 20 en todos los comercios, primer escaneo 50; web 20, evento 40, encuesta 15.
- Estados de carga/vacío/error/listo en Premios, Canjes, Historial y Acciones; entradas actualizadas en preview-manifest.
- DeviceShell compuesto en App, no importado por pantallas de producto; imports normalizados y piezas sin consumidores retiradas. Sin dependencias nuevas ni cambio en contratos protegidos.

## Comprobado
- 33 tests en ocho archivos, todos aprobados.
- Acceso con correo de prueba y 123456, canje de gorra con teclado, saldo 1120→940, movimiento −180 y sexto canje persistido. Pendientes muestra los tres registros pertinentes.
- Copia denegada no anuncia éxito; Escape cierra confirmaciones.
- 12 estados forzados, ca/es/en, 15 rutas en 375×667, 390×844, 768×1024, 667×375 y 1280×550: sin desbordamiento horizontal, tabs dentro del marco, sin errores de ejecución.
- 08001→Barcelona desde la pantalla de código postal llega a Home y consultas municipales; arrastre de Acciones mueve scrollTop 0→590.
- Sin capturas nuevas por preferencia del usuario: validación de interacción/DOM, no certificación visual por píxeles.

## No corresponde resolver aquí
- Puntos, canjes, stock, atribución de invitaciones, entrega y correos reales: requieren la implementación de producción. La simulación no afecta UAT.
- Contratos protegidos conservan su integración actual; el adaptador/configuración del monorepo debe revisarse en Cursor.
- El análisis disponible mantiene aviso de contraseñas filtradas desactivado e información de lectura pública de códigos postales. No hay análisis profundo reciente: ejecutar desde Seguridad antes de entrega. No se afirma que la app sea segura.
- Las API de eventos/noticias no aportan traducciones inglesas completas; su fallback existente se conserva sin alterar schemas.
- Las etapas previas del rediseño Burbuja no incluidas en este informe siguen pendientes de su revisión específica.
