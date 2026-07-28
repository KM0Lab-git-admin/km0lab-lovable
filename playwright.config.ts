import { defineConfig } from "@playwright/test";
import { RESPONSIVE_VIEWPORTS } from "./src/design-system/viewports";

/**
 * Regresión visual responsive — un project de Playwright por cada viewport
 * oficial de `src/design-system/viewports.ts` (fuente única de verdad).
 *
 * - Viewports `tier: "contract"` → captura px-a-px + checks estructurales.
 * - Viewports `tier: "smoke"` (móvil landscape) → solo checks estructurales.
 *
 * Las pantallas/estados que se validan viven en
 * `src/design-system/preview-manifest.ts`.
 *
 * Baselines: se generan en CI (Linux) con el workflow "update-baselines";
 * en local (Windows/macOS el rendering difiere) usa `npm run test:visual:local`,
 * que ejecuta todo EXCEPTO la comparación de screenshots.
 */
export default defineConfig({
  testDir: "./tests/visual",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [["html", { open: "never" }], ["list"]],
  timeout: 60_000,
  // Sin sufijo de plataforma: las baselines canónicas son las de CI (Linux).
  snapshotPathTemplate: "{testDir}/__screenshots__/{projectName}/{arg}{ext}",
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.01,
      animations: "disabled",
      caret: "hide",
    },
  },
  use: {
    baseURL: "http://localhost:8080",
    reducedMotion: "reduce",
    trace: "on-first-retry",
  },
  webServer: {
    // En CI servimos el build (más estable y parecido a producción);
    // en local reutilizamos el dev server de Vite si ya está levantado.
    command: process.env.CI
      ? "npm run build && npx vite preview --port 8080 --strictPort"
      : "npm run dev",
    url: "http://localhost:8080",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
  projects: RESPONSIVE_VIEWPORTS.map((vp) => ({
    name: vp.id,
    metadata: { tier: vp.tier },
    use: {
      browserName: "chromium" as const,
      viewport: { width: vp.width, height: vp.height },
    },
  })),
});
