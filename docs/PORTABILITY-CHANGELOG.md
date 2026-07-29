# Portability Changelog

Registro de cambios realizados en este prototipo (Lovable) que deben
portarse **manualmente** al monorepo de producción KM0 LAB.

- Formato: cada versión agrupa cambios listos para portar en un único
  pase manual.
- La versión **solo** sube cuando el usuario lo indica explícitamente
  en el chat. Mientras tanto, todo cambio nuevo se acumula bajo la
  versión abierta actual.
- Cada entrada incluye: qué se cambió, archivos tocados, motivo y
  notas de portabilidad (dependencias, migraciones, gotchas).

---

## v1.0 — En curso

### 1. Bypass de `RequireAuth` en desarrollo

**Qué:** el guard `RequireAuth` deja pasar sin sesión cuando
`import.meta.env.DEV` es `true`, para poder validar pantallas
protegidas (`/historial-punts`, `/premis-canjats`, `/profile`) sin
loguearse.

**Archivos:**
- `src/components/RequireAuth.tsx`

**Motivo:** acelerar la validación visual del prototipo.

**Notas de portabilidad:**
- En producción (`import.meta.env.DEV === false`) el guard sigue
  activo: no expone rutas protegidas al usuario final.
- Si el monorepo usa otro flag para "modo dev" (por ejemplo una env
  var propia), sustituir `import.meta.env.DEV` por el flag equivalente
  antes de portar.
- Mantener también el bypass por `sessionStorage.km0_preview_authed`
  usado por `/home-registrado` para las demos.
