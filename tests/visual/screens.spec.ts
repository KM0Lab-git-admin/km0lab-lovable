import { test, expect } from "@playwright/test";
import {
  PREVIEW_SCREENS,
  PREVIEW_SESSION,
} from "../../src/design-system/preview-manifest";

/**
 * Matriz pantallas × estados × viewports.
 *
 * - Pantallas/estados: `src/design-system/preview-manifest.ts`. Estados con
 *   `src: null` (no forzables por URL) se omiten.
 * - Viewports: un project de Playwright por entrada de
 *   `src/design-system/viewports.ts` (ver playwright.config.ts).
 *
 * En TODOS los viewports se valida el contrato estructural (sin overflow
 * horizontal). En los viewports `tier: "contract"` se compara además una
 * captura px-a-px, salvo en pantallas `dynamicContent` (datos remotos o
 * fecha actual → la comparación sería flaky hasta que se mockeen).
 */

for (const screen of PREVIEW_SCREENS) {
  for (const state of screen.states) {
    if (!state.src) continue; // estado no forzable por URL

    const title =
      screen.states.length > 1
        ? `${screen.label} · ${state.label}`
        : screen.label;

    test(title, async ({ page }, testInfo) => {
      const tier = (testInfo.project.metadata?.tier ?? "contract") as
        | "contract"
        | "smoke";

      // Estado de sesión determinista: sembrada (registrado) o limpia (guest).
      if (state.seedSession) {
        await page.addInitScript(
          ([key, value]) => window.localStorage.setItem(key, value),
          [PREVIEW_SESSION.key, JSON.stringify(PREVIEW_SESSION.value)] as const,
        );
      } else {
        await page.addInitScript(
          (key) => window.localStorage.removeItem(key),
          PREVIEW_SESSION.key,
        );
      }

      await page.goto(state.src);
      await page.waitForLoadState("networkidle");

      // 1) Contrato universal (todos los viewports, también smoke):
      //    nada provoca scroll horizontal a nivel de documento.
      const overflowX = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
      expect
        .soft(overflowX, `overflow horizontal de ${overflowX}px en ${state.src}`)
        .toBeLessThanOrEqual(0);

      //    El body tiene contenido visible (la ruta no ha petado en blanco).
      const visibleText = (await page.locator("body").innerText()).trim();
      expect(visibleText.length, "la página renderiza contenido").toBeGreaterThan(0);

      // 2) Contrato visual px-a-px solo donde aplica.
      if (tier === "contract" && !screen.dynamicContent) {
        await expect(page).toHaveScreenshot(`${screen.id}--${state.id}.png`, {
          fullPage: true,
        });
      }
    });
  }
}
