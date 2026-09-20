# Plan: Invita y gana

## Resultado
Crear un flujo frontend navegable, integrado con la Home, Acciones, el acceso existente y el sistema de idioma de KM0 Lab. Todo funcionará con datos simulados: compartir y copiar serán reales en el dispositivo, pero ninguna acción concederá puntos ni escribirá en servicios reales.

## Cambios de experiencia
- Añadir una tarjeta compacta «Invita i guanya» en la Home solo para ciudadanos con sesión, entre Accesos rápidos y Eventos destacados.
- Añadir una acción navegable «Invita i guanya» dentro de Acciones.
- Crear `/invite` con selección Persona/Negocio, recompensas configurables compartidas (100/500), compartir del sistema, copia con alternativa manual y diálogo accesible con QR real.
- Si no hay sesión, `/invite` mostrará un aviso y llevará al acceso; tras validar el código, regresará automáticamente a `/invite`.
- Los enlaces distinguirán claramente sus destinos y usarán una referencia opaca, sin datos personales:
  - persona → acceso ciudadano existente con invitación aplicada;
  - negocio → alta web responsive con municipio y referencia conservados.
- Mostrar «Invitación aplicada» discretamente durante el acceso ciudadano cuando corresponda.

## Alta de negocio
- Crear una única página KM0 centrada y de una columna, también en escritorio, según la opción elegida.
- Incluir todos los campos solicitados, etiquetas visibles, validación con Zod y React Hook Form, categoría obligatoria, aceptación de condiciones y privacidad, y logo opcional con previsualización, sustitución y eliminación.
- Reutilizar la sesión existente cuando exista; si no existe, pedir correo para asociar posteriormente al gestor sin crear autenticación real nueva.
- Implementar mediante un servicio mock tipado los estados: carga inicial, formulario vacío, listo, enviando, error recuperable, negocio ya registrado y confirmación.
- La confirmación llevará a un acceso simulado al espacio del negocio; no se sumarán puntos ni se alterará el saldo o historial.

## Integración y consistencia
- Añadir un único archivo de configuración para recompensas y construcción de enlaces, reutilizado en todas las pantallas.
- Añadir las traducciones en catalán, español e inglés en el diccionario existente.
- Mantener la navegación inferior donde corresponde, el marco móvil, los tokens, tipografías, botones y patrones accesibles existentes.
- Registrar las pantallas y estados nuevos en el catálogo de vistas y actualizar la hoja de ruta.
- Añadir la dependencia aprobada `qrcode` para generar el QR exactamente desde el enlace seleccionado.

## Verificación
- Comprobar tipos y pruebas relevantes.
- Verificar navegación, regreso tras acceso, selección Persona/Negocio, compartir/cancelación, copia y alternativa manual, QR, validaciones, conservación del formulario, bloqueo de doble envío y estados simulados.
- Validar 375×667, 390×844 y el marco centrado en vistas anchas, sin desbordamiento horizontal.

## Conexiones pendientes fuera del prototipo
- Generación segura de referencias personales y enlaces canónicos.
- Persistencia y validación real del alta de negocio.
- Confirmación del registro válido y concesión de recompensas en saldo e historial.
- Acceso real al espacio del negocio y gestión legal de los enlaces de condiciones y privacidad.
