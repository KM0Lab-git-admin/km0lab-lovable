import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  // ─────────────────────────────────────────────────────────────
  // PORTRAIT-ONLY — una sola maqueta portrait por pantalla.
  // Prohíbe las variantes de orientación/tablet en pantallas y
  // componentes de app (ver docs/KNOWLEDGE.md §3). Evita que se
  // reintroduzcan maquetas landscape/tablet paralelas que rompen la
  // consistencia entre resoluciones.
  //
  // FASE 1: acotado a los archivos ya migrados. FASE 2: ampliar
  // `files` a ["src/pages/**/*.{ts,tsx}", "src/components/**/*.{ts,tsx}"]
  // una vez barridas el resto de pantallas. NO incluir aquí las piezas
  // solo-Lovable (PreviewAll, DesignSystem, SimulatedDevice), que sí
  // necesitan renderizar a distintos tamaños.
  // ─────────────────────────────────────────────────────────────
  {
    files: [
      "src/components/BrandedFrame.tsx",
      "src/components/StackCarousel.tsx",
      "src/pages/Onboarding.tsx",
      "src/pages/Language.tsx",
      "src/pages/PostalCode.tsx",
    ],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "Literal[value=/(^|[\\s\"'`])(landscape|vertical-tablet|horizontal-mobile|horizontal-desktop|wide-landscape|short-landscape):/]",
          message:
            "Portrait-only: prohibidas las variantes de orientación/tablet (landscape:, vertical-tablet:, horizontal-mobile:, horizontal-desktop:, wide-landscape:, short-landscape:). Diseña una sola maqueta portrait centrada. Ver docs/KNOWLEDGE.md §3.",
        },
        {
          selector:
            "TemplateElement[value.cooked=/(^|[\\s\"'`])(landscape|vertical-tablet|horizontal-mobile|horizontal-desktop|wide-landscape|short-landscape):/]",
          message:
            "Portrait-only: prohibidas las variantes de orientación/tablet (landscape:, vertical-tablet:, horizontal-mobile:, horizontal-desktop:, wide-landscape:, short-landscape:). Diseña una sola maqueta portrait centrada. Ver docs/KNOWLEDGE.md §3.",
        },
      ],
    },
  },
);
